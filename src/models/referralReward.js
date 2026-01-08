import mongoose from 'mongoose';

const referralRewardSchema = new mongoose.Schema({
  // User who received the reward
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  
  // Related referral
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true
  },
  
  // Reward type
  rewardType: {
    type: String,
    enum: ['REFERRER', 'REFEREE'], // who gets the reward
    required: true
  },
  
  // Reward details
  type: {
    type: String,
    enum: ['CREDIT', 'DISCOUNT', 'FREE_MONTH', 'UPGRADE', 'CASH'],
    required: true
  },
  
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'NGN'
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  
  // Processing
  processedAt: {
    type: Date,
    default: null
  },
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  
  // Payment details (if cash reward)
  paymentDetails: {
    method: String, // bank_transfer, wallet, etc
    reference: String,
    transactionId: String,
    paidAt: Date
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Notes
  notes: String
  
}, {
  timestamps: true
});

// Indexes
referralRewardSchema.index({ userId: 1, status: 1 });
referralRewardSchema.index({ referralId: 1 });

let Dataset = mongoose.models?.ReferralReward || mongoose.model('ReferralReward', referralRewardSchema);
export default Dataset;
