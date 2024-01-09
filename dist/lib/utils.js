"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = exports.cn = void 0;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
exports.cn = cn;
function formatPrice(// Esta función recibe 2 argumentos
price, // El precio a formatear. Puede ser un número o una cadena.
options) {
    if (options === void 0) { options = {}; }
    var _a = options.currency, currency = _a === void 0 ? 'USD' : _a, _b = options.notation, notation = _b === void 0 ? 'compact' : _b; // Opciones por defecto
    var numericPrice = // Comprueba el tipo de datos del parámetro price
     typeof price === 'string' ? parseFloat(price) : price; // Si es una cadena, la convierte a un número usando parseFloat(). Sino devuelve price directamente.
    return new Intl.NumberFormat('en-US', {
        style: 'currency', // El objecto Intl.NumberFormat habilita el formato numérico de acuerdo al lenguaje.
        currency: currency,
        notation: notation,
        maximumFractionDigits: 2,
    }).format(numericPrice);
}
exports.formatPrice = formatPrice;
