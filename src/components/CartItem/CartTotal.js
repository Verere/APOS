"use client"
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
 import { GlobalContext } from '@/context'

import React, { useContext, useEffect, useState } from 'react'
import { fetchPaymentByOrder } from '@/actions/fetch'

export const CartTotal = ({pays})=>{
const {cart, deleteItem} = useContext(CartContext)
 const {setCartTotal, cartValue, setCartValue, payment, setPayment,
  bal, setBal} = useContext(GlobalContext)
 const {order, setOrder, cpayment, setCPayment} = useContext(CartContext)

const [total, setTotal] = useState(0)


// normalize cart to always be an array of items
const items = Array.isArray(cart) ? cart : (cart?.cartItems || [])


useEffect(()=>{
  
  const getPayment= async()=>{
 
  //  const Payments = await fetchPaymentByOrder(order?._id)
   let allPayments=[]
    allPayments =  pays?.map((i) => i.amountPaid)  
       const paymentt = allPayments?.reduce((acc, item) => 
       acc + (item)
       ,0)
       setPayment(paymentt)
       const t = total -payment
       setBal(t)
  
  }
  getPayment()
},[payment, cpayment])

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
},[cart, setCartTotal, setCartValue])


return(

<>
<div className=" w-full border flex  sm:flex-col justify-between px-2 border-gray-200 bg-white  mt-5 shadow-sm rounded text-sm font-bold border-t ">
        <h3 className='flex'>Order :
        <span> {"  "}{currencyFormat(total)}</span> </h3>
        <h3 className='flex text-green-700'>Paid :
        <span> {"  "}{currencyFormat(payment)}</span> </h3>
        <h3 className='flex text-orange-500'>Balance :
        <span> {"  "}{currencyFormat(bal)}</span> </h3>
      </div>      
  </>
);
};

