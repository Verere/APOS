import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import UserSubscription from '@/models/userSubscription'
import SubscriptionPackage from '@/models/subscriptionPackage'
import User from '@/models/user'
import { verifyPaystackTransaction, formatPaystackAmount } from '@/lib/paystackConfig'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

// POST /api/subscription/payment/verify
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
    const { reference, packageId, billingCycle, storeId } = body

    console.log('Payment verification request:', { reference, packageId, billingCycle, storeId })

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Verify transaction with Paystack
    const verification = await verifyPaystackTransaction(reference)

    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed', error: verification.error },
        { status: 400 }
      )
    }

    const transactionData = verification.data

    // Check if transaction was successful
    if (transactionData.status !== 'success') {
      return NextResponse.json(
        { success: false, message: 'Payment was not successful', status: transactionData.status },
        { status: 400 }
      )
    }

    // Get package details - packageId is actually the package name from the frontend
    console.log('Looking up package with name:', packageId)
    let subscriptionPackage = await SubscriptionPackage.findOne({ name: packageId })
    console.log('Package found:', subscriptionPackage ? 'YES' : 'NO')
    
    if (!subscriptionPackage) {
      console.log('Package not found, attempting to seed packages...')
      // Try to seed packages if not found
      const { SUBSCRIPTION_PACKAGES } = await import('@/utils/subscriptionPackages')
      console.log('Loaded packages from utility:', SUBSCRIPTION_PACKAGES.map(p => p.name))
      
      for (const pkg of SUBSCRIPTION_PACKAGES) {
        const result = await SubscriptionPackage.findOneAndUpdate(
          { name: pkg.name },
          pkg,
          { upsert: true, new: true }
        )
        console.log('Seeded package:', pkg.name, result ? 'SUCCESS' : 'FAILED')
      }
      
      // Try again after seeding
      subscriptionPackage = await SubscriptionPackage.findOne({ name: packageId })
      console.log('Package found after seeding:', subscriptionPackage ? 'YES' : 'NO')
      
      if (!subscriptionPackage) {
        console.error('Package still not found after seeding. Available packages:', 
          await SubscriptionPackage.find({}).select('name'))
        return NextResponse.json(
          { success: false, message: 'Subscription package not found', packageId },
          { status: 404 }
        )
      }
    }

    // Check if subscription already exists for this reference
    const existingSubscription = await UserSubscription.findOne({ transactionReference: reference })
    if (existingSubscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription already activated for this transaction' },
        { status: 400 }
      )
    }

    // Calculate subscription dates
    const startDate = new Date()
    const endDate = new Date()
    
    if (billingCycle === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Get trial period if applicable
    let trialEndDate = null
    if (subscriptionPackage.trialDays && subscriptionPackage.trialDays > 0) {
      trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + subscriptionPackage.trialDays)
    }

    // Create subscription
    const newSubscription = await UserSubscription.create({
      userId: session.user.id,
      storeId: storeId || null,
      packageId: subscriptionPackage._id,
      packageName: subscriptionPackage.name,
      status: trialEndDate ? 'TRIAL' : 'ACTIVE',
      billingCycle: billingCycle || 'MONTHLY',
      startDate,
      endDate,
      trialEndDate,
      amount: formatPaystackAmount(transactionData.amount),
      currency: transactionData.currency || 'NGN',
      paymentMethod: 'PAYSTACK',
      transactionReference: reference,
      lastPaymentDate: new Date(),
      nextBillingDate: endDate,
      autoRenew: true
    })

    // Update user's subscription status
    await User.findByIdAndUpdate(session.user.id, {
      currentSubscription: newSubscription._id,
      subscriptionStatus: newSubscription.status
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscription: newSubscription,
        transactionDetails: {
          reference: transactionData.reference,
          amount: formatPaystackAmount(transactionData.amount),
          currency: transactionData.currency,
          paidAt: transactionData.paid_at,
          channel: transactionData.channel
        }
      }
    })

  } catch (error) {
    console.error('Subscription payment verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
