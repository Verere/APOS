

"use client";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext(null);

export default function GlobalState({ children }) {
  const [showNavModal, setShowNavModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [componentLoader, setComponentLoader] = useState({
    loading: false,
    id: "",
  });
  const [pageLevelLoader, setPageLevelLoader] = useState(true);
  const [componentLevelLoader, setComponentLevelLoader] = useState({
    loading: false,
    id: "",
  });
  const [isAuthUser, setIsAuthUser] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [hotel, setHotel] = useState([]);
  const [CanOrders, setCanOrders] = useState([]);
  const [compOrders, setCompOrders] = useState([]);
  const [suspOrders, setSuspOrders] = useState([]);
  const [cCanOrders, setCCanOrders] = useState(null);
  const [cCompOrders, setCCompOrders] = useState(null);
  const [cSuspOrders, setCSuspOrders] = useState(null);
  const [currentUpdatedProduct, setCurrentUpdatedProduct] = useState(null);
  const [busDate, setBusDate] = useState("");
  const [guest, setGuest] = useState([]);
  const [location, setLocation] = useState(null)
  const [payment, setPayment] = useState(0)
const [bal, setBal] = useState(0)
const [slug, setSlug] = useState(null)
const [store, setStore] = useState([]);
  const [addressFormData, setAddressFormData] = useState([
    {
      fullName: "",
      address: "",
      city: "",
      state: "",
    },
  ]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  
  const [allOrdersForUser, setAllOrdersForUser] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [allOrdersForAllUsers, setAllOrdersForAllUsers] = useState([]);

  const pathname = usePathname();
  useEffect(() => {
    if(location !==null)  localStorage.setItem('location', JSON.stringify(location))
}, [location])
  useEffect(() => {
    if(busDate !==null)  localStorage.setItem('bDate', JSON.stringify(busDate))
},[busDate])


useEffect(() => {
 
  setLocationToState()
})


const setLocationToState = () => {
  setLocation (
    localStorage.getItem('location')
    ? JSON.parse(localStorage.getItem('location')) : null
  )
}


  useEffect(() => {
      const localUser = JSON.parse(localStorage.getItem("user")) || {};
      setUser(localUser);
   
  },[]);



  return (
    <GlobalContext.Provider
      value={{
        showNavModal,
        setShowNavModal,
        isAuthUser,
        setIsAuthUser,
        user,
        setUser,
        pageLoader,
        setPageLoader,
        componentLoader,
        setComponentLoader,
        isAdminView,
        setIsAdminView,
        isAdmin,
        setIsAdmin,
        files,
        setFiles,
        showLoading,
        setShowLoading,
        currentUpdatedProduct,
        setCurrentUpdatedProduct,       
        addressFormData,
        setAddressFormData,
        cartTotal,
        setCartTotal,
        cartValue,
        setCartValue,
        guest, setGuest,
        pageLevelLoader,
        setPageLevelLoader,
        componentLevelLoader,
        setComponentLevelLoader,
        allOrdersForUser,
        setAllOrdersForUser,
        orderDetails,
        setOrderDetails,
        setOrderDetails,
        allOrdersForAllUsers,
        setAllOrdersForAllUsers,
        location, setLocation,
        setLocationToState,
        busDate, setBusDate,
      CanOrders, setCanOrders,
       compOrders, setCompOrders,
        suspOrders, setSuspOrders,
      cCanOrders, setCCanOrders,
      cCompOrders, setCCompOrders,
       cSuspOrders, setCSuspOrders,
       hotel, setHotel,
       payment, setPayment,
       bal, setBal,
       slug, setSlug,         
       store, 
       setStore
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
