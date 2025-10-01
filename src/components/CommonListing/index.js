"use client"

import { useRouter } from "next/navigation"
import ProductButton from "./ProductButton"
import ProductTile from "./ProductTile"
import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "@/context"
import { CartContext } from "@/context/CartContext"




export default function CommonListing({data, orderRcpt}){
    const { cart,  order, setOrder,  currentOrder, } =
        useContext(CartContext);
   

useEffect(()=>{
    const setOrd = async()=>{
        if(currentOrder){
        await    setOrder(orderRcpt[0])
        }
    }
    setOrd()
})

  
    return(
        <section className="bg-white w-full">
                <div className="grid grid-cols-2 gap-2 px-2 ">
                    {
                    data && data.length ?
                    data.map(item =>(
                        <article className="relative flex flex-col border mb-2 cursor-pointer px-2 mt-2" key={item._id}>
                        <ProductTile item={item}/>
                        <ProductButton  item={item} order={orderRcpt}/>
                    </article>
                    ))                  
                    
                    :''
                    }
                </div>
        </section>
    )}