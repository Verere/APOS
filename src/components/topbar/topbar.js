"use client";
import styles from "./navbar.module.css";
import { Menu, Transition, Popover } from "@headlessui/react";
import { FaBarsStaggered, FaPencil } from "react-icons/fa6";
import { FaCheckSquare, FaShoppingCart } from "react-icons/fa";
import { Fragment } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";
import { GlobalContext } from "@/context";
import { useContext, useEffect, useState, useActionState } from "react";
import { currencyFormat } from '@/utils/currency';

const TopBar = ({showNav, setShowNav, showCart, setShowCart}) => {
  const searchParams = useSearchParams()
  const {replace}= useRouter()
  const router = useRouter()
  const pathname = usePathname()
  const slug = pathname.split('/')[1]
  const [mobileOpen, setMobileOpen] = useState(false)

     const {user, setUser, cartValue, cartTotal} = useContext(GlobalContext);
     console.log('neew user', user)
const handleLogout = async ()=>{
  await signOut({ callbackUrl: '/login' });
}
  return (
    <div className={`w-full mb-1 h-16 bg-black px-3 cursor-pointer flex justify-between items-center overflow-x-visible transition-all duration-[400ms] ${showNav ? "pl-56" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="font-extrabold text-white">
          <h1 onClick={()=>{ replace(`/${slug}/pos`); setMobileOpen(false); }} className="text-lg">{`${slug}`}</h1>
        </div>
      </div>

      {/* Desktop / tablet inline nav */}
      <nav className="hidden md:flex mr-3 text-white justify-between items-center w-1/2 uppercase gap-4">
        <Link href={`/${slug}/pos`}><button className="hover:underline bg-transparent p-0 m-0 border-0">POS</button></Link>
        <Link href={`/${slug}/dashboard/orders`}><button className="hover:underline bg-transparent p-0 m-0 border-0">Orders</button></Link>
        <Link href={`/${slug}/dashboard/payments`}><button className="hover:underline bg-transparent p-0 m-0 border-0">Payments</button></Link>
        <Link href={`/${slug}/dashboard/payments`}><button className="hover:underline bg-transparent p-0 m-0 border-0">Expenses</button></Link>
        <Link href={`/${slug}/dashboard/payments`}><button className="hover:underline bg-transparent p-0 m-0 border-0">EOD</button></Link>
        <Link href={`/${slug}/dashboard`}><button className="hover:underline bg-transparent p-0 m-0 border-0">Admin</button></Link>
        <button onClick={()=>handleLogout()} className="ml-2">Logout</button>
      </nav>

      {/* Cart icon with value - only show on POS page */}
      {pathname.includes('/pos') && setShowCart && (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCart(!showCart)} 
            className="relative bg-transparent border-0 p-2 hover:bg-gray-800 rounded-md transition-colors"
          >
            <FaShoppingCart className="w-6 h-6 text-white" />
            {cartTotal > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartTotal}
              </span>
            )}
            {cartValue > 0 && (
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold whitespace-nowrap">
                {currencyFormat(cartValue)}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Current user display */}
      <div className="hidden md:flex items-center gap-3 text-white ml-4">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-semibold">{(user.name || user.email || 'U')[0].toUpperCase()}</div>
            <div className="text-sm text-white">
              <div className="font-medium">{user.name || user.email}</div>
              <div className="text-xs opacity-75">{user.role || ''}</div>
            </div>
          </div>
        ) : (
          <Link href="/login"><button className="text-white">Login</button></Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <FaBarsStaggered className="w-7 h-7 text-white cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} />
        {/* <div className="pl-2">
          <FaPencil className="w-6 h-6 text-gray-200" onClick={()=> setShowNav(!showNav)} />
        </div> */}
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-2 right-2 bg-black text-white rounded-md shadow-lg z-50 md:hidden">
          <ul className="flex flex-col p-3 gap-2">
            <li>
              <Link href={`/${slug}/pos`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">POS</button></Link>
            </li>
            <li>
              <Link href={`/${slug}/dashboard/orders`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">Orders</button></Link>
            </li>
            <li>
              <Link href={`/${slug}/dashboard/payments`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">Payments</button></Link>
            </li>
            <li>
              <Link href={`/${slug}/dashboard/payments`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">Expenses</button></Link>
            </li>
            <li>
              <Link href={`/${slug}/dashboard/payments`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">EOD</button></Link>
            </li>
            
              <li>
                <Link href={`/${slug}/dashboard`}><button onClick={() => setMobileOpen(false)} className="bg-transparent p-0 m-0 border-0 text-left w-full">Admin</button></Link>
              </li>
            
            <li>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left">Logout</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopBar;
