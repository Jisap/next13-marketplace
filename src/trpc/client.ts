
import { createTRPCReact } from "@trpc/react-query"; 
import { AppRouter } from ".";

// Crea un hook de React llamado trpc utilizando la función createTRPCReact -> facilita la ejecución
// de procedimientos de trpc en componentes react.
export const trpc = createTRPCReact<AppRouter>({}); // Se le pasa el tipo de router de trpc 