"use client"

import { useRouter } from "next/navigation"
import ProductButton from "./ProductButton"
import ProductTile from "./ProductTile"
import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "@/context"
import { CartContext } from "@/context/CartContext"




export default function CommonListing({data}){
    const { cart,  order, setOrder,  currentOrder, } =
        useContext(CartContext);
   

// useEffect(()=>{
//     const setOrd = async()=>{
//         if(currentOrder){
//         await    setOrder(orderRcpt[0])
//         }
//     }
//     setOrd()
// })

  
    return(
        <section className="bg-white w-full">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2">
                    {
                    data && data.length ?
                    data.map(item =>(
                        <article className="relative flex flex-col border rounded-md mb-2 cursor-pointer p-2 sm:p-3 mt-2 bg-white hover:shadow-md" key={item._id}>
                        <ProductTile item={item}/>
                        <ProductButton  item={item} />
                    </article>
                    ))                  
                    
                    :''
                    }
                </div>
        </section>
    )}