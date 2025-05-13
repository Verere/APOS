import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    hotelId:{
        type: mongoose.Types.ObjectId,
        ref: 'hotel'
    },  
    location:{type: String},
orderId:{type: String},
receipt:{type: String},
   amount: {type: Number}, 
   amountPaid: {type: Number}, 
   mop:{type: String},
   bDate: {type: String},
  user:{type: String},
  status:{type: String},
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

export default mongoose.models.payment || mongoose.model('payment', PaymentSchema) 