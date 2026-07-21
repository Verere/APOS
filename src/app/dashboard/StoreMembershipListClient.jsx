"use client";
import StoreMembershipCardClient from "./StoreMembershipCardClient";

export default function StoreMembershipListClient({ memberships, isCashierOnly }) {
  return (
    <ul className="space-y-3">
      {memberships.map((m) => (
        <li key={String(m.storeId)}>
          <StoreMembershipCardClient
            href={isCashierOnly ? `/${m.slug}/pos` : `/${m.slug}/dashboard`}
            slug={m.slug}
            storeId={m.storeId}
            role={m.role}
            isCashierOnly={isCashierOnly}
            userName={m.userName}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {m.slug}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isCashierOnly ? 'Click to open POS' : `Store ID: ${String(m?.storeId)}`}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">click to join store</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {m.role}
                </span>
                <svg 
                  className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </StoreMembershipCardClient>
        </li>
      ))}
    </ul>
  );
}
