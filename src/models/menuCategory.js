import mongoose from "mongoose";

const MenuCategorySchema = new mongoose.Schema({
    name: {type: String},   
    group: {type: String},   
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

export default mongoose.models.menuCategory || mongoose.model('menuCategory', MenuCategorySchema) 