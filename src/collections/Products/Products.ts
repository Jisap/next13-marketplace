
import { PRODUCT_CATEGORIES } from "../../config";
import { CollectionConfig } from "payload/types";
import { Product } from "@/payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user
  return { ...data, user: user.id }
}

export const Products: CollectionConfig = {

  slug: "products",
  admin: {
    useAsTitle: "name"
  },
  access:{
    
  },
  hooks: {
    beforeChange: [                                             // Antes de realizar un cambio en la colección
      addUser,                                                  // añadimos el usuario que lo compró al objeto de datos
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
    ]
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