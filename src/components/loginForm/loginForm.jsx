"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "../mainNav";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Use NextAuth signIn with redirect true so NextAuth sets cookies then
    // redirects to the dashboard callback URL
    await signIn("credentials", {
      email,
      password,
      callbackUrl: '/dashboard',
      redirect: true,
    });
    // signIn will redirect the browser; no further client-side work required
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full">
        <MainNav />
      </div>
      <div>
        <div className=" w-full flex max-w-3xl  rounded-2xl shadow-lg p-4 my-3">
          <div className=" flex flex-col px-3 py-4 sm:max-w-[480px] shadow sm:rounded-lg sm:px-12">
            <h2 className="font-bold text-2xl capitalize text-yellow-700">login</h2>
            <p className="text-sm mt-3">if you are already a member please login</p>
            <form className="space-y-6 mt-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6">
                  Email address
                </label>
                <input
                  placeholder="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 p-1  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6">
                  Password
                </label>
                <input
                  placeholder="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 p-1 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="flex w-full mb-5 border border-black justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}



 
  
     
      
       
 