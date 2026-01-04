"use client"
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
import Image from 'next/image'
import CartItem from '@/components/CartItem/CartItem'
import Link from 'next/link'
 import { GlobalContext } from '@/context'

import React, { useContext, useEffect, useState, useMemo } from 'react'
import CartItemPanel from '@/components/CartItem/CartItem'
import {  usePathname, useRouter, useSearchParams } from "next/navigation";

export const Cart = ({ slug})=>{
const {cart, deleteItem} = useContext(CartContext)
const {setCartTotal, setCartValue} = useContext(GlobalContext)
 const {location, setLocation, setLocationToState} = useContext(GlobalContext)

   const pathname = usePathname();
const [total, setTotal] = useState(0)

    // cart may be stored as { cartItems: [...] } or as an array - memoized
    const items = useMemo(() => 
      Array.isArray(cart) ? cart : (cart?.cartItems ?? [])
    , [cart]);

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
    }, [items, setCartTotal, setCartValue])


return(

<>
<div className="relative w-full h-full">
    <div className="w-full h-full flex flex-col">
      <main className="w-full bg-gray-50 p-2 sm:p-3 space-y-2">
      {items && items.length > 0 ? (
        items.map((item) => (
          <CartItemPanel item={item}  key={item._id || item.product} slug={slug} pathname={pathname}/>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-400">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-sm sm:text-base font-medium">Your cart is empty</p>
          <p className="text-xs sm:text-sm mt-1">Add items to get started</p>
        </div>
      )}
      </main>  
         
   
         
    </div>
</div>

</>
);
};

