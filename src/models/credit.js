import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
    hotelId:{
        type: mongoose.Types.ObjectId,
        ref: 'hotel'
    },
   orderName:{type: String},
   orderNum:{type: String},
   location:{type: String},
   amount: {type: Number}, 
   bDate: {type: Date},
   soldBy:{type: String,   required: true},
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

export default mongoose.models.credit || mongoose.model('credit', CreditSchema) 