import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import SettingsPageClient from '@/components/settings/SettingsPageClient'

export default async function SettingsPage({ params }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const { slug } = await params

  return <SettingsPageClient slug={slug} user={session.user} />
}
