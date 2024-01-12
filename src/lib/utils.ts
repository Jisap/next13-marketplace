import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(                                  // Esta función recibe 2 argumentos
  price: number | string,                                     // El precio a formatear. Puede ser un número o una cadena.
  options: {                                                  // Un objeto opcional que se puede utilizar 
    currency?: 'USD' | 'EUR' | 'GBP' | 'BDT'                  // para especificar la moneda 
    notation?: Intl.NumberFormatOptions['notation']           // y la notación del precio formateado.
  } = {}
) {
  const { currency = 'USD', notation = 'compact' } = options  // Opciones por defecto

  const numericPrice =                                        // Comprueba el tipo de datos del parámetro price
    typeof price === 'string' ? parseFloat(price) : price     // Si es una cadena, la convierte a un número usando parseFloat(). Sino devuelve price directamente.

  return new Intl.NumberFormat('en-US', { // Crea un nuevo objeto utilizando las opciones especificadas.
    style: 'currency',                    // El objecto Intl.NumberFormat habilita el formato numérico de acuerdo al lenguaje.
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

export function constructMetadata({
  title = 'DigitalHippo - the marketplace for digital assets',
  description = 'DigitalHippo is an open-source marketplace for high-quality digital goods.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@joshtriedcoding',
    },
    icons,
    metadataBase: new URL('https://digitalhippo.up.railway.app'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}