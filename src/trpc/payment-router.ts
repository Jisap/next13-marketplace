import { z } from 'zod'
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { getPayloadClient } from '../get-payload'
import { stripe } from '../lib/stripe'
import type Stripe from 'stripe'

export const paymentRouter = router({

  createSession: privateProcedure                                 // La creación de una session de pagos requiere autenticación (privateProcedure)
    .input(z.object({ productIds: z.array(z.string()) }))         // Recibe un objeto con un array de Ids de productos (productsIds) validado por zod
    .mutation(async ({ ctx, input }) => {                         // La mutación necesita el contexto/info de la petición y los inputs de ids de ptos.
      const { user } = ctx                                        // Del ctx obtenemos el user
      let { productIds } = input                                  // del input los productIds como array

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' })              // Sino hay ptos en la lista lanzamos el error.
      }

      const payload = await getPayloadClient();                  // Cargamos el cliente de payload para gestión de la bd 

      const { docs: products } = await payload.find({            // Obtenemos los ptos según productsIds     
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
      })

      const filteredProducts = products.filter((prod) =>          // Se filtran los ptos de manera que solo contengan los que tienen
        Boolean(prod.priceId)                                     // un precio definido
      )

      const order = await payload.create({                        // Se Crea una orden no pagada asociada al usuario autenticado.
        collection: 'orders',                                     // con los products filtrados
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      })

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =  // Se inicializa la variable line_items como un array que contendrá
        []                                                                // objetos tipo "Stripe.Checkout.SessionCreateParams.LineItem"

      filteredProducts.forEach((product) => {
        line_items.push({                                                 // Se añade a line_items los productos filtrados que tienen un precio definido
          price: product.priceId!,                                        // como objetos con price y quantity
          quantity: 1,
        })
      })

      line_items.push({
        price: "price_1OUu1JCuZvmb6988qSdlYzQo",                          // Se agregan los gatos de envio e impuestos
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      })

      try {
        const stripeSession =                                             // Se crea la session de stripe
          await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            metadata: {
              userId: user.id,
              orderId: order.id,
            },
            line_items,
          })

        return { url: stripeSession.url }
      } catch (err) {
        return { url: null }
      }
    }),
  pollOrderStatus: privateProcedure                   // Este procedimiento 
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input

      const payload = await getPayloadClient()

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: {
          id: {
            equals: orderId,
          },
        },
      })

      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [order] = orders

      return { isPaid: order._isPaid }
    }),
})