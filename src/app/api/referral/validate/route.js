/**
 * Validate referral code
 * GET /api/referral/validate?code=ABC123
 */

import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectDB';
import User from '@/models/user';
import Referral from '@/models/referral';
import { REFERRAL_CONFIG } from '@/lib/referralConfig';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with this referral code
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase() 
    }).select('name email referralCode');

    if (!referrer) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid referral code'
      });
    }

    // Find active referral
    const referral = await Referral.findOne({
      referrerId: referrer._id,
      referralCode: code.toUpperCase(),
      status: { $in: ['PENDING', 'COMPLETED'] }
    });

    if (!referral) {
      return NextResponse.json({
        valid: false,
        message: 'Referral code is not active'
      });
    }

    // Check if expired
    if (referral.expiresAt && referral.expiresAt < new Date()) {
      return NextResponse.json({
        valid: false,
        message: 'Referral code has expired'
      });
    }

    // Check referral limits
    const userStats = await Referral.getUserStats(referrer._id);
    if (userStats.total >= REFERRAL_CONFIG.LIMITS.maxReferralsPerUser) {
      return NextResponse.json({
        valid: false,
        message: 'Referral limit reached'
      });
    }

    return NextResponse.json({
      valid: true,
      referralCode: code.toUpperCase(),
      referrerName: referrer.name,
      reward: {
        type: REFERRAL_CONFIG.REFEREE_REWARD.type,
        amount: REFERRAL_CONFIG.REFEREE_REWARD.amount,
        currency: REFERRAL_CONFIG.REFEREE_REWARD.currency,
        description: REFERRAL_CONFIG.REFEREE_REWARD.description
      },
      message: `You'll receive ${REFERRAL_CONFIG.REFEREE_REWARD.currency} ${REFERRAL_CONFIG.REFEREE_REWARD.amount} when you sign up!`
    });

  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate referral code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
