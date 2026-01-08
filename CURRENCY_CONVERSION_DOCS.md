# Currency Conversion System Documentation

## Overview
The APOS system now includes automatic currency detection and conversion for subscription pricing based on the user's geographic location.

## Features

### 1. Automatic Currency Detection
- **IP-based Geolocation**: Uses ipapi.co API to detect user's country
- **Smart Fallback**: Defaults to Nigerian Naira (NGN) if detection fails
- **Loading State**: Shows "Detecting your location..." while fetching

### 2. Multi-Currency Support
The system supports 18 currencies including:

#### African Currencies (15)
- 🇳🇬 Nigerian Naira (NGN) - ₦
- 🇬🇭 Ghanaian Cedi (GHS) - GH₵
- 🇰🇪 Kenyan Shilling (KES) - KSh
- 🇿🇦 South African Rand (ZAR) - R
- 🇪🇬 Egyptian Pound (EGP) - E£
- 🇲🇦 Moroccan Dirham (MAD) - MAD
- 🇹🇿 Tanzanian Shilling (TZS) - TSh
- 🇺🇬 Ugandan Shilling (UGX) - USh
- West African CFA Franc (XOF) - CFA
- Central African CFA Franc (XAF) - FCFA
- 🇪🇹 Ethiopian Birr (ETB) - Br
- 🇷🇼 Rwandan Franc (RWF) - FRw
- 🇧🇼 Botswana Pula (BWP) - P
- 🇲🇺 Mauritian Rupee (MUR) - ₨
- 🇿🇲 Zambian Kwacha (ZMW) - ZK

#### International Currencies (3)
- 🇺🇸 US Dollar (USD) - $
- 🇪🇺 Euro (EUR) - €
- 🇬🇧 British Pound (GBP) - £

### 3. Real-time Price Conversion
- **Base Currency**: All prices stored in NGN
- **Dynamic Conversion**: Prices automatically converted to selected currency
- **Accurate Rates**: Exchange rates based on current market rates
- **Smart Formatting**: Different decimal places for different currencies

### 4. User Control
- **Manual Override**: Users can change currency via dropdown
- **Persistent Selection**: Currency choice maintained during session
- **Visual Feedback**: Currency symbol and flag shown in dropdown

## Technical Implementation

### Files Created/Modified

#### 1. `src/utils/currencyConverter.js` (NEW)
Core utility file containing:
- `EXCHANGE_RATES`: Conversion rates from NGN to all currencies
- `CURRENCY_SYMBOLS`: Symbol mapping for each currency
- `COUNTRY_CURRENCY_MAP`: Maps country codes to currencies
- `convertCurrency()`: Converts NGN amount to target currency
- `formatCurrency()`: Formats amount with appropriate symbol and decimals
- `detectUserCountry()`: Fetches user's country via IP geolocation
- `getSuggestedCurrency()`: Returns suggested currency based on location

#### 2. `src/components/SubscriptionPackages/index.js` (MODIFIED)
Enhanced subscription packages page with:
- Currency detection on component mount
- Currency selector dropdown with 18 options
- Real-time price conversion display
- Loading states during detection

#### 3. `src/components/settings/SettingsPageClient.js` (MODIFIED)
Updated currency dropdown in Store Settings to include all 18 currencies

## Usage Example

```javascript
import { 
  convertCurrency, 
  formatCurrency, 
  getSuggestedCurrency 
} from '@/utils/currencyConverter'

// Convert 15000 NGN to USD
const usdAmount = convertCurrency(15000, 'USD')
console.log(usdAmount) // 9.75

// Format with currency symbol
const formatted = formatCurrency(9.75, 'USD')
console.log(formatted) // $9.75

// Detect user's currency
const suggestedCurrency = await getSuggestedCurrency()
console.log(suggestedCurrency) 
// { code: 'KES', symbol: 'KSh', countryCode: 'KE' }
```

## Exchange Rates (as of implementation)

