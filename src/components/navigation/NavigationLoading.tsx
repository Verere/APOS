"use client";

import { MarketBookLoading } from "@/components/Loader";
import { useNavigationLoading } from "./NavigationLoadingContext";

export function NavigationLoading() {
  const { loading } = useNavigationLoading();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-7 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] ring-1 ring-blue-100/80 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/80 dark:ring-slate-700/80">
        <MarketBookLoading />
      </div>
    </div>
  );
}
