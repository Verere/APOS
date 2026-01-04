import mongoose from "mongoose";

// Sub-schema for split payment methods
const PaymentMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['CASH', 'POS', 'TRANSFER', 'CHEQUE', 'OTHER'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  // Store and Location
  storeId: {
    type: mongoose.Types.ObjectId,
    ref: 'store',
    required: true,
    index: true
  },
  slug: {
    type: String,
    index: true
  },
  location: {
    type: String
  },

  // Order Information
  orderId: {
    type: mongoose.Types.ObjectId,
    ref: 'order',
    required: true,
    index: true
  },
  orderNum: {
    type: String,
    required: true
  },
  orderName: {
    type: String
  },

  // Customer Information
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer'
  },
  customerName: {
    type: String
  },
  customerType: {
    type: String,
    enum: ['REGISTERED', 'WALK_IN'],
    default: 'WALK_IN'
  },

  // Payment Details
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentMethods: [PaymentMethodSchema],
  
  // Legacy fields for backward compatibility
  cash: {
    type: Number,
    default: 0
  },
  pos: {
    type: Number,
    default: 0
  },
  transfer: {
    type: Number,
    default: 0
  },
  card: {
    type: Number,
    default: 0
  },

  // Amounts
  orderAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  change: {
    type: Number,
    default: 0,
    min: 0
  },

  // Payment Status
  status: {
    type: String,
    enum: ['COMPLETED', 'PARTIAL', 'REFUNDED', 'CANCELLED'],
    default: 'COMPLETED',
    index: true
  },
  paymentType: {
    type: String,
    enum: ['FULL', 'PARTIAL', 'CREDIT'],
    default: 'FULL'
  },

  // Date and User Information
  bDate: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  recordedBy: {
    type: String,
    required: true
  },
  user: {
    type: String
  },

  // Additional Information
  notes: {
    type: String
  },
  refundReason: {
    type: String
  },
  
  // Audit Trail
  updatedBy: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
PaymentSchema.index({ storeId: 1, paymentDate: -1 });
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ customerId: 1, paymentDate: -1 });

// Virtual for determining if payment is split
PaymentSchema.virtual('isSplitPayment').get(function() {
  return this.paymentMethods && this.paymentMethods.length > 1;
});

// Method to calculate totals from payment methods
PaymentSchema.methods.calculateTotals = function() {
  if (this.paymentMethods && this.paymentMethods.length > 0) {
    this.amountPaid = this.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    this.balance = Math.max(0, this.orderAmount - this.amountPaid);
    this.change = Math.max(0, this.amountPaid - this.orderAmount);
  }
};

// Pre-save middleware to ensure data consistency
PaymentSchema.pre('save', function(next) {
  // Calculate totals if payment methods are present
  if (this.paymentMethods && this.paymentMethods.length > 0) {
    this.calculateTotals();
    
    // Set legacy fields for backward compatibility
    this.paymentMethods.forEach(pm => {
      switch(pm.method) {
        case 'CASH':
          this.cash = pm.amount;
          break;
        case 'POS':
          this.pos = pm.amount;
          break;
        case 'TRANSFER':
          this.transfer = pm.amount;
          break;
        case 'CARD':
          this.card = pm.amount;
          break;
      }
    });
  }

  // Set payment type based on amounts
  if (this.balance > 0) {
    this.paymentType = 'PARTIAL';
    this.status = 'PARTIAL';
  } else {
    this.paymentType = 'FULL';
    this.status = 'COMPLETED';
  }

  // Set customer type
  if (this.customerId) {
    this.customerType = 'REGISTERED';
  } else {
    this.customerType = 'WALK_IN';
  }

  next();
});

// Static method to create payment with split methods
PaymentSchema.statics.createSplitPayment = async function(paymentData) {
  const payment = new this(paymentData);
  await payment.save();
  return payment;
};

// Clear cached model
if (mongoose.models.payment) {
  delete mongoose.models.payment;
}

export default mongoose.model('payment', PaymentSchema); 