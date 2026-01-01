import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth'
import { fetchUserMemberships } from '@/actions/fetch'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect('/login')
  }

  const memberships = await fetchUserMemberships(session.user.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-3">Welcome, {session.user.name || session.user.email}</p>
      <div className="mt-6">
        <h2 className="text-lg font-medium">Your Store Memberships</h2>
        {memberships.length === 0 ? (
          <p className="text-sm mt-2">You are not a member of any stores yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {memberships.map((m) => (
              <Link href={`/${m.slug}/dashboard`} key={String(m.storeId)} >
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-semibold text-lg">Store: {m.slug}</div>
                    <div className="text-sm text-gray-600">Address: {String(m?.storeId)}</div>
                  </div>
                  <div className="text-sm font-medium">Role: {m.role}</div>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
