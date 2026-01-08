/**
 * Referral System Configuration
 */

export const REFERRAL_CONFIG = {
  // Reward for the person who refers (referrer)
  REFERRER_REWARD: {
    type: 'CREDIT',
    amount: 5000, // NGN 5,000 credit
    currency: 'NGN',
    description: 'Referral bonus for inviting a friend'
  },
  
  // Reward for the person who signs up (referee)
  REFEREE_REWARD: {
    type: 'DISCOUNT',
    amount: 2000, // NGN 2,000 discount
    currency: 'NGN',
    description: 'Welcome bonus for joining via referral'
  },
  
  // Minimum requirements for reward
  REQUIREMENTS: {
    refereeMinSpend: 10000, // Referee must spend NGN 10,000 to complete referral
    refereeMinDays: 30, // Referee must be active for 30 days
    requireEmailVerification: true,
    requireSubscription: true // Referee must have active subscription
  },
  
  // Limits
  LIMITS: {
    maxReferralsPerUser: 100, // Maximum referrals per user
    maxRewardAmount: 500000, // Maximum total reward amount (NGN 500,000)
    referralExpireDays: 90 // Referral link expires after 90 days
  },
  
  // Share messages
  SHARE_MESSAGES: {
    whatsapp: (code, link) => 
      `🎉 Join me on MarketBook! Get ₦2,000 off your first subscription.\n\nUse my referral code: *${code}*\n\nSign up here: ${link}`,
    
    email: (code, link, referrerName) => ({
      subject: `${referrerName} invited you to MarketBook`,
      body: `Hi there!\n\n${referrerName} thinks you'd love MarketBook - the modern point of sale system.\n\nSign up using their referral code ${code} and get ₦2,000 off your first subscription!\n\n${link}\n\nBest regards,\nMarketBook Team`
    }),
    
    social: (code) => 
      `🚀 Just referred someone to MarketBook! Join us and get ₦2,000 off with code: ${code}`
  }
};

// Helper function to check if referral can be completed
export function canCompleteReferral(referee, referral) {
  const { REQUIREMENTS } = REFERRAL_CONFIG;
  
  // Check email verification
  if (REQUIREMENTS.requireEmailVerification && !referee.emailVerified) {
    return { allowed: false, reason: 'Email not verified' };
  }
  
  // Check subscription
  if (REQUIREMENTS.requireSubscription && referee.subscriptionStatus !== 'ACTIVE') {
    return { allowed: false, reason: 'No active subscription' };
  }
  
  // Check account age
  const accountAgeDays = Math.floor((Date.now() - referee.createdAt) / (1000 * 60 * 60 * 24));
  if (accountAgeDays < REQUIREMENTS.refereeMinDays) {
    return { allowed: false, reason: `Account must be ${REQUIREMENTS.refereeMinDays} days old` };
  }
  
  // Check if referral is expired
  if (referral.expiresAt && referral.expiresAt < new Date()) {
    return { allowed: false, reason: 'Referral expired' };
  }
  
  return { allowed: true };
}

// Helper function to calculate reward amount based on subscription
export function calculateDynamicReward(subscriptionAmount) {
  // Give 10% of first subscription as referrer reward
  const referrerReward = Math.min(subscriptionAmount * 0.1, 10000);
  
  // Give 20% discount as referee reward
  const refereeDiscount = Math.min(subscriptionAmount * 0.2, 5000);
  
  return {
    referrerReward,
    refereeDiscount
  };
}
