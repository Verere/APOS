// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children, session }) {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        const isSecureOrLocalhost = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
        if (process.env.NODE_ENV !== 'production' || !isSecureOrLocalhost) return

        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Ignore registration failures; the app still works online.
        })
    }, [])

    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme='system' enableSystem>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}