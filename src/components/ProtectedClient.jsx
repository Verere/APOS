"use client"
import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function ProtectedClient({ children }){
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading authentication...</div>
  if (status === 'unauthenticated' || !session) {
    return (
      <div>
        <p>You are not signed in.</p>
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span>Signed in as {session.user?.email}</span>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
      {children}
    </div>
  )
}
