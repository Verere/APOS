import { useEffect, useState, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { GlobalContext } from '@/context';

const AddStore = dynamic(() => import('@/components/AddStore'), { ssr: false });

export default function AddStorePage() {
  const { user } = useContext(GlobalContext);
  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchLimitsAndUsage() {
      if (!user?._id) return;
      try {
        const [limitsRes, usageRes] = await Promise.all([
          fetch(`/api/subscription/limits?userId=${user._id}`),
          fetch(`/api/subscription/usage?userId=${user._id}`)
        ]);
        const limitsData = await limitsRes.json();
        const usageData = await usageRes.json();
        setLimits(limitsData);
        setUsage(usageData);
      } catch (e) {
        setLimits(null);
        setUsage(null);
      } finally {
        setLoading(false);
      }
    }
    fetchLimitsAndUsage();
  }, [user]);

  const handleCreateStore = (e) => {
    if (!loading && limits && usage) {
      if (usage.stores >= limits.maxStores) {
        e.preventDefault();
        toast.error('Upgrade your subscription package to create more stores.');
        return;
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        {/* Only render AddStore if allowed */}
        <AddStore />
      </div>
    </div>
  );
}
