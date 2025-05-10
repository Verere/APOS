import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
    },
    maxMenu: {
        type: Number,
        required: true
    }, 
    maxProduct: {
        type: Number,
        required: true
    }, 
    maxStore: {
        type: Number,
        required: true
    }, 
    maxStoreUser: {
        type: Number,
        required: true
    }, 
    
}, {
    timestamps: true
})

let Dataset = mongoose.models.subscription || mongoose.model('subscription', SubscriptionSchema)
export default Dataset