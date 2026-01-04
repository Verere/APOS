import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
  storeId:{
        type: mongoose.Types.ObjectId,
        ref: 'store',
        required: true
    },
  customerId:{
        type: mongoose.Types.ObjectId,
        ref: 'customer',
        required: true
    },
  orderId:{
        type: mongoose.Types.ObjectId,
        ref: 'order',
        required: true
    },

   amount: {type: Number, required: true}, 
   amountPaid: {type: Number, default: 0},
   bDate: {type: Date},
   soldBy:{type: String, required: true},
   isPaid:{type: Boolean, default:false},
   isCancelled:{type: Boolean, default:false},
   updatedBy:{type: String},
   updatedAt: {
        type: Date,
        default: Date.now
    } ,
    createdAt: {
        type: Date,
        default: Date.now
    } 
   
})

// Clear cached model to ensure schema changes are picked up
if (mongoose.models.credit) {
  delete mongoose.models.credit
}

export default mongoose.model('credit', CreditSchema) 