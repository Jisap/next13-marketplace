"use client"

import { trpc } from "@/trpc/client"
import VerifyEmailPage from '../app/(auth)/verify-email/page';
import { Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import Link from "next/link";

interface VerifyEmailProps {
  token: string
}

const VerifyEmail = ({ token }: VerifyEmailProps) => { // Se llega a esta función despues de pinchar el enlace del email que genera un token a traves del cms
  
  const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({ // query -> trpc -> AuthRouter -> VerifyEmail -> payload.verifyEmail -> recibe el token -> si se valida
    token,                                                              // verify:true en "user" -> mensaje de success contenido en la data, sino de isErrors
  })

  if(isError){
    return (
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-8 w-8 text-red-600" />
        <h3 className="font-semibold text-xl">Ther was a problem</h3>
        <p className="text-muted-foreground text-sm">
          This token is not valid or might be expired. Please try again.
        </p>
      </div>  
    )
  }

  if(data?.success){
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative mb-4 h-60 w-60 text-muted-foreground">
          <Image
            src="/nav/hippo-email-sent.png"
            alt="hippo-email-sent"
            fill
          />
        </div>
        <h3 className="font-semibold text-2xl">
          You&apos;re all set!
        </h3>
        <p className="text-muted-foreground text-center mt-1">
          Thank you for verifying your email
        </p>
        <Link
          href="/sign-in"
          className={buttonVariants({
            className: 'mt-4'
          })}
        >
          Sign In
        </Link>
      </div>  
    )
  }

  if(isLoading){
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin h-8 w-8 text-zinc-300" />
        <h3 className="font-semibold text-xl">Verifiying...</h3>
        <p className="text-muted-foreground text-sm">
          This won&apos;t take long.
        </p>
      </div>    
    )
  }
}

export default VerifyEmail