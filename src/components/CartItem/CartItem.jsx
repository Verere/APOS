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
<article className="border border-gray-200 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow mb-2 overflow-hidden">
  <div className="p-3 sm:p-4">
    {/* Item name and price */}
    <div className="flex justify-between items-start gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
          {item.name || item.item}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs sm:text-sm text-gray-500">{currencyFormat(item.price)}</span>
          <span className="text-xs text-gray-400">× {item.qty}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="font-bold text-base sm:text-lg text-blue-600">{currencyFormat(item.amount)}</div>
        <button
          onClick={async () => { await deleteItem(cart, item) }}
          className="text-xs text-red-500 hover:text-red-700 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>

    {/* Quantity controls */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <button
          onClick={async () => { await decr(cart, item) }}
          className="px-3 sm:px-4 py-2 text-lg font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg active:bg-gray-200 transition-colors"
          aria-label="decrease"
        >−</button>
        <div className="px-4 sm:px-6 py-2 text-center font-bold text-sm sm:text-base text-gray-900 min-w-[50px] border-x border-gray-200">{item.qty}</div>
        <button
          onClick={async () => { await incr(cart, item) }}
          className="px-3 sm:px-4 py-2 text-lg font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg active:bg-gray-200 transition-colors"
          aria-label="increase"
        >+</button>
      </div>
      <div className="text-xs sm:text-sm text-gray-500 font-medium">
        Subtotal: <span className="text-gray-900 font-semibold">{currencyFormat(item.amount)}</span>
      </div>
    </div>
  </div>
</article>
              </>
  )
}

export default CartItemPanel;

