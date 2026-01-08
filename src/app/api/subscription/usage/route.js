/**
 * API endpoint to get current user's subscription usage
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { 
  getUserSubscription, 
  getUserUsage, 
  getUsagePercentages 
} from '@/lib/subscriptionLimits';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [subscriptionData, usage, percentages] = await Promise.all([
      getUserSubscription(session.user.id),
      getUserUsage(session.user.id),
      getUsagePercentages(session.user.id)
    ]);

    if (!subscriptionData) {
      return NextResponse.json(
        { error: 'Unable to fetch subscription data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        packageName: subscriptionData.package.name,
        displayName: subscriptionData.package.displayName,
        status: subscriptionData.subscription?.status || 'NONE'
      },
      limits: subscriptionData.limits,
      usage,
      percentages
    });

  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription usage',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
