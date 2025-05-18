'use client'
import { addMenuStock } from '@/actions'
import { GlobalContext } from '@/context'
import { CartContext } from '@/context/CartContext'
import { currencyFormat } from '@/utils/currency'
import React, { useContext, useEffect, useState, useActionState } from 'react'
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify'
import {  usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateSalesAction, updateSalesCancel } from '@/actions/update'

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

const handleCancel = async(item, pathname)=> {
  if(payment){
    toast.warn('Payment has been taken for this order. Create new Order')
  }else{

    await setLoading(true)
    await updateSalesCancel(item, pathname)
  }
}

  return (
   <>
<article key={item._id} className="border border-gray-200 bg-white shadow-sm rounded mb-1 p-2">
                  <div   className="flex flex-wrap gap-1  justify-between items-center">
                       
                          <p className=" font-bold hover:text-blue-600">
                             {item.item}
                          </p>
                      
                    
                   
                 <div className='w-1/2 flex justify-between'>

                        <div className="w-24">
                      <div className="flex flex-row h-10 p-1 items-center rounded-lg relative bg-transparent mt-1">
                        <button
                        onClick={()=>decreaseQty(cart, item)} 
                        disabled={item.qty === 1 ? true : false} 
                          className="bg-gray-300 text-black hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                        >
                          <span className="m-auto text-2xl font-thin">−</span>
                        </button>
                        <input
                          type="number"
                          className="focus:outline-none text-center py-1 w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-900  outline-none custom-input-number"
                          name="custom-input-number"
                          value={item.qty}
                          readOnly
                          ></input>
                        <button
                       onClick={()=>increaseQty(cart, item)}
                       disabled={item.qty === item.inStock ? true : false} 
                       className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                       >
                          <span className="m-auto text-2xl font-thin">+</span>
                        </button>
                      </div>
                        </div>
                        <div className='flex flex-col'>
                        <p className="font-semibold not-italic text-blue-600 text-sm ">{currencyFormat(item.amount)}</p>
                        <small className="text-black-600 text-xs">
                          {" "}
                        {currencyFormat(item.price)}/ item{" "}
                        </small>
                        </div>
                          <form action={formAction}>  
                    <input type="hidden" name="itemId" value={item.itemId}/>
                    <input type="hidden" name="item" value={item.item} />
                    <input type="hidden" name="action" value="Return"/>
                    <input type="hidden" name="qty" value={item.qty} />
                    {/* <input type="hidden" name="location" value={location} /> */}
                    {/* <input type="hidden" name="balanceStock" value={item.price}/> */}
                    {/* <input type="hidden" name="totalValue" value="{cartTotal}" /> */}
                    <input type="hidden" name="price" value={item.price}/>
          <input type="hidden" name="slug" value={item.slug} />
                    <input type="hidden" name="bDate" value={item.bDate}/>
                    <input type="hidden" name="user" value={user?.name} />
                     <input type="hidden" name="path" value={pathname} /> 
          <button
onClick={()=>handleCancel(item._id, pathname)}
             className="px-4 py-2 inline-block text-sm font-bold text-red-600 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">

        {loading ? "Removing...":  "Remove"}

          </button>
                        </form>
                 </div>

                    </div>

              </article>
              </>
  )
}

export default CartItemPanel;

