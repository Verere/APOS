import mongoose from 'mongoose'

const BusinessDateAuditSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'store',
    required: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    index: true,
  },
  actorUserId: {
    type: String,
    required: true,
  },
  actorName: {
    type: String,
    required: true,
  },
  businessDate: {
    type: String,
    required: true,
    index: true,
  },
  systemDate: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    enum: ['POS_CHECKOUT', 'OFFLINE_SYNC'],
    required: true,
    default: 'POS_CHECKOUT',
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
  },
  orderNum: {
    type: String,
  },
  transactionId: {
    type: String,
    index: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.businessDateAudit || mongoose.model('businessDateAudit', BusinessDateAuditSchema)