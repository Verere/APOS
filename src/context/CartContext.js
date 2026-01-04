"use client";

import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState([]);
  const [codeItems, setCodeItems] = useState([]);
  const [prvOrder, setPrvOrder] = useState([]);
  const [currentOrder, setCurrentOrder]= useState(true)
const [cpayment, setCPayment] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [creditSale, setCreditSale] = useState(false);
  

       
      useEffect(() => {
        setCartToState()
    }, [])

      useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart))
    }, [cart])

    const setCartToState = () => {
      setCart (
        localStorage.getItem('cart')
        ? JSON.parse(localStorage.getItem('cart')) : []
      )
    }
    
    // no local stock cache maintained here anymore

    // check full cart availability; now performed server-side. Keep function for compatibility.
    const checkCartStock = (cartObj)=>{
      return []
    }

    // no local stock to decrement; server owns stock state
      useEffect(() => {
        setOrderToState()
    }, [])

      useEffect(() => {
        localStorage.setItem('order', JSON.stringify(order))
    }, [order])

    const setOrderToState = () => {
      const json = '{"result":true, "count":42}';
      setOrder (
        localStorage.getItem('order') ? JSON.parse(json):[]
      )
    }
    
    
    const addToCart = async ({product, name, category, image, price,  qty, onSale}) => {
       // normalize cart item and include _id for UI keys
       const item = { _id: product, product, name, category, image, price, qty, amount: qty * price, onSale}

        // server will validate stock at checkout; accept item into cart

        const isItemExist = cart?.cartItems?.find(  
          (i) => i.product === item.product
        )

        let newCartItems;

        if(isItemExist){
          newCartItems =  cart?.cartItems?.map((i) =>
          i.product === isItemExist.product ? { ...i, ...item } : i)
        }else{
            newCartItems =[...(cart?.cartItems || []), item]
        }
        localStorage.setItem('cart', JSON.stringify({cartItems: newCartItems}))
        setCartToState()
        return { success: true }
   }
   
   const incr = async (cart, item) => {  
        const newData = [...cart?.cartItems?? []]
        newData.forEach(items => {
          if (String(items.product) === String(item.product)) {
            // increment by 1
            items.qty = (items.qty || 0) + 1
            items.amount= items.qty * items.price 
            // ensure _id present
            if(!items._id) items._id = items.product
          }
        })
        localStorage.setItem('cart', JSON.stringify({cartItems: newData}))
        setCartToState()
      }
       
   const decr = async (cart, item) => {        

        const newData = [...cart?.cartItems?? []]
        newData.forEach(items => {
          if (String(items.product) === String(item.product)) { 
            items.qty = (items.qty || 1) - 1
            if(items.qty < 0) items.qty = 0
            items.amount= items.qty * items.price
            if(!items._id) items._id = items.product
          }

        })
        localStorage.setItem('cart', JSON.stringify({cartItems: newData}))
        setCartToState()
   }
        
      const deleteItem = (cart, item) => {

        const newData = (cart?.cartItems || []).filter(items => String(items.product) !== String(item.product))
        localStorage.setItem('cart', JSON.stringify({cartItems: newData}))
        setCartToState()
      }

  

  return (
    <CartContext.Provider value={{
        cart,
        
        checkCartStock,
        addToCart,
        decr,
       incr,
       setCartToState,
        setCart,
        deleteItem,
        order, 
        setOrder,
        setOrderToState,
        prvOrder, setPrvOrder,
        currentOrder, setCurrentOrder,
        cpayment, setCPayment,
        codeItems, setCodeItems,
        selectedCustomer, setSelectedCustomer,
        creditSale, setCreditSale
      }}
      >        
      <div >{children}</div>
    </CartContext.Provider>
  );
};
