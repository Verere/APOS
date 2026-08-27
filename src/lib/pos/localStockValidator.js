export function normalizeOfflineCartItem(item, allowDecimalQuantity = false) {
  const productId = String(item?.product || item?.productId || item?._id || '').trim();
  const requestedQty = Number(item?.qty ?? item?.quantity ?? 1);

  if (!productId) {
    throw new Error('Cart item is missing a product id.');
  }

  if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
    throw new Error(`Item ${productId} must have a positive quantity.`);
  }

  if (!allowDecimalQuantity && !Number.isInteger(requestedQty)) {
    throw new Error(`Item ${productId} quantity must be a whole number for offline checkout.`);
  }

  return { productId, requestedQty };
}

export function getLocalStockValidationError({
  cartItems = [],
  localProducts = [],
  allowDecimalQuantity = false,
} = {}) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return 'Cart is empty.';
  }

  const localProductMap = new Map(
    (Array.isArray(localProducts) ? localProducts : []).map((product) => {
      const productId = String(product?._id || product?.productId || product?.id || '').trim();
      const quantity = Number(product?.qty ?? 0);
      const productName = String(product?.name || product?.productName || product?.title || '').trim();
      return [productId, {
        qty: Number.isFinite(quantity) ? quantity : 0,
        name: productName || productId,
      }];
    })
  );

  for (const item of cartItems) {
    let productId = '';
    let requestedQty = 0;

    try {
      const normalized = normalizeOfflineCartItem(item, allowDecimalQuantity);
      productId = normalized.productId;
      requestedQty = normalized.requestedQty;
    } catch (error) {
      return error.message;
    }

    const productInfo = localProductMap.get(productId);
    const availableQty = productInfo?.qty;
    const productLabel = productInfo?.name || productId;

    if (typeof availableQty !== 'number' || !Number.isFinite(availableQty)) {
      return `Offline sale is not allowed because local stock for ${productLabel} is unavailable. Please sync the catalog and try again.`;
    }

    if (requestedQty > availableQty) {
      return `Insufficient local stock for ${productLabel}. Requested ${requestedQty}, available ${availableQty}.`;
    }
  }

  return null;
}

export function validateLocalCartStock({
  cartItems = [],
  localProducts = [],
  allowDecimalQuantity = false,
} = {}) {
  const validationError = getLocalStockValidationError({
    cartItems,
    localProducts,
    allowDecimalQuantity,
  });

  if (validationError) {
    throw new Error(validationError);
  }

  return true;
}
