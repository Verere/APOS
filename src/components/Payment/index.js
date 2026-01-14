'use client'

import { addPaymentWithOrder } from "@/actions"
import { GlobalContext } from "@/context"
import { useContext, useEffect, useState, useActionState, useRef } from "react"
import { toast } from "react-toastify"
import { useFormState } from 'react-dom';
import { CartContext } from "@/context/CartContext"
import { useReactToPrint } from 'react-to-print';
import { currencyFormat } from '@/utils/currency'

const PaymentPage=({slug, order, location, busDate, pathname})=>{
    const {cartValue,bal, user, cartTotal, store} = useContext(GlobalContext)
    const {cpayment, setCPayment, cart, setCart} = useContext(CartContext)
    const [payment, setPayment]= useState(null)
    const [amount, setAmount]=useState(cartValue)
    const [cash, setCash] = useState(cartValue)
    const [pos, setPos] = useState(0)
    const [transfer, setTransfer] = useState(0)
    const [showPrintModal, setShowPrintModal] = useState(false)
    const [completedOrder, setCompletedOrder] = useState(null)
    const [paymentsData, setPaymentsData] = useState([])
    const [orderItems, setOrderItems] = useState([])
    const printRef = useRef(null)
    const reactToPrintFn = useReactToPrint({ 
        contentRef: printRef,
        pageStyle: `
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        `
      })
    
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
                
                // Prepare payment data for receipt
                const paymentsList = []
                if(cash > 0) paymentsList.push({ mop: 'Cash', amount: parseFloat(cash) })
                if(pos > 0) paymentsList.push({ mop: 'POS', amount: parseFloat(pos) })
                if(transfer > 0) paymentsList.push({ mop: 'Transfer', amount: parseFloat(transfer) })
                
                setPaymentsData(paymentsList)
                setCompletedOrder({
                    ...order,
                    bDate: busDate,
                    amount: cartValue,
                    amountPaid: totalPayment,
                    bal: balance
                })
                
                // Fetch order items from sales
                if(order?._id) {
                    fetch(`/api/sales/order/${order._id}`)
                        .then(res => res.json())
                        .then(data => {
                            if(data.sales && Array.isArray(data.sales)) {
                                setOrderItems(data.sales)
                            } else {
                                // Fallback to cart items if fetch fails
                                setOrderItems(cart?.cartItems || cart || [])
                            }
                        })
                        .catch(err => {
                            console.error('Error fetching order items:', err)
                            // Fallback to cart items
                            setOrderItems(cart?.cartItems || cart || [])
                        })
                } else {
                    // Use cart items if no order ID
                    setOrderItems(cart?.cartItems || cart || [])
                }
                
                // Show print modal
                setShowPrintModal(true)
                
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

        {/* Print Modal */}
        {showPrintModal && completedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h2 className="text-xl font-semibold mb-4 text-center">Payment Successful!</h2>
                    <p className="text-center text-gray-600 mb-6">Would you like to print the receipt?</p>
                    
                    {/* Hidden print content */}
                    <div style={{display: 'none'}}>
                        <div ref={printRef} style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '5mm' }}>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                                    {store?.name || 'STORE NAME'}
                                </h2>
                                <p style={{ margin: '2px 0', fontSize: '11px' }}>
                                    {store?.address || 'Store Address'}
                                </p>
                                <p style={{ margin: '2px 0', fontSize: '11px' }}>
                                    {store?.number && `Tel: ${store.number}`}
                                    {store?.number && store?.whatsapp && ' | '}
                                    {store?.whatsapp && `WhatsApp: ${store.whatsapp}`}
                                </p>
                                {store?.email && (
                                    <p style={{ margin: '2px 0', fontSize: '11px' }}>{store.email}</p>
                                )}
                                <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
                            </div>

                            {/* Order Info */}
                            <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Date:</span>
                                    <span>{completedOrder?.bDate || new Date().toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Receipt #:</span>
                                    <span>{completedOrder?.orderNum || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Cashier:</span>
                                    <span>{user?.name || 'N/A'}</span>
                                </div>
                                <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '10px' }}>
                                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                                            <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                                            <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, index) => (
                                            <tr key={item?._id || index} style={{ borderBottom: '1px dotted #ccc' }}>
                                                <td style={{ padding: '4px 0', wordBreak: 'break-word', maxWidth: '40mm' }}>
                                                    {item?.item || item?.name}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '4px 0' }}>{item?.qty}</td>
                                                <td style={{ textAlign: 'right', padding: '4px 0' }}>
                                                    {currencyFormat(item?.amount || (item?.price * item?.qty))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>
                            </div>

                            {/* Totals */}
                            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', padding: '4px 0' }}>
                                    <span>TOTAL:</span>
                                    <span>{currencyFormat(completedOrder?.amount)}</span>
                                </div>
                                
                                {/* Payment Details */}
                                {paymentsData && paymentsData.length > 0 && (
                                    <>
                                        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
                                        {paymentsData.map((p, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                                <span>{p.mop}:</span>
                                                <span>{currencyFormat(p.amount)}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold' }}>
                                    <span>PAID:</span>
                                    <span>{currencyFormat(completedOrder?.amountPaid)}</span>
                                </div>
                                
                                {completedOrder?.bal > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                        <span>BALANCE:</span>
                                        <span>{currencyFormat(completedOrder?.bal)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }}></div>
                            <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Thank You!</p>
                                <p style={{ margin: '5px 0', fontSize: '10px' }}>Please come again</p>
                                {store?.whatsapp && (
                                    <p style={{ margin: '5px 0', fontSize: '10px' }}>
                                        Questions? WhatsApp: {store.whatsapp}
                                    </p>
                                )}
                                <p style={{ margin: '8px 0', fontSize: '10px', fontWeight: 'bold' }}>Powered by www.marketbook.app</p>
                                                            <p style={{ margin: '2px 0', fontSize: '10px' }}>+2349076361669</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={reactToPrintFn} 
                            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                            Print Receipt
                        </button>
                        <button 
                            onClick={() => setShowPrintModal(false)} 
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    )
}
export default PaymentPage