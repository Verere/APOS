'use client'

import Link from 'next/link'

export default function OfflineActions() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        onClick={handleRetry}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
      >
        Try again
      </button>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
