import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import UserSubscription from '@/models/userSubscription';
import User from '@/models/user';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the user's current subscription
    const user = await User.findById(session.user.id)
      .populate({
        path: 'currentSubscription',
        match: { status: { $in: ['ACTIVE', 'TRIAL'] } }
      });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user has a current subscription reference, use that
    if (user.currentSubscription) {
      return NextResponse.json({
        success: true,
        subscription: {
          packageName: user.currentSubscription.packageName,
          status: user.currentSubscription.status,
          billingCycle: user.currentSubscription.billingCycle,
          amount: user.currentSubscription.amount,
          currency: user.currentSubscription.currency,
          startDate: user.currentSubscription.startDate,
          endDate: user.currentSubscription.endDate,
          autoRenew: user.currentSubscription.autoRenew,
          paymentMethod: user.currentSubscription.paymentMethod,
          transactionReference: user.currentSubscription.transactionReference
        }
      });
    }

    // Fallback: Find the most recent active subscription
    const subscription = await UserSubscription.findOne({
      userId: session.user.id,
      status: { $in: ['ACTIVE', 'TRIAL'] }
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        packageName: subscription.packageName,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        currency: subscription.currency,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod,
        transactionReference: subscription.transactionReference
      }
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription',
        details: error.message
      },
      { status: 500 }
    );
  }
}
