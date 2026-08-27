import db from './db'

export const upsertCustomerRecord = async (customer) => {
  if (!customer) return null

  const record = {
    id: customer.id || customer._id || `customer-${customer.phone || customer.email || Date.now()}`,
    customerId: String(customer._id || customer.customerId || customer.id || ''),
    storeId: customer.storeId || null,
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    walletBalance: Number(customer.walletBalance || 0),
    outstandingBalance: Number(customer.outstandingBalance || 0),
    isDeleted: Boolean(customer.isDeleted),
    updatedAt: new Date().toISOString(),
  }

  return db.customers.put(record)
}

export const getCustomerById = async (customerId) => {
  if (!customerId) return null
  return db.customers.where('customerId').equals(String(customerId)).first()
}
