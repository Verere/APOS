import { Suspense } from 'react'
import AcceptInviteClient from '@/components/AcceptInvite'

function AcceptInviteContent() {
  return <AcceptInviteClient />
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  )
}
