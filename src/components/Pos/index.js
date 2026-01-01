"use client"
import { CartContext } from '@/context/CartContext';
import { GlobalContext } from '@/context';
 import { Flex, Text, Button, ScrollArea, Box, Heading, Grid, Select, Avatar, TextField } from '@radix-ui/themes';
import { useContext, useEffect, useState, useRef, useActionState } from 'react';
import { Cart } from '../CartItem/Cart';
import { CartTotal } from '../CartItem/CartTotal';
import CatLists from '../CategoryList';
import CommonListing from '../CommonListing';
import {  fetchMenuCategory, fetchOneOrder, fetchCodeProduct,
   fetchPaymentByOrder, fetchSalesByOrderId, fetchSuspendedOrders } from '@/actions/fetch';
import { addOrder , addBdate, addPayment} from '@/actions';
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
 import {    Popover,    PopoverContent,    PopoverTrigger,  } from "@/components/ui/popover"
 
 import { updateSuspendOrder } from '@/actions/update';
 import PaymentPage from '../Payment';
 import PrintPage from '../Print';
import MainNav from '../mainNav';
import TopBar from '../topbar/topbar';
import moment from 'moment'
import { MdSearch } from 'react-icons/md';
import { useDebouncedCallback } from 'use-debounce';
import CodeItem from '../CodeItem';

