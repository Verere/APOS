import mongoose from 'mongoose'

const StoreInviteSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Types.ObjectId,
        ref: 'store',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['OWNER', 'MANAGER', 'CASHIER'],
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    defaultPassword: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// indexes for common lookups
StoreInviteSchema.index({ token: 1 }, { unique: true })
StoreInviteSchema.index({ storeId: 1 })
StoreInviteSchema.index({ email: 1 })

let Dataset = mongoose.models.storeinvite || mongoose.model('storeinvite', StoreInviteSchema)
export default Dataset
