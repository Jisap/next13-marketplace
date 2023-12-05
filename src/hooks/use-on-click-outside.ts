import { RefObject, useEffect } from "react";

type Event = MouseEvent | TouchEvent; // Definición del tipo de evento

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,                // Elemento del DOM de tipo genérico 'T'
  handler: (event: Event) => void   // Función que se llamará cuando se detecte un click fuera del elemento referenciado
) => {
  useEffect(() => {
    const listener = (event: Event) => {                          // listener para el evento click del ratón
      const el = ref?.current;                                    // Elemento referenciado
      if (!el || el.contains((event?.target as Node) || null)) {  // Se comprueba si el ref existe y si el click se ha producido dentro de ese elemento
        return;                                                   // En esos casos no se hace nada
      }

      handler(event); // Se llamará a esta función (setActiveIndex(null) -> isOpen=false) si el click se produjo fuera del ref
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes
};