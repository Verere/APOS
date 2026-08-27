import db from '@/lib/db/db'
import { getDeviceId } from '@/lib/db/device'
import { LOCAL_SYNC_STATUS, LOCAL_TRANSACTION_TYPES, makeLocalId } from '@/lib/db/schema'
import { enqueueSync } from '@/lib/db/syncQueue'
import { createLocalOrder } from '@/lib/db/orders'
import { createLocalPayment } from '@/lib/db/payments'
import { recordLocalInventoryChange } from '@/lib/db/inventory'

function normalizeLocalCartItems(cartItems = []) {
  return (Array.isArray(cartItems) ? cartItems : []).map((item) => {
    const productId = String(item.product || item.productId || item._id || '')
    const quantity = Number(item.qty ?? item.quantity ?? 1)
    const unitPrice = Number(item.price ?? item.unitPrice ?? 0)
    const total = Number(item.total ?? item.amount ?? quantity * unitPrice)

    return {
      ...item,
      product: productId,
      productId,
      quantity,
      qty: quantity,
      price: unitPrice,
      unitPrice,
      total,
      amount: total,
    }
  })
}

function normalizePaymentMethods({ paymentMethods = [], paymentMethod = 'CASH', amountPaid = 0, orderAmount = 0 }) {
  const normalized = (Array.isArray(paymentMethods) ? paymentMethods : [])
    .map((entry) => ({
      method: String(entry?.method || '').toUpperCase().trim(),
      amount: Number(entry?.amount || 0),
    }))
    .filter((entry) => entry.method && entry.amount > 0)

  if (normalized.length > 0) {
    return normalized
  }

  const fallbackAmount = Number(amountPaid || orderAmount || 0)
  return [{ method: String(paymentMethod || 'CASH').toUpperCase(), amount: fallbackAmount }]
}

export async function completeLocalCashSale({
  cartItems,
  storeId,
  storeSlug,
  customer,
  cashier,
  paymentMethods = [],
  paymentMethod = 'CASH',
  amountPaid,
  change,
  orderMeta = {},
}) {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    throw new Error('Cart is empty')
  }

  const items = normalizeLocalCartItems(cartItems)
  const deviceId = await getDeviceId()
  const transactionId = makeLocalId('tx')
  const orderNum = `OFF-${Date.now().toString(36).toUpperCase()}`
  const orderAmount = items.reduce((sum, item) => sum + Number(item.total || item.amount || 0), 0)
  const normalizedPayments = normalizePaymentMethods({
    paymentMethods,
    paymentMethod,
    amountPaid,
    orderAmount,
  })
  const subtotal = normalizedPayments.reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
  const methodSet = Array.from(new Set(normalizedPayments.map((entry) => entry.method)))
  const totalByMethod = (method) => normalizedPayments
    .filter((entry) => entry.method === method)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
  const mop = methodSet.join(',') || String(paymentMethod || 'CASH').toUpperCase()
  const businessDate = String(orderMeta?.bDate || orderMeta?.busDate || new Date().toISOString())

  const localOrder = {
    transactionId,
    deviceId,
    slug: storeSlug || '',
    storeId: storeId || storeSlug || null,
    orderNum,
    customerId: customer?._id || customer?.customerId || null,
    customerName: customer?.name || null,
    cashier: cashier || 'Cashier',
    user: cashier || 'Cashier',
    bDate: businessDate,
    amount: orderAmount,
    amountPaid: subtotal,
    total: orderAmount,
    change: Number(change || Math.max(0, subtotal - orderAmount)),
    orderAmount,
    mop,
    cashPaid: totalByMethod('CASH'),
    posPaid: totalByMethod('POS'),
    transferPaid: totalByMethod('TRANSFER'),
    walletPaid: totalByMethod('WALLET'),
    otherPaid: totalByMethod('OTHER'),
    items,
    meta: {
      ...orderMeta,
      paymentMethods: normalizedPayments,
      source: 'LOCAL_OFFLINE',
    },
  }

  await db.transaction('rw', db.orders, db.orderItems, db.payments, db.inventory, db.syncQueue, async () => {
    await db.orders.put({
      id: makeLocalId('order'),
      transactionId,
      deviceId,
      storeId: localOrder.storeId,
      orderNum,
      customerId: localOrder.customerId,
      customerName: localOrder.customerName,
      cashier: localOrder.cashier,
      amount: localOrder.amount,
      amountPaid: localOrder.amountPaid,
      total: localOrder.total,
      change: localOrder.change,
      items,
      syncStatus: LOCAL_SYNC_STATUS.PENDING,
      status: 'PENDING_SYNC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meta: localOrder.meta,
    })

    const orderItemsToSave = items.map((item, idx) => ({
      id: makeLocalId(`order-item-${idx}`),
      transactionId,
      orderId: transactionId,
      productId: String(item.product || item.productId || item._id || ''),
      productName: item.productName || item.name || '',
      quantity: Number(item.qty ?? item.quantity ?? 1),
      unitPrice: Number(item.price ?? item.unitPrice ?? 0),
      amount: Number(item.amount ?? item.total ?? 0),
      total: Number(item.total ?? item.amount ?? 0),
      createdAt: new Date().toISOString(),
    }))

    if (orderItemsToSave.length) {
      await db.orderItems.bulkPut(orderItemsToSave)
    }

    await db.payments.put({
      id: makeLocalId('payment'),
      transactionId,
      orderId: transactionId,
      deviceId,
      customerId: localOrder.customerId,
      method: mop,
      methods: normalizedPayments,
      amount: Number(subtotal || 0),
      orderAmount: orderAmount,
      change: Number(localOrder.change || 0),
      syncStatus: LOCAL_SYNC_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    for (const item of items) {
      await db.inventory.put({
        id: makeLocalId('inventory'),
        transactionId,
        productId: String(item.product || item.productId || item._id || ''),
        storeId: localOrder.storeId,
        quantityDelta: -Number(item.qty ?? item.quantity ?? 1),
        orderId: transactionId,
        notes: `Offline local sale ${orderNum}`,
        syncStatus: LOCAL_SYNC_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    await enqueueSync({
      transactionId,
      deviceId,
      type: LOCAL_TRANSACTION_TYPES.SALE,
      payload: {
        slug: storeSlug || '',
        user: cashier || 'Cashier',
        bDate: businessDate,
        path: String(orderMeta?.path || '/'),
        amountPaid: subtotal,
        mop,
        orderAmount,
        cashPaid: localOrder.cashPaid,
        posPaid: localOrder.posPaid,
        transferPaid: localOrder.transferPaid,
        walletPaid: localOrder.walletPaid,
        customerId: localOrder.customerId || '',
        customerName: localOrder.customerName || '',
        transactionType: 'STANDARD',
        isComplimentary: false,
        location: String(orderMeta?.location || ''),
        allowDecimalQuantity: Boolean(orderMeta?.allowDecimalQuantity),
        order: localOrder,
        payments: normalizedPayments,
        paymentMethods: normalizedPayments,
        items,
      },
      status: LOCAL_SYNC_STATUS.PENDING,
    })
  })

  return {
    success: true,
    message: 'Sale saved locally. It will sync automatically when internet is available.',
    transactionId,
    orderNum,
    syncStatus: LOCAL_SYNC_STATUS.PENDING,
    localOrder,
  }
}

export async function getLocalPendingSales() {
  return db.orders.where('syncStatus').equals(LOCAL_SYNC_STATUS.PENDING).toArray()
}
