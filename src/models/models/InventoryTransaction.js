// Copilot: Create a Mongoose schema to track inventory transactions.
// Each document must represent ONE stock change.
// Support transaction types: SALE, RESTOCK, ADJUSTMENT, RETURN.
// Fields must include productId, slug, quantity (+/-),
// previousStock, newStock, optional orderId, and createdAt.
// This schema is used for audit and product history.

import mongoose from "mongoose";

const InventoryTransactionSchema = new mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	slug: {
		type: String,
		required: true,
		index: true,
	},
	type: {
		type: String,
		enum: ['SALE', 'RESTOCK', 'ADJUSTMENT', 'RETURN'],
		required: true,
	},
	quantity: {
		// positive or negative number indicating the change applied
		type: Number,
		required: true,
	},
	previousStock: {
		type: Number,
		required: true,
	},
	newStock: {
		type: Number,
		required: true,
	},
	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
	},
	notes: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
	},
});

InventoryTransactionSchema.index({ productId: 1, createdAt: -1 });

const InventoryTransaction = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', InventoryTransactionSchema);

export default InventoryTransaction;