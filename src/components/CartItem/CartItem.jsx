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
    const {cart, incr, decr, deleteItem, updateQty} = useContext(CartContext)  
   const[loading, setLoading] = useState(false)
   const [qtyInput, setQtyInput] = useState(item.qty)
    const { user, payment, setPayment, setBal} = useContext(GlobalContext)
    const pathname = usePathname()
    // if(!user)replace("/login")

    useEffect(()=>{
      setQtyInput(item.qty)
    },[item.qty])

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={async () => { await decr(cart, item) }}
          className="px-3 sm:px-4 py-2.5 text-xl font-bold text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-all"
          aria-label="decrease"
        >−</button>
        <input
          type="number"
          value={qtyInput}
          onChange={(e) => {
            setQtyInput(e.target.value)
            updateQty(cart, item, e.target.value)
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.target.blur()
            }
          }}
          min="0"
          className="w-16 sm:w-20 px-2 py-2.5 text-center font-bold text-sm sm:text-base text-gray-900 bg-white border-x-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={async () => { await incr(cart, item) }}
          className="px-3 sm:px-4 py-2.5 text-xl font-bold text-green-600 hover:text-green-700 hover:bg-green-50 active:bg-green-100 transition-all"
          aria-label="increase"
        >+</button>
      </div>
      <div className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
        Subtotal: <span className="text-gray-900 font-semibold">{currencyFormat(item.amount)}</span>
      </div>
    </div>
  </div>
</article>
              </>
  )
}

export default CartItemPanel;

