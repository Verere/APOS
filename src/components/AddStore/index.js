'use client'
import { addStore, currentUser, fetchSlug } from "@/actions";
import {useEffect, useContext, useState } from "react";
import { useFormState } from 'react-dom';
import {GlobalContext} from '@/context'
import { StatesFormControl } from "@/utils/states";
import UploadForm from "../uploadImageComponent";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadPhotos } from "@/actions/uploadPhoto";

const AddStore =()=>{

    const [loading, setLoading] =useState(false)
    const [states, setStates] = useState('')
    const [lga, setLga] = useState('')
    const [lgas, setLgas] = useState([])
    const [state, formAction, isPending] = useFormState(addStore, {});
    const [logo, setLogo] = useState([])
    const [email, setEmail]=useState('')
    const [slug, setSlug]= useState('')
    const {replace} = useRouter()
    const {
      user,
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
      const getUser = async()=>{
        console.log(user,'mus')
      }
      getUser()
    },[])
     
    useEffect(()=>{
      // console.log(StatesFormControl)
      const getLgas = ()=>{
        const lg = StatesFormControl.filter(order=>order?.label===states)
        let slg= lg[0]?.lga
        setLgas(slg)
      }
      getLgas()
    },[states])
    useEffect(()=>{
      const getState=()=>{
    
    if(state.error){
    //  toast.error(state.error)
    setLoading(false)
    }
    if(state.success){
      toast.success(state.message)
      setLoading(false)
   replace(`/${slug}/pos`)
    }
    }
    getState()
     },[state])
    return(
        <form action={formAction} className="flex flex-col w-[90%] mx-auto space-y-8 z-[-9] px-4">
        <h3 className="text-center font-bold uppercase pt-4"> Enter New Store</h3>
        
        <div className="w-full mt-0 mr-0 ml-0 space-y-4">
  
         
          <input type="text" placeholder="Enter Business Name" name="name" className="border border-gray-400 p-2 w-full" required />
      <div className="flex justify-between w-full items-center  sm:flex-col sm:space-y-4">
        <input type="text" placeholder="Enter Slug" name="slug" arial-label="slug" value={slug} onChange={async(e)=> await setSlug(e.target.value)} className="border border-gray-400 mb-2 p-2 w-full"/>
      <select name="state" id="cat" className="mb-2 p-2 w-full ml-2"  value={states}  onChange={(e)=> setStates(e.target.value)}>
          <option value="">State Located</option>
  {StatesFormControl.map((state)=>(
    <>
          
                    <option key={state.id} id={state.label} value={state.label} >{state.label}</option>
       
              </>
              ))
            }
        </select>
      <select name="lga" id="cat" className="mb-2 p-2 w-full ml-2"  value={lga}  onChange={(e)=> setLga(e.target.value)}>
          <option value="">Choose Lga</option>
  {lgas?.map((state)=>(
    <>
          
                    <option key={state} id={state} value={state} >{state}</option>
       
              </>
              ))
            }
        </select>
        </div>
            <textarea
            className="border border-gray-400 p-2 w-full"
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
  
         <div className="flex   justify-between w-full">
  
         <div className='w-1/2'>
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
         <div  className='w-1/2 ml-2'>
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
          <input type="hidden"  name="user" value={user?._id} />
          <input type="hidden"  name="email" value={user?.email} />
          <input type="hidden"  name="logo" value={logo[0]?.url} /> 
         </div>
          
          
          <button onClick={()=>setLoading(true)} className="border border-gray-400 rounded-md bg-black text-white p-2 w-full" type="submit">
            {loading ? "loading..." : "Submit" }</button>
        
       </div>
        </form>
    )
}
export default AddStore