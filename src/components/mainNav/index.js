import Link from "next/link"
import Image from "next/image"
import { MdLogout } from "react-icons/md";
import ThemeSwitch from '@/app/switch';

const MainNav=()=>{
    return(
        <nav className="fixed top-0 left-0 right-0 flex w-full h-16 sm:h-20 shadow-lg justify-between items-center z-50 bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 lg:px-12">
            <Link href="/" className="font-bold flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <Image 
                        src="/nlogo.svg" 
                        alt="MarketBook Logo" 
                        width={32} 
                        height={32}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl"
                    />
                    <span className="text-xl sm:text-2xl text-white font-bold">MarketBook</span>
                </div>
            </Link>
            <div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors text-2xl">
                        <ThemeSwitch />
                    </button>
                    <Link href="/login">
                        <button className="px-4 py-2 sm:px-6 sm:py-2.5 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
                            Login
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
export default MainNav