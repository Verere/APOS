"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyClient(){
  const search = useSearchParams()
  const router = useRouter()
  const tokenFromQuery = search?.get('token') || search?.get('t') || ''
  const [token, setToken] = useState(tokenFromQuery || '')
  const [status, setStatus] = useState('idle') // idle|loading|success|error
  const [message, setMessage] = useState('')

  useEffect(()=>{
    if(tokenFromQuery){
      submitToken(tokenFromQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tokenFromQuery])

  useEffect(() => {
    let t;
    if (status === 'success') {
      t = setTimeout(() => router.push('/store'), 2500);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [status, router]);

  async function submitToken(value){
    if(!value) return setMessage('Please provide a verification token')
    try{
      setStatus('loading')
      setMessage('Verifying...')
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: value })
      })
      const data = await res.json()
      if(res.ok){
        setStatus('success')
        setMessage(data.message || 'Email verified successfully')
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    }catch(err){
      console.error(err)
      setStatus('error')
      setMessage('Network error, please try again')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-2 text-center">Email Verification</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">Confirm your email address to activate your account.</p>

        {status === 'success' ? (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">{message}</p>
            <button onClick={()=>router.push('/store')} className="px-4 py-2 bg-black text-white rounded">Create Store</button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Token</label>
            <input
              value={token}
              onChange={(e)=>setToken(e.target.value)}
              placeholder="Paste your verification token here"
              className="w-full border rounded p-2 mb-3"
            />

            {status === 'error' && <p className="text-sm text-red-600 mb-2">{message}</p>}

            <div className="flex gap-2">
              <button onClick={()=>submitToken(token)} className="flex-1 px-4 py-2 bg-black text-white rounded">Verify Email</button>
              <button onClick={()=>router.push('/')} className="px-4 py-2 border rounded">Home</button>
            </div>

            {status === 'loading' && <p className="text-sm text-gray-500 mt-3">{message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
