import mongoose from 'mongoose'

const RoomcatSchema = new mongoose.Schema({
    
    category: {
        type: String,
        required: true,
        trim: true
    },
        
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

let Dataset = mongoose.models.roomcat || mongoose.model('roomcat', RoomcatSchema)
export default Dataset