// Paystack configuration
export const PAYSTACK_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_ad0f843481fae22bbfd815f946e0416b7e95820c',
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_a1be37db4c9696e128e5ea06467542f20703618f',
  currency: 'NGN',
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
}

/**
 * Initialize Paystack payment for subscription
 * @param {Object} subscriptionData - Subscription details
 * @returns {Object} Paystack configuration
 */
export function initializeSubscriptionPayment(subscriptionData) {
  const {
    email,
    amount,
    reference,
    metadata,
    currency = PAYSTACK_CONFIG.currency,
    channels = PAYSTACK_CONFIG.channels
  } = subscriptionData

  return {
    reference,
    email,
    amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
    publicKey: PAYSTACK_CONFIG.publicKey,
    currency,
    channels,
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: 'Subscription Package',
          variable_name: 'package_name',
          value: metadata?.packageName || 'N/A'
        },
        {
          display_name: 'Billing Cycle',
          variable_name: 'billing_cycle',
          value: metadata?.billingCycle || 'N/A'
        }
      ]
    }
  }
}

/**
 * Verify Paystack transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPaystackTransaction(reference) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
          'Content-Type': 'application/json',
        }
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Verification failed')
    }

    return {
      success: data.status,
      data: data.data,
      message: data.message
    }
  } catch (error) {
    console.error('Paystack verification error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate unique transaction reference
 * @param {string} prefix - Reference prefix
 * @returns {string} Unique reference
 */
export function generatePaystackReference(prefix = 'SUB') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Calculate subscription amount based on currency
 * @param {number} baseAmount - Base amount in NGN
 * @param {string} currency - Target currency
 * @param {number} rate - Exchange rate
 * @returns {number} Converted amount
 */
export function calculateSubscriptionAmount(baseAmount, currency, rate = 1) {
  if (currency === 'NGN') {
    return baseAmount
  }
  return Math.round(baseAmount * rate * 100) / 100
}

/**
 * Format Paystack amount (convert from kobo to naira)
 * @param {number} amountInKobo - Amount in kobo
 * @returns {number} Amount in naira
 */
export function formatPaystackAmount(amountInKobo) {
  return amountInKobo / 100
}

/**
 * Validate Paystack webhook signature
 * @param {string} signature - Webhook signature from header
 * @param {Object} body - Request body
 * @returns {boolean} Whether signature is valid
 */
export function validatePaystackWebhook(signature, body) {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha512', PAYSTACK_CONFIG.secretKey)
    .update(JSON.stringify(body))
    .digest('hex')
  
  return hash === signature
}

/**
 * Get Paystack error message
 * @param {Object} error - Error object from Paystack
 * @returns {string} User-friendly error message
 */
export function getPaystackErrorMessage(error) {
  const errorMessages = {
    'insufficient_funds': 'Insufficient funds in your account',
    'invalid_card': 'Invalid card details provided',
    'expired_card': 'Your card has expired',
    'declined': 'Transaction was declined by your bank',
    'timeout': 'Transaction timed out. Please try again',
    'network_error': 'Network error. Please check your connection',
    'duplicate_transaction': 'Duplicate transaction detected'
  }

  return errorMessages[error?.code] || error?.message || 'Payment failed. Please try again'
}
