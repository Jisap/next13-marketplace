"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ImageCarouselProps {
  urls: string[]
}

const ImageCarousel = ({ urls }: ImageCarouselProps) => {

  return (
    <div>
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {
            urls.map((url, i) => (
              <CarouselItem key={i}>
                <div className="flex aspect-square justify-center items-center p-6">
                  <Image
                    width={200}
                    height={200} 
                    loading='eager'
                    className='-z-10 h-full w-full object-cover object-center rounded-sm'
                    src={url}
                    alt='Product image'
                  />
                </div>
              </CarouselItem>
            ))
          }
        </CarouselContent> 
        
        <CarouselPrevious />
        <CarouselNext />
          
          
      </Carousel>

    </div>
  )
}

export default ImageCarousel

