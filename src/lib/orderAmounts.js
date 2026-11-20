function finiteNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function getProductSalesAmount(order) {
  const amount = finiteNumber(order?.amount)
  const totalAmount = finiteNumber(order?.totalAmount)
  const deliveryCost = Math.max(0, finiteNumber(order?.deliveryCost) || 0)
  const serviceChargeCost = Math.max(0, finiteNumber(order?.serviceChargeCost) || 0)

  if (amount === null) return Math.max(0, (totalAmount || 0) - deliveryCost - serviceChargeCost)
  if ((deliveryCost > 0 || serviceChargeCost > 0) && totalAmount !== null && amount === totalAmount) {
    return Math.max(0, amount - deliveryCost - serviceChargeCost)
  }

  return Math.max(0, amount)
}

export function getOrderTotal(order) {
  const totalAmount = finiteNumber(order?.totalAmount)
  if (totalAmount !== null) return Math.max(0, totalAmount)

  return getProductSalesAmount(order)
    + Math.max(0, finiteNumber(order?.deliveryCost) || 0)
    + Math.max(0, finiteNumber(order?.serviceChargeCost) || 0)
}
