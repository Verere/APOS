import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { membershipId, slug } = await request.json()

        if (!membershipId) {
            return NextResponse.json({ error: 'Missing membership ID' }, { status: 400 })
        }

        await connectDB()

        // Get the membership to remove
        const membershipToRemove = await StoreMembership.findById(membershipId)
        if (!membershipToRemove) {
            return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
        }

        // Check if the current user is an OWNER
        const currentMembership = await StoreMembership.findOne({
            storeId: membershipToRemove.storeId,
            userId: session.user.id,
            isDeleted: false
        })

        if (!currentMembership || currentMembership.role !== 'OWNER') {
            return NextResponse.json({ error: 'Only store owners can remove members' }, { status: 403 })
        }

        // Prevent removing OWNER role (the pre-hook will also check this)
        if (membershipToRemove.role === 'OWNER') {
            return NextResponse.json({ error: 'Cannot remove store owner' }, { status: 400 })
        }

        // Soft delete the membership
        membershipToRemove.isDeleted = true
        await membershipToRemove.save()

        return NextResponse.json({ 
            message: 'User removed successfully'
        }, { status: 200 })

    } catch (error) {
        console.error('Error removing member:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
