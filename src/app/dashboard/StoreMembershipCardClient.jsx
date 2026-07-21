"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreMembershipCardClient({
  href,
  slug,
  storeId,
  role,
  isCashierOnly,
  userName,
  children,
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    setLoading(true);
    // Small delay for UX, then navigate
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  return (
    <div className="relative">
      <a
        href={href}
        onClick={handleClick}
        className="block group"
        tabIndex={0}
        aria-disabled={loading}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 p-4 sm:p-5 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          {userName ? (
            <div className="mb-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              User: <span className="font-semibold text-gray-800 dark:text-gray-100">{userName}</span>
            </div>
          ) : null}
          {children}
        </div>
      </a>
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-xl">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}
