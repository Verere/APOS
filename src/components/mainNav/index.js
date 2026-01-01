import Link from "next/link"
import { MdLogout } from "react-icons/md";

const MainNav=()=>{
    return(
        <div className=" flex w-full h-16 shadow-md justify-around items-center z-50 bg-white py-8 sm:px-2">
            <div className="font-bold" >
                
                <span className="text-yellow-700 text-2xl">A</span>
                <span className="text-3xl">POS</span>
                </div>
            <div>
                <div className="space-x-3 sm:space-x-1">
                    {/* <Link href="/signup"><button className="py-2 px-3 focus:outline-none">register</button></Link> */}
                    <Link href="/login"><button className="py-2 px-3 focus:outline-none">Login</button></Link>
                    
                    
                </div>



            </div>
        </div>
    )
}
export default MainNav