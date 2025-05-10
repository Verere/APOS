"use client"
import { addCredit } from "@/actions"
import { GlobalContext } from "@/context"
import { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useFormState } from 'react-dom';
import { currencyFormat } from "@/utils/currency"
const CreditSales =({hotelId, orderRcpt, location, busDate, pathname})=>{
    const {cartTotal, user } = useContext(GlobalContext)
    const [values, setValues]=useState("")
    const [amount, setAmount]=useState(cartTotal)
    const [state, formAction, isPending] = useFormState(addCredit, {});

    useEffect(()=>{
        const getState=async()=>{

            if(state.error){
                toast.error(state.error)
            }
            if(state.success){
                toast.success(state.success)
            }
        }
        getState()
    },[state])
    return(
        <div className="flex flex-col">
            <p ><span className="text-blue-500">{currencyFormat(amount)}</span> as Credit sales for <span className="text-blue-500">{orderRcpt[0].orderName}</span></p>
        <form action={formAction}>
<input type="hidden" name="amountPaid" value={amount}  onChange={async(e)=>setAmount(e.target.value)} className='px-2 py-1 my-2 w-full' placeholder= "Enter Amount to pay"/>

                <input type="hidden" name="hotelId" value={hotelId} />
                <input type="hidden" name="orderId" value={orderRcpt[0]._id} />
                <input type="hidden" name="orderNum" value={orderRcpt[0].orderNum} />
                <input type="hidden" name="orderName" value={orderRcpt[0].orderName} />
                <input type="hidden" name="amount" value={cartTotal} />
                <input type="hidden" name="location" value={location} />
                <input type="hidden" name="user" value={user.name} />
                <input type="hidden" name="bDate" value={busDate} />
                <input type="hidden" name="path" value={pathname} />
                <button  className="p-2 w-full mt-2 bg-green-600 text-white font-bold rounded-bg">
               Submit
                </button>
        </form>
        </div>
    )
}
export default CreditSales