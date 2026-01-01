"use client";
import { addUser, currentUser} from "@/actions";

import { GlobalContext } from "@/context";
import Link from "next/link";
import {useEffect, useContext, useState, useActionState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import {useActionState} from 'react-dom'
import { toast } from "react-toastify";
import MainNav from "../mainNav";


export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(addUser, {});
const [email, setEmail] = useState('')
const {setUser} = useContext(GlobalContext)
const [loading, setLoading] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)
      
     useEffect(()=>{
      const getState=async()=>{
    
    if(state.error){
     toast.error(state.error)
     setLoading(false)
    }
    if(state.success){
     setLoading(false)
     setShowSuccess(true)
     if(state.warning){
       toast.warning(state.warning)
     } else {
       toast.success('Account created! Please check your email to verify your account.')
     }
    }
    }
    getState()
     },[state])
  return (
    <>
    <MainNav/>
    <form action={formAction}  className="relative min-h-screen pt-[50px]  max-w-3xl mx-auto">
    <div className="flex flex-col items-center justify-between w-full pt-0 pr-10 pb-0 pl-10 sm:pl-1 sm:pr-1 mx-auto  xl:px-5 lg:flex-row">
      <div className="flex flex-col justify-center items-center w-full pr-0 pl-0 lg:flex-row">
        <div className="w-full mt-10 mr-0 mb-0 ml-0 relative min-w-2xl max-w-2xl lg:mt-0 lg:w-5/12 md:w-full">
          <div className="flex flex-col items-center justify-start pr-2  pl-2 shadow-2xl rounded-xl relative z-10">
            
            {showSuccess ? (
              <>
                <div className="w-full p-6 text-center">
                  <div className="mb-4 text-6xl">✉️</div>
                  <p className="text-3xl font-medium text-green-600 mb-4">Check Your Email!</p>
                  <p className="text-lg text-gray-700 mb-2">
                    We&apos;ve sent a verification email to:
                  </p>
                  <p className="text-lg font-semibold text-blue-600 mb-4">{email}</p>
                  <p className="text-gray-600 mb-6">
                    Please click the link in the email to verify your account and complete the registration.
                  </p>
                  <p className="text-sm text-gray-500">
                    Didn&apos;t receive the email? Check your spam folder or contact support.
                  </p>
                  <Link href="/login" className="inline-flex mt-6 items-center justify-center bg-black text-white px-6 py-3 rounded
                    text-base transition-all duration-200 ease-in-out focus:shadow font-medium uppercase tracking-wide">
                    Go to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="w-full text-4xl sm:text-3xl font-medium  pb-5 text-center text-yellow-700 font-serif">
                      Sign up for an account
                  </p>
                
                  
                    <div className="w-full  p-2 flex flex-col font-bold">
                    <input type="text" placeholder="Enter you Name" name="name" className="w-full  border  mb-4 p-2 "/>
                    <input type="email" placeholder="Email" name="email" value={email} onChange={async(e)=>setEmail(e.target.value)} className="w-full  border  mb-4 p-2 "/>

                    <input type="password" placeholder="Password" name="password" className="w-full border mr-4 mb-0 p-2"/>
                    <input type="password" placeholder="Confirm password" name="cfpassword" className="w-full border mr-4 mt-4 mb-0 p-2"/>
                    
                    </div>
               
                  <p className="mt-4 px-6 text-center">By signing up you accept our <Link href="#" className="text-blue-600 hover:border-b">terms and conditions <span className="text-black">&</span> privacy policy</Link></p>
                  <button
                    className=" inline-flex mt-2 w-full items-center justify-center text-white
                     bg-black px-6 py-4 text-lg  transition-all duration-200 ease-in-out 
                     focus:shadow font-medium uppercase tracking-wide"

                  >
                  
                  {loading ? 'loading...': 'Register'}
                    
                  </button>
                  <p className="mt-4">Already have an Account?</p>
                <Link href="/login" className="opacity-70  inline-flex mt-2 w-full items-center justify-center bg-black px-6 py-4 
                  text-lg  transition-all duration-200 ease-in-out focus:shadow font-medium
                   uppercase tracking-wide"
                  
                   >
                   Login 
                   </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </form>
    </>
  );
}
