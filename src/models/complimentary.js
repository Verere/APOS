import mongoose from "mongoose";

const ComplimentarySchema = new mongoose.Schema({
    hotelId:{
        type: mongoose.Types.ObjectId,
        ref: 'hotel'
    },
   orderName:{type: String},
   orderNum:{type: String},
   location:{type: String},
   amount: {type: Number}, 
   bDate: {type: Date},
   authorizedBy: {type: String}, 
   soldBy:{type: String,   required: true},
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

export default mongoose.models.complimentary || mongoose.model('complimentary', ComplimentarySchema) 