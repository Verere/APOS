import mongoose from 'mongoose'

const StoreSubSchema = new mongoose.Schema({
    
    slug: {
        type: String,
        required: true,
    },
    sub: {
        type: String,
        required: true,
    }, 
    startDate: {
        type: String,
        required: true,
    }, 
    endDate: {
        type: String,
        required: true,
    }, 
   
    
}, {
    timestamps: true
})

let Dataset = mongoose.models.storesub || mongoose.model('storesub', StoreSubSchema)
export default Dataset