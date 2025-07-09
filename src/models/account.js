import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({

  
slug:{type:String},
   previousSales: {type: Number},   
   cash: {type: Number},   
   pos: {type: Number},   
   transfer: {type: Number},   
   totalSales: {type: Number},   
   expenses: {type: Number},   
   metSales: {type: Number},   
   bDate: {type: String},
   user:{type: String},
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

export default mongoose.models.expense || mongoose.model('expense', ExpenseSchema) 