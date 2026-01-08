# Subscription Limits Implementation Guide

This guide explains how to implement and enforce subscription-based usage limits in your application.

## Table of Contents
1. [Overview](#overview)
2. [Available Limits](#available-limits)
3. [Implementation Methods](#implementation-methods)
4. [Frontend Components](#frontend-components)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Overview

The subscription system tracks usage across four main resource types:
- **Stores**: Number of stores a user can create
- **Products**: Number of products per user
- **Users**: Team members/staff accounts
- **Orders**: Total orders processed

Each subscription package (FREE, BASIC, PROFESSIONAL, ENTERPRISE) has different limits for these resources.

---

## Available Limits

### Package Limits Summary

| Package | Stores | Products | Users | Orders |
|---------|--------|----------|-------|---------|
| **FREE** | 1 | 50 | 1 | 100 |
| **BASIC** | 1 | 100 | 1 | 1,000 |
| **PROFESSIONAL** | 3 | 5,000 | 20 | 10,000 |
| **ENTERPRISE** | 10 | 10,000 | 100 | 1,000,000 |

---

## Implementation Methods

### Method 1: Simple Enforcement (Recommended)

Use `enforceLimitInRoute()` for automatic limit checking with standard responses.

```javascript
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  // Check limit - returns error response if limit reached
  const limitError = await enforceLimitInRoute('stores');
  if (limitError) return limitError;

  // Continue with your logic...
}
```

**Pros:**
- Simplest implementation
- Consistent error responses
- Automatic upgrade URL included

**When to use:** Most API routes that create resources

---

### Method 2: Manual Check with Custom Response

Use `requireSubscriptionLimit()` for custom error handling.

```javascript
import { requireSubscriptionLimit } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  const limitResult = await requireSubscriptionLimit('products');
  
  if (!limitResult.allowed) {
    return NextResponse.json({
      error: 'Custom error message',
      current: limitResult.limitCheck.current,
      limit: limitResult.limitCheck.limit,
      // ... custom fields
    }, { status: 403 });
  }

  // Continue...
}
```

**Pros:**
- Full control over error response
- Can add custom messages/fields
- Package-aware messaging

**When to use:** When you need custom error messages or UI-specific responses

---

### Method 3: Direct Resource Check

Use `checkResourceLimit()` for detailed limit information.

```javascript
import { checkResourceLimit } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitCheck = await checkResourceLimit(userId, 'users');
  
  console.log(limitCheck);
  // {
  //   allowed: false,
  //   current: 50,
  //   limit: 50,
  //   packageName: 'BASIC',
  //   message: 'You've reached your limit...'
  // }

  if (!limitCheck.allowed) {
    // Handle limit...
  }
}
```

**Pros:**
- Detailed information for UI
- Can show "X remaining" messages
- Useful for batch operations

**When to use:** Bulk operations, dashboard displays, detailed feedback

---

### Method 4: Feature-Based Access Control

Use `hasSubscriptionFeature()` to restrict premium features.

```javascript
import { hasSubscriptionFeature } from '@/lib/subscriptionLimits';

export async function GET(request) {
  const hasFeature = await hasSubscriptionFeature(
    userId,
    'Export data to Excel/PDF'
  );

  if (!hasFeature) {
    return NextResponse.json({
      error: 'This feature requires Professional plan or higher'
    }, { status: 403 });
  }

  // Continue...
}
```

**Pros:**
- Controls access to specific features
- Easy to check feature availability
- Works with feature names from packages

**When to use:** Premium features, advanced functionality

---

### Method 5: Batch Operations

Check available capacity before processing batches.

```javascript
import { checkResourceLimit } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const { items } = await request.json();
  
  const limitCheck = await checkResourceLimit(userId, 'products');
  const availableSlots = limitCheck.limit === 'Unlimited' 
    ? Infinity 
    : limitCheck.limit - limitCheck.current;

  if (items.length > availableSlots) {
    return NextResponse.json({
      error: `Can only add ${availableSlots} more items`,
      requested: items.length,
      available: availableSlots
    }, { status: 403 });
  }

  // Process batch...
}
```

**When to use:** Bulk imports, batch creation operations

---

## Frontend Components

### Usage Widget

Display current usage for all resources:

```javascript
import { UsageWidget } from '@/components/SubscriptionUsage';

export default function Dashboard() {
  return (
    <div>
      <UsageWidget />
    </div>
  );
}
```

**Features:**
- Real-time usage display
- Progress bars for each resource
- Warning alerts when nearing limits
- Upgrade CTA button

---

### Client-Side Limit Check

Check limits before showing create forms:

```javascript
'use client';
import { useState, useEffect } from 'react';

export default function CreateStoreButton() {
  const [canCreate, setCanCreate] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);

  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    const response = await fetch('/api/subscription/usage');
    const data = await response.json();
    
    const storeUsage = data.percentages.stores;
    setCanCreate(storeUsage.current < storeUsage.limit);
    setLimitInfo(storeUsage);
  };

  if (!canCreate) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p>You've reached your store limit ({limitInfo?.limit})</p>
        <a href="/subscription" className="text-blue-600">
          Upgrade Plan
        </a>
      </div>
    );
  }

  return <button>Create Store</button>;
}
```

---

## Examples

### Example 1: Create Store API

```javascript
// src/app/api/stores/create/route.js
import { enforceLimitInRoute } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitError = await enforceLimitInRoute('stores');
  if (limitError) return limitError;

  const { name, slug } = await request.json();
  const store = await Store.create({ name, slug, owner: userId });
  
  return NextResponse.json({ success: true, store });
}
```

### Example 2: Add Product with Feedback

```javascript
// src/app/api/products/create/route.js
import { checkResourceLimit } from '@/lib/subscriptionLimits';

export async function POST(request) {
  const limitCheck = await checkResourceLimit(userId, 'products');
  
  if (!limitCheck.allowed) {
    return NextResponse.json({
      error: limitCheck.message,
      upgradeUrl: '/subscription'
    }, { status: 403 });
  }

  const product = await Product.create(data);
  
  return NextResponse.json({
    success: true,
    product,
    remaining: limitCheck.limit - limitCheck.current - 1
  });
}
```

### Example 3: Feature-Gated Export

```javascript
// src/app/api/export/route.js
import { hasSubscriptionFeature } from '@/lib/subscriptionLimits';

export async function GET(request) {
  const canExport = await hasSubscriptionFeature(
    userId,
    'Export data to Excel/PDF'
  );

  if (!canExport) {
    return NextResponse.json({
      error: 'Export feature requires Professional plan'
    }, { status: 403 });
  }

  // Generate export...
}
```

---

## Best Practices

### 1. Check Limits Early
Check limits at the start of your API route before processing data:

```javascript
export async function POST(request) {
  const limitError = await enforceLimitInRoute('products');
  if (limitError) return limitError; // Early return
  
  // Continue with expensive operations...
}
```

### 2. Provide Clear Feedback
Include helpful information in error responses:

```javascript
return NextResponse.json({
  error: 'Product limit reached',
  current: 50,
  limit: 50,
  message: 'Upgrade to Professional for 5,000 products',
  upgradeUrl: '/subscription'
}, { status: 403 });
```

### 3. Show Usage in UI
Display usage meters to help users track their limits:

```javascript
// Dashboard component
<UsageWidget />
```

### 4. Batch Operation Awareness
For bulk operations, check total capacity:

```javascript
const availableSlots = limit - current;
if (batchSize > availableSlots) {
  // Show error with specific numbers
}
```

### 5. Feature Flags
Use feature checks for premium functionality:

```javascript
// Show export button only if user has feature
{hasExportFeature && <ExportButton />}
```

### 6. Graceful Degradation
Provide alternatives when limits are reached:

```javascript
if (!limitCheck.allowed) {
  return {
    error: 'Limit reached',
    alternatives: [
      'Delete unused products',
      'Archive old products',
      'Upgrade to higher plan'
    ]
  };
}
```

### 7. Cache Usage Data
Cache usage counts to reduce database queries:

```javascript
// Consider using Redis or similar for usage counts
// Update cache when resources are created/deleted
```

---

## API Endpoints

### GET /api/subscription/usage
Get current user's subscription usage and limits.

**Response:**
```json
{
  "success": true,
  "subscription": {
    "packageName": "BASIC",
    "displayName": "Basic",
    "status": "ACTIVE"
  },
  "limits": {
    "maxStores": 1,
    "maxProducts": 100,
    "maxUsers": 1,
    "maxOrders": 1000
  },
  "usage": {
    "stores": 1,
    "products": 45,
    "users": 1,
    "orders": 230
  },
  "percentages": {
    "stores": { "current": 1, "limit": 1, "percentage": 100 },
    "products": { "current": 45, "limit": 100, "percentage": 45 },
    "users": { "current": 1, "limit": 1, "percentage": 100 },
    "orders": { "current": 230, "limit": 1000, "percentage": 23 }
  }
}
```

---

## Utility Functions Reference

### `getUserSubscription(userId)`
Returns user's active subscription with package details and limits.

### `getUserUsage(userId)`
Returns current usage counts for all resources.

### `checkResourceLimit(userId, resourceType)`
Checks if user can create more of a specific resource.

### `requireSubscriptionLimit(resourceType)`
Server-side middleware to check limits with automatic responses.

### `hasSubscriptionFeature(userId, featureName)`
Checks if a specific feature is available in user's subscription.

### `getUsagePercentages(userId)`
Returns usage percentages for display in UI.

### `enforceLimitInRoute(resourceType)`
Simplest method - returns error response if limit reached, null if allowed.

---

## Testing Limits

To test the limit system:

1. **Create test user with FREE plan**
2. **Try creating 51 products** (limit is 50)
3. **Expected result**: Error after 50th product
4. **Upgrade to BASIC**
5. **Try creating more products**
6. **Expected result**: Can create up to 100

---

## Support

For questions or issues with subscription limits, contact the development team or refer to the examples in `src/lib/subscriptionLimits.examples.js`.
