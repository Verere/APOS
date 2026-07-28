import mongoose from 'mongoose'

const WalletTransactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: 'customer',
      required: true,
      index: true,
    },
    invoice: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['Deposit', 'Sale', 'Refund', 'Adjustment'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    reference: {
      type: String,
      trim: true,
      default: undefined,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
)

WalletTransactionSchema.index({ customer: 1, createdAt: -1 })
WalletTransactionSchema.index({ invoice: 1, createdAt: -1 })
WalletTransactionSchema.index({ type: 1, createdAt: -1 })
WalletTransactionSchema.index(
  { reference: 1 },
  {
    unique: true,
    partialFilterExpression: { reference: { $type: 'string' } },
  }
)

const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', WalletTransactionSchema)

export default WalletTransaction
