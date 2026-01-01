import mongoose from 'mongoose'

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },       
     storeid: {
        type: mongoose.Types.ObjectId,
        ref: 'store'
    },
     slug: {
        type: String
    },     
    isDeleted: {
   type: Boolean,
   default: false,
},
    
}, {
    timestamps: true
})

let Dataset = mongoose.models.menu || mongoose.model('menu', menuSchema)
export default Dataset