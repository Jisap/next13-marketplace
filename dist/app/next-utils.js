"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextHandler = exports.nextApp = void 0;
var next_1 = __importDefault(require("next")); // Se importa la biblioteca next, para la creación de aplicaciones web del lado del servidor.
var PORT = Number(process.env.PORT) || 3000; // Definición del puerto de la aplicación
exports.nextApp = (0, next_1.default)({
    dev: process.env.NODE_ENV !== "production", // entorno de dev 
    port: PORT // en el puerto expecificado  
});
exports.nextHandler = exports.nextApp.getRequestHandler(); // Se define el manejador de solicitudes HTTP entrates y las dirige a la ruta corresp en la aplicación
