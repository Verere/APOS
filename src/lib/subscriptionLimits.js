/**
 * Subscription Limits Checker
 * Provides utilities to check and enforce subscription-based usage limits
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import User from '@/models/user';
import UserSubscription from '@/models/userSubscription';
import Store from '@/models/store';
import Product from '@/models/product';
import Order from '@/models/order';
import { SUBSCRIPTION_PACKAGES } from '@/utils/subscriptionPackages';

/**
 * Get user's active subscription with limits
 * @param {string} userId - User ID
 * @returns {object} Subscription with limits or null
 */
export async function getUserSubscription(userId) {
  try {
    await connectDB();

    // Find user with current subscription
    const user = await User.findById(userId).populate('currentSubscription');

    if (!user) {
      return null;
    }

    // If user has active subscription, return it with package details
    if (user.currentSubscription && 
        ['ACTIVE', 'TRIAL'].includes(user.currentSubscription.status)) {
      
      const packageDetails = SUBSCRIPTION_PACKAGES.find(
        pkg => pkg.name === user.currentSubscription.packageName
      );

      return {
        subscription: user.currentSubscription,
        package: packageDetails,
        limits: packageDetails?.features || {}
      };
    }

    // No active subscription - use FREE package limits
    const freePackage = SUBSCRIPTION_PACKAGES.find(pkg => pkg.name === 'FREE');
    
    return {
      subscription: null,
      package: freePackage,
      limits: freePackage?.features || {}
    };

  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Get current usage counts for a user
 * @param {string} userId - User ID
 * @returns {object} Usage counts
 */
export async function getUserUsage(userId) {
  try {
    await connectDB();

    // Count store memberships where user is OWNER
    const StoreMembership = await import('@/models/storeMembership').then(m => m.default || m);
    const storesCreated = await StoreMembership.countDocuments({ userId, role: 'OWNER', isDeleted: { $ne: true } });

    const [productsCount, usersCount, ordersCount] = await Promise.all([
      Product.countDocuments({ createdBy: userId }),
      User.countDocuments({ createdBy: userId }), // Team members/staff
      Order.countDocuments({ userId: userId })
    ]);

    return {
      stores: storesCreated,
      products: productsCount,
      users: usersCount,
      orders: ordersCount
    };

  } catch (error) {
    console.error('Error getting user usage:', error);
    return {
      stores: 0,
      products: 0,
      users: 0,
      orders: 0
    };
  }
}

/**
 * Check if user can create more of a specific resource
 * @param {string} userId - User ID
 * @param {string} resourceType - Type of resource (stores, products, users, orders)
 * @returns {object} { allowed: boolean, current: number, limit: number, message: string }
 */
export async function checkResourceLimit(userId, resourceType) {
  const subscriptionData = await getUserSubscription(userId);
  
  if (!subscriptionData) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: 'Unable to verify subscription status'
    };
  }

  const { limits } = subscriptionData;
  const usage = await getUserUsage(userId);

  const limitKey = `max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`;
  const limit = limits[limitKey];
  const current = usage[resourceType];

  // Check if limit is unlimited (very high number or special value)
  const isUnlimited = limit >= 1000000 || limit === -1;

  if (isUnlimited) {
    return {
      allowed: true,
      current,
      limit: 'Unlimited',
      message: 'No limit for this resource'
    };
  }

  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    packageName: subscriptionData.package.name,
    message: allowed 
      ? `You can create ${limit - current} more ${resourceType}`
      : `You've reached your limit of ${limit} ${resourceType}. Upgrade to create more.`
  };
}

/**
 * Middleware function to check limits before allowing action
 * Use this in API routes
 */
export async function requireSubscriptionLimit(resourceType) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
      status: 401
    };
  }

  const limitCheck = await checkResourceLimit(session.user.id, resourceType);

  if (!limitCheck.allowed) {
    return {
      error: limitCheck.message,
      status: 403,
      data: {
        current: limitCheck.current,
        limit: limitCheck.limit,
        resourceType,
        packageName: limitCheck.packageName
      }
    };
  }

  return {
    allowed: true,
    limitCheck
  };
}

/**
 * Check if a specific feature is available in user's subscription
 * @param {string} userId - User ID
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean}
 */
export async function hasSubscriptionFeature(userId, featureName) {
  const subscriptionData = await getUserSubscription(userId);
  
  if (!subscriptionData) {
    return false;
  }

  const { package: pkg } = subscriptionData;
  
  if (!pkg) {
    return false;
  }

  return pkg.features.features.includes(featureName) ||
         pkg.features.advancedFeatures?.includes(featureName);
}

/**
 * Get usage percentage for display purposes
 * @param {string} userId - User ID
 * @returns {object} Usage percentages for each resource
 */
export async function getUsagePercentages(userId) {
  const subscriptionData = await getUserSubscription(userId);
  const usage = await getUserUsage(userId);

  if (!subscriptionData) {
    return null;
  }

  const { limits } = subscriptionData;

  const calculatePercentage = (current, max) => {
    if (max >= 1000000 || max === -1) return 0; // Unlimited
    return Math.round((current / max) * 100);
  };

  return {
    stores: {
      current: usage.stores,
      limit: limits.maxStores,
      percentage: calculatePercentage(usage.stores, limits.maxStores),
      unlimited: limits.maxStores >= 1000000
    },
    products: {
      current: usage.products,
      limit: limits.maxProducts,
      percentage: calculatePercentage(usage.products, limits.maxProducts),
      unlimited: limits.maxProducts >= 1000000
    },
    users: {
      current: usage.users,
      limit: limits.maxUsers,
      percentage: calculatePercentage(usage.users, limits.maxUsers),
      unlimited: limits.maxUsers >= 1000000
    },
    orders: {
      current: usage.orders,
      limit: limits.maxOrders,
      percentage: calculatePercentage(usage.orders, limits.maxOrders),
      unlimited: limits.maxOrders >= 1000000
    },
    packageName: subscriptionData.package.name,
    packageDisplayName: subscriptionData.package.displayName
  };
}

/**
 * Enforce limit in API route with automatic response
 * Returns null if allowed, or Response object if denied
 */
export async function enforceLimitInRoute(resourceType) {
  const result = await requireSubscriptionLimit(resourceType);
  
  if (!result.allowed) {
    const { NextResponse } = require('next/server');
    return NextResponse.json(
      { 
        error: result.error,
        ...result.data,
        upgradeUrl: '/subscription'
      },
      { status: result.status }
    );
  }
  
  return null; // Allowed to proceed
}
