"use client"
import { useContext, useEffect, useState, useRef, useActionState, useMemo, useCallback } from 'react';
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
import PrintPage from '../Print';
import TopBar from '../topbar/topbar';
import { addOrder } from '@/actions';
import InvoiceModal from './InvoiceModal';
import PosPaymentModal from './PosPaymentModal';

const PosPage = ({ slug, menus, orderRcpt, sales, getHotel, pays, customers }) => {
  const { location, setBusDate, setHotel, setStore, payment, cartValue, user } = useContext(GlobalContext);
  const { cart, order, setCart, setCPayment, setSelectedCustomer, setCreditSale } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const bDate = useMemo(() => moment().format('D/MM/YYYY'), []);
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [state] = useActionState(addOrder, {});
  const pathname = usePathname();
  const inputRef = useRef(null);

  const filteredProducts = useMemo(() => {
    if (!item) return menus;
    const searchTerm = item.toLowerCase();
    return menus.filter((menu) =>
      menu.name.toLowerCase().includes(searchTerm) || menu.barcode === item
    );
  }, [item, menus]);

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

  const handleCancel = useCallback(() => {
    localStorage.removeItem('cart');
    setCart({ cartItems: [] });
    setSelectedCustomerId('');
    setSelectedCustomer(null);
    setCreditSale(false);
    toast.success('Cart cleared');
  }, [setCart, setSelectedCustomer, setCreditSale]);

  const handleCustomerChange = useCallback((e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    const customer = customers?.find(c => c._id === customerId);
    setSelectedCustomer(customer || null);
  }, [customers, setSelectedCustomer]);

  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers?.find(c => c._id === selectedCustomerId) || null;
  }, [selectedCustomerId, customers]);

  const handleCreditSale = useCallback(async () => {
    if (!selectedCustomerId) {
      toast.error('Please select a customer for credit sale');
      return;
    }

    const items = cart?.cartItems || cart || [];
    if (!items || items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/credit-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          customerId: selectedCustomerId,
          cartItems: items,
          bDate: bDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.stockUpdates && Array.isArray(data.stockUpdates)) {
          // Update cart with current stock values
          const newCartItems = [];
          for (const ci of items) {
            const su = data.stockUpdates.find(u => String(u.product) === String(ci.product));
            if (su) {
              const newQty = Math.min(Number(ci.qty || 0), Number(su.qty || 0));
              if (newQty > 0) {
                newCartItems.push({ ...ci, qty: newQty, amount: (ci.price || 0) * newQty });
              }
            } else {
              newCartItems.push(ci);
            }
          }
          localStorage.setItem('cart', JSON.stringify({ cartItems: newCartItems }));
          setCart(JSON.parse(localStorage.getItem('cart')));
          toast.error(data.error + '. Cart updated from server stock values.');
        } else {
          toast.error(data.error || 'Failed to process credit sale');
        }
        setLoading(false);
        return;
      }

      // Success - clear cart immediately
      localStorage.removeItem('cart');
      setCart({ cartItems: [] });
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCreditSale(false);
      
      // Show success message
      toast.success('Credit sale completed successfully!');
      
      // Show invoice modal
      setInvoiceData(data);
      setShowInvoiceModal(true);
      
      setLoading(false);
    } catch (error) {
      console.error('Credit sale error:', error);
      toast.error('Failed to process credit sale');
      setLoading(false);
    }
  }, [slug, selectedCustomerId, cart, bDate, setCart, setSelectedCustomer, setCreditSale, customers]);

  const printCreditInvoice = useCallback((data) => {
    const invoiceWindow = window.open('', '_blank');
    
    if (!invoiceWindow) {
      toast.error('Please allow popups to view the invoice');
      return;
    }
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Sale Invoice - ${data.orderNum}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { font-size: 12px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { text-align: left; padding: 8px; font-size: 12px; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 14px; background-color: #f9f9f9; }
          .footer { text-align: center; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; font-size: 12px; }
          .credit-notice { background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; text-align: center; font-weight: bold; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${getHotel?.[0]?.name || 'Store Name'}</h1>
          <p>${getHotel?.[0]?.address || ''}</p>
          <p>Tel: ${getHotel?.[0]?.number || ''} | Email: ${getHotel?.[0]?.email || ''}</p>
        </div>

        <div class="credit-notice">
          CREDIT SALE INVOICE
        </div>

        <div class="section">
          <h2>Order Information</h2>
          <div class="info-row">
            <span class="info-label">Invoice #:</span>
            <span>${data.orderNum}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Served By:</span>
            <span>${data.customer?.name || 'N/A'}</span>
          </div>
        </div>

        <div class="section">
          <h2>Customer Information</h2>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span>${data.customer?.name || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>${data.customer?.phone || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span>${data.customer?.email || ''}</span>
          </div>
          ${data.customer?.address ? `
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span>${[
              data.customer.address.street,
              data.customer.address.city,
              data.customer.address.state,
              data.customer.address.zipCode
            ].filter(Boolean).join(', ')}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: right;">${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.price)}</td>
                  <td style="text-align: center;">${item.qty}</td>
                  <td style="text-align: right;">${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.amount)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
                <td style="text-align: right;">${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.totalAmount)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">AMOUNT PAID:</td>
                <td style="text-align: right;">${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(0)}</td>
              </tr>
              <tr class="total-row" style="background-color: #fff3cd;">
                <td colspan="3" style="text-align: right;">BALANCE DUE:</td>
                <td style="text-align: right; color: #ff0000;">${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 10px; font-size: 10px;">This is a computer-generated invoice</p>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
          <button class="no-print" onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
      invoiceWindow.print();
    }, 500);
  }, [getHotel]);
     
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
              <header className="px-4 py-3 border-b bg-slate-100 shrink-0">
                <div className="flex justify-between items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-blue-800 shrink-0">Sales Cart</h2>
                  
                  {/* Customer Selection - Desktop/Tablet */}
                  <div className="hidden sm:flex flex-1 max-w-xs">
                    <select
                      value={selectedCustomerId}
                      onChange={handleCustomerChange}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Walk-in Customer</option>
                      {customers?.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Close button - Mobile only */}
                  <button 
                    onClick={() => setShowCart(false)} 
                    className="lg:hidden text-3xl text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors shrink-0"
                    aria-label="Close cart"
                  >
                    ×
                  </button>
                </div>

                {/* Customer Selection - Mobile */}
                <div className="sm:hidden">
                  <select
                    value={selectedCustomerId}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Walk-in Customer</option>
                    {customers?.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
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
                  
                  <button 
                    onClick={handleCreditSale}
                    disabled={!selectedCustomerId || loading}
                    className='bg-orange-600 text-white px-3 py-2 rounded-lg uppercase hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    aria-label="Credit sale"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Credit Sale'
                    )}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setCPayment(0)
                      setShowPaymentModal(true)
                    }} 
                    className='bg-green-700 text-white px-3 py-2 rounded-lg uppercase hover:bg-green-800 transition-colors'
                    aria-label="Make payment"
                  >
                    Make Payment
                  </button>
                  
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

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoiceData={invoiceData}
          storeInfo={getHotel?.[0]}
        />

        {/* Payment Modal */}
        <PosPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cartValue={cartValue}
          cart={cart}
          order={order}
          busDate={bDate}
          location={location}
          user={user || { name: 'Cashier' }}
          store={getHotel?.[0]}
          slug={slug}
          pathname={pathname}
          customer={selectedCustomerData}
          onSuccess={() => {
            localStorage.removeItem('cart')
            setCart({ cartItems: [] })
            setSelectedCustomerId('')
            setSelectedCustomer(null)
            setCreditSale(false)
          }}
        />
      </>
    )
}
export default PosPage