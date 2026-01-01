"use client"
import { FaEdit } from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import { RiCustomerService2Fill } from "react-icons/ri";

const Banner =()=>{
    return(
        <div className="min-h-[550px] flex justify-center items-center py-12 sm:py-1">
            <div className="container">
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-6 items-center">
                    <div className="sm p-4 order-2">
                        <picture>
                            <img src="/cup.png" alt="food" className="max-w-[400px] h-[400px] w-full mx-auto drop-shadow-[-10px_10px_12px_rgba(0,0,0,1)] rounded-sm object-cover"/>
                        </picture>
                    </div>
                    <div className="px-8">
                        <h2 className="text-3xl sm:text-xl font-bold my-3 tracking-wide text-center sm:mt-6">Display your Menu</h2>
                        <p className="text-sm  tracking-wide leading-5 mb-6"> 
 let your customer browse full menu of your products and prices from their mobile phones
                        </p>
                        <div className="flex gap-3 items-center mb-1">
                            <FaEdit className="h-12 w-12 rounded-full shadow-sm p-4 text-4xl "/>
                            <p>Edit Prices of your Menu with Ease</p>
                        </div>
                        <div className="flex gap-3 items-center mb-1">
                            <GiCash className="h-12 w-12 rounded-full shadow-sm p-4 text-4xl "/>
                            <p>Save Money from recurring printing of paper menu</p>
                        </div>
                        <div className="flex gap-3 items-center mb-1">
                            <RiCustomerService2Fill className="h-12 w-12 rounded-full shadow-sm p-4 text-4xl"/>
                            <p>Add more items to your menu or remove in real time at your finger tip.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 
export default Banner;