"use client";
import styles from "./navbar.module.css";
import { Menu, Transition, Popover } from "@headlessui/react";
import { FaBarsStaggered, FaPencil } from "react-icons/fa6";
import { FaCheckSquare } from "react-icons/fa";
import { Fragment } from "react";
import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";

const TopBar = ({showNav, setShowNav}) => {
  const searchParams = useSearchParams()
  const {replace}= useRouter()
  const router = useRouter()
  const pathname = usePathname()
  const slug = pathname.split('/')[1]

  return (
    <div className={`w-full mb-1 h-16 bg-black px-2 cursor-pointer flex justify-between items-center overflow-x-hidden transition-all duration-[400ms] ${showNav ? "pl-56" : ""}`}>
    <div className="font-extrabold  text-white ">
      <h1 onClick={()=>replace(`/${slug}/pos`)} className="text-xl" >UZ Mall</h1>
        </div>
    
     <ul className="flex mr-3 text-white justify-between items-center w-1/2 md:hidden uppercase">
      <Link href={`/${slug}/pos`}><li>POS</li></Link>
      {/* <Link href={`/${slug}/dashboard`}><li>Sales</li></Link> */}
      <Link href={`/${slug}/dashboard/payments`}><li>Payments</li></Link>
      <Link href={`/${slug}/dashboard/categories`}><li>Categories</li></Link>
      <Link href={`/${slug}/dashboard/products`}><li>Products</li></Link>
      <Link href={`/${slug}/dashboard/stock`}><li>Stock</li></Link>
      <li>Logout</li>
     </ul>
     
      <div className="pl-4 md:pl-16 hidden">
        <FaBarsStaggered className="w-8 h-8 text-gray-100 cursor-pointer" onClick={()=> setShowNav(!showNav)}/>
        </div>
  
      </div>
  );
};

export default TopBar;
