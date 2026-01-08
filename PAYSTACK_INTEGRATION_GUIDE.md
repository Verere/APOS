# Paystack Subscription Integration Guide

## Overview
This document explains how the Paystack payment gateway is integrated with the APOS subscription system.

## Architecture

### Components

1. **Frontend Payment Flow**
   - `src/components/SubscriptionPackages/index.js` - Main subscription UI with Paystack integration
   - Uses `react-paystack` package for payment popup
   - Handles payment success/failure callbacks

2. **Backend Payment Processing**
   - `src/app/api/subscription/payment/verify/route.js` - Verifies payments and activates subscriptions
   - `src/app/api/subscription/payment/webhook/route.js` - Handles Paystack webhooks
   - `src/app/api/subscription/activate-free/route.js` - Activates free subscriptions

3. **Configuration & Utilities**
   - `src/lib/paystackConfig.js` - Paystack configuration and helper functions
   - Environment variables for API keys

4. **Database Models**
   - `src/models/userSubscription.js` - Stores subscription data
   - `src/models/user.js` - User model with subscription fields
   - `src/models/subscriptionPackage.js` - Package definitions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-paystack
```

Already added to package.json.

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Paystack Test Keys (for development)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_ad0f843481fae22bbfd815f946e0416b7e95820c
PAYSTACK_SECRET_KEY=sk_test_a1be37db4c9696e128e5ea06467542f20703618f

# For production, use live keys:
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
# PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
```

**Important Security Notes:**
- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ❌ Never expose `PAYSTACK_SECRET_KEY` to the frontend
- 🔒 Always use test keys in development
- 🚀 Switch to live keys before production deployment

### 3. Get Your Paystack Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up or login
3. Navigate to Settings → API Keys & Webhooks
4. Copy your Public and Secret keys

### 4. Configure Webhook URL

For production, you need to set up a webhook to receive payment notifications:

1. In Paystack Dashboard, go to Settings → Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/subscription/payment/webhook`
3. Copy the webhook secret and add to your `.env.local`

## Payment Flow

### Standard Subscription Flow

```mermaid
User clicks "Subscribe" 
  → Check authentication
  → Initialize Paystack payment
  → Paystack popup opens
  → User enters payment details
  → Payment processed
  → Success callback triggered
  → Verify payment on backend
  → Activate subscription
  → Redirect to dashboard
```

### Free Subscription Flow

```mermaid
User clicks "Start Free"
  → Check authentication
  → Call activate-free API
  → Create free subscription record
  → Update user status
  → Redirect to dashboard
```

## API Endpoints

### 1. Verify Payment
**POST** `/api/subscription/payment/verify`

Verifies a Paystack transaction and activates the subscription.

**Request Body:**
```json
{
  "reference": "SUB_1234567890_ABC123",
  "packageId": "FREE|BASIC|PROFESSIONAL|ENTERPRISE",
  "billingCycle": "MONTHLY|YEARLY",
  "storeId": "optional_store_id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscription": { /* subscription object */ },
    "transactionDetails": {
      "reference": "SUB_1234567890_ABC123",
      "amount": 15000,
      "currency": "NGN",
      "paidAt": "2026-01-06T10:30:00Z",
      "channel": "card"
    }
  }
}
```

### 2. Paystack Webhook
**POST** `/api/subscription/payment/webhook`

Receives notifications from Paystack about payment events.

**Handled Events:**
- `charge.success` - Payment successful
- `subscription.create` - Subscription created
- `subscription.not_renew` - Auto-renewal disabled
- `subscription.disable` - Subscription disabled
- `subscription.expiring_cards` - Card expiring soon

**Headers Required:**
```
x-paystack-signature: <webhook_signature>
```

### 3. Activate Free Subscription
**POST** `/api/subscription/activate-free`

Activates a free subscription without payment.

**Request Body:**
```json
{
  "packageName": "FREE",
  "billingCycle": "MONTHLY|YEARLY"
}
```

## Helper Functions

### paystackConfig.js

#### initializeSubscriptionPayment(subscriptionData)
Prepares Paystack configuration for payment initialization.

```javascript
import { initializeSubscriptionPayment } from '@/lib/paystackConfig'

const config = initializeSubscriptionPayment({
  email: 'user@example.com',
  amount: 15000, // in NGN
  reference: 'SUB_1234567890',
  metadata: {
    userId: '123',
    packageName: 'BASIC',
    billingCycle: 'MONTHLY'
  }
})
```

#### verifyPaystackTransaction(reference)
Verifies a transaction with Paystack API.

```javascript
const result = await verifyPaystackTransaction('SUB_1234567890')
if (result.success) {
  console.log('Payment verified:', result.data)
}
```

#### generatePaystackReference(prefix)
Generates a unique transaction reference.

```javascript
const ref = generatePaystackReference('SUB')
// Returns: SUB_1704528000000_ABC123XYZ
```

## Currency Handling

The system displays prices in multiple currencies but **processes all payments in NGN** (Nigerian Naira).

### How it Works:

1. User selects currency (e.g., KES - Kenyan Shilling)
2. Prices displayed in KES: `KSh1,250/mo`
3. On payment, user sees message: "Payment will be processed in Nigerian Naira (NGN)"
4. Paystack popup shows amount in NGN: `₦15,000`
5. Backend stores transaction in NGN

### Why NGN Only?

- Paystack primarily supports Nigerian businesses
- NGN has widest support across Paystack features
- Simplifies accounting and reconciliation
- Avoids currency conversion issues

### Multi-Currency Support (Future)

To support payments in other currencies:
1. Use Paystack's multi-currency feature (if available)
2. Or integrate additional payment gateways:
   - Flutterwave (supports multiple African currencies)
   - Stripe (global)
   - PayPal (global)

## Testing

### Test Cards

Paystack provides test cards for development:

**Successful Transaction:**
- Card Number: `5060 6666 6666 6666`
- CVV: `123`
- Expiry: Any future date
- PIN: `1234`

**Failed Transaction:**
- Card Number: `5060 6666 6666 6666`
- CVV: `123`
- Expiry: Any future date
- PIN: `0000`

**Insufficient Funds:**
- Use PIN: `0000` with successful card

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the ngrok URL and add to Paystack webhook settings
# Example: https://abc123.ngrok.io/api/subscription/payment/webhook
```

