import mongoose from 'mongoose'

const MyTableSchema = new mongoose.Schema({
    
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

let Dataset = mongoose.models.mytable || mongoose.model('mytable', MyTableSchema)
export default Dataset