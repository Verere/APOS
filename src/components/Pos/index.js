"use client"
import { useContext, useEffect, useState, useRef, useActionState } from 'react';
import { ScrollArea, Box, Heading } from '@radix-ui/themes';
import { toast } from 'react-toastify';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import moment from 'moment';
import { MdSearch } from 'react-icons/md';
import { CartContext } from '@/context/CartContext';
import { GlobalContext } from '@/context';
import { Cart } from '../CartItem/Cart';
import { CartTotal } from '../CartItem/CartTotal';
import CommonListing from '../CommonListing';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PaymentPage from '../Payment';
import PrintPage from '../Print';
import TopBar from '../topbar/topbar';
import { addOrder } from '@/actions';

const PosPage = ({ slug, menus, orderRcpt, sales, getHotel, pays }) => {
  const { location, setBusDate, setHotel, setStore, payment } = useContext(GlobalContext);
  const { order, setCart, setCPayment } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState('');
  const [showCart, setShowCart] = useState(false);
  
  const date = moment();
  const bDate = date.format('D/MM/YYYY');
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [state] = useActionState(addOrder, {});
  const pathname = usePathname();
  const inputRef = useRef(null);

  const filteredProducts = item
    ? menus.filter((menu) =>
        menu.name.toLowerCase().includes(item) || menu.barcode === item
      )
    : menus;

  useEffect(() => {
    setBusDate(bDate);
    setHotel(getHotel);
    if (getHotel && getHotel.length > 0) {
      setStore(getHotel[0]);
      localStorage.setItem('store', JSON.stringify(getHotel[0]));
    }
  }, [getHotel, bDate, setBusDate, setHotel, setStore]);

  useEffect(() => {
    if (state.success) {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCancel = () => {
    localStorage.removeItem('cart');
    setCart({ cartItems: [] });
    toast.success('Cart cleared');
  };
     
  const handleSearch = useDebouncedCallback((e) => {
    const value = e.target.value;
    if (value && value.length > 2) {
      setItem(value);
    } else if (value === '') {
      setItem('');
    }
  }, 300);

    return(
      <>
        {/* Main Container */}
        <div className='min-h-screen w-full bg-gray-50'>
          {/* Top Navigation Bar - Pass cart state */}
          <TopBar 
            slug={slug} 
            showCart={showCart} 
            setShowCart={setShowCart}
          />

          {/* Backdrop - Mobile only, semi-transparent overlay */}
          <div 
            className={`
              lg:hidden fixed inset-0 top-16 bg-black z-30 
              transition-opacity duration-300 ease-in-out
              ${showCart ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
            onClick={() => setShowCart(false)}
            aria-hidden="true"
          />

          {/* Main Layout - Responsive Flex Container */}
          <div className="flex flex-row w-full min-h-[calc(100vh-4rem)]">
            
            {/* ==================== CART COMPONENT ==================== */}
            <aside 
              className={`
                fixed lg:static
                top-16 lg:top-0
                left-0
                h-[calc(100vh-4rem)] lg:h-auto
                w-full max-w-md lg:w-1/2 lg:max-w-none
                z-40 lg:z-0
                bg-white border-r
                shadow-2xl lg:shadow-none
                flex flex-col
                transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${showCart ? 'translate-x-0' : '-translate-x-full'}
              `}
              role="complementary"
              aria-label="Shopping Cart"
              aria-hidden={!showCart}
            >
              {/* Cart Header */}
              <header className="flex justify-between items-center px-4 py-3 border-b bg-slate-100 shrink-0">
                <h2 className="text-xl font-semibold text-blue-800">Sales Cart</h2>
                {/* Close button - Mobile only */}
                <button 
                  onClick={() => setShowCart(false)} 
                  className="lg:hidden text-3xl text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Close cart"
                >
                  ×
                </button>
              </header>
              
              {/* Cart Items Scroll Area */}
              <div className="flex-1 overflow-auto">
                <ScrollArea type="always" scrollbars="vertical" className="h-full">
                  <Cart />
                </ScrollArea>
              </div>
              
              {/* Cart Total */}
              <div className="border-t bg-white shrink-0">
                <CartTotal pays={pays} />
              </div>
              
              {/* Cart Actions */}
              <div className='bg-blue-100/50 w-full border-t shrink-0'>          
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap p-3 gap-2 justify-between items-center text-xs sm:text-sm font-bold">
                  <button 
                    onClick={handleCancel} 
                    className='bg-red-700 text-white px-3 py-2 rounded-lg uppercase hover:bg-red-800 transition-colors'
                    aria-label="Clear cart"
                  >
                    Clear Cart
                  </button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        onClick={() => setCPayment(0)} 
                        className='bg-green-700 text-white px-3 py-2 rounded-lg uppercase hover:bg-green-800 transition-colors'
                        aria-label="Make payment"
                      >
                        Make Payment
                      </button>   
                    </PopoverTrigger>
                    <PopoverContent> 
                      <PaymentPage 
                        slug={slug} 
                        order={order} 
                        pays={pays} 
                        location={location} 
                        busDate={bDate} 
                        pathname={pathname}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className='bg-black text-white px-3 py-2 rounded-lg uppercase hover:bg-gray-800 transition-colors'
                        aria-label="View receipt"
                      >
                        Receipt
                      </button>
                    </PopoverTrigger>
                    <PopoverContent> 
                      <PrintPage cart={sales} payment={payment} />
                    </PopoverContent>
                  </Popover>
                </div> 
              </div>
            </aside>

            {/* ==================== MENU PANEL ==================== */}
            <main className="w-full lg:w-1/2 bg-white flex flex-col">
              {/* Search Bar */}
              <div className='flex justify-between items-center p-3 border-b bg-slate-200 sticky top-0 z-10 shrink-0'>
                <div className="flex items-center border border-gray-400 w-full md:w-3/4 xl:w-2/3 rounded-lg p-2 mx-auto bg-white shadow-sm">
                  <MdSearch className="text-gray-500 text-2xl flex-shrink-0" />
                  <input 
                    type="text" 
                    ref={inputRef} 
                    placeholder="Search Item or scan barcode"
                    name="code" 
                    onChange={handleSearch}   
                    className="w-full outline-none focus:ring-0 bg-transparent px-2 text-base"
                    aria-label="Search products"
                  />     
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className='flex-1 overflow-auto'>
                <Box p="3" className="h-full">
                  <Heading size="4" mb="3" trim="start" align="center" className="text-lg font-semibold text-gray-800">
                    Select Item
                  </Heading>
                  <ScrollArea type="always" scrollbars="vertical" className="h-full"> 
                    <CommonListing data={filteredProducts} orderRcpt={orderRcpt} />
                  </ScrollArea>
                </Box> 
              </div>
            </main>

          </div>
        </div>
      </>
    )
}
export default PosPage