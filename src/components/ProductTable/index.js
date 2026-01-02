

"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateProd, updateProdPrice } from "@/actions";
import { fetchOrderItems, fetchProductById, fetchSearchedProducts, updateOrderDate } from "@/actions/fetch";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { currencyFormat } from "@/utils/currency";
import { MdSearch } from "react-icons/md";
import { useDebouncedCallback } from "use-debounce";
import BarcodePrinter from "../BarCodePrinter";
import { updateBarcode } from "@/actions/update";
import { toast } from "react-toastify";
import { generateEAN13FromUUID } from "@/lib/genBarcode";
import InventoryMovementTable from "../InventoryMovementTable";
import StockAdjustmentForm from "../StockAdjustmentForm";



const ProductTable=({products, slug, userRole})=>{

  const initialItems=[...products]
 
    const { replace } = useRouter();
    const pathname = usePathname()
    const [price, setPrice] = useState(0)
    const [qty, setQty] = useState(0)
    const [loading, setLoading]= useState(false)
    const [total, setTotal] = useState(0)
    const [prod, setProd]= useState([])
     const [code, setCode]=useState('')
     const [item, setItem]=useState(initialItems)
     const [selectedProduct, setSelectedProduct] = useState(null)
     const [inventoryTransactions, setInventoryTransactions] = useState([])
     const [loadingTransactions, setLoadingTransactions] = useState(false)
     const [showStockAdjustment, setShowStockAdjustment] = useState(false)
     const [productToAdjust, setProductToAdjust] = useState(null)
   
    const searchParams = useSearchParams()

    const  handleDUpdate =async(id, path)=>{
      console.log('de',id)
await updateProd(id, path)
 const del =await fetchProductById(id)
   console.log('de',del)
    }

      //  const handleSearch = useDebouncedCallback((e) => {
                   
      //                  if (e.target.value) {
      //                       let tempOrders= [...products]   
      //                  console.log(tempOrders,'tord')
      //                 const items = tempOrders.filter(product=>product?.barcode===e.target.value)  
      //                 console.log(items,'it')
      //                 if (items && items.length) {                 
      //                   setItem(items)
      //                   e.target.value=""
      //                  } else {
      //                    toast.warn('no item with this barcode')
      //                  setCode('')
      //                  e.target.value=""
      //                  }
      //                 }
      //                }, 300);
    
       const filteredProducts = code
          ? products.filter((product) =>
        product.name.toLowerCase().includes(code)
  
          )    
          : products;

   

    const handleEdit=async(id, price, qty, path)=>{
      setLoading(true)
     const update = await updateProdPrice(id, price, qty, path)
     setLoading(false)
     setPrice(0)
     setQty(0)
    }

    const handleViewInventory = async (product) => {
      setSelectedProduct(product)
      setLoadingTransactions(true)
      try {
        // Fetch inventory transactions for this product
        const response = await fetch(`/api/inventory/transactions?productId=${product._id}`)
        const data = await response.json()
        setInventoryTransactions(data.transactions || [])
      } catch (error) {
        console.error('Error fetching inventory transactions:', error)
        toast.error('Failed to load inventory history')
        setInventoryTransactions([])
      } finally {
        setLoadingTransactions(false)
      }
    }

    const handleStockAdjustmentSuccess = () => {
      // Refresh the page to show updated stock
      window.location.reload()
    }
    // useEffect(()=>{
    //   if(code!=='')setItem(initialItems)
    // },[code])


useEffect(()=>{
  const getTotal= async()=>{
//  const  u = await updateOrderDate()
//      const ord =await fetchOrderItems('uz-2090')
//  console.log('orrd', ord)
          let tempOrders= [...products]      
        let counter = 0;
for (const obj of tempOrders) {
   counter++;
}
await   setQty(counter)
        let allPayments=[]
            allPayments =  products?.map((i) => i.totalValue)
            const amtTotal = allPayments.reduce((acc, item) => acc + (item), 0)
          await setTotal(amtTotal)   
  }
  getTotal()
},[products])




return(
   <>
 {/* Stats and Search Section - Mobile Responsive */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
   <div className="flex flex-col md:flex-row md:items-start lg:items-center lg:justify-between gap-4">
     
     {/* Stats Cards - Only visible to owners */}
     {userRole === 'OWNER' && (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:gap-4 gap-3 md:flex-1">
       {/* Total Stock Value Card */}
       <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
         <div className="flex items-center gap-3">
           <div className="bg-blue-600 rounded-lg p-3 shadow-md">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Total Stock Value</p>
             <p className="text-xl sm:text-2xl font-bold text-blue-900 truncate">{currencyFormat(total)}</p>
           </div>
         </div>
       </div>

       {/* Total Products Card */}
       <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
         <div className="flex items-center gap-3">
           <div className="bg-green-600 rounded-lg p-3 shadow-md">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
             </svg>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Total Products</p>
             <p className="text-xl sm:text-2xl font-bold text-green-900">{qty}</p>
           </div>
         </div>
       </div>
     </div>
     )}

     {/* Search Input */}
     <div className={userRole === 'owner' ? 'w-full lg:w-80' : 'w-full'}>
       <div className="relative">
         <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
           <MdSearch className="w-5 h-5 text-gray-400" />
         </div>
         <input
           type="text"
           placeholder="Search products..."
           onChange={(e) => setCode(e.target.value)}
           name="code"
           className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base placeholder:text-gray-400"
         />
         {code && (
           <button
             onClick={() => setCode('')}
             className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         )}
       </div>
     </div>
   </div>
 </div>

 {/* Table Section */}
        <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">{/*  uppercase font-bold */}
        <Table.Root layout="auto" variant="surface">
    <Table.Header>
      
      <Table.Row>
        <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Expiration</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Cost</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Profit</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Qty</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Stock Value</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Re-Order</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Stock</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Update</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Delete</Table.ColumnHeaderCell>
        {/* <Table.ColumnHeaderCell>Stock</Table.ColumnHeaderCell> */}
        {/* <Table.ColumnHeaderCell>Print Barcode</Table.ColumnHeaderCell> */}
      </Table.Row>
    </Table.Header>
  
    <Table.Body>
     {filteredProducts && filteredProducts?.map((patient) => (
              
      <Table.Row key={patient?._id}>
        <Table.RowHeaderCell> {patient?.name}</Table.RowHeaderCell>
        <Table.Cell>{patient?.category}</Table.Cell>
        <Table.Cell>{patient?.expiration}</Table.Cell>
        <Table.Cell>{patient?.cost}</Table.Cell>
        <Table.Cell> {patient.price} </Table.Cell>
        <Table.Cell> {patient.profit} </Table.Cell>
        <Table.Cell>
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={() => handleViewInventory(patient)}
                className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {patient?.qty}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Inventory Movement History - {selectedProduct?.name}
                </DialogTitle>
              </DialogHeader>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <InventoryMovementTable
                  transactions={inventoryTransactions}
                  productName={selectedProduct?.name}
                />
              )}
            </DialogContent>
          </Dialog>
        </Table.Cell>
        <Table.Cell>{patient?.totalValue}</Table.Cell>
        <Table.Cell>{patient?.reOrder}</Table.Cell>
        <Table.Cell>
          <Dialog open={showStockAdjustment && productToAdjust?._id === patient._id} onOpenChange={(open) => {
            if (!open) {
              setShowStockAdjustment(false)
              setProductToAdjust(null)
            }
          }}>
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setProductToAdjust(patient)
                  setShowStockAdjustment(true)
                }}
                className="px-3 py-1 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Adjust
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Stock Adjustment
                </DialogTitle>
              </DialogHeader>
              <StockAdjustmentForm
                product={productToAdjust || patient}
                slug={slug}
                onClose={() => {
                  setShowStockAdjustment(false)
                  setProductToAdjust(null)
                }}
                onSuccess={handleStockAdjustmentSuccess}
              />
            </DialogContent>
          </Dialog>
        </Table.Cell>
        <Table.Cell>
       
          <button   className="p-2  bg-blue-500 text-white font-bold rounded-lg" onClick={()=>replace(`/${slug}/dashboard/products?id=${patient._id}`)}>
                      <FaEdit/>

                      </button>

           
        </Table.Cell>
      
       <Table.Cell>
                      <button onClick={()=>handleDUpdate(patient._id, pathname)}  className="px-2 py-1 bg-red-500 text-white font-bold rounded-lg">
                      Delete
                      </button>
                    </Table.Cell>
     
            {/* <Table.Cell> <button className="bg-green-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>replace(`/${slug}/dashboard/stock?id=${patient._id}`)}>Add Stock</button></Table.Cell> */}
            {/* <Table.Cell> <button className="bg-gray-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>handleBarcode(patient)}>{loading? 'Generating...' :  'Generate Barcode'}</button></Table.Cell> */}
          
            {/* <Table.Cell> 
             
                     
                            
              
                      <Popover>
                        <PopoverTrigger>
                        <a className='bg-black text-white px-2  py-1 rounded-lg uppercase block'>Print Barcode</a>
              
              
                        </PopoverTrigger>
                        <PopoverContent> 
              <BarcodePrinter product={patient}/>
                            </PopoverContent>
                      </Popover>
              </Table.Cell> */}
       
      </Table.Row>
    ))} 
     
      
    </Table.Body>
  </Table.Root>
  </div>
   </>

    )
}
export default ProductTable