
import "./globals.css";
import GlobalState from '@/context'
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from '@/context/CartContext';
import { SessionProvider } from"next-auth/react";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { Providers } from "./provider";
import { generateMetadata as genMeta } from '@/lib/seo';
 import { Analytics } from "@vercel/analytics/react"



const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

// Enhanced SEO Metadata using SEO utility
export const metadata = genMeta({
  title: 'MarketBook - Smart POS & Inventory Management Software for African Businesses',
  description: 'All-in-one POS system with automatic daily profit calculation, debt tracking with reminders, inventory management, and financial reports. Free forever plan. No credit card required. Trusted by 10,000+ businesses across Africa.',
  keywords: [
    'Point of Sale Business Management system Nigeria',
    'inventory management software',
    'point of sale system',
    'retail Point of Sale system',
    'restaurant Point of Sale system',
    'free Point of Sale software',
    'profit tracking software',
    'debt management',
    'sales tracking',
    'small business POS'
  ],
//   verification:{
//   google:'Ocaeiw6Sm2B4_VtSkDSsWl8R8YtNuaD9zSiNRBuCss8'
// }
  "google-site-verification": "google53737323db8ffce7.html"
})


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
        <head>    
        <link rel='icon' href='/nlogo.svg'/>    
      </head>
      <body  className="bg-slate-300 dark:bg-slate-900">
        <Analytics />
         <GlobalState>
        <CartProvider>
          <ToastContainer position="top-right"/>
       <main className='flex min-h-screen flex-col'>
        <Theme >
        <Providers>
        {children}
        </Providers>
        </Theme >
        </main> 
       </CartProvider>
        </GlobalState>

        </body>
    </html>
  )
}

