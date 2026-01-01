import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Types.ObjectId,
        ref: 'store',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true }
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    totalPurchases: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastPurchaseDate: {
        type: Date
    },
    customerType: {
        type: String,
        enum: ['regular', 'vip', 'wholesale', 'retail'],
        default: 'retail'
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    preferredPaymentMethod: {
        type: String,
        enum: ['cash', 'card', 'mobile', 'bank_transfer', 'credit'],
        default: 'cash'
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    outstandingBalance: {
        type: Number,
        default: 0
    },
    companyName: {
        type: String,
        trim: true
    },
    taxId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})

// Indexes for better query performance
customerSchema.index({ storeId: 1, phone: 1 })
customerSchema.index({ storeId: 1, email: 1 })
customerSchema.index({ storeId: 1, isDeleted: 1, isActive: 1 })
customerSchema.index({ storeId: 1, customerType: 1 })

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
    const parts = [
        this.address?.street,
        this.address?.city,
        this.address?.state,
        this.address?.zipCode,
        this.address?.country
    ].filter(Boolean)
    return parts.join(', ')
})

const Customer = mongoose.models.customer || mongoose.model('customer', customerSchema)

export default Customer
