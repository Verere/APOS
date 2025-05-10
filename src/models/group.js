import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: {type: String},   
    location: {type: String},   
    hotelId:{
        type: mongoose.Types.ObjectId,
        ref: 'hotel'
    }, 
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    } 
})

export default mongoose.models.group || mongoose.model('group', GroupSchema) 