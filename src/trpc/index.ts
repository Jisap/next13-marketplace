import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";


export const appRouter = router({               // Crea un nuevo router basado en el de trpc

  auth: authRouter

  // anyApiRoute: publicProcedure.query(() => {   // Define un procedimiento público llamado anyApiRouter basado en el publicProcedure de trpc
  //   return 'hello'                              // Este procedimiento es una consulta (query) que simplemente devuelve la cadena 'hello'
  // })
})

export type AppRouter = typeof appRouter