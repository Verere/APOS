import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  // Referrer (person who shares the link)
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  
  // Unique referral code for the referrer
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  
  // Referee (person who signs up using the link)
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  
  // Status of the referral
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REWARDED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Reward details
  reward: {
    type: {
      type: String,
      enum: ['CREDIT', 'DISCOUNT', 'FREE_MONTH', 'UPGRADE', 'CASH'],
      default: 'CREDIT'
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    description: String
  },
  
  // Tracking
  clickCount: {
    type: Number,
    default: 0
  },
  
  signupDate: {
    type: Date,
    default: null
  },
  
  completionDate: {
    type: Date,
    default: null
  },
  
  rewardDate: {
    type: Date,
    default: null
  },
  
  // Metadata
  metadata: {
    source: String, // where the referral came from (email, social, etc)
    ipAddress: String,
    userAgent: String,
    campaign: String
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

// Indexes for performance
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ createdAt: 1 });

// Generate unique referral code
referralSchema.statics.generateCode = async function(userId) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existing = await this.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

// Get referral stats for a user
referralSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrerId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    completed: 0,
    rewarded: 0,
    totalReward: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'PENDING') result.pending = stat.count;
    if (stat._id === 'COMPLETED') result.completed = stat.count;
    if (stat._id === 'REWARDED') result.rewarded = stat.count;
  });
  
  // Calculate total rewards earned
  const rewards = await this.find({
    referrerId: new mongoose.Types.ObjectId(userId),
    status: 'REWARDED'
  });
  
  result.totalReward = rewards.reduce((sum, ref) => sum + (ref.reward?.amount || 0), 0);
  
  return result;
};

let Dataset = mongoose.models?.Referral || mongoose.model('Referral', referralSchema);
export default Dataset;
