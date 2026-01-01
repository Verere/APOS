"use client";


import LoadingComponent from "@/components/Loader";
import { CartContext } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "@/context";
import moment from 'moment'

export default function ProductButton({ item, orderRcpt}) {

  var date = moment()
  const bDate = date.format('D/MM/YYYY')

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

  const handleCart = async(item) => {
    setAdding(true)
    const res = await addToCart({ product: item._id, name: item.name, category: item.category, image: item.image, price: item.price, qty: 1, onSale: item.onSale })
    if(res && res.success){
      toast.success('Item added to cart')
    }else{
      toast.warn(res?.message || 'Failed to add item')
    }
    setAdding(false)
  };
 
  async function handleDeletedProduct(item) {
    const res = await deleteProduct(item._id);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <>
        <div>
          <button
             onClick={() => handleCart(item)}
            disabled={adding}
            className={`w-full mt-2 md:px-4 truncate p-2 rounded-full text-xs md:text-base ${adding ? 'opacity-60' : ''}`}
            style={{backgroundColor: 'rgb(60,58,58)', color: 'goldenrod'}}
          >
          {adding ? "Adding Item..." : "Add to Cart"}
          </button>
        </div>
    </>
  );
}
      
