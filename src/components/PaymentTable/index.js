

"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateProd, updateProdPrice } from "@/actions";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Heading from "../Heading";
import { currencyFormat } from "@/utils/currency";
import { formatTime } from "@/utils/date";
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

const PaymentTable=({payments, allPayment, slug})=>{
 
    const { replace } = useRouter();
    const pathname = usePathname()
    const [price, setPrice] = useState(0)
    const [qty, setQty] = useState(0)
    const [loading, setLoading]= useState(false)
   
    const  handleUpdate =async(id, path)=>{
await updateProd(id, path)
    }

    // const { user} = useContext(GlobalContext)
    const [totalPayment, setTotalPayment] = useState(0)
    const [totalCash, setTotalCash] = useState(0)
    const [totalTransfer, setTotalTransfer] = useState(0)
    const [totalPos, setTotalPos] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null);

     const filteredPayments = selectedDate
    ? allPayment.filter((order) =>
        order.bDate === format(selectedDate, 'd/MM/yyyy')
    )    
    : payments;

    useEffect(()=>{
      const getValues = async ()=>{
        let tempPay= filteredPayments
        const filteredCash = filteredPayments.filter(p => p.mop==="cash")
        const filteredPos = filteredPayments.filter(p => p.mop==="pos")
        const filteredTransfer = filteredPayments.filter(p => p.mop==="transfer")
        let allPayments=[]
            allPayments =  tempPay.map((i) => i.amountPaid)
            const amtTotal = allPayments.reduce((acc, item) => acc + (item),0)
          await setTotalPayment(amtTotal)    
     
         
          let tempCash=[]
          tempCash =  filteredCash.map((i) => i.amountPaid)
          const cashTotal = tempCash.reduce((acc, item) => acc + (item),0)
        await setTotalCash(cashTotal)

          let tempPos=[]
          tempPos =  filteredPos.map((i) => i.amountPaid)
          const posTotal = tempPos.reduce((acc, item) => acc + (item),0)
        await setTotalPos(posTotal)

          let tempTrans=[]
          tempTrans =  filteredTransfer.map((i) => i.amountPaid)
          const tTotal = tempTrans.reduce((acc, item) => acc + (item),0)
        await setTotalTransfer(tTotal)
}
getValues()
},[filteredPayments])

    const handleEdit=async(id, price, qty, path)=>{
      setLoading(true)
     const update = await updateProdPrice(id, price, qty, path)
     setLoading(false)
     setPrice(0)
     setQty(0)
    }

return( 
  <div className="p-6 -mt-[56px]">
    {/* Header Section with Date Filter */}
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        
        <div className="flex-1 max-w-xs">
          <label className="block mb-2 text-sm font-semibold text-gray-700">Filter by Date:</label>
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

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Cash Payments</p>
          <p className="text-2xl font-bold text-green-700">{currencyFormat(totalCash)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">POS Payments</p>
          <p className="text-2xl font-bold text-blue-700">{currencyFormat(totalPos)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Transfer Payments</p>
          <p className="text-2xl font-bold text-purple-700">{currencyFormat(totalTransfer)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-orange-700">{currencyFormat(totalPayment)}</p>
        </div>
      </div>

      {/* Count Summary */}
      <div className="mt-4 flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
        <span className="text-sm text-gray-600">Total Transactions:</span>
        <span className="font-semibold text-gray-800">{filteredPayments?.length || 0}</span>
        {selectedDate && (
          <>
            <span className="text-sm text-gray-400 mx-2">|</span>
            <span className="text-sm text-gray-600">Date:</span>
            <span className="font-semibold text-blue-600">{format(selectedDate, 'dd/MM/yyyy')}</span>
          </>
        )}
      </div>
    </div>

    {/* Table Section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table.Root layout="auto" variant="surface" className="w-full">
          <Table.Header>
            <Table.Row className="bg-gray-50">
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">Receipt No.</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">Amount Paid</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">User</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700">Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        
          <Table.Body>
            {filteredPayments && filteredPayments?.length > 0 ? (
              filteredPayments.map((patient) => (
                <Table.Row key={patient?._id} className="hover:bg-gray-50 transition-colors">
                  <Table.RowHeaderCell className="font-semibold text-blue-600">
                    #{patient?.receipt}
                  </Table.RowHeaderCell>
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
                  <Table.Cell>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                      onClick={() => replace(`/${slug}/dashboard/stock?id=${patient._id}`)}
                    >
                      View Sales
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No payments found</p>
                    <p className="text-gray-400 text-sm">
                      {selectedDate ? 'Try selecting a different date' : 'No payments recorded yet'}
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
)
}
export default PaymentTable