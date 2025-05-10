import mongoose from 'mongoose'

const CategoriesSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        trim: true
    },
   
    image: {
        type: String,       
    },     
         slug: {
        type: String,
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

let Dataset = mongoose.models.categories || mongoose.model('categories', CategoriesSchema)
export default Dataset