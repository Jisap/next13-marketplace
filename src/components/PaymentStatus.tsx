"use client"

import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PaymentStatusProps {
  orderEmail: string
  orderId: string
  isPaid: boolean
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  
  const router = useRouter()

  const { data } = trpc.payment.pollOrderStatus.useQuery( // Devuelve el status de isPaid de la order
    { orderId },
    {
      enabled: isPaid === false,        // Solo se obtendrá el status de la order si isPaid === false
      refetchInterval: (data) =>        // Se repetirá la petición a traves de un ternario
        data?.isPaid ? false : 1000,    // Si isPaid = true paramos la petición, si isPaid = false -> refetch(1000)
    }
  );

  useEffect(() => {
    if (data?.isPaid) router.refresh()
  }, [data?.isPaid, router]);


  return (
    <div className='mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600'>
      <div>
        <p className='font-medium text-gray-900'>
          Shipping To
        </p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className='font-medium text-gray-900'>
          Order Status
        </p>
        <p>
          {isPaid
            ? 'Payment successful'
            : 'Pending payment'}
        </p>
      </div>
    </div>
  )
}

export default PaymentStatus