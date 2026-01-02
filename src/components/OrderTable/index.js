
"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "@/context";
import {useEffect,  useContext, useState, useActionState } from "react";
import { format } from 'date-fns';
import Search from "../search/search";
import { addOrder } from "@/actions";
import { toast } from "react-toastify";
import { fetchPatientListByLab } from "@/actions/fetch";
import { currencyFormat } from '@/utils/currency';
import { formatTime } from "@/utils/date";
import DatePicker from "react-datepicker";
   import moment from 'moment'

const OrderTable = ({patients}) => {
  const [slug, setSlug]=useState(null)
  const {user }= useContext(GlobalContext)
  const [state, formAction, isPending] = useActionState(addOrder, {});
     const { replace } = useRouter();

   
       var date = moment();
       const [selectedDate, setSelectedDate] = useState(null);
   const bDate = date.format('D/MM/YYYY')

const filteredOrders = selectedDate
    ? patients.filter((order) =>
        order.bDate === format(selectedDate, 'd/MM/yyyy')
    )    
    : patients.filter((order) =>
        order.bDate === bDate);

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
  
 
    // const [item, setItem] = useState([...initialTests])
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
    <div className="p-6 -mt-[6px]">
      {/* Header Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Orders</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Filter by Date:</label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                placeholderText="Select a date..."
                isClearable
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>
          </div>
          
          {selectedDate && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <span className="text-sm text-gray-600">Showing orders for:</span>
              <span className="font-semibold text-blue-600">{format(selectedDate, 'dd/MM/yyyy')}</span>
            </div>
          )}
          
          {!selectedDate && (
            <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <span className="text-sm text-gray-600">Showing today's orders:</span>
              <span className="font-semibold text-green-600">{bDate}</span>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{filteredOrders?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700">
              {currencyFormat(filteredOrders?.reduce((sum, order) => sum + (order?.amount || 0), 0))}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Amount Collected</p>
            <p className="text-2xl font-bold text-purple-700">
              {currencyFormat(filteredOrders?.reduce((sum, order) => sum + (order?.amountPaid || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table.Root layout="auto" variant="surface" className="w-full">
            <Table.Header>
              <Table.Row className="bg-gray-50">
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Receipt No.</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Items Sold</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Order Amount</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Amount Paid</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Time</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">User</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
          
            <Table.Body>
              {filteredOrders && filteredOrders?.length > 0 ? (
                filteredOrders.map((patient) => (
                  <Table.Row key={patient?._id} className="hover:bg-gray-50 transition-colors">
                    <Table.RowHeaderCell className="font-semibold text-blue-600">
                      #{patient?.orderNum}
                    </Table.RowHeaderCell>
                    <Table.Cell>
                      {patient?.items && patient.items.length > 0 ? (
                        <div className="space-y-1">
                          {patient.items.map((item, i) => (
                            <div 
                              key={i} 
                              className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200"
                            >
                              <span className="font-semibold text-blue-600 min-w-[30px]">{item.qty}×</span>
                              <span className="text-gray-700 uppercase">{item.item || item.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No items</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="font-semibold text-gray-800">
                      {currencyFormat(patient?.amount)}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {currencyFormat(patient?.amountPaid)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-gray-600">{patient?.bDate}</Table.Cell>
                    <Table.Cell className="text-gray-600">{formatTime(patient?.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {patient.user}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm">
                        {selectedDate ? 'Try selecting a different date' : 'No orders for today yet'}
                      </p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </div>
  );
}
export default OrderTable