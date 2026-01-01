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
<article key={item._id} className="border border-gray-200 bg-white shadow-sm rounded mb-1 p-2">
  <div className="flex flex-col lg:flex-row gap-2 justify-between items-start lg:items-center">
    <div className="flex-1 w-full">
      <p className="font-bold hover:text-blue-600 truncate">{item.name || item.item}</p>
      <div className="text-xs text-gray-600">{currencyFormat(item.price)} / item</div>
    </div>

    <div className="flex items-center gap-2">
      <div className="flex items-center bg-gray-100 rounded-md">
        <button
          onClick={async () => { await decr(cart, item) }}
          className="px-3 py-2 text-lg bg-gray-200 hover:bg-gray-300 rounded-l"
          aria-label="decrease"
        >−</button>
        <div className="px-4 text-center font-semibold">{item.qty}</div>
        <button
          onClick={async () => { await incr(cart, item) }}
          className="px-3 py-2 text-lg bg-gray-200 hover:bg-gray-300 rounded-r"
          aria-label="increase"
        >+</button>
      </div>

      <div className="flex flex-col items-end">
        <div className="font-semibold text-blue-600">{currencyFormat(item.amount)}</div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={async () => { await deleteItem(cart, item) }}
            className="px-3 py-1 text-sm text-red-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >Remove</button>
        </div>
      </div>
    </div>
  </div>
</article>
              </>
  )
}

export default CartItemPanel;

