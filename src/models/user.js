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
}, {
    timestamps: true
})

let Dataset = mongoose.models?.user || mongoose.model('user', userSchema)
export default Dataset