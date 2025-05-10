"use client"

import { GlobalContext } from "@/context"
import { CartContext } from "@/context/CartContext"
import { Table } from "@radix-ui/themes"
import { useContext, useRef } from "react"
import { currencyFormat } from '@/utils/currency'

import { useReactToPrint } from 'react-to-print';

const PrintPage =({cart, payments})=>{
    const {order, }= useContext(CartContext)
    const {slug, cartTotal, payment, setPayment, bal, setBal}= useContext(GlobalContext)

    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

console.log(payments,  'pp')

    return(
        <>
        <div ref={contentRef}>
        <div>
        <p className="mt-2 text-center text-sm font-black">UZS SHOPPING MALL</p>
        <p className="mb-1 text-center text-xs font-black">No. 200 Njamanze Enugu State. </p>
        <p className="mt-2 border-b-black border-b-4 mb-1 text-center text-xs font-black">07038327921, 08140023487 </p>    
        <h4 className="text-sm pt-1">Order : Customer</h4>
        <p className="text-sm pb-1">Order No.: {order?.orderNum}</p>
        <hr/>
     </div>
     <div className="mx-auto">
        <Table.Root>
        <Table.Header>        
          <Table.Row>
            <Table.ColumnHeaderCell>ITEMS</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>QTY</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>AMOUNT</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
      
        <Table.Body>
        {cart?.map((item) => (
             <>     
          <Table.Row key={item?._id}>
            <Table.RowHeaderCell> {item?.item}</Table.RowHeaderCell>
            <Table.Cell>{item?.qty}</Table.Cell>
            <Table.Cell>{item?.amount}</Table.Cell>
           
          </Table.Row>
          </>
        ))}
         
          
        </Table.Body>
      </Table.Root>
      </div>
      <div className="flex flex-col" >
      <div className="flex justify-around px-1 uppercase font-bold" >
        <p>Total :</p>
       <p> {currencyFormat(cartTotal)}</p>
       </div>
       <hr/>
      {payments && payments.map((p)=>(

      <>
      <div className="flex justify-around px-1 uppercase font-bold" >
        <p> {p.mop}</p> : <p> {currencyFormat(p.amount)}</p>
       </div>
  
       
      
      {/* <div className="flex justify-around px-1 uppercase font-bold" >
        <p>Amount Paid :</p>
       <p> {currencyFormat(amount)}</p>
       </div>
      <div className="flex justify-around px-1 uppercase font-bold" >
        <p>mop :</p>
       <p> {payment[0]?.mop}</p>
       </div>
      <div className="flex justify-around px-1 uppercase font-bold" >
        <p>balance :</p>
       <p> {currencyFormat(bal)}</p>
       </div> */}
      </>
      ))
      } 
       <div className="flex justify-around px-1 uppercase font-bold" >
        <p>Amount Paid :</p>
       <p> {currencyFormat(payment)}</p>
       </div>
       <hr/>
       <h4 className="mt-2 mb-1 text-center border-t-black border-t-4">Thanks for your patronage</h4>
      
      </div>
      </div>

      <button onClick={reactToPrintFn} className='bg-black text-white px-2  py-1 rounded-lg uppercase'>Print</button>
   </> )
}
export default PrintPage