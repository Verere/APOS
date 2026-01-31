"use client";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function CreateStoreButton({ storesCreated, storesAllowed }) {
  const router = useRouter();

  const handleClick = () => {
    if (
      typeof storesCreated === 'number' &&
      typeof storesAllowed === 'number' &&
      storesCreated >= storesAllowed
    ) {
      toast.error('Upgrade your subscription package to create more stores.');
    } else {
      router.push('/add-store');
    }
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
      onClick={handleClick}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Store
    </button>
  );
}
