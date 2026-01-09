# How Subscription Limits Control Access to MarketBook

## Overview

MarketBook uses a **proactive limit enforcement system** that checks subscription limits **before** allowing users to perform actions. This prevents users from exceeding their plan limits while providing clear upgrade paths.

---

## 🔐 3-Layer Access Control System

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ATTEMPTS ACTION                      │
│            (Create Product, Store, User, Order)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Authentication Check                              │
│  ✓ Is user logged in? (NextAuth session)                   │
│  ✓ Is session valid?                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Subscription Limit Check                          │
│  1. Get user's active subscription                          │
│  2. Get user's current usage (count resources)              │
│  3. Compare: current < limit?                               │
│  4. ✅ Allow or ❌ Block                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Business Logic                                    │
│  ✓ Execute action (create, update, delete)                  │
│  ✓ Save to database                                         │
│  ✓ Return success response                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ How It Works: Step-by-Step

### Example: User Tries to Create a Product

#### **User's Subscription:**
- Package: **BASIC**
- Limit: **500 products**
- Current: **497 products**

#### **Step 1: User Clicks "Add Product"**
```javascript
// Frontend sends request
POST /api/products/create
{
  name: "New Product",
  price: 1000,
  // ... other fields
}
```

#### **Step 2: API Route Receives Request**
```javascript
// src/app/api/products/create/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits'

export async function POST(request) {
  // Authentication check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 🔥 SUBSCRIPTION LIMIT CHECK
  const limitError = await enforceLimitInRoute('products')
  if (limitError) return limitError  // ❌ Blocked if limit reached

  // ✅ Allowed - proceed with creation
  const product = await Product.create({ ... })
  return NextResponse.json({ success: true, product })
}
```

#### **Step 3: Limit Check Process**

```javascript
// Inside enforceLimitInRoute('products')

// 1. Get user's subscription
const subscription = await getUserSubscription(userId)
// Returns: { 
//   packageName: "BASIC",
//   limits: { maxProducts: 500, ... }
// }

// 2. Count current products
const usage = await getUserUsage(userId)
// Returns: { products: 497, stores: 2, ... }

// 3. Compare
if (497 < 500) {
  return null  // ✅ ALLOWED - User has 3 slots remaining
}

// If 497 >= 500:
return NextResponse.json({
  error: "You've reached your limit of 500 products. Upgrade to create more.",
  current: 497,
  limit: 500,
  upgradeUrl: '/subscription'
}, { status: 403 })  // ❌ BLOCKED
```

#### **Step 4: Response to User**

**✅ If Allowed (497 < 500):**
```json
{
  "success": true,
  "product": { ... },
  "message": "Product created successfully"
}
```

**❌ If Blocked (497 >= 500):**
```json
{
  "error": "You've reached your limit of 500 products. Upgrade to create more.",
  "current": 497,
  "limit": 500,
  "packageName": "BASIC",
  "upgradeUrl": "/subscription"
}
```

Frontend shows an upgrade modal or error message with upgrade button.

---

## 📊 What Gets Checked

### Resource Types

| Resource | What's Counted | Example Limits |
|----------|----------------|----------------|
| **stores** | `Store.countDocuments({ owner: userId })` | FREE: 1, BASIC: 2, PROFESSIONAL: 5 |
| **products** | `Product.countDocuments({ createdBy: userId })` | FREE: 10, BASIC: 500, PROFESSIONAL: 5,000 |
| **users** | `User.countDocuments({ createdBy: userId })` | FREE: 1, BASIC: 5, PROFESSIONAL: 20 |
| **orders** | `Order.countDocuments({ userId: userId })` | FREE: 100, BASIC: 1,000, PROFESSIONAL: 10,000 |

### Counting Is User-Wide

```javascript
// User has 3 stores with these products:
Store 1: 200 products
Store 2: 150 products
Store 3: 100 products

// Total counted: 450 products
// If limit is 500, user can create 50 more products across ANY store
```

---

## 🔧 3 Implementation Methods

### **Method 1: Simple Auto-Block (Recommended)**

```javascript
import { enforceLimitInRoute } from '@/lib/subscriptionLimits'

export async function POST(request) {
  const limitError = await enforceLimitInRoute('products')
  if (limitError) return limitError  // Auto-generates error response
  
  // Your logic here...
}
```

**Pros:**
- ✅ One line of code
- ✅ Automatic error messages
- ✅ Standard response format

