"use client";


import LoadingComponent from "@/components/Loader";
import { CartContext } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "@/context";
import moment from 'moment'

export default function ProductButton({ item, orderRcpt}) {

  const bDate = useMemo(() => moment().format('D/MM/YYYY'), []);

  const { cart, order, setOrder, currentOrder, addToCart } = useContext(CartContext);
    const {user, cartTotal}= useContext(GlobalContext)
  const pathname = usePathname();
  const router = useRouter();
  const [quantity, setQuantity] = useState(0);

  const[loading, setLoading]= useState(false)


  const [adding, setAdding] = useState(false)

  const id = item._id

  useEffect(() => {
    const getQty = () => {
      const newData = [...(cart?.cartItems ?? [])];
      newData.forEach((items) => {
        if (items?.product === id) {
          setQuantity(items?.qty);
        }
      });
    };
    getQty();
  }, [cart?.cartItems, id]);

  const handleCart = useCallback(async(item) => {
    setAdding(true)
    const res = await addToCart({ product: item._id, name: item.name, category: item.category, image: item.image, price: item.price, qty: 1, onSale: item.onSale })
    if(res && !res.success){
      toast.warn(res?.message || 'Failed to add item')
    }
    setAdding(false)
  }, [addToCart]);
 
  const handleDeletedProduct = useCallback(async function(item) {
    const res = await deleteProduct(item._id);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }, [router]);

  const isOutOfStock = useMemo(() => item.qty === 0, [item.qty]);

  return (
    <>
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <button
             onClick={() => handleCart(item)}
            disabled={adding || isOutOfStock}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
              adding || isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-400 hover:from-gray-900 hover:to-black hover:shadow-lg transform hover:scale-[1.02]'
            }`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              '+ Add to Cart'
            )}
          </button>
        </div>
    </>
  );
}
      
