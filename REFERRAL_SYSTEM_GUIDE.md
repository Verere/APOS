# 🎁 Referral System Implementation Guide

## Overview
Complete referral/affiliate program with tracking, rewards, and analytics.

---

## 📦 What's Been Created

### **1. Database Models**

#### **Referral Model** (`src/models/referral.js`)
- Tracks each referral relationship
- Fields: referrerId, refereeId, referralCode, status, rewards, clicks
- Auto-generates unique referral codes
- Built-in stats calculator

#### **ReferralReward Model** (`src/models/referralReward.js`)
- Tracks rewards given to users
- Supports multiple reward types: CREDIT, DISCOUNT, FREE_MONTH, CASH
- Payment tracking for cash rewards

#### **User Model Updates** (`src/models/user.js`)
- Added: `referralCode`, `referredBy`, `referredByCode`, `referralCredits`

---

### **2. Configuration** (`src/lib/referralConfig.js`)

```javascript
REFERRER_REWARD: ₦5,000 credit
REFEREE_REWARD: ₦2,000 discount

Requirements:
- Email verification required
- Active subscription required
- 30 days minimum account age
- ₦10,000 minimum spend by referee

Limits:
- Max 100 referrals per user
- ₦500,000 total reward cap
- 90 days referral expiry
```

---

### **3. API Endpoints**

#### **POST /api/referral/generate**
Generate or retrieve user's referral code
```javascript
Response: {
  referralCode: "ABC12345",
  referralLink: "https://app.com/signup?ref=ABC12345",
  stats: { total, pending, completed, rewarded, totalReward }
}
```

#### **POST /api/referral/track**
Track referral clicks/visits
```javascript
Body: {
  referralCode: "ABC12345",
  metadata: { source, ipAddress, userAgent }
}
```

#### **GET /api/referral/validate?code=ABC12345**
Validate a referral code
```javascript
Response: {
  valid: true,
  referrerName: "John Doe",
  reward: { type, amount, currency, description }
}
```

#### **GET /api/referral/list**
Get user's referral history
```javascript
Response: {
  referrals: [...],
  rewards: [...],
  stats: {...}
}
```

---

### **4. Frontend Component** (`src/components/ReferralDashboard`)

**Features:**
- ✅ Display referral code and link
- ✅ One-click copy to clipboard
- ✅ Share via WhatsApp, Email
- ✅ Stats dashboard (total, pending, completed, earned)
- ✅ Referrals list with status
- ✅ How it works section
- ✅ Responsive design

**Access:** `/referral` page

---

## 🚀 Implementation Flow

### **1. User Generates Referral Code**
```javascript
// Frontend
const response = await fetch('/api/referral/generate', { method: 'POST' });
const { referralCode, referralLink } = await response.json();
```

### **2. Share Referral Link**
User shares: `https://yourapp.com/signup?ref=ABC12345`

### **3. Track Click**
When someone clicks the link:
```javascript
await fetch('/api/referral/track', {
  method: 'POST',
  body: JSON.stringify({
    referralCode: 'ABC12345',
    metadata: { source: 'whatsapp' }
  })
});
```

### **4. Validate During Signup**
```javascript
const response = await fetch('/api/referral/validate?code=ABC12345');
const { valid, reward } = await response.json();
// Show reward message to user
```

### **5. Complete Referral**
When referee meets requirements (subscribes, verifies email, etc.):
```javascript
// In your subscription/payment handler
import Referral from '@/models/referral';

const referral = await Referral.findOne({
  referralCode: userReferralCode,
  status: 'PENDING'
});

if (referral) {
  referral.refereeId = newUser._id;
  referral.signupDate = new Date();
  referral.status = 'COMPLETED';
  await referral.save();
  
  // Apply rewards...
}
```

---

## 💰 Reward Types

### **1. Credit**
Add to user's account balance
```javascript
user.referralCredits += 5000;
await user.save();
```

### **2. Discount**
Apply to next subscription payment
```javascript
// In payment processing
const discount = user.referralCredits;
const finalAmount = subscriptionAmount - discount;
```

