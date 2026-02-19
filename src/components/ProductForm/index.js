
"use client"
import { GlobalContext } from "@/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useEffect, useContext, useState, useActionState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { addProduct} from "@/actions";
import { fetchProductById} from "@/actions/fetch";
import { updateProduct } from "@/actions/update";
import { Princess_Sofia } from "next/font/google";
import Link from "next/link";
import Heading from "../Heading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';
import BarcodeScanner from '../Pos/BarcodeScanner';

 

const ProductForm = ({slug, categories}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  // Barcode scan handler for product form
  const handleBarcodeScan = (barcode) => {
    setScannerLoading(true);
    setShowScanner(false);
    setCode(barcode);
    toast.success('Barcode scanned and added!');
    setScannerLoading(false);
  };

 
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
const {user} = useContext(GlobalContext)
 const [state, formAction, isPending] = useActionState(addProduct, {});
const [loading, setLoading] = useState(false)
const [category, setCategory] = useState('')
console.log(
  'user', user
)
const {
  files,
  setFiles,
  componentLoader,
  setComponentLoader,
  setShowLoading,
  currentUpdatedProduct,
  setCurrentUpdatedProduct,
} = useContext(GlobalContext);
  
const [name, setName] = useState('')
const [price, setPrice] = useState('')
const [cost, setCost] = useState('')
const [profit, setProfit] = useState('')
const [reOrder, setReOrder] = useState('')
 const [up, setUp] = useState(false)
const [code, setCode] = useState('')
const [id, setId] =useState('')
const [qty, setQty]= useState('')
const [total, setTotal]=useState('')
const [selectedDate, setSelectedDate] = useState(null);

 
 useEffect(()=>{
  const getState=()=>{

if(state.error){
 toast.error(state.error)
 setLoading(false)
}
if(state.success){
 toast.success(state.success)
 setLoading(false)
 setUp(false)
 setName('')
 setPrice('')
 setCost('')
 setProfit('')
 setCode('')
 setUp(false)
 setQty('')
 setId('')
 setTotal('')
}
}
getState()
 },[state])

 useEffect(()=>{
  const getProd = async ()=>{
    const params = new URLSearchParams(searchParams)
    const id = params.get('id')
      // setTotal(prod[0]?.totalValue)

     if(id){
      const prod = await fetchProductById(id)
      setName(prod[0]?.name)
      setPrice(prod[0]?.price)
      setCost(prod[0]?.cost)
      setProfit(prod[0]?.profit)
      setCode(prod[0]?.barcode)
      setUp(true)
      setId(id)
      setQty(prod[0]?.qty)
      if(prod[0]?.category)setCategory(prod[0]?.category)
      if(prod[0]?.expiration)setCategory(prod[0]?.expiration)
     }
}
getProd()
},[searchParams])

// Auto-calculate total based on qty and price
useEffect(()=>{
  if(qty && price && qty.length && price.length ){
    const totals = parseInt(qty) * parseFloat(price)
    setTotal(totals)
  }
},[qty,price])

// Auto-calculate profit from price and cost
useEffect(()=>{
  if(cost && price && cost.length && price.length) {
    const calculatedProfit = parseFloat(price) - parseFloat(cost)
    setProfit(calculatedProfit.toString())
  }
},[cost, price])

  // Memoize formatted expiration date
  const formattedExpiration = useMemo(() => 
    selectedDate ? format(selectedDate, 'd/MM/yyyy') : ''
  , [selectedDate]);

  return (
    <>
      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-4 relative w-[340px] max-w-full">
            <button
              className="absolute top-2 right-2 text-xl text-gray-600 hover:text-gray-900"
              onClick={() => setShowScanner(false)}
              aria-label="Close scanner"
            >×</button>
            <h2 className="text-lg font-semibold mb-2">Scan Barcode</h2>
            <div className="mb-2">
              <span className="text-xs text-gray-500">Point your camera at the product barcode</span>
            </div>
            <div>
              <BarcodeScanner
                onScan={handleBarcodeScan}
                onError={err => toast.error("Camera error: " + err)}
              />
            </div>
            {scannerLoading && <div className="mt-2 text-blue-600">Processing...</div>}
          </div>
        </div>
      )}
      <form action={formAction} className="w-full -mt-[56px]">
   <Heading title="Product Entry"/>
    <div className="flex flex-col justify-around w-full mx-auto">
      <input type="text" placeholder="Enter Product Name" name="name" value={name} onChange={(e)=>setName(e.target.value)} className="border mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white" required />
     
      <div className="flex flex-col sm:flex-row gap-2">
            <select name="category" id="cat"  value={category} className="mx-auto mb-1 p-2 w-full border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block bg-white text-black dark:bg-gray-800 dark:text-white" onChange={(e)=>setCategory(e.target.value)}>
          <option value="">Choose Category</option>
            {
                categories?.map(location=>(
                    <option key={location._id} id={location.name} value={location.name} >{location.name}</option>
                ))
            }
        </select>
        <div className="flex flex-col w-full p-2 mb-1">
         <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date</label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-400 px-4 py-2 pr-10 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-black dark:bg-gray-800 dark:text-white"
                    placeholderText="Select expiration date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={new Date()}
                    calendarClassName="custom-datepicker"
                    wrapperClassName="w-full"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                </div>
                </div>
      <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
      
      
            <input type="number" placeholder="Enter Cost Price" name="cost" value= {cost}  onChange={(e)=>setCost(e.target.value)}className="border mx-auto mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"  required />
            <input type="number" placeholder="Enter Selling Price" name="price" value= {price}  onChange={(e)=>setPrice(e.target.value)}className="border mx-auto mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"  required />
            <input type="number" placeholder="Profit (Auto-calculated)" name="profit" value= {profit} readOnly className="border mx-auto mb-1 border-gray-300 bg-gray-50 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"  required />
           </div>
            <input type="number" placeholder="Enter Qty" name="qty" value ={qty} onChange={(e)=>setQty(e.target.value)} className="border mx-auto mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"  required />
            <input type="text" placeholder="Total Value" name="totalValue" value ={total} onChange={(e)=>setTotal(e.target.value)}  className="border mx-auto mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"/>
            <input type="number" placeholder="Enter reOrder Qty" name="reOrder" value ={reOrder} onChange={(e)=>setReOrder(e.target.value)} className="border mx-auto mb-1 border-gray-400 p-2 w-full block bg-white text-black dark:bg-gray-800 dark:text-white"  required />

  <div className="flex flex-row items-center gap-2 mb-1">
    <input name="barcode" placeholder="Enter Barcode" value={code} onChange={(e)=>setCode(e.target.value)} className="border border-gray-400 p-2 flex-1 min-w-0 bg-white text-black dark:bg-gray-800 dark:text-white" />
    <button
      type="button"
      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 whitespace-nowrap"
      onClick={() => setShowScanner(true)}
      aria-label="Scan barcode"
    >Scan</button>
  </div>
  <input name="up" type="hidden" value={up} />
  <input name="id" type="hidden" value={id} />
        </div>
       </div>
      <div className="flex justify-between w-full"> 
        
       
       <input type="hidden"  name="slug" value={slug} /> 
       <input type="hidden"  name="expiration" value={formattedExpiration} /> 
      <input type="hidden"  name="path" value={pathname} />
          
      <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md bg-black text-white p-2 w-full block">
        {loading? 'loading...' : id ? 'UPDATE PRODUCT': 'Add New Product'}</button>
      </div>
    
      </form>
    </>
  );
};

export default ProductForm;

