import { appRouter } from "@/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"


// controlador para las solicitudes TRPC en el servidor. 

const handler = (req: Request) => { // req es la solicitud HTTP recibida por el servidor
  fetchRequestHandler({             // Maneja las solicitudes TRPC utilizando la interfaz Fetch API
    endpoint: "/api/trpc",          // Se expecifica la ruta para las solicitudes trpc,
    req,                            // la solicitud http
    router: appRouter,              // el router trpc que manejará las solicitudes
    createContext: () => ({})       // devuelve un contexto para cada solicitud
  })
}

export { handler as GET, handler as POST }  // Se exporta como GET y POST