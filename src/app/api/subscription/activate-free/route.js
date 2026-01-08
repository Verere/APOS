import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import UserSubscription from '@/models/userSubscription'
import SubscriptionPackage from '@/models/subscriptionPackage'
import User from '@/models/user'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

// POST /api/subscription/activate-free
export async function POST(request) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packageName, billingCycle } = body

    // Check if user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({
      userId: session.user.id,
      status: { $in: ['ACTIVE', 'TRIAL'] }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, message: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Find the FREE package
    const freePackage = await SubscriptionPackage.findOne({ name: 'FREE' })
    if (!freePackage) {
      return NextResponse.json(
        { success: false, message: 'Free package not found' },
        { status: 404 }
      )
    }

    // Calculate subscription dates (1 year for free)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    // Create free subscription
    const newSubscription = await UserSubscription.create({
      userId: session.user.id,
      packageId: freePackage._id,
      packageName: 'FREE',
      status: 'ACTIVE',
      billingCycle: billingCycle || 'MONTHLY',
      startDate,
      endDate,
      amount: 0,
      currency: 'NGN',
      paymentMethod: 'MANUAL',
      transactionReference: `FREE_${Date.now()}`,
      lastPaymentDate: new Date(),
      nextBillingDate: endDate,
      autoRenew: false
    })

    // Update user's subscription status
    await User.findByIdAndUpdate(session.user.id, {
      currentSubscription: newSubscription._id,
      subscriptionStatus: 'ACTIVE'
    })

    return NextResponse.json({
      success: true,
      message: 'Free subscription activated successfully',
      data: newSubscription
    })

  } catch (error) {
    console.error('Free subscription activation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
