/**
 * Get user's referrals list
 * GET /api/referral/list
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import Referral from '@/models/referral';
import ReferralReward from '@/models/referralReward';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // optional filter

    await connectDB();

    // Build query
    const query = { referrerId: session.user.id };
    if (status) {
      query.status = status.toUpperCase();
    }

    // Get referrals
    const referrals = await Referral.find(query)
      .populate('refereeId', 'name email createdAt subscriptionStatus')
      .sort({ createdAt: -1 })
      .limit(100);

    // Get rewards
    const rewards = await ReferralReward.find({
      userId: session.user.id,
      rewardType: 'REFERRER'
    }).sort({ createdAt: -1 });

    // Calculate stats
    const stats = await Referral.getUserStats(session.user.id);

    return NextResponse.json({
      success: true,
      referrals: referrals.map(ref => ({
        id: ref._id,
        referralCode: ref.referralCode,
        status: ref.status,
        referee: ref.refereeId ? {
          name: ref.refereeId.name,
          email: ref.refereeId.email,
          joinedAt: ref.signupDate,
          subscriptionStatus: ref.refereeId.subscriptionStatus
        } : null,
        reward: ref.reward,
        clickCount: ref.clickCount,
        createdAt: ref.createdAt,
        completedAt: ref.completionDate,
        rewardedAt: ref.rewardDate
      })),
      rewards: rewards.map(reward => ({
        id: reward._id,
        type: reward.type,
        amount: reward.amount,
        currency: reward.currency,
        description: reward.description,
        status: reward.status,
        createdAt: reward.createdAt,
        processedAt: reward.processedAt
      })),
      stats
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch referrals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
