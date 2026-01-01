'use client'
import { addStore } from "@/actions";
import React, {useEffect, useContext, useState, useRef, useActionState  } from "react";
import {GlobalContext} from '@/context'
import { StatesFormControl } from "@/utils/states";
import UploadForm from "../uploadImageComponent";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadPhotos } from "@/actions/uploadPhoto";
import {  useFormStatus } from "react-dom";

const AddStore =()=>{

    const [loading, setLoading] =useState(false)
    const [states, setStates] = useState('')
    const [lga, setLga] = useState('')
    const [lgas, setLgas] = useState([])
    const initialState = { error: null };
    const { pending } = useFormStatus();
const [state, formAction] = useActionState (addStore, initialState);
    // const [result, formAction, isPending] = React.useActionState(addStore);
    const [logo, setLogo] = useState([])
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const {replace} = useRouter()
    const {
      user,
      files,
      setFiles,     
      setShowLoading,   
    } = useContext(GlobalContext);
      
    const formRef = useRef(null)
    
    // Note: rely on native form submission to invoke server action (formAction)
    
    useEffect(() => {
      async function handleUpload(event) {
        if (files.length !== 0) {
          setShowLoading(true);
          const formDatas = new FormData();
          files.forEach((file) => {
            formDatas.append("files", file);
          });
          const data = await uploadPhotos(formDatas);
          if (data) {
            setLogo(data)
          
            setShowLoading(false);
          } else {
            toast.error("Something went wrong please upload image again");
            setFiles([]);
            setShowLoading(false);
            setLogo([])
          }
        }
      }
      handleUpload();
    }, [files]);
    
    useEffect(()=>{
      // initialize store email from current user if available
      if (user && user.email) setStoreEmail(user.email)
    },[user])
        useEffect(()=>{
      // console.log(StatesFormControl)
      const getLgas = ()=>{
        const lg = StatesFormControl.filter(order=>order?.label===states)
        let slg= lg[0]?.lga
        setLgas(slg)
      }
      getLgas()
    },[states])
    // useEffect(()=>{
    //   // load lgas only when a state is selected; reset lga selection
    //   if (!states) {
    //     setLgas([])
    //     setLga('')
    //     return
    //   }

    //   const entry = StatesFormControl.find(s => String(s.label) === String(states) || String(s.id) === String(states))

    //   if (entry) {
    //     // ensure the structure has an array for lga
    //     if (!Array.isArray(entry.lga)) {
    //       entry.lga = []
    //     }
    //     setLgas(entry.lga)
    //   } else {
    //     // if the source data lacks an entry for this state, create a fallback
    //     const fallback = { id: String(states).toLowerCase().replace(/\s+/g, '-'), label: states, lga: [] }
    //     StatesFormControl.push(fallback)
    //     setLgas([])
    //   }
    //   setLga('')
    // },[states])
    useEffect(()=>{
      if (!state) return
      setLoading(false)
      if (state.error) {
        toast.error(state.error || 'Failed to create store')
        return
      }
      if (state.success) {
        toast.success(state.message || 'Store created')
        if (formRef.current) formRef.current.reset()
        if (state.slug) replace(`/${state.slug}/pos`)
      }
    },[state, replace])
    return(
        <form ref={formRef} action={formAction} className="flex flex-col w-full max-w-2xl mx-auto space-y-6 px-4 py-6">
        <h3 className="text-center font-bold uppercase pt-4"> Enter New Store</h3>
        
        <div className="w-full mt-0 mr-0 ml-0 space-y-4">
  
         
          <input type="text" placeholder="Enter Business Name" name="name" className="border border-gray-400 p-2 w-full" required />
          <div className="w-full">
            <label className="text-sm font-medium">Contact Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value
                setEmail(v)
                const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
                if (!v) setEmailError('Email is required')
                else if (!re.test(v)) setEmailError('Invalid email address')
                else setEmailError('')
              }}
              onBlur={(e) => { if (!e.target.value) setEmailError('Email is required') }}
              placeholder="contact@business.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            {emailError ? <p className="text-sm text-red-500 mt-1">{emailError}</p> : null}
          </div>
      <div className="flex gap-3 w-full flex-row sm:flex-col">
      <select name="state" id="cat" className="mb-2 p-2 w-full"  value={states}  onChange={(e)=> setStates(e.target.value)}>
          <option value="">State Located</option>
  {StatesFormControl.map((s) => (
    <option key={s.id} id={s.label} value={s.label}>{s.label}</option>
  ))}
        </select>
      <select name="lga" id="cat" className="mb-2 p-2 w-full"  value={lga}  onChange={(e)=> setLga(e.target.value)}>
          <option value="">Choose Lga</option>
  {lgas?.map((lg) => (
    <option key={lg} id={lg} value={lg}>{lg}</option>
  ))}
        </select>
        </div>
            <textarea
            className="border border-gray-300 p-3 w-full rounded-md"
              required
              name="address"
              id="address"
              rows="3"
              placeholder="Enter Business Address"
        
              ></textarea>
         <div className="flex flex-col gap-5 md:flex  justify-between w-full">
  
          <input type="text" placeholder="Your Phone Number" name="phone" className="border border-gray-400 p-2 "/>
          <input type="text" placeholder="Business Number" name="whatsapp" className="border border-gray-400 p-2 "/>
         </div>
  
         <div className="flex flex-row space-x-4 sm:gap-4 w-full">
  
         <div className='w-full sm:w-1/2'>
            <label
              htmlFor='opens'
              className='block text-sm font-medium '
            >
              Opening Time
            </label>
            <input
              type='time'
              id='check_in_time'
              name='opens'
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              required
            />
          </div>  
         <div  className='w-full sm:w-1/2'>
            <label
              htmlFor='check_in_time'
              className='block text-sm font-medium '
            >
              Closing Time
            </label>
            <input
              type='time'
              id='check_in_time'
              name='closes'
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              required
            />
          </div>  
          </div>
  
         <div className="flex flex-col w-full">
          <p> Upload your logo here</p>
  <UploadForm files={files} setFiles={setFiles} /> 
          {/* <input type="text" placeholder="Enter Logo" name="logo" className="border border-gray-400 p-2 w-full"/> */}
          {/* <input type="text" placeholder="Store Image" name="image" className="border border-gray-400 p-2 w-full"/> */}
          <input type="hidden"  name="user" value={user?._id || ''} />
          <input type="hidden"  name="logo" value={logo[0]?.url || ''} /> 
         </div>
          
          
          <button disabled={pending || loading || !!emailError || !email} type="submit" className="rounded-md bg-black text-white p-3 w-full disabled:opacity-60">
            {pending || loading ? "Creating store..." : "Create Store" }</button>
        
       </div>
        </form>
    )
}
export default AddStore