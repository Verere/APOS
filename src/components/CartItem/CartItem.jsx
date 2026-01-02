'use client'
import { addMenuStock } from '@/actions'
import { GlobalContext } from '@/context'
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
import React, { useContext, useEffect, useState, useActionState } from 'react'
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify'
import {  usePathname, useRouter, useSearchParams } from "next/navigation";



const CartItemPanel = ({item}) => {
  const [state, formAction, isPending] = useActionState(addMenuStock, {});
  const { replace } = useRouter();
const {_id}= item
    const {cart, incr, decr, deleteItem} = useContext(CartContext)  
   const[loading, setLoading] = useState(false)
    const { user, payment, setPayment, setBal} = useContext(GlobalContext)
    const pathname = usePathname()
    // if(!user)replace("/login")

    useEffect(()=>{
      const getError = async()=>{
  
        if(state.error){
        await  toast.warn(state.error)
        await setLoading(true)
        }
      }
      getError()
    },[state])

// sales cancellation removed

  return (
   <>
<article key={item._id} className="border border-gray-200 bg-white shadow-sm rounded-md mb-2 p-2 sm:p-3">
  <div className="flex flex-col gap-2">
    {/* Item name and price */}
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base hover:text-blue-600 truncate">{item.name || item.item}</p>
        <div className="text-xs text-gray-600 mt-0.5">{currencyFormat(item.price)} / item</div>
      </div>
      <div className="font-semibold text-blue-600 text-sm sm:text-base ml-2">{currencyFormat(item.amount)}</div>
    </div>

    {/* Quantity controls and remove button */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center bg-gray-100 rounded-md">
        <button
          onClick={async () => { await decr(cart, item) }}
          className="px-2 sm:px-3 py-1.5 sm:py-2 text-lg bg-gray-200 hover:bg-gray-300 rounded-l active:bg-gray-400"
          aria-label="decrease"
        >−</button>
        <div className="px-3 sm:px-4 text-center font-semibold text-sm sm:text-base min-w-[40px]">{item.qty}</div>
        <button
          onClick={async () => { await incr(cart, item) }}
          className="px-2 sm:px-3 py-1.5 sm:py-2 text-lg bg-gray-200 hover:bg-gray-300 rounded-r active:bg-gray-400"
          aria-label="increase"
        >+</button>
      </div>

      <button
        onClick={async () => { await deleteItem(cart, item) }}
        className="px-3 py-1.5 text-xs sm:text-sm text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 active:bg-red-100 whitespace-nowrap"
      >Remove</button>
    </div>
  </div>
</article>
              </>
  )
}

export default CartItemPanel;

