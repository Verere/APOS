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

export const Cart = ({cart, slug})=>{
// const {cart, deleteItem} = useContext(CartContext)
 const {setCartTotal} = useContext(GlobalContext)
 const {location, setLocation, setLocationToState} = useContext(GlobalContext)

   const pathname = usePathname();
const [total, setTotal] = useState(0)


useEffect(() => {
    const getTotal = () => {  
  // var newData= cart   
  let newCartItems=[]
  newCartItems =  cart?.map((i) =>
    i.amount)

      if(cart?.length > 0){
        const amtTotal = newCartItems.reduce((acc, item) => 
      acc + (item)
      ,0)

        setTotal(amtTotal)
        setCartTotal(amtTotal)
      }else{
        setTotal(0)
        setCartTotal(0)
      }    

    }
    getTotal()
},[cart, setCartTotal])


return(

<>
<div className="relative w-full h-full py-1 mb-3">
  

    <div className="w-full  h-full py-1 flex flex-col relative px-3  mb-3 ">
      <main className="w-full bg-slate-600 pr-1 p-1">
      
       {cart && cart?.map((item) => (

              <CartItemPanel item={item}  key={item._id} slug={slug} pathname={pathname}/>
              ))} 
      </main>  
         
   
         
    </div>
</div>

</>
);
};

