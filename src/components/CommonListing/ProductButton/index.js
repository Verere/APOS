"use client";

import LoadingComponent from "@/components/Loader";
import { CartContext } from "@/context/CartContext";
import { addSales, } from "@/actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { fetchLatestStockItem } from "@/actions/fetch";
import { GlobalContext } from "@/context";
import moment from 'moment'

export default function ProductButton({ item}) {

  var date = moment()
  const bDate = date.format('D/MM/YYYY')

     const { cart,  order, setOrder,  currentOrder,  codeItems, setCodeItems} =
            useContext(CartContext);
    const {user, cartTotal}= useContext(GlobalContext)
  const pathname = usePathname();
  const router = useRouter();
  const [quantity, setQuantity] = useState(0);

  const [state, formAction, isPending] = useActionState(addSales, {});
  const[loading, setLoading]= useState(false)

  useEffect(()=>{
    const getItem = async()=>{
        if(codeItems && codeItems.length){
      datas = codeItems
        }else{datas=data}

    }
    getItem()
},[codeItems])

  useEffect(()=>{
    const getError = async()=>{

      if(state.error){
      await  toast.warn(state.error)
      await setLoading(false)
      }
      if(state.success){
    
      await setLoading(false)
      }
    }
    getError()
  },[state])

 

const id = item._id

// const getQty = () => {
//   const newData = [...(cart?.cartItems ?? [])];
//   newData.forEach((items) => {
//     if (items?.product === item._id) {
//       setQuantity(items?.qty);
//     }
//   });
// };

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
  await  setLoading(true)
  // const stock = await fetchLatestStockItem(item._id)

  // if(order[0].status !== "newOrder")toast.warn("Create new Order")
  };
 
 
  async function handleDeletedProduct(item) {
    // setComponentLoader({ loading: true, id: item._id });
    const res = await deleteProduct(item._id);
    if (res.success) {
      toast.success(res.message);
      // setComponentLoader({ loading: false, id: "" });
      router.refresh();
    } else {
      toast.error(res.message);
      // setComponentLoader({ loading: false, id: "" });
    }
  }

  return (

    <>
    
        <div>
          <form action={formAction}>  
          <input type="hidden" name="slug" value={order?.slug} />
                    <input type="hidden" name="order" value={order?._id} />
                    <input type="hidden" name="orderNum" value={order?.orderNum} />
                    <input type="hidden" name="itemId" value={item._id} />
                    <input type="hidden" name="item" value={item.name} />
                    <input type="hidden" name="barcode" value={item.barcode} />
                    <input type="hidden" name="stock" value={item.qty} />
                    <input type="hidden" name="qty" value="1" />
                    <input type="hidden" name="price" value={item.price}/>
                    <input type="hidden" name="amount" value={item.price}/>
                    <input type="hidden" name="bDate" value={bDate}/>
                    <input type="hidden" name="status" value={order?.status}/>
                    <input type="hidden" name="soldBy" value={user?.name} />
                    <input type="hidden" name="path" value={pathname} />
                    <input type="hidden" name="totalOrder" value={cartTotal} />
          <button
             onClick={() => handleCart(item)}
            style={{
              backgroundColor: "rgb(60, 58, 58)",
              color: "goldenRod",
              minWidth: "94%",
              margin: "4px",
              padding: ".5rem 1rem",
              border: "none",
              borderRadius: "50px",
              fontSize: "1rem",
            }}
          >
          {loading ? "Adding Item..." : "Add to Cart"}
          </button>
          </form>
        </div>

    </>
  );
}
