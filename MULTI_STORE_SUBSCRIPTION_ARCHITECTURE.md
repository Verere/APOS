# Multi-Store Subscription Architecture

## Overview

MarketBook's subscription system is **user-based, not store-based**. A single subscription covers **all stores** owned by the user, up to their package limit.

---

## Architecture Design

### ✅ How It Works

```
User (1) ──► Subscription (1) ──► Covers Multiple Stores (up to package limit)
│
├─► Store 1
├─► Store 2
├─► Store 3
└─► Store N (up to maxStores limit)
```

### Subscription Model (`UserSubscription`)

```javascript
{
  userId: ObjectId,        // REQUIRED - The user who owns the subscription
  storeId: ObjectId,       // OPTIONAL - Reference to primary/first store (just metadata)
  packageId: ObjectId,     // REQUIRED - The subscription package
  packageName: String,     // "FREE", "STARTER", "BASIC", "PROFESSIONAL", "ENTERPRISE"
  status: String,          // "ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "SUSPENDED"
  billingCycle: String,    // "MONTHLY" or "YEARLY"
  // ... other fields
}
```

**Important:** The `storeId` field is **optional metadata** that references the user's primary/first store for convenience. It does NOT limit the subscription to that store only.

---

## Package Limits

| Package        | Max Stores | Max Products | Max Users | Max Orders | Storage  |
|----------------|------------|--------------|-----------|------------|----------|
| FREE           | 1          | 10           | 1         | 100        | 500MB    |
| STARTER        | 1          | 50           | 2         | 500        | 2GB      |
| BASIC          | 2          | 500          | 5         | 1,000      | 5GB      |
| PROFESSIONAL   | 5          | 5,000        | 20        | 10,000     | 50GB     |
| ENTERPRISE     | Unlimited  | Unlimited    | Unlimited | Unlimited  | Unlimited|

### How Limits Are Enforced

```javascript
// src/lib/subscriptionLimits.js

// 1. Get user's subscription
const subscriptionData = await getUserSubscription(userId)

// 2. Get current usage across ALL user's stores
const usage = await getUserUsage(userId)
// Returns: { stores: 3, products: 450, users: 4, orders: 850 }

// 3. Check if user can create more stores
const limitCheck = await checkResourceLimit(userId, 'stores')
// Returns: { allowed: true/false, current: 3, limit: 5 }
```

The system counts **all resources** owned by the user across **all their stores**, not per-store.

---

## Example Scenarios

### Scenario 1: Basic Package (2 Stores)

```
User subscribes to BASIC package
├─► Can create up to 2 stores
├─► Total 500 products across all stores
├─► Total 5 users across all stores
└─► Total 1,000 orders across all stores
```

**Store 1:**
- 300 products
- 3 users
- 600 orders

**Store 2:**
- 200 products
- 2 users
- 400 orders

**Total Usage:**
- ✅ 2 stores (limit: 2) - OK
- ✅ 500 products (limit: 500) - OK
- ✅ 5 users (limit: 5) - OK
- ✅ 1,000 orders (limit: 1,000) - OK

---

### Scenario 2: Professional Package (5 Stores)

```
User subscribes to PROFESSIONAL package
├─► Can create up to 5 stores
├─► Total 5,000 products across all stores
├─► Total 20 users across all stores
└─► Total 10,000 orders across all stores
```

The user can distribute resources however they want:
- Store 1: 2,000 products
- Store 2: 1,500 products
- Store 3: 800 products
- Store 4: 500 products
- Store 5: 200 products
- **Total: 5,000 products** ✅

---

## How Multi-Store Creation Works

### 1. User Creates First Store

```javascript
// Automatic on signup
POST /api/stores/create
{
  name: "Main Store",
  slug: "main-store"
}

// System creates:
// 1. Store record (owner: userId)
// 2. StoreMembership record (userId, storeId, role: "OWNER")
// 3. If subscription exists, updates subscription.storeId = storeId (optional)
```

### 2. User Creates Additional Stores

```javascript
// Check if user can create more stores
const limitCheck = await checkResourceLimit(userId, 'stores')

if (!limitCheck.allowed) {
  return {
    error: "You've reached your limit of 2 stores. Upgrade to PROFESSIONAL to create up to 5 stores."
  }
}

// Create additional store
POST /api/stores/create
{
  name: "Second Store",
  slug: "second-store"
}
```

### 3. Limit Enforcement

