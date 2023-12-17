import { AuthCredentialsValidator } from "../lib/validators/account-credential-validators";
import { publicProcedure, router } from './trpc';
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const authRouter = router( {

  createPayloadUser: publicProcedure                // Procedimiento para la creación de un usuario en payload
    .input(AuthCredentialsValidator)                    // Requiere de los datos del usuario validados por zod
    .mutation(async({input}) => {                       // y de una función que mute su estado en payload
      const { email, password } = input                     // Esta función necesita esos datos del usuario           
      const payload = await getPayloadClient()              // y el cliente de gestión del cms 

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
        success: true, sentToEmail: email       // Si se creo el usuario en bd establecemos la prop sentToEmail con el email
      }                                         // en signUp se usará en el useMutation tanto para el toast como para el '/verify-email?to='
    }),

    verifyEmail: publicProcedure
      .input(z.object({token: z.string()}))
      .query( async ({ input }) => {
        const { token } = input
        const payload = await getPayloadClient()

        const isVerified = await payload.verifyEmail({  // El cliente comprueba que el usuario de bd coincide con el del token -> isVerified = true
          collection: "users",
          token
        })

        if(!isVerified) throw new TRPCError({ code: "UNAUTHORIZED"})

        return { success: true }  // Este true se coloca en el campo verify de la collection "Users"
      })
})