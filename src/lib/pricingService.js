function normalizePrice(value) {
  if (value === null || value === undefined) return undefined;

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return undefined;

  return parsed;
}

function getMappedPrice(prices, priceTypeId) {
  if (!prices || !priceTypeId) return undefined;

  // Support Mongoose Map instances
  if (typeof prices.get === 'function') {
    return normalizePrice(prices.get(priceTypeId));
  }

  // Support plain JS object payloads
  if (typeof prices === 'object') {
    return normalizePrice(prices[priceTypeId]);
  }

  return undefined;
}

export function getSellingPrice(product, customer, settings) {
  return resolveSellingPriceDetails(product, customer, settings).unitPrice;
}

export function resolveSellingPriceDetails(product, customer, settings) {
  const customerPriceTypeId = customer?.priceTypeId;
  const defaultPriceTypeId = settings?.defaultPriceTypeId;

  // 1) Customer-specific price type
  const customerTypePrice = getMappedPrice(product?.prices, customerPriceTypeId);
  if (customerTypePrice !== undefined) {
    return {
      unitPrice: customerTypePrice,
      priceTypeId: customerPriceTypeId,
    };
  }

  // 2) Store default price type
  const defaultTypePrice = getMappedPrice(product?.prices, defaultPriceTypeId);
  if (defaultTypePrice !== undefined) {
    return {
      unitPrice: defaultTypePrice,
      priceTypeId: defaultPriceTypeId,
    };
  }

  // 3) Backward-compatible legacy price
  const legacyPrice = normalizePrice(product?.price);
  if (legacyPrice !== undefined) {
    return {
      unitPrice: legacyPrice,
      priceTypeId: 'legacy',
    };
  }

  // 4) Only fail if no price is available anywhere
  throw new Error('No selling price available for this product.');
}

export default getSellingPrice;
