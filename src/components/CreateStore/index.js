"use client"
import { GlobalContext } from "@/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useEffect, useContext, useState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { addStore } from "@/actions";

 
const CreateStorePage = ({})=>{
    const pathname = usePathname();
    const {user} = useContext(GlobalContext)
     const [state, formAction, isPending] = useFormState(addStore, {});
    const [loading, setLoading] = useState(false)
    const [slug, setSlug] = useState('')
    const {replace}= useRouter()
     useEffect(()=>{
      const getState=()=>{
    
    if(state.error){
     toast.error(state.error)
     setLoading(false)
    }
    if(state.success){
     setLoading(false)
    replace(`/qr/${slug}/dashboard/menu`);

    }
    }
    getState()
     },[state, replace, slug])
    return(
      <>
      <form action={formAction} className="flex flex-col justify-between  w-full mt-0 mr-0 ml-0 ">
    <div className="flex flex-col justify-around mt-2 w-full sm:flex-col">
      <input type="text" placeholder="Enter Store/Hotel Name" name="name" className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
      <input type="text" placeholder="Enter Slug a.k.a short name" name="slug" value= {slug} onChange={async(e)=>setSlug(e.target.value)} className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
      <input type="text" placeholder="Enter your Address" name="address" className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
      <input type="text" placeholder="Enter Phone Number" name="phone" className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
      <input type="text" placeholder="Enter logo url" name="logo" className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
  
       </div>
      <div className="flex justify-between w-full mt-2">
     
        
       
       <input type="hidden"  name="user" value={user._id} /> 
      <input type="hidden"  name="path" value={pathname} />
          
      <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md bg-black text-white p-2 ">
        {loading? 'loading...' : 'Add New Category'}</button>
      </div>
    
      </form>
    </>
  );
};
  
export default CreateStorePage