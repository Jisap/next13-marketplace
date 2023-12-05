"use client"

import { PRODUCT_CATEGORIES } from "@/config"
import { useRef, useState } from "react"
import NavItem from "./NavItem"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"

const NavItems = () => {
  
  const[activeIndex, setActiveIndex] = useState<null|number>();
  const isAnyOpen = activeIndex !== null;
  const navRef = useRef<HTMLDivElement | null>(null);
  
  useOnClickOutside(navRef, () => setActiveIndex(null)); // Cierra el menu de navegación si se clickea fuera del ref

  return (
    <div className="flex gap-4 h-full" ref={navRef}>
      {PRODUCT_CATEGORIES.map((category, i) => {
        
          const handleOpen = () => {
            if(activeIndex === i){              // Si se clickea en un item que ya esta abierto su activeIndex=null -> isOpen=false
              setActiveIndex(null)
            }else{
              setActiveIndex(i)                 // Si se clickea en un item cerrado su activeIndex=i
            }
          }  

          const isOpen = i === activeIndex;     // Si i=activeIndex se clickeo en un item y isOPen=true
        
          return (
            <NavItem
              category={category}
              handleOpen={handleOpen}
              isOpen={isOpen}
              key={category.value}
              isAnyOpen={isAnyOpen}
            />  
          )
      })}
    </div>
  )
}

export default NavItems