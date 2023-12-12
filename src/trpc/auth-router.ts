import { AuthCredentialsValidator } from "../lib/validators/account-credential-validators";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";


export const authRouter = router( {

  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async({input}) => {
      const { email, password } = input
      const payload = await getPayloadClient()

      // check if user already exists

      const { docs: users } = await payload.find({  // Buscamos en db el usuario por el email del formulario
        collection: "users",
        where: {
          email: {
            equals: email
          },
        },
      })

      
      if(users.length !== 0){
        throw new TRPCError({ code: "CONFLICT"}) // Si hay un usuario con el mismo nombre mensaje de error porque no vamos a duplicarlo
      } 

      await payload.create({                     // Si no lo hay lo creamos en db a través de payload
        collection: "users",
        data: {
          email,
          password,
          role: "user",
        },
      })

      return {
        success: true, sentToEmail: email
      }
    })
})