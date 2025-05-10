
'use client';
import Link from "next/link";

const imageLists=[
    {
        id:0,
        img:"/qr1.webp",
        title:"Display Pictures of your Menu",
        description: "Lorem is a very good tools to be using ofor didk"
    },
    {
        id:1,
        img:"/qr2.webp",
        title:"Increase Sales by 70%",
        description: "Lorem is a very good tools to be using ofor didk"
    },
    {
        id:2,
        img:"/qrweb.webp",
        title:"Edit Prices with ease",
        description: "Lorem is a very good tools to be using ofor didk"
    },
]
const Hero =()=>{

   
    return(
        <>
         <div className="pt-[120px] bg-black -z-10">
        <div className="relative overflow-hidden min-h-[350px] sm:min-h-[550px] flex justify-center items-center duration-200">
         <div className="flex justify-between items-center">
           <div className="rotate-45 absolute  rounded-xl -top-1/2 w-[400px] left-0 bg-yellow-700/40  ">
            <picture><img src="/qr.png" alt="photo" className="w-[200px] h-[200px]"/></picture> 
           </div>
           <div className="text-center">
            <p className="font-bold text-5xl sm:text-2xl tracking-wide mb-2 capitalize">Make Sales with Ease</p>
            <p className="text-lg sm:text-sm font-bold tracking-wider mb-5 sm:p-4">...let customers order from you with your <span className="text-yellow-700">Qr </span>link</p>
           <Link href="/signup"><button className="btn">Get Started</button></Link>
           </div>
           </div>
          
            </div>
            </div>
         
      
            </>
    )
}
export default Hero