'use client'

import { addPayment } from "@/actions"
import { GlobalContext } from "@/context"
import { useContext, useEffect, useState, useActionState } from "react"
import { toast } from "react-toastify"
import { useFormState } from 'react-dom';
import { CartContext } from "@/context/CartContext"

const PaymentPage=({hotelId, order, location, busDate, pathname})=>{
    const {cartTotal,bal, user} = useContext(GlobalContext)
    const {cpayment, setCPayment} = useContext(CartContext)
    const [payment, setPayment]= useState(null)
    const [amount, setAmount]=useState(cartTotal)
    const [state, formAction, isPending] = useActionState(addPayment, {});
    const [mop, setMop] = useState("cash")
    const[loading, setLoading]= useState(false)

    useEffect(()=>{
        const getState=async()=>{

            if(state.error){
                toast.error(state.error)
                setLoading(false)
            }
            if(state.success){
                toast.success(state.success)
                setLoading(false)
            }
        }
        getState()
    },[state])

    const handlePayment = async()=>{
        await setLoading(true)
        await setCPayment(cpayment +1)
    }

    return(
        <div className="flex flex-col">
        <form action={formAction}>
        <div className="flex items-center space-x-2">
            <label
              htmlFor='amountPaid'
              className='block text-sm font-medium text-gray-700'
            >
         Amount:
            </label>
<input type="number" name="amountPaid" value={amount}  onChange={async(e)=>setAmount(e.target.value)} className='px-2 border py-1 my-2 w-full' placeholder= "Enter Amount to pay"/>
</div>

<div className="flex items-center space-x-2">
            <label
              htmlFor='mop'
              className='block text-sm font-medium text-gray-700'
            >
            MOP:
            </label>
<select className="mt-2 px-2 py-2 w-full" name="mop" id="mop"  onChange={async(e)=>setMop(e.target.value)} >
        
            <option   value="cash" >Cash</option>
            <option   value="transfer" >Transfer</option>
            <option   value="pos" >POS</option>
         
    </select>
    </div>

                <input type="hidden" name="hotelId" value={hotelId} />
                <input type="hidden" name="orderId" value={order?._id} />
                <input type="hidden" name="orderNum" value={order?.orderNum} />
                <input type="hidden" name="orderName" value={order?.orderName} />
                <input type="hidden" name="paymentNum" value={payment} />
                <input type="hidden" name="orderAmount" value={cartTotal} />
                <input type="hidden" name="bal" value={bal} />
                <input type="hidden" name="location" value={location} />
                    <input type="hidden" name="user" value={user?.name} />
                <input type="hidden" name="bDate" value={busDate} />
                <input type="hidden" name="path" value={pathname} />
                <button onClick={()=>handlePayment()} className="p-2 w-full mt-2 bg-green-600 text-white font-bold rounded-bg">
             {loading ? "Making Payment...": "Make Payment"}  
                </button>
        </form>
        </div>
    )
}
export default PaymentPage