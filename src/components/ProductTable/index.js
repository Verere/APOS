

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



const ProductTable=({products, slug})=>{

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


        // const handleSearch = async(code) => {       
       
        //    if (code && code.length) {
        //      const items = await fetchSearchedProducts(slug, code)
        //        setItem(items)
        //               setCode("")
        //             } else{
        //               setItem(initialItems)
        //               setCode("")
        //    }
          
        //  }
        //  const handleBarcode = async(patient) => {   
        //   setLoading(true)
        //   const {_id, barcode} = patient
        //   const id= _id
        //   if (barcode && barcode.length ) {
        //     setLoading(false)
        //     toast.warn("This Product already has a barcode")
        //   }else{
        //       const barcodes = generateEAN13FromUUID();
        //    const items=    await updateBarcode(id, barcodes, pathname)

        //         setLoading(false)
        //      toast.success("Barcode generated successfully")
            

        //    }
          
        //  }

return(
   <>
 <div className="flex  sm:flex-col justify-between items-center px-3 my-3 uppercase font-bold" >
              <div className="flex justify-around px-2 " >
                    <p>Total Stock Value :</p>
                   <p> {currencyFormat(total)}</p>
                   </div>
              <div className="flex justify-around px-2 " >
                    <p>Total Product :</p>
                   <p> {qty}</p>
                   </div>
                <div className="flex justify-between items-center border border-gray-400 w-1/3  pl-2 rounded-lg ">
                   <input type="text" placeholder="Search Item" 
                   onChange={(e)=>setCode(e.target.value)} 
                   name="code" className="p-2 outline-none focus:border-none "/>  
                   {/* <button className="flex justify-between items-center bg-gray-400 p-2  rounded-r-lg"
                   onClick={()=>handleSearch(code)}> 
                    Search</button>   */}
                 </div>
                   </div>
        <div className="w-full overflow-y-scroll overflow-x-scroll uppercase font-bold">
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
            <DialogContent className="max-w-2xl">
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