### **3. Free Month**
Extend subscription period
```javascript
subscription.endDate.setMonth(subscription.endDate.getMonth() + 1);
await subscription.save();
```

### **4. Cash**
Payout to bank account
```javascript
const reward = await ReferralReward.create({
  userId,
  type: 'CASH',
  amount: 5000,
  status: 'PENDING'
});
// Process via payment gateway
```

---

## 📊 Analytics & Tracking

### **Get User Stats**
```javascript
const stats = await Referral.getUserStats(userId);
// Returns: { total, pending, completed, rewarded, totalReward }
```

### **Track Conversion Rate**
```javascript
const referral = await Referral.findOne({ referralCode });
const conversionRate = (referral.refereeId ? 1 : 0) / referral.clickCount;
```

### **Leaderboard**
```javascript
const topReferrers = await Referral.aggregate([
  { $match: { status: 'REWARDED' } },
  { $group: {
    _id: '$referrerId',
    count: { $sum: 1 },
    totalReward: { $sum: '$reward.amount' }
  }},
  { $sort: { count: -1 } },
  { $limit: 10 }
]);
```

---

## 🎨 Customization

### **Change Rewards**
Edit `src/lib/referralConfig.js`:
```javascript
REFERRER_REWARD: {
  type: 'CREDIT',
  amount: 10000, // Change to ₦10,000
  currency: 'NGN'
}
```

### **Change Requirements**
```javascript
REQUIREMENTS: {
  refereeMinSpend: 20000, // Increase to ₦20,000
  refereeMinDays: 60, // Change to 60 days
  requireSubscription: false // Remove requirement
}
```

### **Custom Share Messages**
```javascript
SHARE_MESSAGES: {
  whatsapp: (code, link) => `Your custom message with ${code}`,
  email: (code, link, name) => ({ subject: '...', body: '...' })
}
```

---

## 🔗 Integration Points

### **1. Signup Page**
Add referral code input:
```javascript
'use client';
import { useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  
  // Validate code on mount
  useEffect(() => {
    if (refCode) {
      validateReferralCode(refCode);
    }
  }, [refCode]);
  
  // Show reward message if valid
}
```

### **2. User Registration**
Save referral info:
```javascript
// In your signup API
if (referralCode) {
  const referrer = await User.findOne({ referralCode });
  newUser.referredBy = referrer._id;
  newUser.referredByCode = referralCode;
}
```

### **3. Subscription Payment**
Complete referral:
```javascript
// After successful payment
if (user.referredBy) {
  await completeReferral(user.referredByCode, user._id);
  await applyReferralRewards(user);
}
```

### **4. Dashboard**
Add referral link:
```javascript
// In sidebar or top menu
<Link href="/referral">
  <Gift className="w-5 h-5" />
  Referral Program
</Link>
```

---

## 🧪 Testing Checklist

- [ ] Generate referral code
- [ ] Copy code/link to clipboard
- [ ] Share via WhatsApp (opens WhatsApp)
- [ ] Share via Email (opens email client)
- [ ] Validate referral code
- [ ] Track referral click
- [ ] Sign up with referral code
- [ ] Complete referral (meet requirements)
- [ ] Rewards are applied correctly
- [ ] Stats update in real-time
- [ ] Referrals list shows correct data

---

## 📈 Future Enhancements

1. **Tiered Rewards**: More referrals = higher rewards
2. **Social Sharing**: Twitter, Facebook integration
3. **QR Codes**: Generate QR for offline sharing
4. **Email Campaign**: Automated referral emails
5. **Leaderboard**: Public top referrers board
6. **Badges**: Achievements for milestones
7. **Referral Templates**: Pre-written messages
8. **Analytics Dashboard**: Detailed conversion tracking

---

## 🆘 Support

For questions or issues:
1. Check API responses in browser console
2. Verify database records in MongoDB
3. Review referralConfig.js settings
4. Check user permissions and authentication

---

**🎉 Referral system is ready to use!**

Access at: `/referral`