**Cons:**
- ❌ Can't customize error message

---

### **Method 2: Custom Error Messages**

```javascript
import { requireSubscriptionLimit } from '@/lib/subscriptionLimits'

export async function POST(request) {
  const limitCheck = await requireSubscriptionLimit('products')
  
  if (!limitCheck.allowed) {
    return NextResponse.json({
      error: 'Oops! Product limit reached!',
      message: `Your ${limitCheck.data.packageName} plan allows ${limitCheck.data.limit} products.`,
      current: limitCheck.data.current,
      limit: limitCheck.data.limit,
      upgradeUrl: '/subscription',
      customField: 'Any custom data you want'
    }, { status: 403 })
  }
  
  // Your logic here...
}
```

**Pros:**
- ✅ Full control over error response
- ✅ Add custom fields
- ✅ Branded messaging

**Cons:**
- ❌ More code to write

---

### **Method 3: Advanced Checks**

```javascript
import { checkResourceLimit } from '@/lib/subscriptionLimits'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  const limitCheck = await checkResourceLimit(session.user.id, 'products')
  
  if (!limitCheck.allowed) {
    // Custom handling
    await logLimitReached(session.user.id, 'products')
    await sendUpgradeEmail(session.user.email)
    
    return NextResponse.json({
      error: limitCheck.message,
      // ... custom response
    }, { status: 403 })
  }
  
  // Your logic here...
}
```

**Pros:**
- ✅ Complete control
- ✅ Can add side effects (logging, emails)
- ✅ Access to detailed limit data

**Cons:**
- ❌ Most code to write
- ❌ Need to handle auth yourself

---

## 🎯 Where Limits Are Enforced

### Critical API Routes That MUST Check Limits:

#### **1. Store Creation**
```javascript
// src/app/api/stores/create/route.js
export async function POST(request) {
  const limitError = await enforceLimitInRoute('stores')
  if (limitError) return limitError
  
  // Create store...
}
```

#### **2. Product Creation**
```javascript
// src/app/api/products/create/route.js
export async function POST(request) {
  const limitError = await enforceLimitInRoute('products')
  if (limitError) return limitError
  
  // Create product...
}
```

#### **3. User/Team Member Creation**
```javascript
// src/app/api/users/create/route.js
export async function POST(request) {
  const limitError = await enforceLimitInRoute('users')
  if (limitError) return limitError
  
  // Create user...
}
```

#### **4. Order Creation (Optional - usually not restricted)**
```javascript
// src/app/api/orders/create/route.js
export async function POST(request) {
  const limitError = await enforceLimitInRoute('orders')
  if (limitError) return limitError
  
  // Create order...
}
```

---

## 🚫 What Happens When Limit Is Reached

### Backend Response:
```json
{
  "error": "You've reached your limit of 500 products. Upgrade to create more.",
  "current": 500,
  "limit": 500,
  "resourceType": "products",
  "packageName": "BASIC",
  "upgradeUrl": "/subscription"
}
```

### Frontend Handling:

```javascript
// Frontend code
const response = await fetch('/api/products/create', {
  method: 'POST',
  body: JSON.stringify(productData)
})

const result = await response.json()

if (response.status === 403) {
  // Limit reached
  toast.error(result.error)
  
  // Show upgrade modal
  showUpgradeModal({
    current: result.current,
    limit: result.limit,
    packageName: result.packageName,
    upgradeUrl: result.upgradeUrl
  })
  
  return
}

// Success case
toast.success('Product created!')
```

### Upgrade Modal Example:

```
┌─────────────────────────────────────────────┐
│         🚀 Upgrade Your Plan                │
├─────────────────────────────────────────────┤
│                                             │
│  You've used all 500 products in your      │
│  BASIC plan.                                │
│                                             │
│  Current Usage: 500/500 products            │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Upgrade to PROFESSIONAL               │ │
│  │  • 5,000 products                      │ │
│  │  • 5 stores                            │ │
│  │  • 20 team members                     │ │
│  │  • Advanced features                   │ │
│  │                                        │ │
│  │  Only ₦220,000/year                   │ │
│  │                                        │ │
│  │  [Upgrade Now] [Learn More]           │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Maybe Later]                              │
└─────────────────────────────────────────────┘
```

---

## 📈 Usage Display

### Dashboard Widget:

