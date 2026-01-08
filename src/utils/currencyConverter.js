// Exchange rates relative to NGN (Nigerian Naira)
// Base prices are in NGN, these rates convert FROM NGN to other currencies
export const EXCHANGE_RATES = {
  NGN: 1,           // Nigerian Naira (base currency)
  GHS: 0.0526,      // Ghanaian Cedi (1 NGN = 0.0526 GHS)
  KES: 0.0833,      // Kenyan Shilling (1 NGN = 0.0833 KES)
  ZAR: 0.0118,      // South African Rand (1 NGN = 0.0118 ZAR)
  EGP: 0.0323,      // Egyptian Pound (1 NGN = 0.0323 EGP)
  MAD: 0.00645,     // Moroccan Dirham (1 NGN = 0.00645 MAD)
  TZS: 1.667,       // Tanzanian Shilling (1 NGN = 1.667 TZS)
  UGX: 2.381,       // Ugandan Shilling (1 NGN = 2.381 UGX)
  XOF: 0.385,       // West African CFA Franc (1 NGN = 0.385 XOF)
  XAF: 0.385,       // Central African CFA Franc (1 NGN = 0.385 XAF)
  ETB: 0.0769,      // Ethiopian Birr (1 NGN = 0.0769 ETB)
  RWF: 0.833,       // Rwandan Franc (1 NGN = 0.833 RWF)
  BWP: 0.00877,     // Botswana Pula (1 NGN = 0.00877 BWP)
  MUR: 0.0294,      // Mauritian Rupee (1 NGN = 0.0294 MUR)
  ZMW: 0.0167,      // Zambian Kwacha (1 NGN = 0.0167 ZMW)
  USD: 0.00065,     // US Dollar (1 NGN = 0.00065 USD)
  EUR: 0.00059,     // Euro (1 NGN = 0.00059 EUR)
  GBP: 0.00051,     // British Pound (1 NGN = 0.00051 GBP)
}

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  EGP: 'E£',
  MAD: 'MAD',
  TZS: 'TSh',
  UGX: 'USh',
  XOF: 'CFA',
  XAF: 'FCFA',
  ETB: 'Br',
  RWF: 'FRw',
  BWP: 'P',
  MUR: '₨',
  ZMW: 'ZK',
  USD: '$',
  EUR: '€',
  GBP: '£',
}

// Country to currency mapping
export const COUNTRY_CURRENCY_MAP = {
  NG: 'NGN', // Nigeria
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
  EG: 'EGP', // Egypt
  MA: 'MAD', // Morocco
  TZ: 'TZS', // Tanzania
  UG: 'UGX', // Uganda
  SN: 'XOF', // Senegal
  CI: 'XOF', // Ivory Coast
  BJ: 'XOF', // Benin
  BF: 'XOF', // Burkina Faso
  ML: 'XOF', // Mali
  NE: 'XOF', // Niger
  TG: 'XOF', // Togo
  GW: 'XOF', // Guinea-Bissau
  CM: 'XAF', // Cameroon
  CF: 'XAF', // Central African Republic
  TD: 'XAF', // Chad
  CG: 'XAF', // Republic of Congo
  GQ: 'XAF', // Equatorial Guinea
  GA: 'XAF', // Gabon
  ET: 'ETB', // Ethiopia
  RW: 'RWF', // Rwanda
  BW: 'BWP', // Botswana
  MU: 'MUR', // Mauritius
  ZM: 'ZMW', // Zambia
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  // EU countries
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR',
  GR: 'EUR', LU: 'EUR', SI: 'EUR', CY: 'EUR', MT: 'EUR',
  SK: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR',
}

/**
 * Convert amount from NGN to target currency
 * @param {number} amountInNGN - Amount in Nigerian Naira
 * @param {string} targetCurrency - Target currency code
 * @returns {number} Converted amount
 */
export function convertCurrency(amountInNGN, targetCurrency = 'NGN') {
  if (!EXCHANGE_RATES[targetCurrency]) {
    console.warn(`Exchange rate not found for ${targetCurrency}, using NGN`)
    return amountInNGN
  }
  
  const rate = EXCHANGE_RATES[targetCurrency]
  const converted = amountInNGN * rate
  
  // Round to appropriate decimal places
  if (targetCurrency === 'USD' || targetCurrency === 'EUR' || targetCurrency === 'GBP') {
    return Math.round(converted * 100) / 100 // 2 decimal places
  } else {
    return Math.round(converted) // Whole numbers for most African currencies
  }
}

/**
 * Format currency with appropriate symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'NGN') {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  
  // For currencies that typically use decimals
  if (currency === 'USD' || currency === 'EUR' || currency === 'GBP' || 
      currency === 'ZAR' || currency === 'BWP') {
    return `${symbol}${amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }
  
  // For whole number currencies
  return `${symbol}${Math.round(amount).toLocaleString()}`
}

/**
 * Get user's country from IP (using a geolocation API)
 * Falls back to Nigeria if detection fails
 */
export async function detectUserCountry() {
  try {
    // Try using ipapi.co (free tier: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept': 'application/json' }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.country_code || 'NG'
    }
  } catch (error) {
    console.warn('Country detection failed:', error)
  }
  
  // Fallback to Nigeria
  return 'NG'
}

/**
 * Get currency for a country
 * @param {string} countryCode - Two-letter country code
 * @returns {string} Currency code
 */
export function getCurrencyForCountry(countryCode) {
  return COUNTRY_CURRENCY_MAP[countryCode] || 'NGN'
}

/**
 * Get suggested currency based on user's location
 * Returns both currency code and formatted display name
 */
export async function getSuggestedCurrency() {
  const countryCode = await detectUserCountry()
  const currency = getCurrencyForCountry(countryCode)
  const symbol = CURRENCY_SYMBOLS[currency]
  
  return {
    code: currency,
    symbol: symbol,
    countryCode: countryCode
  }
}
