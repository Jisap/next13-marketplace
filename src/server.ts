
import express from "express"
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./app/next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";

const app = express();                                        // Instancia de Express

const PORT = Number(process.env.PORT) || 3000;                // Puerto donde trabaja

const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => ({  // Se crea un contexto para que la información de req/res
  req, res,                                                                        // de express coincida con el formato de trpc 
})

const start = async () => {                                   // Función start que inicia la aplicación
  const payload = await getPayloadClient({                    // Se obtiene el cliente de gestión de payload usando el método definido en get-payload.ts
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`)
      },
    },
  })

  app.use('/api/trpc', trpcExpress.createExpressMiddleware({  // El server usará el middleware en la ruta /api/trpc y para ello se configura un
    router: appRouter,                                        // appRouter que es el router de trpc y sus procedimientos
    createContext                                             // basados en la gestión de las req/res que da el contexto
  }))

  app.use((req, res) => nextHandler(req, res)); // Se le indica a express que use el manejador de solicitudes http de next.js

  nextApp.prepare().then(() => {                // Se llama a nextApp.prepare() para preparar la aplicación Next.js. Prepare garantiza que todas las rutas y páginas estén listas y configuradas antes de que el servidor comience a escuchar solicitudes.   
    payload.logger.info('Next.js started')      // Una vez que la preparación esté completa, se muestra un mensaje en el log indicando que Next.js se ha iniciado.

    app.listen(PORT, async () => {              // El servidor Express se inicia y escucha en el puerto definido. 
      payload.logger.info(                      // Se muestra en el log la URL de la aplicación Next.js.
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`  
      )
    })
  })
}

start()
