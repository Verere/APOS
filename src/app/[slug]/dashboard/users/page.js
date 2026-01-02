import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import User from '@/models/user'
import UsersPageClient from '@/components/UsersPage'

const UsersPage = async ({ params }) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/login')
    }

    const { slug } =await params

    try {
        await connectDB()

        // Get the store
        const store = await Store.findOne({ slug }).lean()
        if (!store) {
            return <div>Store not found</div>
        }

        // Get current user's membership
        const currentUserMembership = await StoreMembership.findOne({
            storeId: store._id,
            userId: session.user.id,
            isDeleted: false
        }).lean()

        if (!currentUserMembership) {
            redirect(`/${slug}/dashboard`)
        }

        // Only OWNER and MANAGER can view users
        if (!['OWNER', 'MANAGER'].includes(currentUserMembership.role)) {
            redirect(`/${slug}/dashboard`)
        }

        // Get all store memberships with user details
        const memberships = await StoreMembership.find({
            storeId: store._id,
            isDeleted: false
        })
            .populate('userId', 'name email')
            .sort({ role: 1, createdAt: -1 })
            .lean()

        // Convert ObjectIds to strings for client components
        const serializedMemberships = memberships.map(m => ({
            _id: m._id.toString(),
            userId: m.userId?._id?.toString(),
            userName: m.userId?.name || 'Unknown',
            userEmail: m.userId?.email || 'No email',
            role: m.role,
            createdAt: m.createdAt?.toISOString(),
            updatedAt: m.updatedAt?.toISOString()
        }))

        return (
            <UsersPageClient 
                memberships={serializedMemberships}
                currentUserRole={currentUserMembership.role}
                slug={slug}
                storeId={store._id.toString()}
                storeName={store.name}
            />
        )
    } catch (error) {
        console.error('Error loading users:', error)
        return <div>Error loading users</div>
    }
}

export default UsersPage