import { getPayloadClient } from "@/get-payload"
import { getServerSideUser } from "@/lib/payload-utils"
import { cookies } from "next/headers"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}


const ThankYouPage = async ({ searchParams }: PageProps) => {

  const orderId = searchParams.orderId                          // id de la orden 
  const nextCookies = cookies();                                // Cookie que contiene el usuario logueado y el token de autenticación

  const { user } = await getServerSideUser(nextCookies);        // User que ha realizado la compra
  const payload = await getPayloadClient();

  const { docs: orders } = await payload.find({                 // Obtención de datos del pedido desde el CMS Payload:  
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId
      }
    }
  })

  const [order] = orders              // Reasignamos el primer valor del array orders a order

  if(!order) return notFound();       // Sino hay orden compra mensaje de error

  const orderUserId =                 
    typeof order.user === "string"    // Verifica si el tipo de order.user es una cadena
      ? order.user                    // Si es una cadena, asigna order.user a orderUserId
      : order.user.id                 // Si no es una cadena (objeto), asigna order.user.id a orderUserId

  if (orderUserId !== user?.id) {                                     // Se verifica que el ID del usuario que realizó el pedido coincida con el ID del usuario actual. 
    return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`); // Si no coinciden, se redirige a la página de inicio de sesión con el parámetro origin en la URL.
  }



  return (
    <main className="relative lg:min-h-full">
      <div className='hidden lg:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12'>
        <Image
          fill
          src='/checkout-thank-you.jpg'
          className='h-full w-full object-cover object-center'
          alt='thank you for your order'
        />
      </div>

      <div>
        <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24'>
          <div className='lg:col-start-2'>
            <p className='text-sm font-medium text-blue-600'>
              Order successful
            </p>
            <h1 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              Thanks for ordering
            </h1>

            {order._isPaid 
              ? <p className='mt-2 text-base text-muted-foreground'>
                Your order was processed and your assets are
                available to download below. We&apos;ve sent
                your receipt and order details to{' '}
                {typeof order.user !== 'string' ? (
                  <span className='font-medium text-gray-900'>
                    {order.user.email}
                  </span>
                ) : null}.
              </p>
              : <p className='mt-2 text-base text-muted-foreground'>
                We appreciate your order, and we&apos;re
                currently processing it. So hang tight and
                we&apos;ll send you confirmation very soon!
              </p>
            }

          </div>
        </div>
      </div>
    </main>
  )
}

export default ThankYouPage