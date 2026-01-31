import dynamic from 'next/dynamic';

const AddStore = dynamic(() => import('@/components/AddStore'), { ssr: false });

export default function AddStorePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <AddStore />
      </div>
    </div>
  );
}