```javascript
import { getUsagePercentages } from '@/lib/subscriptionLimits'

export default async function UsageDashboard({ userId }) {
  const usage = await getUsagePercentages(userId)
  
  return (
    <div>
      <h2>{usage.packageDisplayName} Plan</h2>
      
      <UsageBar 
        label="Products"
        current={usage.products.current}
        limit={usage.products.limit}
        percentage={usage.products.percentage}
        unlimited={usage.products.unlimited}
      />
      
      <UsageBar 
        label="Stores"
        current={usage.stores.current}
        limit={usage.stores.limit}
        percentage={usage.stores.percentage}
      />
      
      {usage.products.percentage > 80 && (
        <UpgradeAlert>
          You're using {usage.products.percentage}% of your product limit.
          Consider upgrading to avoid hitting your limit.
        </UpgradeAlert>
      )}
    </div>
  )
}
```

**Display Example:**

```
┌─────────────────────────────────────────────┐
│  BASIC Plan                    [Upgrade]    │
├─────────────────────────────────────────────┤
│                                             │
│  Products    497 / 500                      │
│  ████████████████████████████████████░░ 99% │
│                                             │
│  Stores      2 / 2                          │
│  ████████████████████████████████████ 100%  │
│                                             │
│  Users       4 / 5                          │
│  ████████████████████████████░░░░░░░░ 80%   │
│                                             │
│  Orders      856 / 1,000                    │
│  ███████████████████████████░░░░░░░░░ 85%   │
│                                             │
│  ⚠️ You're close to your product limit!     │
│     Upgrade to PROFESSIONAL for 10x more    │
│     [View Plans →]                          │
└─────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Updates

### After Creating a Resource:

```javascript
// User creates a product
// Current: 497 → 498

// Next API call automatically sees updated count
const usage = await getUserUsage(userId)
// Returns: { products: 498, ... }

// Remaining slots: 500 - 498 = 2
```

No caching - every check queries database for real-time accuracy.

---

## ♾️ Unlimited Plans (Enterprise)

### Special Handling:

```javascript
const limit = subscriptionPackage.features.maxProducts

if (limit >= 1000000 || limit === -1) {
  // Treat as unlimited
  return {
    allowed: true,
    current: usage.products,
    limit: 'Unlimited',
    message: 'No limit for this resource'
  }
}
```

**Enterprise users never see limit warnings** - all checks pass automatically.

---

## 🚀 Upgrade Flow

### User Hits Limit → Upgrades → Immediate Access

```
1. User: "Create product"
   ❌ Blocked: 500/500 products

2. User clicks "Upgrade Now"
   → Redirects to /subscription

3. User subscribes to PROFESSIONAL
   → Payment processed
   → UserSubscription.update({ packageName: 'PROFESSIONAL' })
   → User.update({ currentSubscription: newSubscriptionId })

4. User: "Create product" (retry)
   ✅ Allowed: 500/5,000 products
   → Product created successfully
```

**Subscription changes are effective immediately** - no waiting period.

---

## 🛡️ Security Considerations

### Limit checks happen server-side only:

```javascript
// ✅ SECURE: Backend check
// src/app/api/products/create/route.js
const limitError = await enforceLimitInRoute('products')
if (limitError) return limitError

// ❌ INSECURE: Frontend check only
// User can bypass by modifying JavaScript
```

### Frontend displays are informational only:

```javascript
// Frontend shows: "497/500 products"
// This is just UI - the real enforcement is in the API
```

### Users cannot manipulate limits:

- Limits stored in code (`SUBSCRIPTION_PACKAGES`)
- Usage counted from database queries
- No user input involved in limit calculation

---

## 📋 Summary

### How Limits Control Access:

1. **Before Action**: Check if current usage < limit
2. **If Over Limit**: Return 403 error with upgrade message
3. **If Under Limit**: Allow action to proceed
4. **After Action**: Next check will see incremented count

### Implementation Checklist:

```
✅ Import limit check function in API route
✅ Add check before resource creation
✅ Return error response if blocked
✅ Continue with normal logic if allowed
✅ Handle 403 responses in frontend
✅ Show upgrade modal when limit reached
✅ Display usage statistics in dashboard
```

### Key Files:

- `/src/lib/subscriptionLimits.js` - Core limit checking logic
- `/src/utils/subscriptionPackages.js` - Package definitions with limits
- `/src/models/userSubscription.js` - Subscription data model
- API routes - Where limits are enforced

The system is **proactive** (blocks before action), **real-time** (no caching), and **transparent** (clear upgrade paths). 🎯
