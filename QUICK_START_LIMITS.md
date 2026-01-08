# 🚀 Quick Start: Implementing Subscription Limits

## Overview
Your subscription system is now ready to enforce usage limits based on user plans. Here's how to use it in 5 minutes.

---

## ✅ What's Been Added

### 1. Core Utilities (`src/lib/subscriptionLimits.js`)
- ✅ `enforceLimitInRoute()` - Simplest method, automatic responses
- ✅ `requireSubscriptionLimit()` - Custom error handling
- ✅ `checkResourceLimit()` - Detailed limit information
- ✅ `hasSubscriptionFeature()` - Feature-based access control
- ✅ `getUserSubscription()` - Get user's plan and limits
- ✅ `getUserUsage()` - Get current usage counts
- ✅ `getUsagePercentages()` - Usage percentages for UI

### 2. API Endpoints
- ✅ `GET /api/subscription/usage` - Returns usage data for current user

### 3. React Components
- ✅ `<UsageWidget />` - Display usage with progress bars

### 4. Documentation
- ✅ `SUBSCRIPTION_LIMITS_GUIDE.md` - Complete implementation guide
- ✅ `src/lib/subscriptionLimits.examples.js` - 6 implementation examples

---

## 🎯 Quickest Implementation (3 Steps)

### Step 1: Add to Your API Route

Open any API route where you create resources (stores, products, users, orders):

```javascript
// src/app/api/YOUR-RESOURCE/create/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  // Add these 2 lines at the start:
  const limitError = await enforceLimitInRoute('products'); // or 'stores', 'users', 'orders'
  if (limitError) return limitError;

  // Your existing code continues here...
  const body = await request.json();
  // ... rest of your logic
}
```

That's it! The API will now automatically:
- ✅ Check if user has reached their limit
- ✅ Return 403 error with upgrade message if limit reached
- ✅ Allow creation if within limits

---

### Step 2: Add Usage Widget to Dashboard

```javascript
// src/app/[slug]/dashboard/page.js (or any dashboard component)
import { UsageWidget } from '@/components/SubscriptionUsage';

export default function Dashboard() {
  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add this widget anywhere */}
      <UsageWidget />
    </div>
  );
}
```

The widget automatically shows:
- ✅ Current usage vs limits for all resources
- ✅ Progress bars with color coding (green/yellow/red)
- ✅ Warnings when approaching limits
- ✅ Upgrade button

---

### Step 3: Test It!

1. **Login as a FREE user** (limits: 50 products, 1 store, 1 user)
2. **Try creating 51 products**
3. **Expected result**: Error after 50th product with message:
   ```json
   {
     "error": "You've reached your limit of 50 products. Upgrade to create more.",
     "current": 50,
     "limit": 50,
     "resourceType": "products",
     "upgradeUrl": "/subscription"
   }
   ```

---

## 📊 Available Resource Types

When using `enforceLimitInRoute()`, use these resource types:

| Resource Type | What It Limits | Example Usage |
|--------------|----------------|---------------|
| `'stores'` | Number of stores | Creating new stores |
| `'products'` | Number of products | Adding products/inventory |
| `'users'` | Team members | Adding staff/employees |
| `'orders'` | Total orders | Processing sales |

---

## 🎨 Example Implementations

### Example 1: Limit Product Creation
```javascript
// src/app/api/products/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitError = await enforceLimitInRoute('products');
  if (limitError) return limitError;

  const { name, price, sku } = await request.json();
  // Create product...
}
```

### Example 2: Limit Store Creation
```javascript
// src/app/api/stores/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitError = await enforceLimitInRoute('stores');
  if (limitError) return limitError;

  const { name, slug } = await request.json();
  // Create store...
}
```

### Example 3: Limit Team Members
```javascript
// src/app/api/team/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitError = await enforceLimitInRoute('users');
  if (limitError) return limitError;

  const { email, role } = await request.json();
  // Add team member...
}
```

### Example 4: Custom Error Message
```javascript
import { requireSubscriptionLimit } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitResult = await requireSubscriptionLimit('products');
  
  if (!limitResult.allowed) {
    return NextResponse.json({
      error: 'Product Limit Reached',
      message: `You can only have ${limitResult.limitCheck.limit} products on your current plan.`,
      upgradeMessage: 'Upgrade to Professional for 5,000 products!',
      upgradeUrl: '/subscription'
    }, { status: 403 });
  }

  // Continue...
}
```

---

## 🔒 Feature-Based Access Control

Restrict premium features to higher-tier plans:

```javascript
import { hasSubscriptionFeature } from '@/lib/subscriptionLimits';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // Check if user has this feature
  const canExport = await hasSubscriptionFeature(
    session.user.id,
    'Export data to Excel/PDF'
  );

  if (!canExport) {
    return NextResponse.json({
      error: 'This feature requires Professional plan or higher',
      upgradeUrl: '/subscription'
    }, { status: 403 });
  }

  // Generate export...
}
```

