import { User } from "@/payload-types";
import { ExpressContext } from "@/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { PayloadRequest } from "payload/types";

// 1º inicializa un servidor trpc
const t = initTRPC.context<ExpressContext>().create();        // Inicializa un contexto de trpc y despues crea una instancia de trpc con ese contexto
                                                              // t contiene métodos y propiedades necesarios para trabajar con trpc

const middleware = t.middleware                               // Se obtiene el middlewate de trpc. Los mid son funciones que se ejecutan antes de manejar solicitudes
const isAuth = middleware(async({ctx, next}) => {             // ctx contiene info sobre la solicitud entrante, next es una func que pasa al siguiente procedimiento
  const req = ctx.req as PayloadRequest                       // Desde el contexto accedemos al objeto de la solicitud
  const {user} = req as { user:User | null }                  // Se convierte el objeto de solicitud a un tipo User
  if(!user || !user.id){
    throw new TRPCError({ code: 'UNAUTHORIZED' })             // Si el usuario no existe o no tiene un id lanzamos error
  }
  return next({                                               // Si el usuario si existe next devuelve un contexto actualizado con dicho usuario
    ctx: {
      user,
    }
  })
})

// 2º router para gestion de rutas
export const router = t.router                              // t.router gestiona y maneja las rutas y procedimientos TRPC

// 3º procedimientos para usar desde el cliente
export const publicProcedure = t.procedure                  // t.procedure son funciones invocadas remotamente desde el cliente
export const privateProcedure = t.procedure.use(isAuth)