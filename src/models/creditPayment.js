import mongoose from "mongoose";

const CreditPaymentSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Types.ObjectId,
    ref: 'store',
    required: true
  },
  creditId: {
    type: mongoose.Types.ObjectId,
    ref: 'credit',
    required: true
  },
  orderId: {
    type: mongoose.Types.ObjectId,
    ref: 'order',
    required: true
  },
  customerId: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'POS', 'TRANSFER', 'CHEQUE', 'OTHER'],
    default: 'CASH'
  },
  receiptNumber: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Clear cached model
if (mongoose.models.creditPayment) {
  delete mongoose.models.creditPayment
}

export default mongoose.model('creditPayment', CreditPaymentSchema)
