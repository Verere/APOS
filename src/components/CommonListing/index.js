"use client"

import { useRouter } from "next/navigation"
import ProductButton from "./ProductButton"
import ProductTile from "./ProductTile"
import { useContext, useEffect, useState, useMemo } from "react"
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

  // Memoize to avoid unnecessary re-renders when data hasn't changed
  const hasData = useMemo(() => data && data.length > 0, [data]);
  
    return(
        <section className="bg-white w-full pb-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-3">
                    {
                    hasData &&
                    data.map(item =>(
                        <article className="relative flex flex-col border border-gray-200 rounded-xl overflow-hidden cursor-pointer bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-300 group" key={item._id}>
                        <ProductTile item={item}/>
                        <ProductButton  item={item} />
                    </article>
                    ))                  
                    
                    
                    }
                </div>
        </section>
    )}