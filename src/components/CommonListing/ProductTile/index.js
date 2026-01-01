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
        {/* <div  className="overflow-hidden aspect-w-1 aspect-h-1 h-52">
           <picture>
            <img
            src={item?.image}
            alt={item.menu}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-125"/>
            </picture>
        </div> */}
      
        <div  className="my-1 flex flex-col lg:flex-row lg:justify-between mditems-center">
            <h3 className="text-black truncate text-xs md:text-base lg:text-lg font-bold uppercase">{item?.name}</h3>

                <div className='flex flex-col  justify-between  md:items-end'>
                    <p className="text-xs md:text-sm font-semibold">{currencyFormat(item.price)}</p>
                   <div className="flex items-center space-x-3 space-y-2 md:space-y-0 ">
                    <p className="text-xs md:text-sm"><span className="font-medium">stock:</span> {typeof avail !== 'undefined' ? avail : item.qty}</p>
                    {(avail === 0 || typeof avail === 'undefined') && (
                      <button onClick={handleAddStock} className="py-1 px-3  bg-blue-600 text-white text-xs rounded">Add stock</button>
                    )}
                    </div>
                </div>

            </div>
        </>

    )
}