# 📊 Subscription Limits System - Visual Overview

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER MAKES REQUEST                            │
│              (Create Product, Store, User, etc.)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API ROUTE HANDLER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  import { enforceLimitInRoute } from '@/lib/...'         │  │
│  │                                                            │  │
│  │  const limitError = await enforceLimitInRoute('products')│  │
│  │  if (limitError) return limitError;                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUBSCRIPTION LIMITS CHECKER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Get user's active subscription                       │  │
│  │  2. Fetch current usage counts                           │  │
│  │  3. Compare usage vs limits                              │  │
│  │  4. Return allowed/denied decision                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
      WITHIN LIMIT                     LIMIT REACHED
             │                                │
             ▼                                ▼
    ┌────────────────┐              ┌─────────────────┐
    │  Continue      │              │  Return 403     │
    │  Creating      │              │  Error with     │
    │  Resource      │              │  Upgrade Link   │
    └────────────────┘              └─────────────────┘
```

---

## 📦 File Structure

```
APOS-main/
│
├── src/
│   ├── lib/
│   │   ├── subscriptionLimits.js          ⭐ Core utility functions
│   │   └── subscriptionLimits.examples.js  📝 Implementation examples
│   │
│   ├── components/
│   │   └── SubscriptionUsage/
│   │       ├── UsageWidget.jsx             🎨 React usage display
│   │       └── index.js                    📦 Export file
│   │
│   ├── app/api/
│   │   └── subscription/
│   │       └── usage/
│   │           └── route.js                🔌 Usage API endpoint
│   │
│   └── utils/
│       └── subscriptionPackages.js         📊 Package definitions
│
├── QUICK_START_LIMITS.md                   🚀 Quick start guide
└── SUBSCRIPTION_LIMITS_GUIDE.md            📚 Complete documentation
```

---

## 🔄 Data Flow

### 1. User Subscription Data
```javascript
{
  subscription: {
    packageName: 'BASIC',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-02-01'
  },
  limits: {
    maxStores: 1,
    maxProducts: 100,
    maxUsers: 1,
    maxOrders: 1000
  }
}
```

### 2. Current Usage
```javascript
{
  stores: 1,      // Current count
  products: 45,   // Current count
  users: 1,       // Current count
  orders: 230     // Current count
}
```

### 3. Limit Check Result
```javascript
{
  allowed: false,
  current: 100,
  limit: 100,
  packageName: 'BASIC',
  message: "You've reached your limit of 100 products..."
}
```

---

## 🎨 Usage Widget Visual

```
┌────────────────────────────────────────────────┐
│  📊 Subscription Usage                         │
│     Basic Plan                                 │
├────────────────────────────────────────────────┤
│                                                │
│  ⚠️ Approaching Limit                         │
│     Consider upgrading to avoid interruption   │
│                                                │
├────────────────────────────────────────────────┤
│  🏪 Stores            1 / 1                    │
│  [████████████████████████████] 100%           │
│                                                │
│  📦 Products          45 / 100                 │
│  [█████████████░░░░░░░░░░░░░░░] 45%            │
│                                                │
│  👥 Team Members      1 / 1                    │
│  [████████████████████████████] 100%           │
│                                                │
│  🛒 Orders            230 / 1000               │
│  [██████░░░░░░░░░░░░░░░░░░░░░░] 23%            │
│                                                │
├────────────────────────────────────────────────┤
│           [  Upgrade Plan  ]                   │
└────────────────────────────────────────────────┘
```

---

## ⚡ Implementation Methods Comparison

| Method | Complexity | Customization | Use Case |
|--------|-----------|---------------|----------|
| `enforceLimitInRoute()` | ⭐ Simple | ❌ Standard | Quick implementation |
| `requireSubscriptionLimit()` | ⭐⭐ Medium | ✅ Custom errors | Custom messages |
| `checkResourceLimit()` | ⭐⭐⭐ Advanced | ✅✅ Full control | Batch operations |
| `hasSubscriptionFeature()` | ⭐ Simple | ❌ Boolean only | Feature gates |

---

## 🎯 Quick Implementation Path

```
START HERE
    │
    ├─► Step 1: Open API route (2 min)
    │   └─► Add 2 lines of code
    │
    ├─► Step 2: Add UsageWidget to dashboard (1 min)
    │   └─► Import and place component
    │
    └─► Step 3: Test with FREE account (2 min)
        └─► Try exceeding limits

