"use client"

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { httpBatchLink } from "@trpc/client";


const Providers = ({children}: PropsWithChildren) => {
  
  const [queryClient] = useState(() => new QueryClient());        // Estado local para el cliente de Query
  const [trpcClient] = useState(() =>                             // Estado local para el cliente de TRPC
    trpc.createClient({                                           // inicializado con una instancia del cliente TRPC
      links: [                                                    // links procesa peticiones y respuestas entre cliente/servidor
        httpBatchLink ({                                          // tipo http
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,  // donde la url esta definida para el servidor y
          fetch(url, options) {                                   // se personaliza el método fetch para incluir las credenciales
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    })
  )

  return(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        { children }
      </QueryClientProvider>
    </trpc.Provider>  
  )
  
}

export default Providers