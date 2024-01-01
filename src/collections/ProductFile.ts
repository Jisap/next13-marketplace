import { User } from '../payload-types'
import { BeforeChangeHook } from 'payload/dist/collections/config/types'
import { Access, CollectionConfig } from 'payload/types'

const addUser: BeforeChangeHook = ({ req, data }) => {      // Añade el ID del usuario actual (req.user.id) al campo user en los datos que se van a cambiar.
  const user = req.user as User | null
  return { ...data, user: user?.id }
}

const yourOwnAndPurchased: Access = async ({ req }) => {     // Esta función determina qué archivos de productos tiene acceso un usuario. 
  
  const user = req.user as User | null

  if(user?.role === "admin") return true                     // Si el usuario es admin puede ver todos 
  if(!user) return false                                     // Sino existe un usuario no puede ver nada

  const {docs: products} = await req.payload.find({          // Productos existentes
    collection: "products",
    depth: 0,
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const ownProductFileIds = products                          // De los ptos existentes se obtienen los productos que el usuario a creado y de los que es propietario
    .map((prod) => prod.product_files)
    .flat()

  const { docs: orders } = await req.payload.find({           // Ordenes existentes, ptos que se han comprado
    collection: 'orders',
    depth: 2,
    where: {
      user: {
        equals: user.id,
      },
    },
  });
  
  const purchasedProductFileIds = orders.map((order) => {     // De las ordenes se obtienen los productos comprados por el usuario
    
    return order.products.map((product) => {
      
      if(typeof product === "string") return req.payload.logger.error( // Si el product es una cadena, el pto es solo un id y no se ha recuperado completamente
        'Search depth not sufficient to find purchased file IDs'       // Mensaje de error.  
      )

      return typeof product.product_files === 'string'  // Si el product_files es una cadena se asume que es un id
        ? product.product_files                         // y lo devuele
        : product.product_files.id                      // sino será un objeto que tiene una prop id y se devuelve.
    })
  })
  .filter(Boolean) // Se eliminan rdos falsys
  .flat()          // Se obtiene un array único de ids. 

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds] // El usuario tendrá acceso a los ptos cuyas ids sean de sus creaciones y de lo que haya comprado
    }
  }
}

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  admin: {
    hidden: ({ user }) => user.role !== 'admin',
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === 'admin',
    delete: ({ req }) => req.user.role === 'admin',
  },
  upload: {
    staticURL: '/product_files',
    staticDir: 'product_files',
    mimeTypes: [
      'image/*',
      'font/*',
      'application/postscript',
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true,
    },
  ],
}