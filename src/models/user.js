import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    emailToken: {
        type: String,
        required: true
    },
    // email verification fields
    emailVerified: {
        type: Date,
        default: null
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    // password reset fields
    passwordResetToken: {
        type: String
    },
    passwordResetExpiry: {
        type: Date
    },
    role: {
        type: String,
        default: 'user'
    },
    root: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
    isAdmin: {
        type: Boolean,
        default: true
       
    },
    // Subscription fields
    currentSubscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSubscription'
    },
    subscriptionStatus: {
        type: String,
        enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED', 'NONE'],
        default: 'NONE'
    },
    // Referral fields
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    referredByCode: {
        type: String,
        default: null
    },
    referralCredits: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
})

let Dataset = mongoose.models?.user || mongoose.model('user', userSchema)
export default Dataset