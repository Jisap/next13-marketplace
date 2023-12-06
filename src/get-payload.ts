import dotenv from "dotenv";
import path from "path";
import payload from "payload";
import type { InitOptions } from "payload/config";

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

let cached = (global as any).payload;   // Se crea una variable cached que almacena el cliente y la promesa de inicialización. 

if(!cached){                            // Si no existe esta variable "cached", el cliente y la promesa son null
  cached = (global as any).payload = {
    client: null,
    promise: null,
  }
}

interface Args {
  initOptions?: Partial<InitOptions> // Interface para las opciones de conexión del cms "payload"
}

export const getPayloadClient = async ({ initOptions }: Args = {}) => { // Este código está diseñado para inicializar y proporcionar un cliente para el sistema de gestión de contenido (CMS) llamado "Payload

  if(!process.env.PAYLOAD_SECRET){                         // Comprobación de la variable de entorno del cms
    throw new Error("PAYLOAD_SECRET is missing")
  }

  if (cached.client) {                                      // Si el cliente ya está en caché, 
    return cached.client                                    // se devuelve directamente sin realizar una nueva inicialización.
  }

  if (!cached.promise) {                                    // Si no hay una promesa existente, 
    cached.promise = payload.init({                         // se inicializa el Payload 
      secret: process.env.PAYLOAD_SECRET,                   // con la clave secreta 
      local: initOptions?.express ? false : true,           // y otras opciones proporcionadas para conexión con el cms.
      ...(initOptions || {})
    })
  }

  try {
    cached.client = await cached.promise                    // Intenta obtener el cliente desde la promesa
  } catch (e: unknown) {
    cached.promise = null                                   // Si hay un error, se limpia la promesa para que se intente nuevamente en el próximo llamado.
  }

  return cached.client;                                     // Finalmente, devuelve el cliente de Payload que ha sido almacenado en caché.
}