"use client"


interface ImageSliderProps {
  urls: string[]
}


const ImageSlider = ({urls}: ImageSliderProps) => {
  
  
  
  
  return (
    <div className='group relative bg-zinc-100 aspect-square overflow-hidden rounded-xl'>
      <div className='absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition'>
        
      </div>
    </div>
  )
}

export default ImageSlider