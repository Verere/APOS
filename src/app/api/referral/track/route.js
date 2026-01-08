/**
 * Track referral click/visit
 * POST /api/referral/track
 */

import { NextResponse } from 'next/server';
import connectDB from '@/utils/connectDB';
import Referral from '@/models/referral';
import User from '@/models/user';

export async function POST(request) {
  try {
    const { referralCode, metadata } = await request.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find referrer by code
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Find or create referral tracking record
    let referral = await Referral.findOne({
      referrerId: referrer._id,
      referralCode: referralCode.toUpperCase(),
      status: 'PENDING'
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found or expired' },
        { status: 404 }
      );
    }

    // Increment click count
    referral.clickCount += 1;
    
    // Update metadata if provided
    if (metadata) {
      referral.metadata = {
        ...referral.metadata,
        ...metadata,
        lastVisit: new Date()
      };
    }

    await referral.save();

    return NextResponse.json({
      success: true,
      message: 'Referral tracked successfully',
      referrerName: referrer.name,
      reward: referral.reward
    });

  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track referral',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