TOTAL TIME: ~5 minutes
```

---

## 📊 Subscription Tiers Visual

```
FREE                BASIC              PROFESSIONAL        ENTERPRISE
┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
│ Stores  │        │ Stores  │        │ Stores  │        │ Stores  │
│    1    │        │    1    │        │    3    │        │   10    │
├─────────┤        ├─────────┤        ├─────────┤        ├─────────┤
│Products │        │Products │        │Products │        │Products │
│   50    │  ───►  │   100   │  ───►  │  5,000  │  ───►  │ 10,000  │
├─────────┤        ├─────────┤        ├─────────┤        ├─────────┤
│  Users  │        │  Users  │        │  Users  │        │  Users  │
│    1    │        │    1    │        │   20    │        │  100    │
├─────────┤        ├─────────┤        ├─────────┤        ├─────────┤
│ Orders  │        │ Orders  │        │ Orders  │        │ Orders  │
│   100   │        │  1,000  │        │ 10,000  │        │1,000,000│
└─────────┘        └─────────┘        └─────────┘        └─────────┘
   FREE             ₦5,000/mo          ₦10,000/mo         ₦20,000/mo
```

---

## 🔒 Feature-Based Access Control

```
┌─────────────────────────────────────────────────────────┐
│              FEATURE AVAILABILITY MATRIX                 │
├──────────────────────┬──────┬───────┬──────────┬────────┤
│       Feature        │ FREE │ BASIC │   PRO    │  ENT   │
├──────────────────────┼──────┼───────┼──────────┼────────┤
│ Basic POS            │  ✅  │  ✅   │   ✅     │  ✅    │
│ Inventory Mgmt       │  ❌  │  ✅   │   ✅     │  ✅    │
│ Multi-store          │  ❌  │  ❌   │   ✅     │  ✅    │
│ Export Data          │  ❌  │  ❌   │   ✅     │  ✅    │
│ Barcode Printing     │  ❌  │  ❌   │   ✅     │  ✅    │
│ API Access           │  ❌  │  ❌   │   ❌     │  ✅    │
│ Custom Integrations  │  ❌  │  ❌   │   ❌     │  ✅    │
└──────────────────────┴──────┴───────┴──────────┴────────┘
```

---

## 🚦 Error Flow

```
User Action
    │
    ▼
API Request ──────────► Limit Check
    │                       │
    │                       ├─► Within Limit ──► ✅ Allow
    │                       │
    │                       └─► Limit Reached ──► ❌ Block
    │                                               │
    ▼                                               ▼
Return Success                           Return 403 Error
    │                                               │
    ▼                                               ▼
┌──────────────┐                          ┌─────────────────┐
│   Success    │                          │  Error Message  │
│   Response   │                          │  + Upgrade Link │
└──────────────┘                          └─────────────────┘
```

---

## 💾 Database Queries

### When Checking Limits:

```javascript
// 1. Get user's subscription
User.findById(userId).populate('currentSubscription')

// 2. Count current usage (parallel)
Promise.all([
  Store.countDocuments({ owner: userId }),
  Product.countDocuments({ createdBy: userId }),
  User.countDocuments({ createdBy: userId }),
  Order.countDocuments({ userId })
])

// 3. Compare and decide
if (current >= limit) {
  return { allowed: false, ... }
}
```

---

## 📈 Usage Percentage Calculation

```javascript
Percentage = (Current Usage / Limit) × 100

