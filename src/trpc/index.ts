import { z } from "zod";
import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";


import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";


export const appRouter = router({               // Crea un nuevo router basado en el de trpc

  auth: authRouter,                             // Subrouter de autenticación

  getInfiniteProducts: publicProcedure          // Procedimiento público 
    .input(                                     // que 1º tendrá un input  
      z.object({                                // validado con reglas de zod
        limit: z.number().min(1).max(100),          // cantidad de elementos que se deben devolver en la consulta.
        cursor: z.number().nullish(),               // Si se proporciona la consulta devuelve resultados a partir de ese punto
        query: QueryValidator                       // opciones de consulta adicionales para filtrar los resultados de la consulta principal.
      })
    )
    .query(async({ input }) => {                      // y 2º una petición a la bd con dicho input

      const { query, cursor } = input                 // Se extraen del input el cursor y las opciones de consulta
      const { sort, limit, ...queryOpts } = query     // y de estas el sort y el limit, el resto de opciones no desestructuradas van queryOpts (categories)

      const payload = await getPayloadClient();       // Cargamos el cliente de payload

      const parsedQueryOpts: Record<string, {equals: string}> = {}  // Inicializamos un objeto que almacenará las queryOpts de una forma modificada

      Object.entries(queryOpts).forEach(([key, value]) => {         // Cada categoría contendrá un objeto = { equals: value }
        parsedQueryOpts[key] = { equals: value }
    })

    const page = cursor || 1

    const { docs: items, hasNextPage, nextPage } = await payload.find({ // Se realiza la petición expecificando todo lo anteriormente detallado
      collection: 'products',
      where: {
        approvedForSale: {
          equals: 'approved',
        },
        ...parsedQueryOpts, // Aquí se utilizan las categorias modificadas par ser usadas en la consulta
      },
      sort,
      depth: 1,
      limit,
      page,
    })

    return {
      items,                                      // El rdo final de la petición serán los items según el input
      nextPage: hasNextPage ? nextPage : null     // y la paginacíon correspondiente
    }

  })
})

export type AppRouter = typeof appRouter