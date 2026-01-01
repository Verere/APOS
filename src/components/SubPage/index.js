'use client'

import {subs}  from "@/utils/sub"
import Heading from "../Heading"
import { GrStatusGood } from "react-icons/gr";
import { currencyFormat } from "@/utils/currency";
import { useRouter } from "next/navigation";
// import { usePaystackPayment } from 'react-paystack';
import { useEffect, useState } from "react";
import { fetchStoreDetailSlug, updateStoreSub, insertSub } from "@/actions";
import { formatDate, formatDate2 } from "@/utils/date";
import { toast } from "react-toastify";


const initialFormData = {
  slug:'',
sub:'', 
startDate:'', 
endDate:''

};
const SubPage = ({slug, })=>{
    const ref= (new Date()).getTime().toString();
        const currency= "NGN";
        const publicKey = "pk_live_808f88fc6be015457adc014721d76a1b929056e3";
        // const publicKey = "pk_test_ad0f843481fae22bbfd815f946e0416b7e95820c";
    const [formData, setFormData] = useState(initialFormData);
     const [email, setEmail]= useState('')
     const [fullName, setFullName]= useState('')
     const [subAmount, setSubAmount]= useState(0)
     const [store, setStore]= useState([])
     const [sub, setSub] = useState([])
     const [ starts, setStarts] = useState('')
     const [ ends, setEnds] = useState('')
     const [orderSuccess, setOrderSuccess] = useState(false)
    
      useEffect(()=>{
        const getStore = async()=>{
            const st = await fetchStoreDetailSlug(slug)
            setStore(st)
            setEmail(st.email)
            setFullName(st.name)
            console.log(st.email, 'email')
        }
        getStore()
      },[slug])
      useEffect(()=>{
        const getStore = async()=>{
          setFormData({
            slug,
            sub: sub.name,
            startDate: formatDate(new Date()),
            endDate: formatDate2(new Date())
          })
       
        }
        getStore()
      },[sub])
    const config = {
      reference: ref,
      email: email,
      amount: subAmount,
      publicKey: publicKey,
      currency,
      label: fullName,   
          
    };
    
    const onSuccess = (reference) => {
      // Implementation for whatever you want to do with reference and after success call.
     handleSuccess(reference)
setOrderSuccess(true)
     handleSuccess(reference)
     console.log('reference',reference);
    };
    const handleSuccess= async(reference)=>{
      console.log(reference, 'ref')
      const start =formData.startDate
      const end = formData.endDate
      await updateStoreSub(slug, sub.name, start, end, reference.reference)    
      
      
      const saveSub=  await insertSub(formData)
      setFormData(initialFormData)
      replace(`/${slug}/dashboard`)
  }
  const onClose = () => {
    // implementation for  whatever you want to do when the Paystack dialog closed.
    console.log('closed')
  }
  
  const initializePayment = usePaystackPayment(config);
  
  
  const {replace}= useRouter()
  const router = useRouter()
  const handleSub =async(sub)=>{
    if(slug){
      const amount = sub.price *1200
      await setSubAmount(amount)
      setSub(sub)
      console.log(sub)
      console.log(slug)
       if(subAmount && email ){
   
        console.log('nm',formData)
   initializePayment(onSuccess, onClose)
 }else{
   toast.warn('Check your network and try again')
   router.refresh()
 }
  }else{
    replace('/signup')
}
    }

    if (orderSuccess) {
      return (
        <section className="h-screen bg-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mt-8 max-w-screen-xl px-4 sm:px-6 lg:px-8 ">
              <div className="bg-white text-black shadow">
                <div className="px-4 py-6 sm:px-8 sm:py-10 flex flex-col gap-5">
                  <h1 className="font-bold text-lg">
                    Your payment is successfull!
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return(
        <>
        <Heading title="Our Pricing"/>
        <div className="flex min-h-screen w-full px-4 mx-auto items-center overflow-y-scroll">
             <div className="grid grid-cols-3 sm:grid-cols-1 gap-5 md:grid-cols-2 w-full"> 
          {subs.map((sub, index)=>(

           <div key={index} className="capitalize border rounded-sm items-center">
            <div className='mb-4 items-center p-4'>
                <h1 className="text-bold text-2xl pb-8">{currencyFormat(sub.price)}/<span className="text-sm">month</span></h1>
            <p className='text-4xl'>{sub.name}</p>
            </div>
            {sub.features.map((f, i)=>(

<div key={i} className="flex space-x-5 items-center px-5">
<GrStatusGood />
    <p >{f}</p>
</div>
))}
<div className=" flex justify-around py-3 mx-auto mt-2 items-center">
{/* <button className="btn" onClick={()=>handleSub(sub)}>join Now</button> */}
</div>
             </div>
          ))}
        </div>
        </div> 
        </>
    )
}
 export default SubPage;