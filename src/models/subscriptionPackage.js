import mongoose from 'mongoose';

const SubscriptionPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    yearly: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'NGN'
    }
  },
  features: {
    maxStores: {
      type: Number,
      required: true
    },
    maxProducts: {
      type: Number,
      required: true
    },
    maxUsers: {
      type: Number,
      required: true
    },
    maxOrders: {
      type: Number,
      required: true, // per month
    },
    storage: {
      type: String,
      required: true // e.g., "1GB", "5GB", "Unlimited"
    },
    features: [{
      type: String
    }],
    advancedFeatures: [{
      type: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  trialDays: {
    type: Number,
    default: 0
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

// Update the updatedAt timestamp before saving
SubscriptionPackageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.SubscriptionPackage || mongoose.model('SubscriptionPackage', SubscriptionPackageSchema);
