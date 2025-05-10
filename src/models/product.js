import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
   barcode:{type:String},
    price: {
        type: Number,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
        default:0
    },
    unit: {
        type: String,
    },
    reOrder: {
        type: Number,
    }, 
    isAvailable: {
        type: Boolean,
        default: true
    },       
     category: {
        type: String,
    },    
         
    slug: {
        type: String
    }
    , 
    totalValue: {
        type: Number,
    },     
         isDeleted: {
        type: Boolean,
        default: false,
    },
}, {    
  
}, {
    timestamps: true
})

let Dataset = mongoose.models.product || mongoose.model('product', productSchema)
export default Dataset