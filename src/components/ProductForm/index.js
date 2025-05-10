
"use client"
import { GlobalContext } from "@/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useEffect, useContext, useState, useActionState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { addProduct, fetchProductById, updateProd } from "@/actions";
import { uploadPhotos } from "@/actions/uploadPhoto";
import UploadForm from "../uploadImageComponent";
import { Princess_Sofia } from "next/font/google";
import Link from "next/link";
import Heading from "../Heading";


 

const ProductForm = ({id, slug, categories}) => {

 
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
const {user} = useContext(GlobalContext)
 const [state, formAction, isPending] = useActionState(addProduct, {});
const [loading, setLoading] = useState(false)
const [category, setCategory] = useState([])
const [image, setImage] = useState([])
const {
  files,
  setFiles,
  componentLoader,
  setComponentLoader,
  setShowLoading,
  currentUpdatedProduct,
  setCurrentUpdatedProduct,
} = useContext(GlobalContext);
  
const initialFormData = {
 
  imageUrl: [],

};


 
  const [formData, setFormData] = useState(initialFormData);
 useEffect(()=>{
  const getState=()=>{

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



  return (
    <>
      <form action={formAction} className="w-full -mt-[56px]">
   <Heading title="Product Entry"/>
    <div className="flex flex-col justify-around w-full mx-auto">
      <input type="text" placeholder="Enter Product Name" name="name" className="border mb-1 border-gray-400 p-2 w-full " required />
     
      <div className="flex justify-between flex-wrap">
      
      
            <input type="number" placeholder="Enter Price" name="price" className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />
            <input type="number" placeholder="Enter Qty" name="qty" className="border mx-auto mb-1 border-gray-400 p-2 w-full"  required />
            <input type="text" placeholder="Total Value" name="totalValue" className="border mx-auto mb-1 border-gray-400 p-2 w-full "/>
            <input type="text" placeholder="UoM" name="unit" className="border mx-auto mb-1 border-gray-400 p-2 w-full "  />
            <select name="category" id="cat"  value={category} className="mx-auto mb-1 p-2 w-full " onChange={async (e)=>await setCategory(e.target.value)}>
          <option value="">Choose Category</option>
            {
                categories?.map(location=>(
                    <option key={location._id} id={location.name} value={location.name} >{location.name}</option>
                ))
            }
        </select>
  <input name="barcode" placeholder="Enter Barcode" className="border mb-1 border-gray-400 p-2 w-full "/>
        </div>
       </div>
      <div className="flex justify-between w-full">
     
        
       
       <input type="hidden"  name="slug" value={slug} /> 
      <input type="hidden"  name="path" value={pathname} />
          
      <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md bg-black text-white p-2 w-full">
        {loading? 'loading...' : 'Add New Product'}</button>
      </div>
    
      </form>
     <Link href={`/${slug}/dashboard/products/product-table`}> <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md mt-2 bg-black/80 text-white p-2 w-full">
        View Products</button></Link>
    </>
  );
};

export default ProductForm;

