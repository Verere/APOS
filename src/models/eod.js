import mongoose from "mongoose";

const EodSchema = new mongoose.Schema({
location:{type:String},
    cash: {type: Number},
    pos: {type: Number},
    transfer: {type: Number},
    credit: {type: Number},
    complementary: {type: Number}, 
    totalSales: {type: Number}, 
    netSales: {type: Number}, 
    bDate: {type: Date},
    isCancelled:{type: Boolean , default:false},
    hotelId:{
        type: mongoose.Types.ObjectId,
        ref: 'hotel'
    },
    createdAt: {
        type: Date,
        default: Date.now
    } 
   
})

export default mongoose.models.eod || mongoose.model('eod', EodSchema) 