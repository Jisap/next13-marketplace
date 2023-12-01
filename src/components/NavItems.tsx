"use client"

import { PRODUCT_CATEGORIES } from "@/config"
import { useState } from "react"
import NavItem from "./NavItem"

const NavItems = () => {
  
  const[activeIndex, setActiveIndex] = useState<null|number>();
  const isAnyOpen = activeIndex !== null;
  
  return (
    <div className="flex gap-4 h-full">
      {PRODUCT_CATEGORIES.map((category, i) => {
        
          const handleOpen = () => {
            if(activeIndex === i){              // Si se clickea en un item que ya esta abierto su activeIndex=null
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