import mongoose from "mongoose";

const StoreSettingsSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    index: true
  },
  
  // POS Settings
  allowCreditSales: {
    type: Boolean,
    default: true
  },
  allowPriceAdjustment: {
    type: Boolean,
    default: false
  },
  
  // Store Information
  storeName: String,
  storeAddress: String,
  storePhone: String,
  storeEmail: String,
  taxId: String,
  currency: {
    type: String,
    default: 'NGN'
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  orderAlerts: {
    type: Boolean,
    default: true
  },
  lowStockAlerts: {
    type: Boolean,
    default: true
  },
  paymentAlerts: {
    type: Boolean,
    default: true
  },
  
  // Security Settings
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 30
  },
  
  // Appearance Settings
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  },
  language: {
    type: String,
    default: 'en'
  },
  dateFormat: {
    type: String,
    default: 'DD/MM/YYYY'
  },
  timeFormat: {
    type: String,
    default: '12h',
    enum: ['12h', '24h']
  },
  
  // Printing Settings
  receiptFormat: {
    type: String,
    default: 'standard',
    enum: ['standard', 'compact', 'detailed']
  },
  autoPrint: {
    type: Boolean,
    default: false
  },
  printerName: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
StoreSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
