/**
 * Generate or retrieve user's referral code
 * POST /api/referral/generate
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import connectDB from '@/utils/connectDB';
import User from '@/models/user';
import Referral from '@/models/referral';
import { REFERRAL_CONFIG } from '@/lib/referralConfig';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user already has a referral code
    let user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user already has a code, return it
    if (user.referralCode) {
      const stats = await Referral.getUserStats(user._id);
      
      return NextResponse.json({
        success: true,
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXTAUTH_URL}/signup?ref=${user.referralCode}`,
        stats,
        config: {
          referrerReward: REFERRAL_CONFIG.REFERRER_REWARD,
          refereeReward: REFERRAL_CONFIG.REFEREE_REWARD
        }
      });
    }

    // Generate new referral code
    const referralCode = await Referral.generateCode(user._id);

    // Update user with referral code (bypass validation for other fields)
    await User.findByIdAndUpdate(
      user._id, 
      { referralCode },
      { runValidators: false }
    );

    // Create initial referral record
    await Referral.create({
      referrerId: user._id,
      referralCode,
      status: 'PENDING',
      reward: REFERRAL_CONFIG.REFERRER_REWARD,
      expiresAt: new Date(Date.now() + REFERRAL_CONFIG.LIMITS.referralExpireDays * 24 * 60 * 60 * 1000)
    });

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink: `${process.env.NEXTAUTH_URL}/signup?ref=${referralCode}`,
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
        rewarded: 0,
        totalReward: 0
      },
      config: {
        referrerReward: REFERRAL_CONFIG.REFERRER_REWARD,
        refereeReward: REFERRAL_CONFIG.REFEREE_REWARD
      }
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate referral code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    
    if (!user || !user.referralCode) {
      return NextResponse.json({
        success: false,
        message: 'No referral code found'
      });
    }

    const stats = await Referral.getUserStats(user._id);

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXTAUTH_URL}/signup?ref=${user.referralCode}`,
      stats,
      config: {
        referrerReward: REFERRAL_CONFIG.REFERRER_REWARD,
        refereeReward: REFERRAL_CONFIG.REFEREE_REWARD
      }
    });

  } catch (error) {
    console.error('Error fetching referral code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch referral code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
