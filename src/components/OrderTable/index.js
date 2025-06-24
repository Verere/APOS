
"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "@/context";
import {useEffect,  useContext, useState } from "react";

import Search from "../search/search";
import { useFormState } from 'react-dom';
import { addOrder } from "@/actions";
import { toast } from "react-toastify";
import { fetchPatientListByLab } from "@/actions/fetch";
import { currencyFormat } from '@/utils/currency';

const OrderTable = ({patients}) => {
  const [slug, setSlug]=useState(null)
  const {user }= useContext(GlobalContext)
  const [state, formAction, isPending] = useFormState(addOrder, {});
     const { replace } = useRouter();
   const pat="patient"
   const pathname = usePathname();

useEffect(()=>{
  const getSlug=()=>{
  const slg = JSON.parse(localStorage.getItem('slug'))
setSlug(slg)
console.log(slug)
  }
  getSlug()
})
   useEffect(()=>{
    const getState=()=>{
  
  if(state.error){
   toast.error(state.error)
  }
  if(state.success){
   toast.success(state.success)
  }
  }
  getState()
   },[state])
  const initialTests = [...patients]
 
    const [item, setItem] = useState([...initialTests])
    const [code, setCode]= useState('')

    useEffect(()=>{
      if(code!=='')setItem(initialTests)
    },[code])

      const handleSearch = async(code) => {       
        
        if (code && code.length) {
          const items = await fetchPatientListByLab(slug, code)
          setItem(items)
          setCode("")
        } else{
          setItem(initialTests)
          setCode("")
        }
        
      }

    return (
    <div className="overflow-x-auto p-6">
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
        <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="py-3 px-4 border-b">Order Number</th>
            <th className="py-3 px-4 border-b">Items Sold</th>
            <th className="py-3 px-4 border-b">Order Amount</th>
            <th className="py-3 px-4 border-b">Amount Paid</th>
          </tr>
        </thead>
        <tbody className="text-gray-800">
          {patients.map((order, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">{order.orderNum}</td>
              <td className="py-3 px-4 border-b">
                <ul className="list-disc pl-5">
                  {order.items.map((item, i) => (
                    <>
                    <li className="list-none" key={i}>{item.qty} * {item.item}</li>
                    </>
                  ))}
                </ul>
              </td>
              <td className="py-3 px-4 border-b">{currencyFormat(order.amount)}</td>
              <td className="py-3 px-4 border-b">{currencyFormat(order.amountPaid)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default OrderTable