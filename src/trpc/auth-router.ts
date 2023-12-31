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
        success: true,                          // Si se creo el usuario devolvemos true    
        sentToEmail: email                      // y ademas la prop sentToEmail con el email
      }                                         // en signUp se usará en el useMutation tanto para el toast como para el '/verify-email?to='
    }),

    verifyEmail: publicProcedure                        // Despues de pinchar en enlace del correo se redirige a /verify-email -> <VerifyEmail /> -> AuthRouter
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
      }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input
      const { res } = ctx
      
      const payload = await getPayloadClient()

      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password,
          },
          res, // La respuesta del server es un user y un token para autenticación. 
        });    // Ademas establece automaticamente una cookie http que incluye dicho token con el label "payload-token". 

        return { success: true }
      } catch (err) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    }),
})