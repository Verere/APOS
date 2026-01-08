'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  MessageCircle, 
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReferralDashboard() {
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Generate or get referral code
      const codeResponse = await fetch('/api/referral/generate', {
        method: 'POST'
      });
      const codeData = await codeResponse.json();
      
      if (codeData.success) {
        setReferralData(codeData);
        
        // Fetch referrals list
        const listResponse = await fetch('/api/referral/list');
        const listData = await listResponse.json();
        
        if (listData.success) {
          setReferrals(listData.referrals);
        }
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${type === 'code' ? 'Code' : 'Link'} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareViaWhatsApp = () => {
    if (!referralData) return;
    const message = `🎉 Join me on MarketBook! Get ₦${referralData.config.refereeReward.amount.toLocaleString()} off your first subscription.\n\nUse my referral code: *${referralData.referralCode}*\n\nSign up here: ${referralData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!referralData) return;
    const subject = 'Join me on MarketBook!';
    const body = `Hi there!\n\nI think you'd love MarketBook - the modern point of sale system.\n\nSign up using my referral code ${referralData.referralCode} and get ₦${referralData.config.refereeReward.amount.toLocaleString()} off your first subscription!\n\n${referralData.referralLink}\n\nBest regards`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load referral data</p>
        </div>
      </div>
    );
  }

  const stats = referralData.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-semibold">
          <Gift className="w-4 h-4" />
          Referral Program
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Earn Rewards by Referring Friends
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Share MarketBook with your network and earn ₦{referralData.config.referrerReward.amount.toLocaleString()} for each successful referral!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rewarded}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₦{stats.totalReward.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Earned</p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Referral Link</h2>
          <p className="text-gray-600">Share this link with friends to start earning</p>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Referral Code
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralData.referralCode}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-lg font-bold text-center"
            />
            <button
              onClick={() => copyToClipboard(referralData.referralCode, 'code')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Referral Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralData.referralLink}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={() => copyToClipboard(referralData.referralLink, 'link')}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={shareViaWhatsApp}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Share on WhatsApp
          </button>
          <button
            onClick={shareViaEmail}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
          >
            <Mail className="w-5 h-5" />
            Share via Email
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">1. Share Your Link</h3>
            <p className="text-gray-600">Send your unique referral link to friends and colleagues</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">2. They Sign Up</h3>
            <p className="text-gray-600">Your friend creates an account using your referral code</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">3. Earn Rewards</h3>
            <p className="text-gray-600">You both get rewarded when they subscribe!</p>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Referee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reward</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        referral.status === 'REWARDED' ? 'bg-green-100 text-green-800' :
                        referral.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {referral.referee ? (
                        <div>
                          <p className="font-medium text-gray-900">{referral.referee.name}</p>
                          <p className="text-sm text-gray-500">{referral.referee.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not joined yet</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {referral.reward?.currency} {referral.reward?.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
