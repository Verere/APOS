function toNumber(value, fallback = NaN) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildOrderItemSnapshots(cartItems = [], updatedProducts = []) {
  const updatedMap = new Map((updatedProducts || []).map((p) => [String(p.id), p]));

  let totalAmount = 0;
  let totalProfit = 0;

  const orderItems = (cartItems || []).map((item, index) => {
    const productId = String(item.productId || item.product || '').trim();
    if (!productId) {
      throw new Error(`cartItems[${index}]: missing productId`);
    }

    const quantity = toNumber(item.quantity ?? item.qty, NaN);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`cartItems[${index}]: quantity must be a positive integer`);
    }

    const unitPrice = toNumber(item.unitPrice ?? item.price, NaN);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`cartItems[${index}]: unitPrice must be a valid non-negative number`);
    }

    const resolvedTotal = toNumber(item.total ?? item.amount, quantity * unitPrice);
    if (!Number.isFinite(resolvedTotal) || resolvedTotal < 0) {
      throw new Error(`cartItems[${index}]: total must be a valid non-negative number`);
    }

    const productMeta = updatedMap.get(productId);
    const cost = toNumber(productMeta?.cost, 0);
    const profit = Number((unitPrice - cost) * quantity) || 0;

    const priceTypeId = String(item.priceTypeId || 'legacy').trim() || 'legacy';
    const productName = String(item.productName || item.name || productMeta?.name || '').trim();

    totalAmount += resolvedTotal;
    totalProfit += profit;

    return {
      ...item,
      productId,
      productName,
      quantity,
      unitPrice,
      priceTypeId,
      total: resolvedTotal,
      // Legacy aliases retained for compatibility with current UI/reporting.
      product: String(item.product || item.productId || productId),
      name: String(item.name || item.productName || productName),
      qty: quantity,
      price: unitPrice,
      amount: resolvedTotal,
      cost,
      profit,
    };
  });

  return {
    orderItems,
    totalAmount,
    totalProfit,
  };
}

export default buildOrderItemSnapshots;