## Error Handling

### Common Errors

1. **"Unauthorized"** (401)
   - User not logged in
   - Solution: Redirect to login page

2. **"Payment verification failed"** (400)
   - Invalid transaction reference
   - Transaction not found
   - Solution: Check reference is correct and transaction exists

3. **"Subscription already activated"** (400)
   - Duplicate transaction reference
   - Solution: Check if user already has subscription

4. **"Internal server error"** (500)
   - Database connection failed
   - Paystack API down
   - Solution: Check logs, retry later

### User-Friendly Error Messages

The system provides friendly error messages:

```javascript
import { getPaystackErrorMessage } from '@/lib/paystackConfig'

const errorMsg = getPaystackErrorMessage(error)
toast.error(errorMsg)
```

Error mapping:
- `insufficient_funds` → "Insufficient funds in your account"
- `invalid_card` → "Invalid card details provided"
- `expired_card` → "Your card has expired"
- `declined` → "Transaction was declined by your bank"

## Security Considerations

### Best Practices

1. **Never Expose Secret Key**
   ```javascript
   // ❌ WRONG - Never do this
   const secretKey = 'sk_live_123456'
   
   // ✅ CORRECT - Use environment variables
   const secretKey = process.env.PAYSTACK_SECRET_KEY
   ```

2. **Validate Webhook Signatures**
   - Always verify webhook signatures to prevent fraud
   - Use `validatePaystackWebhook()` function

3. **Verify Payments Server-Side**
   - Never trust client-side payment confirmation
   - Always verify with Paystack API on backend

4. **Use HTTPS in Production**
   - Required for Paystack integration
   - Protects sensitive payment data

5. **Store Transaction References**
   - Keep records of all transactions
   - Useful for disputes and reconciliation

### PCI Compliance

- ✅ No card details stored on your server
- ✅ Paystack handles all sensitive data
- ✅ PCI DSS compliant by default

## Monitoring & Analytics

### Track Key Metrics

1. **Payment Success Rate**
   ```javascript
   const successRate = (successfulPayments / totalAttempts) * 100
   ```

2. **Average Transaction Value**
   ```javascript
   const avgValue = totalRevenue / totalTransactions
   ```

3. **Subscription Churn Rate**
   ```javascript
   const churnRate = (cancelledSubs / totalSubs) * 100
   ```

### Logging

Important events to log:
- Payment initializations
- Successful payments
- Failed payments
- Subscription activations
- Subscription cancellations
- Webhook events

## Troubleshooting

### Payment Not Processing

**Check:**
1. Are Paystack keys correct in `.env.local`?
2. Is user authenticated?
3. Is email valid?
4. Check browser console for errors
5. Check server logs

### Webhook Not Receiving Events

**Check:**
1. Is webhook URL publicly accessible?
2. Is webhook URL correct in Paystack dashboard?
3. Is signature validation passing?
4. Check Paystack webhook logs in dashboard

### Subscription Not Activating

**Check:**
1. Did payment succeed?
2. Was transaction verified?
3. Check database for subscription record
4. Check server logs for errors

## Production Deployment Checklist

- [ ] Replace test keys with live keys
- [ ] Configure webhook URL with live domain
- [ ] Test live payment with real card
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure email notifications
- [ ] Set up backup payment method
- [ ] Test subscription expiry flow
- [ ] Set up auto-renewal reminders
- [ ] Configure SSL certificate
- [ ] Test webhook signature validation

## Support & Resources

### Paystack Documentation
- [Getting Started](https://paystack.com/docs/)
- [API Reference](https://paystack.com/docs/api/)
- [Webhooks Guide](https://paystack.com/docs/payments/webhooks/)
- [Testing Guide](https://paystack.com/docs/payments/test-payments/)

### react-paystack Package
- [NPM Package](https://www.npmjs.com/package/react-paystack)
- [GitHub Repo](https://github.com/iamraphson/react-paystack)

### Contact Paystack Support
- Email: support@paystack.com
- Twitter: @PaystackHQ
- Developer Forum: https://paystack.community/

## Future Enhancements

1. **Subscription Management Dashboard**
   - View active subscriptions
   - Upgrade/downgrade plans
   - Cancel subscriptions
   - View payment history

2. **Auto-Renewal System**
   - Automatic charge before expiry
   - Email reminders
   - Grace period handling

3. **Invoice Generation**
   - PDF invoices
   - Email delivery
   - Invoice history

4. **Promo Codes & Discounts**
   - Percentage discounts
   - Fixed amount discounts
   - Limited time offers

5. **Analytics Dashboard**
   - Revenue charts
   - Subscription metrics
   - Customer insights

6. **Multi-Gateway Support**
   - Flutterwave integration
   - Stripe integration
   - PayPal integration

---

**Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Maintained by:** APOS Development Team
