import mongoose from "mongoose";

function normalizeOrderItem(raw = {}) {
    const quantity = Number(raw.quantity ?? raw.qty ?? 0);
    const unitPrice = Number(raw.unitPrice ?? raw.price ?? 0);
    const total = Number(raw.total ?? raw.amount ?? (quantity * unitPrice));

    const productId = String(raw.productId ?? raw.product ?? '').trim();
    const productName = String(raw.productName ?? raw.name ?? '').trim();
    const priceTypeId = String(raw.priceTypeId ?? 'legacy').trim() || 'legacy';

    return {
        ...raw,
        productId,
        productName,
        quantity,
        unitPrice,
        priceTypeId,
        total,
        // Legacy aliases kept for backward compatibility in existing UI/reporting code.
        product: raw.product ?? productId,
        name: raw.name ?? productName,
        qty: raw.qty ?? quantity,
        price: raw.price ?? unitPrice,
        amount: raw.amount ?? total,
    };
}

const OrderItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, trim: true },
        productName: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        priceTypeId: { type: String, required: true, trim: true },
        total: { type: Number, required: true, min: 0 },
        // Optional legacy fields.
        product: { type: String },
        name: { type: String },
        qty: { type: Number },
        price: { type: Number },
        amount: { type: Number },
        cost: { type: Number },
        profit: { type: Number },
        category: { type: String },
        image: { type: String },
        barcode: { type: String },
        onSale: { type: Boolean },
    },
    { _id: false, strict: false }
);

const OrderSchema = new mongoose.Schema({
    slug:{
        type: String
    },
   orderName:{type: String},
   orderNum:{type: String},
    items:{type: [OrderItemSchema], default: []},
   amount: {type: Number}, 
   totalAmount: {type: Number}, // For consistency with other endpoints
   profit: {type: Number, default: 0},
   amountPaid: {type: Number, default:0}, 
   bal: {type: Number}, 
   bDate: {type: String},
    transactionType: { type: String, enum: ['STANDARD', 'COMPLIMENTARY'], default: 'STANDARD' },
    approvedBy: { type: String },
    reason: { type: String },
    remarks: { type: String },
   soldBy:{type: String,   required: true},
   status:{type: String, default:'newOrder'},
   isSuspended:{type: Boolean, default:false},
   isCompleted:{type: Boolean, default:false},
   isCancelled:{type: Boolean, default:false},
    cancellationReason:{type: String},
    cancelledBy:{type: String},
    cancelledAt:{type: Date},
   updatedBy:{type: String},
   updatedAt: {
        type: Date,
        default: Date.now
    } ,
    createdAt: {
        type: Date,
        default: Date.now
    } 
   
})

OrderSchema.pre('validate', function (next) {
    if (Array.isArray(this.items)) {
        this.items = this.items.map((item) => normalizeOrderItem(item));
    }
    next();
});

export default mongoose.models.order || mongoose.model('order', OrderSchema) 