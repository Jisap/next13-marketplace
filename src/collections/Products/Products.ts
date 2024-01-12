
import { PRODUCT_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "@/payload-types";
import { AfterChangeHook, BeforeChangeHook } from "payload/dist/collections/config/types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user
  return { ...data, user: user.id }
}

const syncUser: AfterChangeHook<Product> = async ({  // Despues de crear el pto o modificar la colección sincronizamos el usuario con la bd
  req,  // Solicitud de cambio/creación
  doc,  // producto que a cambiado/creado
}) => {
  const fullUser = await req.payload.findByID({     // Usuario que quiere crear un pto
    collection: 'users',
    id: req.user.id,
  })

  if (fullUser && typeof fullUser === 'object') {   // Verifica que fullUser existe y si es un objeto
    const { products } = fullUser                   // Si es así extrae la propiedad products del usuario      

    const allIDs = [                                          // Crea un array de ids únicos de productos
      ...(products?.map((product) =>                          
        typeof product === 'object' ? product.id : product
      ) || []),
    ]

    const createdProductIDs = allIDs.filter(                  // Filtrado de IDs duplicados y creación de un array de productos a actualizar:
      (id, index) => allIDs.indexOf(id) === index             // La función de filtro devuelve true para los elementos que cumplen la condición de que  
    )                                                         // la primera aparición del id sea igual al índice actual.  

    const dataToUpdate = [...createdProductIDs, doc.id]       // Luego, agrega el ID del producto (doc.id) al array resultante (dataToUpdate).

    await req.payload.update({                                // Actualización de la información del usuario
      collection: 'users',
      id: fullUser.id,
      data: {
        products: dataToUpdate,
      },
    })
  }
}

const isAdminOrHasAccess =                                    // Generador de reglas de acceso que se utiliza para verificar si un usuario tiene acceso a recursos específicos.
  (): Access =>                                               // La función se define como una función que no toma argumentos pero retorna otra función, la cual retorna un objeto que representa las reglas de accceso
    ({ req: { user: _user } }) => {                           // Dicha fn toma como arg un req que contiene un user (_user es el valor del arg user)
      const user = _user as User | undefined                  // Nos aseguramos que _user sea de tipo User

      if (!user) return false                                 // false si no existe el user (no se da acceso)
      if (user.role === 'admin') return true                  // true si el user es admin   (si se da acceso)

      const userProductIDs = (user.products || []).reduce<    // se transforma el array user.products en un array más simple que contenga solo los ids de los ptos
        Array<string>
      >((acc, product) => {
        if (!product) return acc                              // Si el product es undefined o null se retorna el acumulador sin cambios
        if (typeof product === 'string') {                    // Si product es una cadena se agrega directamente al array acumulador
          acc.push(product)
        } else {
          acc.push(product.id)                                // Si product es un objeto se agreaga el product.id   
        }

        return acc
      }, []); // [] valor inicial del acumulador

      return {
        id: {
          in: userProductIDs,                                 // El array final contiene solo los IDs de los productos cuyo acceso estará en función del role del usuario
        },                                                    // o de si perternecen al usuario que los creo o compro
      }
    }


export const Products: CollectionConfig = {

  slug: "products",
  admin: {
    useAsTitle: "name"
  },
  access:{
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  hooks: {
    beforeChange: [                                             // Antes de realizar un cambio en la colección
      addUser,                                                  // añadimos el usuario que creo/actualizó un pto al objeto de datos
      async (args) => {                                         // y realizamos unas operaciones sobre dicho objeto dependiendo de si es una creación a actualización.

        if(args.operation === "create"){                        // Si creamos un nuevo producto
          const data = args.data as Product
          const createdProduct = await stripe.products.create({ // Creamos el product en la pasarela de pagos stripe
            name: data.name,                                    // con su nombre
            default_price_data: {                               // su precio y la moneda de pago  
              currency: 'EUR',
              unit_amount: Math.round(data.price * 100),
            }
          })
          const updated: Product = {                            // Actualizamos el objeto de datos con los datos de la pasarela de pagos
            ...data,
            stripeId: createdProduct.id, // impuestos
            priceId: createdProduct.default_price as string // precio en euros
          }
          return updated;

        }else if(args.operation === "update"){                  // Si actualizamos un producto
          const data = args.data as Product

          const updatedProduct = await stripe.products.update(data.stripeId!, { // Actualizamos el product en la pasarela de pagos stripe
              name: data.name,
              default_price: data.priceId!,
          })

          const updated: Product = {                                            // Actualizamos en objeto de datos que luego se utilizará en la bd
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          }

          return updated
        }
      }
    ],
    afterChange: [syncUser],                                                    // Despues de realizar un cambio en la colección sincronizamos la colección con la bd
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false
      }
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,

    },
    {
      name: "description",
      type: "textarea",
      label: "Products details",
    },
    {
      name: "price",
      label: "Price in USD",
      min: 0,
      max: 1000,
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATEGORIES.map(({label, value}) => ({label, value})),
      required: true,
    },
    {
      name: "product_files",
      label: "Product file(s)",
      type: "relationship",
      required: true,
      relationTo: "product_files",
      hasMany: false,
    },
    {
      name: "approvedForSale",
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      access: {
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending verification",
          value: "pending"
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Denied",
          value: "denied",
        },
      ],
    },
    {
      name: "priceId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false
      },
      type: "text",
      admin: {
        hidden: true
      },
    },
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false
      },
      type: "text",
      admin: {
        hidden: true
      },
    },
    {
      name: "images",
      type: "array",
      label: "Product images",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images"
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        }
      ]
    }
    
      
    
  ]
}