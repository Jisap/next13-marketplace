
import express from "express"
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./app/next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextBuild from 'next/dist/build';
import path from 'path'
import { Payload } from "payload";
import { PayloadRequest } from "payload/types";
import { parse } from "url";

const app = express();                                                // Instancia de Express

const PORT = Number(process.env.PORT) || 3000;                        // Puerto donde trabaja

const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => ({  // Se crea un contexto para que la información de req/res
  req, res,                                                                        // de express coincida con el formato de trpc 
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>

export type WebhookRequest = IncomingMessage & {rawBody: Buffer}      // Tipo para solicitud weebhook

const start = async () => {                                           // Función start que inicia la aplicación
  
  const webhookMiddleware = bodyParser.json({                         // Este middleware analiza el cuerpo json de las solicitudes entrantes (/api/webhooks/stripe) 
    verify: (req: WebhookRequest, _, buffer) => {                     // verify se ejecuta antes de analizar el cuerpo de la solicitud json
      req.rawBody = buffer                                            // y asigna el cuerpo sin procesar (buffer) a la propiedad rawBody de la solicitud req
    }
  })

  app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler); // Petición a stripe pasando al stripeWebhookHandler el cuerpo sin procesar de la solictud
  
  const payload = await getPayloadClient({                    // Se obtiene el cliente de gestión de payload usando el método definido en get-payload.ts
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`)
      },
    },
  })

  const cartRouter = express.Router();

  cartRouter.use(payload.authenticate);

  cartRouter.get("/", (req,res) => {
    const request = req as PayloadRequest
    if(!request.user) return res.redirect('sign-in?origin=cart')
    const parsedUrl = parse(req.url, true)

    return nextApp.render(req, res, "/cart", parsedUrl.query)
  });

  app.use("/cart", cartRouter);

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info(
        'Next.js is building for production'
      )

      // @ts-expect-error
      await nextBuild(path.join(__dirname, '../'))

      process.exit()
    })

    return
  }
  
  
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
