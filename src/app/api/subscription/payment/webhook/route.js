import { NextResponse } from 'next/server'
import connectDB from '@/utils/connectDB'
import UserSubscription from '@/models/userSubscription'
import { validatePaystackWebhook } from '@/lib/paystackConfig'

// POST /api/subscription/payment/webhook
// Handle Paystack webhook events
export async function POST(request) {
  try {
    await connectDB()

    // Get webhook signature from headers
    const signature = request.headers.get('x-paystack-signature')
    const body = await request.json()

    // Validate webhook signature
    if (!validatePaystackWebhook(signature, body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const event = body.event
    const data = body.data

    console.log('Paystack webhook event:', event)

    switch (event) {
      case 'charge.success':
        // Handle successful charge
        await handleSuccessfulCharge(data)
        break

      case 'subscription.create':
        // Handle subscription creation
        await handleSubscriptionCreate(data)
        break

      case 'subscription.not_renew':
        // Handle subscription non-renewal
        await handleSubscriptionNotRenew(data)
        break

      case 'subscription.disable':
        // Handle subscription disable
        await handleSubscriptionDisable(data)
        break

      case 'subscription.expiring_cards':
        // Handle expiring cards notification
        await handleExpiringCards(data)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed', error: error.message },
      { status: 500 }
    )
  }
}

// Handle successful charge
async function handleSuccessfulCharge(data) {
  try {
    const reference = data.reference
    
    // Find subscription by transaction reference
    const subscription = await UserSubscription.findOne({ transactionReference: reference })
    
    if (subscription) {
      subscription.status = 'ACTIVE'
      subscription.lastPaymentDate = new Date()
      await subscription.save()
      console.log('Subscription activated:', subscription._id)
    }
  } catch (error) {
    console.error('Error handling successful charge:', error)
  }
}

// Handle subscription creation
async function handleSubscriptionCreate(data) {
  try {
    // Update subscription status
    const subscriptionCode = data.subscription_code
    
    const subscription = await UserSubscription.findOne({ 
      transactionReference: data.reference 
    })
    
    if (subscription) {
      subscription.paystackSubscriptionCode = subscriptionCode
      subscription.status = 'ACTIVE'
      await subscription.save()
      console.log('Subscription code updated:', subscriptionCode)
    }
  } catch (error) {
    console.error('Error handling subscription create:', error)
  }
}

// Handle subscription not renew
async function handleSubscriptionNotRenew(data) {
  try {
    const subscriptionCode = data.subscription_code
    
    const subscription = await UserSubscription.findOne({ 
      paystackSubscriptionCode: subscriptionCode 
    })
    
    if (subscription) {
      subscription.autoRenew = false
      subscription.status = 'CANCELLED'
      subscription.cancelledAt = new Date()
      subscription.cancelReason = 'User cancelled auto-renewal'
      await subscription.save()
      console.log('Subscription auto-renewal disabled:', subscription._id)
    }
  } catch (error) {
    console.error('Error handling subscription not renew:', error)
  }
}

// Handle subscription disable
async function handleSubscriptionDisable(data) {
  try {
    const subscriptionCode = data.subscription_code
    
    const subscription = await UserSubscription.findOne({ 
      paystackSubscriptionCode: subscriptionCode 
    })
    
    if (subscription) {
      subscription.status = 'SUSPENDED'
      subscription.cancelledAt = new Date()
      subscription.cancelReason = 'Subscription disabled by Paystack'
      await subscription.save()
      console.log('Subscription disabled:', subscription._id)
    }
  } catch (error) {
    console.error('Error handling subscription disable:', error)
  }
}

// Handle expiring cards notification
async function handleExpiringCards(data) {
  try {
    // This is a notification event - you might want to send an email to users
    console.log('Card expiring soon for subscription:', data)
    
    // TODO: Send email notification to user about expiring card
    // You can implement this using nodemailer or your email service
  } catch (error) {
    console.error('Error handling expiring cards:', error)
  }
}
