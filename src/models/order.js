import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    slug:{
        type: String
    },
   orderName:{type: String},
   orderNum:{type: String},
   items:{type: Array},
   amount: {type: Number}, 
   profit: {type: Number, default: 0},
   amountPaid: {type: Number, default:0}, 
   bal: {type: Number}, 
   bDate: {type: String},
   soldBy:{type: String,   required: true},
   status:{type: String, default:'newOrder'},
   isSuspended:{type: Boolean, default:false},
   isCompleted:{type: Boolean, default:false},
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

export default mongoose.models.order || mongoose.model('order', OrderSchema) 