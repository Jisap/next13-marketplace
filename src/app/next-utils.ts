import next from "next";       // Se importa la biblioteca next, para la creación de aplicaciones web del lado del servidor.



const PORT = Number(process.env.PORT) || 3000;            // Definición del puerto de la aplicación

export const nextApp = next({                             // Instancia de next para el manejo de peticiones al server
  dev: process.env.NODE_ENV !== "production",             // entorno de dev 
  port: PORT                                              // en el puerto expecificado  
});


export const nextHandler = nextApp.getRequestHandler();   // Se define el manejador de solicitudes HTTP entrates y las dirige a la ruta corresp en la aplicación