const PosPage=({slug, menus, orderRcpt, sales, orders, getHotel, pays, categories})=>{
    const {busDate, location, setBusDate, user,  CanOrders, setCanOrders,
        compOrders, setCompOrders,
         suspOrders, setSuspOrders,
       cCanOrders, setCCanOrders,
       cCompOrders, setCCompOrders,
        cSuspOrders, setCSuspOrders, cartTotal, cartValue, setHotel, setCPayment,total, payment, setPayment, setBal} = useContext(GlobalContext)
    const { prvOrder, setPrvOrder, order, setOrder,currentOrder, setCurrentOrder, cpayment,  codeItems, setCodeItems
      } = useContext(CartContext)
    const [orderName, setOrderName]= useState("")
    const [loading, setLoading]= useState(false)
     const [code, setCode]=useState('')
     const [item, setItem]=useState('')
    const [showCart, setShowCart] = useState(false)

    var date = moment();
const bDate = date.format('D/MM/YYYY')
    const searchParams = useSearchParams()
  const {replace}= useRouter()
  const router = useRouter()
    const [state, formAction, isPending] = useActionState(addOrder, {});
    const pathname = usePathname();
  const inputRef = useRef(null);

  const filteredProducts = item
          ? menus.filter((menu) =>
        menu.name.toLowerCase().includes(item) 
        || menu.barcode === item
  
          )    
          : menus;
 
//     useEffect(()=>{
//       const fetchOrders = async()=>{
//         let tempOrders= [...orders]      
//         let counter = 0;
// for (const obj of tempOrders) {
//    counter++;
// }
// await   setCCanOrders(counter)
//         const cSusOrders = tempOrders.filter(order=>order?.status==='Suspended')
//         let countSusOrder= 0
//         for(const obj of cSusOrders)countSusOrder++
//        await   setCSuspOrders(countSusOrder)
//         await    setSuspOrders(countSusOrder)

//         const cCComp = tempOrders.filter(order=>order?.status==='Completed')
//        let countCompOrder= 0
//         for(const obj of cCComp)countCompOrder++
//         await   setCCompOrders(countCompOrder)
     
//       }
//       fetchOrders()
//     })

      const fetchOrders = async()=>{
        let tempOrders= [...orders]      
        let counter = 0;
for (const obj of tempOrders) {
   counter++;
}
    
     

       }
    


  useEffect(()=>{
    const getNewOrderToState=async()=>{
     
      await  setBusDate(bDate)
      await setHotel(getHotel)
    }
    getNewOrderToState()
  })
  const handleSetOrder= async()=>{
    console.log("pay", payment)
    if(payment && payment >= 0){
      await setLoading(true)
      removeO()
      await setCurrentOrder(true)
    }else{
      toast.warn('You have not made any Payment for this order')
      
    }
  }
  
  const removeO = async()=>{
    const params = new URLSearchParams(searchParams)
    params.delete("o")
 params.delete("q");
    replace(`${pathname}?${params}`)
    
}
     
     useEffect(()=>{
         const getError = async()=>{
     
           if(state.success){
           await setLoading(false)
           }
         }
         getError()
       },[state])   



    useEffect(() => {
      const submitForm = async()=>{
        inputRef.current.focus();


      }
      submitForm()
    }, []);
  
     
        const handleSearch = useDebouncedCallback((e) => {
          // setCode("");
              // e.preventDefault()
       console.log(e.target.value, "val")
           if (e.target.value) {

             e.target.value.length > 2 && setItem(e.target.value)
           } else {
             e.target.value === "" 
            setItem("");
           }
   
         }, 300);

    return(
      <>
       
    
        <div className='min-h-screen w-screen overflow-x-hidden'>
          <TopBar slug={slug}/>
    {/* cart and menu - mobile-first: stack (column), desktop: row at lg */}
    <div className="flex flex-col lg:flex-row w-full pos-container">
      {/* Mobile toggles: hidden on lg+ (fallback classes) */}
      <div className="flex justify-end p-2 hide-on-lg">
        <button onClick={()=>setShowCart(!showCart)} className="bg-blue-600 text-white px-3 py-1 rounded-md show-on-mobile">
          {showCart ? 'Hide Cart' : 'Show Cart'}
        </button>
      </div>
            {/* cart panel */}
        <div className={`order-1 lg:order-1 w-full lg:w-1/2 flex-col border shadow-sm mx-auto justify-between items-start mt-2 lg:mt-0 panel-half ${showCart ? 'pos-show' : 'pos-hide'}`}>
            <div className='w-full '>
              <div className="w-full flex justify-between align-center mx-auto px-4 border-b-black mb-2 bg-slate-100">
              {/* <h2 className="flex justify-between text-xl font-semibold w-full "><span className='text-blue-800'>Sales Cart</span>  <span>Receipt No.: <span>{currentOrder? orderRcpt[0]?.orderNum: order?.orderNum}</span></span></h2> */}
          
              </div>
            <ScrollArea type="always" scrollbars="vertical" style={{ height: 'min(40vh, 500px)' }}>
            {/* <Cart cart={sales} /> */}
            <Cart  />
            </ScrollArea>
            <CartTotal   pays={pays}/>
            </div> 
           
            <div className='bg-blue-100/50 w-full'>          
           <div className="flex  flex-wrap p-2 gap-2 justify-between align-centre uppercase text-sm font-bold">
     
          
        <form action={formAction}>
       
                            <input type="hidden" name="slug" value={slug} />
                            {/* <input type="hidden" name="payment" value={payment} /> */}
                            <input type="hidden" name="amount" value={cartValue} />
                            <input type="hidden" name="orderName" value={orderName} />
                            {/* soldBy supplied by server session; removed client-supplied hidden input */}
                            <input type="hidden" name="bDate" value={bDate} />
                            {/* <input type="hidden" name="orderId" value={orderRcpt[0]?._id} />
                            <input type="hidden" name="order" value={orderRcpt[0]?.status} /> */}
                            <input type="hidden" name="path" value={pathname} />
                            <button onClick={()=>handleSetOrder()} className='bg-blue-700 text-white px-2  py-1 rounded-lg uppercase'>
                         {loading ? "Creating New Order..." : " New order"} 
                            </button>
                          </form>
        
        <button onClick={()=>handleCancel(orderRcpt[0]?._id)} className='bg-red-700 text-white px-2  py-1 rounded-lg uppercase' >
            cancel 
        </button>
        <Popover>
          <PopoverTrigger>
        <a onClick={()=>setCPayment(0)} className='bg-green-700 text-white px-2  py-1 rounded-lg uppercase' >
        Payment
        </a>   

          </PopoverTrigger>
          <PopoverContent> 
          <PaymentPage slug={slug} order={order} pays={pays} location={location} busDate={bDate} pathname={pathname}/>
                    </PopoverContent>
        </Popover>
       
              

        <Popover>
          <PopoverTrigger>
          <a className='bg-black text-white px-2  py-1 rounded-lg uppercase'>Receipt</a>


          </PopoverTrigger>
          <PopoverContent> 
          <PrintPage cart={sales} payment={payment}/>
              </PopoverContent>
        </Popover>
        </div> 
   </div>
     </div>
    {/* menu and cat panel */}
    <div className="order-1 lg:order-2 w-full lg:w-1/2 flex-col panel-half">
    <div className='flex justify-between items-center p-2 border bg-slate-200 w-full mx-auto'>

      <div className="flex items-center border border-gray-400 w-full md:w-2/3 rounded-lg p-2 mx-auto ">
      <MdSearch />
      <input type="text" ref={inputRef} placeholder="Search Item or scan barcode" name="code" onChange={(e)=>handleSearch(e)}   className="w-full outline-none focus:border-none "/>     
    </div>
  
        </div>

    <div className='w-full mx-auto'>
      <Box p="2" >
            <Heading size="4" mb="2" trim="start" align="center">
          Select Item
            </Heading>
    <ScrollArea type="always" scrollbars="vertical" style={{ height: 'min(55vh, 700px)' }}> 

  <CommonListing data={filteredProducts} orderRcpt={orderRcpt} />

    </ScrollArea>
    </Box> 
    </div>

    </div>

</div>
</div>
      </>

    )
}
export default PosPage