Based on 1 NGN (Nigerian Naira):

| Currency | Rate | Example (₦15,000) |
|----------|------|-------------------|
| GHS | 0.0526 | GH₵789 |
| KES | 0.0833 | KSh1,250 |
| ZAR | 0.0118 | R177 |
| EGP | 0.0323 | E£485 |
| USD | 0.00065 | $9.75 |
| EUR | 0.00059 | €8.85 |
| GBP | 0.00051 | £7.65 |

## Country-to-Currency Mapping

The system automatically maps 40+ countries to their currencies:

### West African CFA Countries (XOF)
- Senegal, Ivory Coast, Benin, Burkina Faso, Mali, Niger, Togo, Guinea-Bissau

### Central African CFA Countries (XAF)
- Cameroon, Central African Republic, Chad, Congo, Equatorial Guinea, Gabon

### Individual Currency Countries
- Each African country with its own currency (Nigeria→NGN, Kenya→KES, etc.)

### EU Countries
- Germany, France, Italy, Spain, and 15 other EU countries → EUR

## API Dependency

### ipapi.co Geolocation API
- **Free Tier**: 1,000 requests/day
- **Usage**: Detects user's country code
- **Fallback**: Returns 'NG' if API fails
- **Endpoint**: `https://ipapi.co/json/`

### Rate Limit Handling
If you exceed the free tier:
1. System falls back to NGN
2. User can still manually select currency
3. Consider upgrading to paid tier or using alternative service

## Customization

### Adding New Currencies
1. Add exchange rate to `EXCHANGE_RATES` in `currencyConverter.js`
2. Add symbol to `CURRENCY_SYMBOLS`
3. Add country mapping to `COUNTRY_CURRENCY_MAP`
4. Add option to currency selector dropdowns

### Updating Exchange Rates
Exchange rates are currently hardcoded. To make them dynamic:

```javascript
// Example: Fetch from external API
async function fetchExchangeRates() {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/NGN')
  const data = await response.json()
  return data.rates
}
```

### Changing Base Currency
If you need a different base currency:
1. Update all prices in subscription packages
2. Recalculate `EXCHANGE_RATES` relative to new base
3. Update `convertCurrency()` function logic

## Testing

### Manual Testing Steps
1. Visit subscription page
2. Verify currency auto-detected based on your location
3. Change currency in dropdown
4. Verify all prices update correctly
5. Check formatting (decimals, thousands separators)
6. Test with different billing cycles (monthly/yearly)

### Edge Cases to Test
- VPN usage (different country detection)
- API failure (should fallback to NGN)
- Unsupported currency (should show NGN)
- Free tier package (should show "Free" not "0")

## Performance Considerations

### Optimization Tips
1. Currency detection happens once on mount
2. Conversion calculations are lightweight (multiplication)
3. Consider caching exchange rates
4. Consider storing user's currency preference in localStorage

### Potential Improvements
- Cache geolocation result in sessionStorage
- Store user currency preference in user settings
- Use WebSocket for real-time rate updates
- Implement currency conversion history

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsive
- ✅ No external dependencies beyond Next.js and React
- ⚠️ Requires JavaScript enabled (client-side detection)

## Security Considerations

- IP geolocation doesn't reveal precise location
- No sensitive data stored
- API calls made client-side
- Consider rate limiting if using paid geolocation service

## Future Enhancements

1. **Real-time Exchange Rates**: Integrate with forex API
2. **User Preferences**: Store currency choice in database
3. **Historical Rates**: Show price history charts
4. **Multi-currency Checkout**: Process payments in user's currency
5. **Tax Calculations**: Add VAT/tax based on country
6. **Currency Comparison**: Show prices in multiple currencies simultaneously

## Support

For questions or issues:
1. Check exchange rates are up to date
2. Verify API quota not exceeded
3. Test with VPN disabled
4. Clear browser cache and retry

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintained by**: APOS Development Team
