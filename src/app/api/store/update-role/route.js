import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import StoreMembership from '@/models/storeMembership'
import Store from '@/models/store'
import User from '@/models/user'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { membershipId, newRole, storeId } = await req.json()

    if (!membershipId || !newRole || !storeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['OWNER', 'MANAGER', 'CASHIER']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if current user is an OWNER of the store
    const currentUserMembership = await StoreMembership.findOne({
      storeId,
      userId: session.user.id,
      isDeleted: false
    })

    if (!currentUserMembership || currentUserMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only store owners can update roles' },
        { status: 403 }
      )
    }

    // Get the membership to update
    const membershipToUpdate = await StoreMembership.findById(membershipId)

    if (!membershipToUpdate || membershipToUpdate.isDeleted) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    // Verify the membership belongs to the same store
    if (membershipToUpdate.storeId.toString() !== storeId) {
      return NextResponse.json(
        { error: 'Membership does not belong to this store' },
        { status: 403 }
      )
    }

    // Prevent changing OWNER roles
    if (membershipToUpdate.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change OWNER role. Transfer ownership instead.' },
        { status: 400 }
      )
    }

    // Check if trying to change to the same role
    if (membershipToUpdate.role === newRole) {
      return NextResponse.json(
        { error: 'User already has this role' },
        { status: 400 }
      )
    }

    // Update the role
    membershipToUpdate.role = newRole
    await membershipToUpdate.save()

    // Populate user info for response
    const updatedMembership = await StoreMembership.findById(membershipId).populate('userId', 'name email')

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      membership: updatedMembership
    })

  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}
