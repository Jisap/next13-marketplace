import { User } from "@/payload-types"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { NextRequest } from "next/server"

// Este método devuelve un usuario basado en el token generado despues del login

export const getServerSideUser = async (
  cookies: NextRequest["cookies"] | ReadonlyRequestCookies  
) => {

  const token =  cookies.get("payload-token")?.value                                  // Obtiene el token de la cookie generada en el login

  const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {   // Este endpoint lo crea el server cms automaticamente
    headers:{                                                                         // y en los headers le colocamos el token obtenido
      Authorization: `JWT ${token}`,                                                  // despues del logueo
    }
  })

  const { user } = (await meRes.json()) as {user: User | null}                        // De la respuesta obtenemos el usuario autenticado

  return { user }
}