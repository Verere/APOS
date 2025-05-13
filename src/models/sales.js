import mongoose from "mongoose";

const SalesSchema = new mongoose.Schema({

   order: {
    type: mongoose.Schema.ObjectId,
    ref: 'order',
    required: true
},
slug:{type:String},
   location:{type: String},
   orderNum:{type: String},
  itemId:{type: String},
   item:{type: String},
   price: {type: Number}, 
   qty: {type: Number}, 
   amount: {type: Number}, 
   bDate: {type: String},
   soldBy:{type: String},
   status:{type: String},
   isUpdated:{type:Boolean, default:false},
    isCancelled:{type:Boolean, default:false},
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

export default mongoose.models.sales || mongoose.model('sales', SalesSchema) 