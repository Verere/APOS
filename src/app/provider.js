// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children, session }) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme='system' enableSystem>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}