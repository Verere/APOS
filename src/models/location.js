import mongoose from 'mongoose'

const LocationSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        trim: true
    },
    lga: {
        type: String,
        trim: true
    },
        
         fee: {
        type: Number
    }
    ,     
        
         slug: {
        type: String
    }
    ,     
         isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
}, {
    timestamps: true
})

let Dataset = mongoose.models.location || mongoose.model('location', LocationSchema)
export default Dataset