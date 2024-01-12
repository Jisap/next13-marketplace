import { buildConfig } from "payload/config";
import { webpackBundler } from "@payloadcms/bundler-webpack"
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";
import { Users } from "./collections/Users";
import dotenv from 'dotenv';
import { Products } from "./collections/Products/Products";
import { Media } from "./collections/Media";
import { ProductFiles } from "./collections/ProductFile";
import { Orders } from "./collections/Orders";

 dotenv.config({
   path: path.resolve(__dirname, '../.env'),
 })

export default buildConfig({                                  // Configura el cms payload

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',        // Se define la URL del servidor que utilizará "Payload"
  collections: [Users, Products, Media, ProductFiles, Orders],// Se definen las colecciones y rutas de la aplicación. 
  routes: {
    admin: '/sell'                                            // la interfaz de administración estará disponible en la ruta /sell.
  },
  admin: {                                                    // Se configura el bundler que se utilizará en la interfaz de administración.
    user: "users",
    bundler: webpackBundler(),                                // En este caso, se utiliza el bundler de Webpack (webpackBundler()).  
    meta: {
      titleSuffix: "- DigitalHippo",
      favicon: "/favicon.ico",
      ogImage: "/thumbnail.jpg",
    },
  },
  rateLimit: {                                                // Se establece un límite de velocidad para las solicitudes al servidor
    max: 2000,
  },
  editor: slateEditor({}),                                    // Se configura el editor que se utilizará en las áreas de texto enriquecido. 
  db: mongooseAdapter({                                       // Se configura la base de datos que utilizará "Payload".  
    url: process.env.MONGODB_URL!
  }),
  typescript:{
    outputFile: path.resolve(__dirname, 'payload-types.ts'),  // Se configura "Payload" para generar un archivo de tipos TypeScript (payload-types.ts)
  },
  
})

// Cuando se ejecuta npm run dev, nodemon se encargará de la ejecución de tu aplicación 
// y utilizará la configuración de "Payload" especificada en src/payload.config.ts. E