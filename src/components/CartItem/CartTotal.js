"use client"
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
 import { GlobalContext } from '@/context'

import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { fetchPaymentByOrder } from '@/actions/fetch'

export const CartTotal = ({pays})=>{
const {cart, deleteItem} = useContext(CartContext)
 const {setCartTotal, cartValue, setCartValue, payment, setPayment,
  bal, setBal} = useContext(GlobalContext)
 const {order, setOrder, cpayment, setCPayment} = useContext(CartContext)

const [total, setTotal] = useState(0)


// normalize cart to always be an array of items
const items = useMemo(() => 
  Array.isArray(cart) ? cart : (cart?.cartItems || [])
, [cart]);


useEffect(()=>{
  
  const getPayment= async()=>{
 
  //  const Payments = await fetchPaymentByOrder(order?._id)
   let allPayments=[]
    allPayments =  pays?.map((i) => i.amountPaid)  
       const paymentt = allPayments?.reduce((acc, item) => 
       acc + (item)
       ,0)
       setPayment(paymentt)
  
  }
  getPayment()
},[cpayment, pays, setPayment])

// Calculate balance whenever total or payment changes
useEffect(() => {
  const balance = total - (payment || 0)
  setBal(balance)
}, [total, payment, setBal])

useEffect(() => {
    const getTotal = () => {     
      if(!items || items.length === 0){
        setTotal(0)
        setCartValue(0)
        setCartTotal(0)
        return
      }
      const amtTotal = items.reduce((acc, i) => acc + (i.amount || 0), 0)
      const qtyTotal = items.reduce((acc, i) => acc + (i.qty || 0), 0)
      setTotal(amtTotal)
      setCartValue(amtTotal)
      setCartTotal(qtyTotal)
    

    }
    getTotal()
},[items, setCartTotal, setCartValue])


return(

<>
<div className="w-full border-t-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white shadow-lg">
      <div className="p-3 sm:p-4 space-y-2">
        {/* Order Amount */}
        <div className='flex justify-between items-center py-1.5 border-b border-gray-200'>
          <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Order Total:</span>
          <span className="text-base sm:text-lg font-bold text-gray-900">{currencyFormat(total)}</span>
        </div>
        
        {/* Paid Amount */}
        <div className='flex justify-between items-center py-1.5'>
          <span className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wide">Amount Paid:</span>
          <span className="text-base sm:text-lg font-bold text-green-700">{currencyFormat(payment || 0)}</span>
        </div>
        
        {/* Balance */}
        <div className='flex justify-between items-center py-2 px-2 bg-orange-50 rounded-lg border border-orange-200'>
          <span className="text-sm sm:text-base font-bold text-orange-700 uppercase tracking-wide">Balance Due:</span>
          <span className="text-lg sm:text-xl font-extrabold text-orange-600">{currencyFormat(bal|| 0)}</span>
        </div>
      </div>
    </div>      
  </>
);
};

