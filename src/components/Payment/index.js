'use client'

import { addPaymentWithOrder } from "@/actions"
import { GlobalContext } from "@/context"
import { useContext, useEffect, useState, useActionState } from "react"
import { toast } from "react-toastify"
import { useFormState } from 'react-dom';
import { CartContext } from "@/context/CartContext"

const PaymentPage=({slug, order, location, busDate, pathname})=>{
    const {cartValue,bal, user, cartTotal} = useContext(GlobalContext)
    const {cpayment, setCPayment, cart, setCart} = useContext(CartContext)
    const [payment, setPayment]= useState(null)
    const [amount, setAmount]=useState(cartValue)
    const [cash, setCash] = useState(cartValue)
    const [pos, setPos] = useState(0)
    const [transfer, setTransfer] = useState(0)
    const totalPayment = (parseFloat(cash || 0) || 0) + (parseFloat(pos || 0) || 0) + (parseFloat(transfer || 0) || 0)
    const orderTotal = parseFloat(cartValue || 0) || 0
    const rawBalance = Number((orderTotal - totalPayment).toFixed(2))
    const balance = rawBalance < 0 ? 0 : rawBalance
    const isInvalid = totalPayment > orderTotal
        const [state, formAction, isPending] = useActionState(addPaymentWithOrder, {});
        const [mopSelected, setMopSelected] = useState(['cash'])
        const toggleMop = (val) => {
            setMopSelected(prev => {
                if(prev.includes(val)){
                    // removing selection -> clear corresponding amount
                    if(val === 'cash') setCash(0)
                    if(val === 'pos') setPos(0)
                    if(val === 'transfer') setTransfer(0)
                    return prev.filter(x=>x!==val)
                }
                return [...prev, val]
            })
        }
    const[loading, setLoading]= useState(false)

    useEffect(()=>{
        const getState=async()=>{

            if(state.error){
                // if server returned latest stock values, update local storage stock and reduce cart quantities
                if(state.stockUpdates && Array.isArray(state.stockUpdates)){
                    try{
                        // adjust cart quantities to DB stock
                        const currentCart = cart?.cartItems || cart || []
                        const newCartItems = []
                        for(const ci of currentCart){
                            const su = state.stockUpdates.find(u=>String(u.product) === String(ci.product))
                            if(su){
                                const newQty = Math.min(Number(ci.qty || 0), Number(su.qty || 0))
                                if(newQty > 0){
                                    newCartItems.push({ ...ci, qty: newQty, amount: (ci.price || 0) * newQty })
                                }
                            }else{
                                newCartItems.push(ci)
                            }
                        }
                        localStorage.setItem('cart', JSON.stringify({ cartItems: newCartItems }))
                        setCart(JSON.parse(localStorage.getItem('cart')))
                        toast.error(state.error + '. Cart updated from server stock values.')
                    }catch(e){
                        toast.error(state.error)
                    }
                }else{
                    toast.error(state.error)
                }
                setLoading(false)
            }
            if(state.success){
                toast.success(state.success)
                // clear cart after successful payment/checkout
                try{ setCart([]) }catch(e){}
                setLoading(false)
            }
        }
        getState()
    },[state])

    // submit is handled by the form action `formAction` (addPaymentWithOrder)

    return(
        <div className="flex flex-col">
        <form action={formAction}>
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                        <label className='block text-sm font-medium text-gray-700'>Total Order:</label>
                        <input type="text" name="totalOrder" value={cartValue} readOnly className='px-2 border py-1 my-2 w-full bg-gray-100' />
                    </div>
                    <div className="flex flex-col space-y-2">
                                                <label className='block text-sm font-medium text-gray-700'>MOP (select one or more):</label>
                                                <div className="flex gap-3 items-center">
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="mopOption" value="cash" checked={mopSelected.includes('cash')} onChange={()=>toggleMop('cash')} />
                                                        <span>Cash</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="mopOption" value="pos" checked={mopSelected.includes('pos')} onChange={()=>toggleMop('pos')} />
                                                        <span>POS</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input type="checkbox" name="mopOption" value="transfer" checked={mopSelected.includes('transfer')} onChange={()=>toggleMop('transfer')} />
                                                        <span>Transfer</span>
                                                    </label>
                                                </div>
                                        </div>
                    {mopSelected.includes('cash') && (
                        <div className="flex items-center space-x-2">
                            <label className='block text-sm font-medium text-gray-700'>Cash:</label>
                            <input type="number" name="cashPaid" value={cash}  onChange={async(e)=>setCash(e.target.value)} className='px-2 border py-1 my-2 w-full' placeholder= "Cash amount"/>
                        </div>
                    )}

                    {mopSelected.includes('pos') && (
                        <div className="flex items-center space-x-2">
                            <label className='block text-sm font-medium text-gray-700'>POS:</label>
                            <input type="number" name="posPaid" value={pos}  onChange={async(e)=>setPos(e.target.value)} className='px-2 border py-1 my-2 w-full' placeholder= "POS amount"/>
                        </div>
                    )}

                    {mopSelected.includes('transfer') && (
                        <div className="flex items-center space-x-2">
                            <label className='block text-sm font-medium text-gray-700'>Transfer:</label>
                            <input type="number" name="transferPaid" value={transfer}  onChange={async(e)=>setTransfer(e.target.value)} className='px-2 border py-1 my-2 w-full' placeholder= "Transfer amount"/>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <label className='block text-sm font-medium text-gray-700'>Total Payment:</label>
                        <input type="number" name="amountPaid" value={totalPayment} readOnly className='px-2 border py-1 my-2 w-full bg-gray-100' />
                    </div>
                                        {isInvalid && (
                                            <div className="text-sm text-red-600">Total payment cannot exceed total order value.</div>
                                        )}

                    <div className="flex items-center space-x-2">
                        <label className='block text-sm font-medium text-gray-700'>Balance:</label>
                        <input type="number" name="balance" value={balance} readOnly className='px-2 border py-1 my-2 w-full bg-gray-100' />
                    </div>

                    

                                        
                </div>

                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="cartItems" value={JSON.stringify(cart?.cartItems || cart || [])} />
                <input type="hidden" name="orderId" value={order?._id} />
                <input type="hidden" name="orderNum" value={order?.orderNum} />
                <input type="hidden" name="orderName" value={order?.orderName} />
                <input type="hidden" name="paymentNum" value={payment} />
                <input type="hidden" name="orderAmount" value={cartValue} />
                <input type="hidden" name="mop" value={mopSelected.join(',')} />
                <input type="hidden" name="cashPaid" value={cash} />
                <input type="hidden" name="posPaid" value={pos} />
                <input type="hidden" name="transferPaid" value={transfer} />
                <input type="hidden" name="amountPaid" value={totalPayment} />
                <input type="hidden" name="bal" value={balance} />
                <input type="hidden" name="location" value={location} />
                    <input type="hidden" name="user" value={user?.name} />
                <input type="hidden" name="bDate" value={busDate} />
                <input type="hidden" name="path" value={pathname} />
                     <button type="submit" disabled={isInvalid || isPending} className={`p-2 w-full mt-2 font-bold rounded-bg ${isInvalid ? 'bg-gray-400 text-gray-700' : 'bg-green-600 text-white'}`}>
                 {isPending ? "Making Payment...": "Make Payment"}  
                     </button>
        </form>
        </div>
    )
}
export default PaymentPage