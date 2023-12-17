import { ExpressContext } from "@/server";
import { initTRPC } from "@trpc/server";

// 1º inicializa un servidor trpc
const t = initTRPC.context<ExpressContext>().create();        // Inicializa un contexto de trpc y despues crea una instancia de trpc con ese contexto
                                                              // t contiene métodos y propiedades necesarios para trabajar con trpc

// 2º router para gestion de rutas
export const router = t.router                // t.router gestiona y maneja las rutas y procedimientos TRPC

// 3º procedimientos para usar desde el cliente
export const publicProcedure = t.procedure    // t.procedure son funciones invocadas remotamente desde el cliente
