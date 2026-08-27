const LOCAL_PAYMENT_METHODS = ['CASH', 'POS', 'TRANSFER', 'OTHER']

export function hasLocalPaymentMethod(selectedMethods = [], paymentAmounts = {}) {
  return selectedMethods.some((method) => {
    if (!LOCAL_PAYMENT_METHODS.includes(method)) return false
    return Number(paymentAmounts?.[method] || 0) > 0
  })
}

export function isLocalFirstCheckoutEligible({
  offlineEnabled,
  isComplimentary,
  walletSelected,
  selectedMethods = [],
  paymentAmounts = {},
}) {
  if (!offlineEnabled) return false
  if (isComplimentary) return false
  if (walletSelected) return false
  if (typeof navigator !== 'undefined' && navigator.onLine) return false

  return hasLocalPaymentMethod(selectedMethods, paymentAmounts)
}

export function shouldTryImmediateServerSync() {
  if (typeof navigator === 'undefined') return false
  return Boolean(navigator.onLine)
}
