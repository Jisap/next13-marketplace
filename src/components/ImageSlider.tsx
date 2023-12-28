"use client"

import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import type SwiperType from 'swiper'
import { useEffect, useState } from 'react'
import { Pagination } from 'swiper/modules'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'

interface ImageSliderProps {
  urls: string[]
}

const ImageSlider = ({ urls }: ImageSliderProps) => {

  const [swiper, setSwiper] = useState<null | SwiperType>(null); // Estado para el objeto swiper
  const [activeIndex, setActiveIndex] = useState(0);             // Estado para el índice activo 

  const [slideConfig, setSlideConfig] = useState({               // Estado para la configuración del deslizador 
    isBeginning: true,
    isEnd: activeIndex === (urls.length ?? 0) - 1,
  })

  useEffect(() => {
    swiper?.on('slideChange', ({ activeIndex }) => {             // Nos suscribimos al evento 'slideChange' de Swiper 
      setActiveIndex(activeIndex)                                // y actualizamos el estado local tanto del índice activo como el de la configuración de swiper
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (urls.length ?? 0) - 1,
      })
    })
  }, [swiper, urls])

  const activeStyles = 'active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square h-8 w-8 z-50 place-items-center rounded-full border-2 bg-white border-zinc-300'
  const inactiveStyles = 'hidden text-gray-400'

  return (
    <div className='group relative bg-zinc-100 aspect-square overflow-hidden rounded-xl'>
      <div className='absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition'>
        {/* boton para avanzar en el slide */}
        <button
          onClick={(e) => {
            e.preventDefault()
            swiper?.slideNext()
          }}
          className={cn(
            activeStyles,         // Estilos del boton en estado de hover
            'right-3 transition', // más margen a la derecha con transición.
            {
              [inactiveStyles]: slideConfig.isEnd,                  // Se aplican inactiveStyles si slideConfig.isEnd = true
              'hover:bg-primary-300 text-primary-800 opacity-100':  // Pero sino se aplican estos estilos
                !slideConfig.isEnd,
            }
          )}
          aria-label='next image'>
          <ChevronRight className='h-4 w-4 text-zinc-700' />{' '}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            swiper?.slidePrev()
          }}
          className={cn(activeStyles, 'left-3 transition', {
            [inactiveStyles]: slideConfig.isBeginning,
            'hover:bg-primary-300 text-primary-800 opacity-100':
              !slideConfig.isBeginning,
          })}
          aria-label='previous image'>
          <ChevronLeft className='h-4 w-4 text-zinc-700' />{' '}
        </button>
      </div>
 
      <Swiper
        pagination={{
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`
          },
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
        spaceBetween={50}
        modules={[Pagination]}
        slidesPerView={1}
        className='h-full w-full'>
        {urls.map((url, i) => (
          <SwiperSlide
            key={i}
            className='-z-10 relative h-full w-full'>
            <Image
              fill
              loading='eager'
              className='-z-10 h-full w-full object-cover object-center'
              src={url}
              alt='Product image'
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
    </div>
  )
}

export default ImageSlider