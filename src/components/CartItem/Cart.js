"use client"
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
import Image from 'next/image'
import CartItem from '@/components/CartItem/CartItem'
import Link from 'next/link'
 import { GlobalContext } from '@/context'

import React, { useContext, useEffect, useState } from 'react'
import CartItemPanel from '@/components/CartItem/CartItem'
import {  usePathname, useRouter, useSearchParams } from "next/navigation";

export const Cart = ({ slug})=>{
const {cart, deleteItem} = useContext(CartContext)
const {setCartTotal, setCartValue} = useContext(GlobalContext)
 const {location, setLocation, setLocationToState} = useContext(GlobalContext)

   const pathname = usePathname();
const [total, setTotal] = useState(0)

    // cart may be stored as { cartItems: [...] } or as an array
    const items = Array.isArray(cart) ? cart : (cart?.cartItems ?? [])

    useEffect(() => {
      const getTotal = () => {
        if(!items || items.length === 0){
          setTotal(0)
          setCartTotal(0)
          setCartValue(0)
          return
        }
        const amtTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
        const qtyTotal = items.reduce((acc, item) => acc + (item.qty || 0), 0)
        setTotal(amtTotal)
        setCartValue(amtTotal)
        setCartTotal(qtyTotal)
      }
      getTotal()
    }, [cart, setCartTotal, setCartValue])


return(

<>
<div className="relative w-full h-full">
    <div className="w-full h-full flex flex-col">
      <main className="w-full bg-slate-50 p-1 sm:p-2">
      
      {items && items.map((item) => (

        <CartItemPanel item={item}  key={item._id || item.product} slug={slug} pathname={pathname}/>
        ))} 
      </main>  
         
   
         
    </div>
</div>

</>
);
};

