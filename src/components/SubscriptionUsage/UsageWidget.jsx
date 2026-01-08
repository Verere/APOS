'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Store, Package, Users, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function UsageWidget() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/subscription/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const { percentages, subscription } = usage;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertLevel = (percentage) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const resources = [
    { 
      key: 'stores', 
      label: 'Stores', 
      icon: Store, 
      data: percentages.stores 
    },
    { 
      key: 'products', 
      label: 'Products', 
      icon: Package, 
      data: percentages.products 
    },
    { 
      key: 'users', 
      label: 'Team Members', 
      icon: Users, 
      data: percentages.users 
    },
    { 
      key: 'orders', 
      label: 'Orders', 
      icon: ShoppingCart, 
      data: percentages.orders 
    }
  ];

  const hasNearLimitResource = resources.some(
    r => !r.data.unlimited && r.data.percentage >= 75
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Subscription Usage</h3>
          <p className="text-sm text-gray-600">
            {subscription.displayName} Plan
          </p>
        </div>
        <TrendingUp className="w-6 h-6 text-blue-600" />
      </div>

      {hasNearLimitResource && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900">Approaching Limit</p>
            <p className="text-yellow-700">
              Consider upgrading to avoid service interruption.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {resources.map(({ key, label, icon: Icon, data }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {data.current} / {data.unlimited ? '∞' : data.limit}
              </span>
            </div>
            
            {!data.unlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(data.percentage)}`}
                  style={{ width: `${Math.min(data.percentage, 100)}%` }}
                ></div>
              </div>
            )}

            {data.unlimited && (
              <div className="text-xs text-green-600 font-medium">
                Unlimited ∞
              </div>
            )}

            {!data.unlimited && data.percentage >= 90 && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                {data.limit - data.current} remaining
              </p>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/subscription"
        className="mt-6 block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
      >
        Upgrade Plan
      </Link>
    </div>
  );
}
