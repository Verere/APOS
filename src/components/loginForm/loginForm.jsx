"use client";

import { authenticate, currentUser } from "@/actions";
import { GlobalContext } from "@/context";
import Cookies from "js-cookie";
import { useContext, useEffect, useState, useActionState } from "react";
import { useFormState } from "react-dom";
import MainNav from "../mainNav";
import { CartContext } from "@/context/CartContext";
import { toast } from "react-toastify";



const LoginForm = () => {
   const {isAuthUser,  setIsAuthUser, setShowNavModal} = useContext(GlobalContext);
  //  const {setStore} = useContext(CartContext);
   const [state, action, isPending] = useActionState(authenticate, undefined);

const [loading, setLoading]= useState(false)

  useEffect(()=>{
    const getUser = async() => {
     if(state.error){
      toast.error(state.error)
      setLoading(false)}
     if(state.success){
        const user = await currentUser(email)
      Cookies.set('emailToken', user?.emailToken)
      if(user.isAdmin ===true)setIsAuthUser(true)      
      console.log(user)
      setLoading(false)}
    }
  getUser()
  },[state])


  return (
    <>
    <div className="fixed top-0 left-0 w-full"> 
<MainNav/>
</div>
    <div >        
    <div className=" w-full flex max-w-3xl  rounded-2xl shadow-lg p-4 my-3">
      <div className=" flex flex-col px-3 py-4 sm:max-w-[480px] shadow sm:rounded-lg sm:px-12">
        <h2 className="font-bold text-2xl capitalize text-yellow-700">login</h2>
        <p className="text-sm mt-3">if you are already a member please login</p>
        <form className="space-y-6 mt-5" action={action}>
      <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6"
                >
                  Email address
                </label>
                  <input
                    placeholder="email" 
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 p-1  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6"
                >
                  Password
                </label>
                  <input
                    placeholder="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 p-1 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
      <div>
                    <button
                      className="flex w-full mb-5 border border-black justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      aria-disabled={isPending} onClick={()=>setLoading(true)}>
                     {loading ? 'loading...' : "Sign in"}
                    </button>
                  </div>
                 
        {/* <div className="flex h-8 items-end space-x-1">

                   {errorMessage && (
            <>
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div> */}
    </form>
    </div>
    </div>
    </div>
    </>
  );
};

export default LoginForm;



 
  
     
      
       
 