Examples:
  45 products / 100 limit  = 45%  🟢 Green  (Normal)
  80 products / 100 limit  = 80%  🟡 Yellow (Warning)
  95 products / 100 limit  = 95%  🔴 Red    (Critical)
  100 products / 100 limit = 100% 🚫 Blocked
```

---

## 🎯 Implementation Priority

```
HIGH PRIORITY (Must Have)
├─► Store creation      ⭐⭐⭐⭐⭐
├─► Product creation    ⭐⭐⭐⭐⭐
├─► User/Team creation  ⭐⭐⭐⭐⭐
└─► Order processing    ⭐⭐⭐⭐⭐

MEDIUM PRIORITY (Should Have)
├─► Bulk operations     ⭐⭐⭐
├─► File uploads        ⭐⭐⭐
└─► Batch imports       ⭐⭐⭐

LOW PRIORITY (Nice to Have)
├─► Reports             ⭐⭐
├─► Exports             ⭐⭐
└─► API endpoints       ⭐⭐
```

---

## 🧪 Testing Scenarios

```
┌─────────────────────────────────────────────────┐
│              TEST SCENARIOS                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Scenario 1: Limit Enforcement                  │
│  ├─► FREE user creates 50 products   ✅ Pass    │
│  └─► FREE user creates 51st product  ❌ Block   │
│                                                  │
│  Scenario 2: Package Upgrade                    │
│  ├─► User at limit upgrades plan     ✅ Pass    │
│  └─► Can now create more resources   ✅ Pass    │
│                                                  │
│  Scenario 3: Usage Display                      │
│  ├─► Widget shows correct usage      ✅ Pass    │
│  └─► Progress bars update            ✅ Pass    │
│                                                  │
│  Scenario 4: Error Messages                     │
│  ├─► Clear error message shown       ✅ Pass    │
│  └─► Upgrade link provided           ✅ Pass    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎓 Learning Path

```
Day 1: Basic Understanding
├─► Read QUICK_START_LIMITS.md
└─► Add enforceLimitInRoute() to 1 API route

Day 2: UI Integration
├─► Add UsageWidget to dashboard
└─► Test with FREE account

Day 3: Advanced Features
├─► Read SUBSCRIPTION_LIMITS_GUIDE.md
└─► Implement custom error messages

Day 4: Feature Gates
├─► Add hasSubscriptionFeature() checks
└─► Restrict premium features

Day 5: Optimization
├─► Review all API routes
└─► Add limits where needed
```

---

## 🏆 Success Metrics

```
✅ All critical resources have limit checks
✅ Users see their usage in dashboard
✅ Error messages are clear and helpful
✅ Upgrade flow is seamless
✅ No unexpected service interruptions
✅ Users understand their plan limits
```

---

## 🆘 Troubleshooting

```
Issue: "Limit not enforced"
├─► Check: Is enforceLimitInRoute() called?
└─► Check: Is it at the start of the function?

Issue: "Always returns 'allowed'"
├─► Check: User has active subscription?
└─► Check: Usage counts are correct?

Issue: "Widget not showing"
├─► Check: Is component imported?
└─► Check: API endpoint returns data?

Issue: "Wrong limit displayed"
├─► Check: User's subscription package
└─► Check: subscriptionPackages.js values
```

---

## 📞 Quick Reference

| Need | File | Function |
|------|------|----------|
| Simple limit check | `subscriptionLimits.js` | `enforceLimitInRoute()` |
| Custom error | `subscriptionLimits.js` | `requireSubscriptionLimit()` |
| Detailed info | `subscriptionLimits.js` | `checkResourceLimit()` |
| Feature check | `subscriptionLimits.js` | `hasSubscriptionFeature()` |
| Usage display | `UsageWidget.jsx` | `<UsageWidget />` |
| Usage API | `api/subscription/usage` | `GET /api/subscription/usage` |

---

**Ready to implement? Start with QUICK_START_LIMITS.md! 🚀**
