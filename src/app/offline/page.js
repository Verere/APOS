import OfflineActions from './OfflineActions'

export const metadata = {
  title: 'Offline | MarketBook POS',
}

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">You are offline</h1>
        <p className="text-sm text-slate-600 mb-4">
          MarketBook POS is running with limited connectivity. Local-first sales remain available and queued transactions will sync automatically when internet access is restored.
        </p>
        <p className="text-xs text-slate-500">
          Reconnect to continue server-backed actions like wallet validation and account updates.
        </p>
        <OfflineActions />
      </div>
    </main>
  )
}
