import mongoose from 'mongoose'

const RoomSchema = new mongoose.Schema({
    
    name: {
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

let Dataset = mongoose.models.room || mongoose.model('room', RoomSchema)
export default Dataset