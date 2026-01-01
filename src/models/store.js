import mongoose from 'mongoose'
const StoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
    },  
    
   
    address: {
        type: String,
        required: true
    },   
   
    
    number: {
        type: Number        
    },
    whatsapp: {
        type: Number,
    },    
     user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    logo: {
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
        
         isDeleted: {
        type: Boolean,
        default: false,
    },
    sub:{
        type:String,
    },
    starts:{
        type: Date
    },
    ends:{
        type:Date
    },
    reference:{
        type:String
    },
}, {
    timestamps: true
})
// Ensure a unique index on slug
StoreSchema.index({ slug: 1 }, { unique: true })

let Dataset = mongoose.models.store || mongoose.model('store', StoreSchema)
export default Dataset