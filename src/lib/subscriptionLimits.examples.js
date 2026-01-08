/**
 * EXAMPLE: How to enforce subscription limits in API routes
 * 
 * This file demonstrates different ways to implement subscription-based
 * usage limits in your API endpoints.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { 
  enforceLimitInRoute,
  requireSubscriptionLimit,
  checkResourceLimit,
  hasSubscriptionFeature,
  getUserSubscription
} from '@/lib/subscriptionLimits';

// ============================================================================
// METHOD 1: Simple enforcement with automatic response (RECOMMENDED)
// ============================================================================

/**
 * Example: Create Store with limit check
 * This is the simplest method - automatically returns error if limit is reached
 */
export async function POST_CreateStore(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check limit - returns error response if limit reached, null if allowed
    const limitError = await enforceLimitInRoute('stores');
    if (limitError) return limitError;

    // Continue with your normal logic...
    const body = await request.json();
    
    // Create store logic here...
    
    return NextResponse.json({
      success: true,
      message: 'Store created successfully'
    });

  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// ============================================================================
// METHOD 2: Manual check with custom response
// ============================================================================

/**
 * Example: Create Product with custom limit response
 * Use this when you need custom error messages or additional logic
 */
export async function POST_CreateProduct(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Manual limit check with custom handling
    const limitResult = await requireSubscriptionLimit('products');
    
    if (!limitResult.allowed) {
      return NextResponse.json({
        error: 'Product Limit Reached',
        message: `You've reached your limit of ${limitResult.limitCheck.limit} products.`,
        current: limitResult.limitCheck.current,
        limit: limitResult.limitCheck.limit,
        suggestion: 'Upgrade to Professional plan for up to 5,000 products',
        upgradeUrl: '/subscription',
        packageName: limitResult.limitCheck.packageName
      }, { status: 403 });
    }

    // Continue with product creation...
    const body = await request.json();
    
    // Create product logic here...
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      remainingSlots: limitResult.limitCheck.limit - limitResult.limitCheck.current - 1
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// ============================================================================
// METHOD 3: Direct resource check
// ============================================================================

/**
 * Example: Add Team Member with detailed limit info
 * Use this when you need granular control over the limit check
 */
export async function POST_AddTeamMember(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Direct check for detailed information
    const limitCheck = await checkResourceLimit(session.user.id, 'users');

    if (!limitCheck.allowed) {
      // Custom response based on package
      const upgradeMessage = limitCheck.packageName === 'FREE' 
        ? 'Upgrade to Basic plan to add team members'
        : `Upgrade to ${limitCheck.packageName === 'BASIC' ? 'Professional' : 'Enterprise'} plan for more team members`;

      return NextResponse.json({
        error: 'Team Member Limit Reached',
        details: {
          current: limitCheck.current,
          limit: limitCheck.limit,
          package: limitCheck.packageName,
          message: limitCheck.message,
          upgradeMessage
        }
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Add team member logic here...
    
    return NextResponse.json({
      success: true,
      message: 'Team member added successfully',
      usage: {
        current: limitCheck.current + 1,
        limit: limitCheck.limit,
        remaining: limitCheck.limit - limitCheck.current - 1
      }
    });

  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

// ============================================================================
// METHOD 4: Feature-based access control
// ============================================================================

/**
 * Example: Export Data - Feature check
 * Use this to restrict access to premium features
 */
export async function GET_ExportData(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this feature
    const hasExportFeature = await hasSubscriptionFeature(
      session.user.id,
      'Export data to Excel/PDF'
    );

    if (!hasExportFeature) {
      return NextResponse.json({
        error: 'Feature Not Available',
        message: 'Data export is only available in Professional and Enterprise plans',
        requiredPlan: 'Professional',
        upgradeUrl: '/subscription'
      }, { status: 403 });
    }

    // Export logic here...
    
    return NextResponse.json({
      success: true,
      downloadUrl: '/exports/data.xlsx'
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// METHOD 5: Batch operations with limit awareness
// ============================================================================

/**
 * Example: Bulk Product Import
 * Check limits before processing batch operations
 */
export async function POST_BulkImportProducts(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body; // Array of products to import

    // Check if user can add this many products
    const limitCheck = await checkResourceLimit(session.user.id, 'products');
    const availableSlots = limitCheck.limit === 'Unlimited' 
      ? Infinity 
      : limitCheck.limit - limitCheck.current;

    if (products.length > availableSlots) {
      return NextResponse.json({
        error: 'Insufficient Capacity',
        message: `You can only add ${availableSlots} more products. You're trying to add ${products.length}.`,
        details: {
          requested: products.length,
          available: availableSlots,
          current: limitCheck.current,
          limit: limitCheck.limit
        },
        suggestion: 'Upgrade your plan or reduce the number of products to import'
      }, { status: 403 });
    }

    // Process import...
    
    return NextResponse.json({
      success: true,
      imported: products.length,
      remaining: availableSlots - products.length
    });

  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
}

// ============================================================================
// METHOD 6: Subscription details with limits
// ============================================================================

/**
 * Example: Get Dashboard Stats with subscription awareness
 * Include subscription limits in response for UI display
 */
export async function GET_DashboardStats(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription details
    const subscriptionData = await getUserSubscription(session.user.id);

    // Your regular dashboard stats logic...
    const stats = {
      totalSales: 50000,
      totalOrders: 250,
      // ... other stats
    };

    // Include subscription context
    return NextResponse.json({
      success: true,
      stats,
      subscription: {
        package: subscriptionData.package.name,
        displayName: subscriptionData.package.displayName,
        limits: subscriptionData.limits,
        features: subscriptionData.package.features
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
