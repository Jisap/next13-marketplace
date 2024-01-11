import { NextRequest, NextResponse } from 'next/server'
import { getServerSideUser } from './lib/payload-utils'

export async function middleware(req: NextRequest) {      // El middleware procesara todas las solicitudes al servidor de nextjs
  const { nextUrl, cookies } = req                        // De la solicitud obtenemos la url de la próxima solicitud y las cookies asociadas
  const { user } = await getServerSideUser(cookies)       // Obtenemos el usuario de las cookies

  if (
    user &&                                               // Si existe un usuario  
    ['/sign-in', '/sign-up'].includes(nextUrl.pathname)   // y la ruta de la próxima solicitud  es sign-in o sign-up 
  ) {
    return NextResponse.redirect(                         // redirect a la página principal "/" del servidor 
      `${process.env.NEXT_PUBLIC_SERVER_URL}/`
    )
  }

  return NextResponse.next()  // Sino se cumple la condición anterior la función devuelve next() para que siga el fujo de la solicitud
}