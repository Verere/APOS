
"use client"
import { GlobalContext } from "@/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useEffect, useContext, useState, useActionState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { addProduct} from "@/actions";
import { fetchProductById} from "@/actions/fetch";
import { updateProduct } from "@/actions/update";
import { Princess_Sofia } from "next/font/google";
import Link from "next/link";
import Heading from "../Heading";
import DatePicker from "react-datepicker";
import { format } from 'date-fns';

 

const ProductForm = ({slug, categories}) => {

 
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
const {user} = useContext(GlobalContext)
 const [state, formAction, isPending] = useActionState(addProduct, {});
const [loading, setLoading] = useState(false)
const [category, setCategory] = useState([])
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

useEffect(()=>{
  const getTotal = async()=>{
    if(qty &&  price && price.length && qty.length ){
      const totals = parseInt(qty)* parseInt(price)
      setTotal(totals)
    }
  }
  getTotal()
},[qty,price])

useEffect(()=>{
  // Auto-calculate profit from price and cost
  if(cost && price && cost.length && price.length) {
    const calculatedProfit = parseFloat(price) - parseFloat(cost)
    setProfit(calculatedProfit.toString())
  }
},[cost, price])

  return (
    <>
      <form action={formAction} className="w-full -mt-[56px]">
   <Heading title="Product Entry"/>
    <div className="flex flex-col justify-around w-full mx-auto">
      <input type="text" placeholder="Enter Product Name" name="name" value={name} onChange={async (e)=>await setName(e.target.value)} className="border mb-1 border-gray-400 p-2 w-full " required />
     
      <div className="flex justify-between items-center">
            <select name="category" id="cat"  value={category} className="mx-auto mb-1 p-2 w-full " onChange={async (e)=>await setCategory(e.target.value)}>
          <option value="">Choose Category</option>
            {
                categories?.map(location=>(
                    <option key={location._id} id={location.name} value={location.name} >{location.name}</option>
                ))
            }
        </select>
        <div className="flex items-center font-semibold w-full p-2 mb-1">
         <label className="block  mr-2">Expiration Date:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="border px-3 py-2 rounded w-full"
                  placeholderText="Pick a date"
                />
                </div>
                </div>
      <div className="flex justify-between flex-wrap">
      <div className="flex justify-between w-full">
      
      
            <input type="number" placeholder="Enter Cost Price" name="cost" value= {cost}  onChange={async (e)=>await setCost(e.target.value)}className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />
            <input type="number" placeholder="Enter Selling Price" name="price" value= {price}  onChange={async (e)=>await setPrice(e.target.value)}className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />
            <input type="number" placeholder="Profit (Auto-calculated)" name="profit" value= {profit} readOnly className="border mx-auto mb-1 border-gray-300 bg-gray-50 p-2 w-full"  required />
           </div>
            <input type="number" placeholder="Enter Qty" name="qty" value ={qty} onChange={async (e)=>await setQty(e.target.value)} className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />
            <input type="text" placeholder="Total Value" name="totalValue" value ={total} onChange={async (e)=>await setTotal(e.target.value)}  className="border mx-auto mb-1 border-gray-400 p-2 w-full "/>
            <input type="number" placeholder="Enter reOrder Qty" name="reOrder" value ={reOrder} onChange={async (e)=>await setReOrder(e.target.value)} className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />

  <input name="barcode" placeholder="Enter Barcode" value={code} onChange={async (e)=>await setCode(e.target.value)} className="border mb-1 border-gray-400 p-2 w-full "/>
  <input name="up" type="hidden" value={up} />
  <input name="id" type="hidden" value={id} />
        </div>
       </div>
      <div className="flex justify-between w-full"> 
        
       
       <input type="hidden"  name="slug" value={slug} /> 
       <input type="hidden"  name="expiration" value={format(selectedDate, 'd/MM/yyyy')} /> 
      <input type="hidden"  name="path" value={pathname} />
          
      <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md bg-black text-white p-2 w-full">
        {loading? 'loading...' : id ? 'UPDATE PRODUCT': 'Add New Product'}</button>
      </div>
    
      </form>
          
     <Link href={`/${slug}/dashboard/products/product-table`}> <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md mt-2 bg-black/80 text-white p-2 w-full">
        View Products</button></Link>
    </>
  );
};

export default ProductForm;

