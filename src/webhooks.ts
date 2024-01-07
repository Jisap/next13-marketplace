import express from 'express'
import { WebhookRequest } from './server'
import { stripe } from './lib/stripe'
import type Stripe from 'stripe'
import { getPayloadClient } from './get-payload'
import { Product } from './payload-types'
import { Resend } from 'resend'
import { ReceiptEmailHtml } from './components/emails/ReceiptEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export const stripeWebhookHandler = async (
  req: express.Request,
  res: express.Response
) => {

  // Validate that this request actualy comes from stripe

  const webhookRequest = req as any as WebhookRequest       // Solicitud webhook
  const body = webhookRequest.rawBody                       // Se extrae el cuerpo sin procesar "rawBody" de la solicitud
  const signature = req.headers['stripe-signature'] || ''   // Del cuerpo se obtiene la firma de stripe

  let event
  try {
    event = stripe.webhooks.constructEvent(                 // Con constructEvent se valida la firma -> y generamos un event
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error
          ? err.message
          : 'Unknown Error'
        }`
      )
  }

  const session = event.data                                  // Extracción de datos del evento y generamos una session
    .object as Stripe.Checkout.Session

  if (
    !session?.metadata?.userId ||                             // Si no hay usuarioId o orderId mensaje de error
    !session?.metadata?.orderId
  ) {
    return res
      .status(400)
      .send(`Webhook Error: No user present in metadata`)
  }

  if (event.type === 'checkout.session.completed') {          // Si el tipo de evento es checkout.session.completed, se procede a realizar acciones adicionales.
    const payload = await getPayloadClient()

    const { docs: users } = await payload.find({              // Se busca al usuario que figura en la session
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    })

    const [user] = users

    if (!user)                                                // Si no existe el usuario mensaje de error
      return res
        .status(404)
        .json({ error: 'No such user exists.' })

    const { docs: orders } = await payload.find({             // Buscamos la order que figura en la session
      collection: 'orders',
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    const [order] = orders

    if (!order)
      return res
        .status(404)
        .json({ error: 'No such order exists.' })             // Sino existe la order mensaje de error

    // update the _isPaid value of this order

    await payload.update({                                    // Se actualiza la propiedad _isPaid de la orden a true en la base de datos.
      collection: 'orders',
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    // send receipt
    try {
      const data = await resend.emails.send({
        from: 'DigitalHippo <onboarding@resend.dev>',
        to: [user.email],
        subject:
          'Thanks for your order! This is your receipt.',
        html: ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }),
      })
      res.status(200).json({ data })
    } catch (error) {
      res.status(500).json({ error })
    }
  }

  return res.status(200).send() // Finalmente, si todo se ejecutó correctamente, se envía una respuesta exitosa con un código 200.
}