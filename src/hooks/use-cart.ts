import { Product } from '@/payload-types'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware'

export type CartItem = {
  product: Product
}

type CartState = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCart = create<CartState>()( // Se crea el estado del carrito tipo <CartState>
  persist(                                  // Se utiliza la función persist para habilitar la persistencia del estado en el almacenamiento local.
    (set) => ({                             // Se proporciona una función que toma el método set para modificar el estado
      items: [],                            // y devuelve un objeto que representa el estado inicial del carrito más los métodos para modificarlo 
      addItem: (product) =>                 
        set((state) => {
          return { items: [...state.items, { product }] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.product.id !== id
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',                              // La persistencia se configura con un nombre de cart-storage 
      storage: createJSONStorage(() => localStorage),    // y se utiliza el almacenamiento local (localStorage). 
    }
  )
)