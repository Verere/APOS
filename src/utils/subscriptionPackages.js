// Predefined subscription packages for MarketBook

export const SUBSCRIPTION_PACKAGES = [
  {
    name: 'FREE',
    displayName: 'Free Starter',
    description: 'Perfect for trying out MarketBook',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'NGN'
    },
    features: {
      maxStores: 1,
      maxProducts: 50,
      maxUsers: 1,
      maxOrders: 100,
      storage: '500MB',
      features: [
        'Basic POS functionality',
        'Product management',
        'Sales tracking',
        'Basic reporting',
        'Email support'
      ],
      advancedFeatures: []
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    trialDays: 0
  },
  {
    name: 'BASIC',
    displayName: 'Basic',
    description: 'Great for small businesses getting started',
    price: {
      monthly: 5000,
      yearly: 50000, // 2 months free
      currency: 'NGN'
    },
    features: {
      maxStores: 1,
      maxProducts: 100,
      maxUsers: 1,
      maxOrders: 1000,
      storage: '5GB',
      features: [
        'Everything in Free',
        'Inventory management',
        'Customer management',
        'Credit sales',
        'Payment tracking',
        'Advanced reporting',
        'Email & chat support'
      ],
      advancedFeatures: [
        'Multiple payment methods',
        'Receipt customization',
        'Low stock alerts'
      ]
    },
    isActive: true,
    isPopular: false,
    sortOrder: 2,
    trialDays: 14
  },
  {
    name: 'PROFESSIONAL',
    displayName: 'Professional',
    description: 'For growing businesses that need more',
    price: {
      monthly: 10000,
      yearly: 110000, // 2 months free
      currency: 'NGN'
    },
    features: {
      maxStores: 3,
      maxProducts: 5000,
      maxUsers: 20,
      maxOrders: 10000,
      storage: '50GB',
      features: [
        'Everything in Basic',
        'Multi-store management',
        'Advanced inventory tracking',
        'Employee management',
        'Expense tracking',
        'End of day reports',
        'Priority support'
      ],
      advancedFeatures: [
        'Price adjustment permissions',
        'Credit sales control',
        'Custom user roles',
        'Export data to Excel/PDF',
        'WhatsApp invoice sharing',
        'Barcode printing'
      ]
    },
    isActive: true,
    isPopular: true,
    sortOrder: 3,
    trialDays: 30
  },
  {
    name: 'ENTERPRISE',
    displayName: 'Enterprise',
    description: 'For large businesses with advanced needs',
    price: {
      monthly: 20000,
      yearly: 220000, // 2 months free
      currency: 'NGN'
    },
    features: {
      maxStores: 10, // Unlimited
      maxProducts: 10000, // Unlimited
      maxUsers: 100, // Unlimited
      maxOrders: 1000000, // Unlimited
      storage: 'Unlimited',
      features: [
        'Everything in Professional',
        'Unlimited stores',
        'Unlimited products',
        'Unlimited users',
        'Unlimited orders',
        'Advanced analytics & insights',
        'API access',
        '24/7 dedicated support'
      ],
      advancedFeatures: [
        'Custom integrations',
        'White-label options',
        'Advanced security features',
        'Custom training sessions',
        'Dedicated account manager',
        'SLA guarantees',
        'Data migration assistance',
        'Custom development'
      ]
    },
    isActive: true,
    isPopular: false,
    sortOrder: 4,
    trialDays: 30
  }
];

// Helper function to calculate savings
export const calculateYearlySavings = (monthlyPrice) => {
  return (monthlyPrice * 12) - (monthlyPrice * 10);
};

// Helper function to check if feature is available in package
export const hasFeature = (packageName, featureName) => {
  const pkg = SUBSCRIPTION_PACKAGES.find(p => p.name === packageName);
  if (!pkg) return false;
  
  return pkg.features.features.includes(featureName) || 
         pkg.features.advancedFeatures.includes(featureName);
};

// Helper function to check if limit is reached
export const isLimitReached = (packageName, limitType, currentValue) => {
  const pkg = SUBSCRIPTION_PACKAGES.find(p => p.name === packageName);
  if (!pkg) return true;
  
  const limit = pkg.features[limitType];
  if (limit === -1) return false; // Unlimited
  
  return currentValue >= limit;
};
