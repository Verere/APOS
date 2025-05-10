
"use client"
import { GlobalContext } from "@/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {useEffect, useContext, useState, useActionState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { addCategory } from "@/actions";

 

const CategoryForm = ({id, slug}) => {


  const { replace } = useRouter();
  const pathname = usePathname();
const {user} = useContext(GlobalContext)
 const [state, formAction, isPending] = useActionState(addCategory, {});
const [loading, setLoading] = useState(false)
  
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

      <form action={formAction} className="flex flex-col justify-between  w-full mt-0 mr-0 ml-0 ">
    <div className="flex justify-around mt-2 w-full sm:flex-col">
      <input type="text" placeholder="Enter Test Name" name="name" className="border mx-2 mb-2 border-gray-400 p-2 w-full sm:p-0" required />
  
       </div>
      <div className="flex justify-between w-full mt-2">
     
        
       
       <input type="hidden"  name="slug" value={slug} /> 
      <input type="hidden"  name="path" value={pathname} />
          
      <button onClick={()=>setLoading(true)}  className="border border-gray-400 rounded-md bg-black text-white p-2 ">
        {loading? 'loading...' : 'Add New Category'}</button>
      </div>
    
      </form>
    </>
  );
};

export default CategoryForm;

