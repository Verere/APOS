"use client"
import { useRouter } from 'next/navigation';
import { currencyFormat } from './../../../utils/currency';
import { useContext } from 'react';
import { CartContext } from '@/context/CartContext';
import { toast } from 'react-toastify';


export default function ProductTile({item}){  
   
    const router = useRouter()
    const { } = useContext(CartContext)
    const avail = item.qty

    const handleAddStock = () => {
      toast.info('Use the stock management page to update product stock.')
    }

    return(
        <>
        {/* Product Info */}
        <div className="p-3 sm:p-4 flex flex-col gap-2">
            {/* Stock Badge */}
            <div className="mb-2">
             {avail > 0 ? (
               <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                 {avail} in stock
               </span>
             ) : (
               <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                 Out of stock
               </span>
             )}
           </div>
            <h3 className="text-gray-900 text-sm sm:text-base font-bold line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-blue-600 transition-colors">
              {item?.name}
            </h3>

            <div className='flex items-center justify-between'>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {currencyFormat(item.price)}
                </p>
                {avail === 0 && (
                  <button 
                    onClick={handleAddStock} 
                    className="py-1 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                  >
                    Add stock
                  </button>
                )}
            </div>
        </div>
        </>

    )
}