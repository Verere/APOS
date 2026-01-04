import Link from "next/link"
import { MdLogout } from "react-icons/md";

const MainNav=()=>{
    return(
        <nav className="fixed top-0 left-0 right-0 flex w-full h-16 sm:h-20 shadow-lg justify-between items-center z-50 bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 lg:px-12">
            <div className="font-bold flex items-center gap-2" >
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                    <span className="text-yellow-300 text-2xl sm:text-3xl">A</span>
                    <span className="text-2xl sm:text-3xl text-white">POS</span>
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 sm:gap-4">
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