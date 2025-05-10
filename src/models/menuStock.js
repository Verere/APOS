import mongoose from 'mongoose'

const MenuStockSchema = new mongoose.Schema({
   
  itemId: {
        type: mongoose.Types.ObjectId,
        ref: 'product'
    },
    item: {
        type: String
    },
    
    stock: {
        type: Number,
        required: true
    },   
   
    action: {
        type: String,
        required:true,        
    },
    qty: {
        type: Number,
        required:true,
    },    
    balanceStock: {
        type: Number,
        required:true,
    },     
        
       
    isUpdated: {
        type: Boolean,
        default:false,
    },  
     user: {
        type: String
    },             
    slug: {
        type: String
    },       
     bDate: {
        type: String
    }
   
}, {
    timestamps: true
})

let Dataset = mongoose.models.menuStock || mongoose.model('menuStock', MenuStockSchema)
export default Dataset

    
         
   