```javascript
// In store creation API
export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  // Check store limit
  const limitCheck = await requireSubscriptionLimit('stores')
  
  if (limitCheck.error) {
    return NextResponse.json(
      { error: limitCheck.error },
      { status: limitCheck.status }
    )
  }
  
  // Create store...
}
```

---

## Subscription Assignment Flow

### When User Subscribes

```javascript
// 1. User clicks "Subscribe to BASIC"
// 2. Payment is processed
// 3. Subscription is created

const newSubscription = await UserSubscription.create({
  userId: session.user.id,              // Required
  storeId: userStoreId || null,         // Optional: first store reference
  packageId: subscriptionPackage._id,   // Required
  packageName: "BASIC",                 // Required
  status: "ACTIVE",
  // ... other fields
})

// 4. Link to user
await User.findByIdAndUpdate(session.user.id, {
  currentSubscription: newSubscription._id,
  subscriptionStatus: "ACTIVE"
})
```

### storeId Assignment Logic

```javascript
// Try to get user's first store
if (!storeId && session?.user?.id) {
  const membership = await StoreMembership.findOne({ 
    userId: session.user.id, 
    isDeleted: { $ne: true } 
  }).select('storeId').lean()
  
  if (membership?.storeId) {
    storeId = membership.storeId  // Use first store as reference
  }
}

// If no stores exist yet, storeId = null is fine
// User can create stores later, and subscription still applies
```

---

## Database Queries

### Get User's Subscription

```javascript
const user = await User.findById(userId).populate('currentSubscription')
const subscription = user.currentSubscription

// subscription.packageName = "BASIC"
// subscription.storeId = optional reference to first store
```

### Count User's Stores

```javascript
const storesCount = await Store.countDocuments({ 
  owner: userId 
})
// Returns total stores owned by user (across all stores)
```

### Count User's Products

```javascript
const productsCount = await Product.countDocuments({ 
  createdBy: userId 
})
// Returns total products across all user's stores
```

---

## Upgrading Subscriptions

### User Upgrades from BASIC to PROFESSIONAL

**Before Upgrade:**
- Package: BASIC
- Stores: 2/2 (at limit)
- Products: 450/500

**After Upgrade:**
- Package: PROFESSIONAL
- Stores: 2/5 (can create 3 more)
- Products: 450/5,000 (lots of room)

```javascript
// User can immediately create more stores
POST /api/stores/create
{
  name: "Third Store"
}
// ✅ Allowed now (PROFESSIONAL allows 5 stores)
```

---

## Key Takeaways

1. **Subscription = User Level** (not store level)
2. **One subscription covers all stores** the user owns
3. **Limits are cumulative** across all stores
4. **storeId field is optional metadata** for convenience
5. **Resource counting is user-based**: `Store.countDocuments({ owner: userId })`
6. **Upgrading unlocks more capacity** across all stores

---

## API Endpoints

### Check Limits

```javascript
GET /api/subscription/usage
// Returns user's current usage and limits

Response:
{
  subscription: {
    packageName: "BASIC",
    status: "ACTIVE"
  },
  usage: {
    stores: 2,
    products: 450,
    users: 4,
    orders: 850
  },
  limits: {
    maxStores: 2,
    maxProducts: 500,
    maxUsers: 5,
    maxOrders: 1000
  }
}
```

### Check Specific Resource

```javascript
// In any API route
import { requireSubscriptionLimit } from '@/lib/subscriptionLimits'

export async function POST(request) {
  const limitCheck = await requireSubscriptionLimit('stores')
  
  if (limitCheck.error) {
    return NextResponse.json(
      { error: limitCheck.error, ...limitCheck.data },
      { status: limitCheck.status }
    )
  }
  
  // Proceed with store creation...
}
```

---

## Migration Considerations

If you have existing subscriptions with `storeId` set:

1. **No changes needed** - storeId is just metadata
2. **Subscription still covers all user's stores**
3. **Limits are still enforced user-wide**
4. **storeId can be null** - doesn't affect functionality

---

## Summary

✅ **Correct Design**: User → 1 Subscription → N Stores (up to limit)  
❌ **Incorrect Design**: User → N Subscriptions (1 per store)

The current architecture is **correct and scalable**. The `storeId` field in `UserSubscription` is optional metadata and doesn't restrict the subscription to a single store.

When a user subscribes to a package:
- They get 1 subscription
- It covers ALL their stores
- Limits are enforced across all stores
- They can upgrade to increase capacity

No architectural changes needed! The system already works correctly for multi-store scenarios. 🎉
