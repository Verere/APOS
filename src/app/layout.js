
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
// import { Analytics } from "@vercel/analytics/react"



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: 'ABMS',
  },
 
  applicationName: 'ABMS',
  referrer: 'origin-when-cross-origin',
  authors:[
    {name: 'Averit Technology Limited', url:"https://apos-one.vercel.app/"}
  ],
  formatDetection:{
    email: false,
    address: false,
    telephone: false,
  },



}


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
        <head>    
        <link rel='icon' href='/logo.svg'/>    
      </head>
      <body  className="bg-slate-300 dark:bg-slate-900">

         {/* <SessionProvider > */}

         <GlobalState>
        <CartProvider>
          <ToastContainer position="top-right"/>
       <main className='flex min-h-screen flex-col'>
        <Theme >
        {/* <Providers> */}
        {children}
        {/* <Analytics /> */}
        {/* </Providers> */}
        </Theme >
        </main> 
       </CartProvider>
        </GlobalState>
         {/* </SessionProvider> */}
        </body>
    </html>
  )
}

