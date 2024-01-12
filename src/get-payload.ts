import dotenv from "dotenv";
import path from "path";
import payload, { Payload } from "payload";
import type { InitOptions } from "payload/config";
import nodemailer from "nodemailer"

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

const transporter = nodemailer.createTransport({
  host:"smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY
  }
})

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

// Este código está diseñado para inicializar y proporcionar un cliente para el sistema de gestión de contenido (CMS) llamado "Payload

export const getPayloadClient = async ({ initOptions }: Args = {}):Promise<Payload> => { 

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
      ...(initOptions || {}),
      email: {                                              // y configuración de la verificación del user vía email.
        transport: transporter,                             
        fromAddress: "onboarding@resend.dev",
        fromName: "DigitalHippo"
      }
    })
  }

  try {
    cached.client = await cached.promise                    // Intenta obtener el cliente desde la promesa
  } catch (e: unknown) {
    cached.promise = null                                   // Si hay un error, se limpia la promesa para que se intente nuevamente en el próximo llamado.
  }

  return cached.client;                                     // Finalmente, devuelve el cliente de Payload que ha sido almacenado en caché.
}

