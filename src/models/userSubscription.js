import mongoose from 'mongoose';

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: Reference to primary/first store (for convenience only)
  // Subscription applies to user and covers all their stores up to package limit
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false,
    default: null
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPackage',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  billingCycle: {
    type: String,
    enum: ['MONTHLY', 'YEARLY'],
    default: 'MONTHLY'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  trialEndDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'BANK_TRANSFER', 'PAYSTACK', 'FLUTTERWAVE', 'MANUAL']
  },
  transactionReference: {
    type: String
  },
  paystackSubscriptionCode: {
    type: String
  },
  lastPaymentDate: {
    type: Date
  },
  nextBillingDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ storeId: 1, status: 1 });
UserSubscriptionSchema.index({ endDate: 1, status: 1 });

// Update the updatedAt timestamp before saving
UserSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.UserSubscription || mongoose.model('UserSubscription', UserSubscriptionSchema);
