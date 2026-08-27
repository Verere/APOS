// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { toast } from 'react-toastify'

const CHUNK_RELOAD_GUARD_KEY = '__marketbook_chunk_reload_once__'

function isChunkLoadFailureMessage(message) {
    if (!message) return false
    const normalized = String(message).toLowerCase()
    return (
        normalized.includes('chunkloaderror') ||
        normalized.includes('loading chunk') ||
        normalized.includes('failed to fetch dynamically imported module')
    )
}

export function Providers({ children, session }) {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        const isSecureOrLocalhost = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
        if (process.env.NODE_ENV !== 'production' || !isSecureOrLocalhost) return

        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Ignore registration failures; the app still works online.
        })
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const attemptChunkRecovery = () => {
            try {
                const hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) === '1'
                if (!hasReloaded) {
                    sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, '1')
                    window.location.reload()
                    return
                }
            } catch (_) {
                window.location.reload()
                return
            }

            toast.error('A new version is available. Please refresh this page.')
        }

        const onError = (event) => {
            const message = event?.message || event?.error?.message
            if (isChunkLoadFailureMessage(message)) {
                attemptChunkRecovery()
            }
        }

        const onUnhandledRejection = (event) => {
            const reason = event?.reason
            const message = reason?.message || String(reason || '')
            if (isChunkLoadFailureMessage(message)) {
                attemptChunkRecovery()
            }
        }

        window.addEventListener('error', onError)
        window.addEventListener('unhandledrejection', onUnhandledRejection)

        return () => {
            window.removeEventListener('error', onError)
            window.removeEventListener('unhandledrejection', onUnhandledRejection)
        }
    }, [])

    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme='system' enableSystem>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}