import mongoose from 'mongoose'

const StoreMembershipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    storeId: {
        type: mongoose.Types.ObjectId,
        ref: 'store',
        required: true
    },
    role: {
        type: String,
        enum: ['OWNER', 'MANAGER', 'CASHIER'],
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        default: []
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// prevent duplicate membership records for same user-store pair
StoreMembershipSchema.index({ userId: 1, storeId: 1 }, { unique: true })

// additional indexes to speed up lookups
StoreMembershipSchema.index({ storeId: 1 })
StoreMembershipSchema.index({ userId: 1 })

let Dataset = mongoose.models.storemembership || mongoose.model('storemembership', StoreMembershipSchema)
export default Dataset

// Prevent removing or demoting the last OWNER for a store
// - On save: if role is being changed from OWNER -> non-OWNER, ensure another OWNER exists
// - On findOneAndUpdate: if update would remove OWNER role or mark isDeleted, ensure another OWNER exists
// - On findOneAndDelete: prevent deleting the last OWNER

async function countOtherOwners(storeId, excludeId) {
    return mongoose.models.storemembership.countDocuments({ storeId, role: 'OWNER', isDeleted: { $ne: true }, _id: { $ne: excludeId } });
}

StoreMembershipSchema.pre('save', async function(next) {
    try {
        if (!this.isNew && this.isModified('role')) {
            const prior = await mongoose.models.storemembership.findById(this._id).lean();
            if (prior && prior.role === 'OWNER' && this.role !== 'OWNER') {
                const others = await countOtherOwners(this.storeId, this._id);
                if (others === 0) {
                    const err = new Error('Cannot remove OWNER role: store must have at least one OWNER');
                    return next(err);
                }
            }
        }
        next();
    } catch (e) { next(e); }
});

StoreMembershipSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate() || {};
        // Normalize $set
        const set = update.$set || update;
        if (set.role === undefined && set.isDeleted === undefined) return next();

        const doc = await this.model.findOne(this.getQuery()).lean();
        if (!doc) return next();

        // If the existing doc is OWNER and the update would demote or delete it, ensure other owners exist
        const willDemote = (set.role && set.role !== 'OWNER');
        const willDelete = (set.isDeleted === true);
        if (doc.role === 'OWNER' && (willDemote || willDelete)) {
            const others = await countOtherOwners(doc.storeId, doc._id);
            if (others === 0) {
                const err = new Error('Cannot remove OWNER role: store must have at least one OWNER');
                return next(err);
            }
        }
        next();
    } catch (e) { next(e); }
});

StoreMembershipSchema.pre('findOneAndDelete', async function(next) {
    try {
        const doc = await this.model.findOne(this.getQuery()).lean();
        if (!doc) return next();
        if (doc.role === 'OWNER') {
            const others = await countOtherOwners(doc.storeId, doc._id);
            if (others === 0) {
                const err = new Error('Cannot delete the last OWNER of a store');
                return next(err);
            }
        }
        next();
    } catch (e) { next(e); }
});