Available features to check (from subscription packages):
- ✅ 'Export data to Excel/PDF'
- ✅ 'Barcode printing'
- ✅ 'WhatsApp invoice sharing'
- ✅ 'Custom user roles'
- ✅ 'API access'
- ✅ And more... (see `subscriptionPackages.js`)

---

## 🎯 Where to Add Limit Checks

Add limit checks to these API routes:

### Must Have (Critical):
- ✅ `POST /api/stores` - Store creation
- ✅ `POST /api/products` - Product creation
- ✅ `POST /api/team` or `/api/users` - Adding team members
- ✅ `POST /api/orders` - Creating orders

### Good to Have:
- ✅ Bulk import endpoints
- ✅ Batch creation endpoints
- ✅ File upload endpoints (check storage limits)

### Premium Features:
- ✅ Export/download endpoints
- ✅ Advanced reporting
- ✅ API access endpoints
- ✅ Integration endpoints

---

## 📱 Frontend Usage Display

### Option 1: Usage Widget (Recommended)
```javascript
import { UsageWidget } from '@/components/SubscriptionUsage';

<UsageWidget /> // Shows all resources with progress bars
```

### Option 2: Custom Display
```javascript
'use client';
import { useState, useEffect } from 'react';

export default function CustomUsageDisplay() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetch('/api/subscription/usage')
      .then(res => res.json())
      .then(data => setUsage(data));
  }, []);

  if (!usage) return <div>Loading...</div>;

  return (
    <div>
      <h3>Products: {usage.usage.products} / {usage.limits.maxProducts}</h3>
      <h3>Stores: {usage.usage.stores} / {usage.limits.maxStores}</h3>
      {/* ... */}
    </div>
  );
}
```

---

## 🚨 Error Responses

When a limit is reached, your API will return:

```json
{
  "error": "You've reached your limit of 50 products. Upgrade to create more.",
  "current": 50,
  "limit": 50,
  "resourceType": "products",
  "packageName": "FREE",
  "upgradeUrl": "/subscription"
}
```

**Status Code:** `403 Forbidden`

Handle this in your frontend:
```javascript
const response = await fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify(productData)
});

if (response.status === 403) {
  const error = await response.json();
  // Show upgrade modal or redirect to subscription page
  window.location.href = error.upgradeUrl;
}
```

---

## 📈 Subscription Tiers & Limits

| Plan | Stores | Products | Users | Orders | Price |
|------|--------|----------|-------|--------|-------|
| **FREE** | 1 | 50 | 1 | 100 | ₦0 |
| **BASIC** | 1 | 100 | 1 | 1,000 | ₦5,000/mo |
| **PROFESSIONAL** | 3 | 5,000 | 20 | 10,000 | ₦10,000/mo |
| **ENTERPRISE** | 10 | 10,000 | 100 | 1,000,000 | ₦20,000/mo |

---

## 🧪 Testing Checklist

Test these scenarios:

- [ ] FREE user tries to create 51st product → Should fail
- [ ] FREE user tries to create 2nd store → Should fail
- [ ] BASIC user creates 100 products → Should succeed
- [ ] BASIC user tries 101st product → Should fail
- [ ] PROFESSIONAL user creates 3 stores → Should succeed
- [ ] Usage widget shows correct percentages
- [ ] Upgrade button redirects to `/subscription`
- [ ] Error messages are clear and helpful

---

## 🔧 Advanced Usage

For more advanced implementations, see:
- 📖 `SUBSCRIPTION_LIMITS_GUIDE.md` - Complete guide with all methods
- 📝 `src/lib/subscriptionLimits.examples.js` - 6 detailed examples
- 🛠️ `src/lib/subscriptionLimits.js` - Full API reference

---

## 💡 Pro Tips

1. **Check limits early** in your API route (first few lines)
2. **Show usage in UI** so users know their limits before hitting them
3. **Provide clear upgrade paths** in error messages
4. **Cache usage data** if you have high traffic (consider Redis)
5. **Test with different plans** to ensure limits work correctly
6. **Use feature flags** for premium functionality
7. **Monitor limit errors** to understand when users need to upgrade

---

## 🆘 Need Help?

1. **Check the complete guide**: `SUBSCRIPTION_LIMITS_GUIDE.md`
2. **See examples**: `src/lib/subscriptionLimits.examples.js`
3. **Review the utility functions**: `src/lib/subscriptionLimits.js`

---

## ✅ Quick Checklist

- [ ] Added `enforceLimitInRoute()` to critical API routes
- [ ] Added `<UsageWidget />` to dashboard
- [ ] Tested limit enforcement with FREE plan
- [ ] Tested upgrade flow
- [ ] Added feature-based access control where needed
- [ ] Error messages include upgrade URL
- [ ] Frontend handles 403 responses gracefully

---

**You're all set! 🎉**

Start by adding `enforceLimitInRoute()` to just ONE API route and test it. Then gradually add it to other routes.
