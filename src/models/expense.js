import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({

  
slug:{type:String},
   Description:{type: String},  
   amount: {type: Number},   
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