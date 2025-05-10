import mongoose from 'mongoose'

const PaystackSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true
    }, 
    bank: {
        type: String,  
        required:true     
    },     
         slug: {
        type: String
    },
    payStack:{
        type: String,
        required:true
    }
    ,     
         isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
}, {
    timestamps: true
})

let Dataset = mongoose.models.paystack || mongoose.model('paystack', PaystackSchema)
export default Dataset