
"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "@/context";
import {useEffect,  useContext, useState, useActionState } from "react";

import Search from "../search/search";
import { addOrder } from "@/actions";
import { toast } from "react-toastify";
import { fetchPatientListByLab } from "@/actions/fetch";
import { currencyFormat } from '@/utils/currency';
import { formatTime } from "@/utils/date";

const OrderTable = ({patients}) => {
  const [slug, setSlug]=useState(null)
  const {user }= useContext(GlobalContext)
  const [state, formAction, isPending] = useActionState(addOrder, {});
     const { replace } = useRouter();
   const pat="patient"
   const pathname = usePathname();
   console.log('p', user)


useEffect(()=>{
  const getSlug=()=>{
  const slg = JSON.parse(localStorage.getItem('slug'))
setSlug(slg)
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
       
       <Table.Root layout="auto" variant="surface">
          <Table.Header>
            
            <Table.Row>
              <Table.ColumnHeaderCell>Receipt No.</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>ITEMS SOLD</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>ORDER AMOUNT</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>AMOUNT PAID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        
          <Table.Body>
           {patients && patients?.map((patient) => (
                    
            <Table.Row key={patient?._id}>
              <Table.RowHeaderCell> {patient?.orderNum}</Table.RowHeaderCell>
                  <Table.Cell>
                <ul className="list-disc pl-5">
                  {patient.items.map((item, i) => (
                    <>
                    <li className="list-none uppercase" key={i}>{item.qty} * {item.item}</li>
                    </>
                  ))}
                </ul>

              </Table.Cell>
              <Table.Cell>{currencyFormat(patient?.amount)}</Table.Cell>
              <Table.Cell>{currencyFormat(patient?.amountPaid)}</Table.Cell>
              <Table.Cell>{patient?.bDate}</Table.Cell>
              <Table.Cell>{formatTime(patient?.createdAt)}</Table.Cell>
              <Table.Cell> {patient.user} </Table.Cell>
          
           
           
             
            </Table.Row>
          ))} 
           
            
          </Table.Body>
        </Table.Root>
    </div>
  );
}
export default OrderTable