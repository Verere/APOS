

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
import { currencyFormat } from "@/utils/currency";
import { MdSearch } from "react-icons/md";
import { useDebouncedCallback } from "use-debounce";
import BarcodePrinter from "../BarCodePrinter";
import { updateBarcode } from "@/actions/update";
import { toast } from "react-toastify";
import { generateEAN13FromUUID } from "@/lib/genBarcode";



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
    

    const handleEdit=async(id, price, qty, path)=>{
      setLoading(true)
     const update = await updateProdPrice(id, price, qty, path)
     setLoading(false)
     setPrice(0)
     setQty(0)
    }
    useEffect(()=>{
      if(code!=='')setItem(initialItems)
    },[code])
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


        const handleSearch = async(code) => {       
       
           if (code && code.length) {
             const items = await fetchSearchedProducts(slug, code)
             console.log(items)
               setItem(items)
                      setCode("")
                    } else{
                      setItem(initialItems)
                      setCode("")
           }
          
         }
         const handleBarcode = async(patient) => {   
          setLoading(true)
          const {_id, barcode} = patient
          const id= _id
          if (barcode && barcode.length ) {
            setLoading(false)
            toast.warn("This Product already has a barcode")
          }else{
              const barcodes = generateEAN13FromUUID();
           const items=    await updateBarcode(id, barcodes, pathname)

                setLoading(false)
             toast.success("Barcode generated successfully")
            

           }
          
         }

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
                   <button className="flex justify-between items-center bg-gray-400 p-2  rounded-r-lg"
                   onClick={()=>handleSearch(code)}> 
                    Search</button>  
                 </div>
                   </div>
        <div className="w-full overflow-y-scroll overflow-x-scroll uppercase font-bold">
        <Table.Root layout="auto" variant="surface">
    <Table.Header>
      
      <Table.Row>
        <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Barcode</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Stock</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Total Value</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Update</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Delete</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Stock</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Print Barcode</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  
    <Table.Body>
     {item && item?.map((patient) => (
              
      <Table.Row key={patient?._id}>
        <Table.RowHeaderCell> {patient?.name}</Table.RowHeaderCell>
        <Table.Cell>{patient?.category}</Table.Cell>
        <Table.Cell>{patient?.barcode}</Table.Cell>
        <Table.Cell> {patient.price} </Table.Cell>
        <Table.Cell>{patient?.qty}</Table.Cell>
        <Table.Cell>{patient?.totalValue}</Table.Cell>
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
     
            <Table.Cell> <button className="bg-green-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>replace(`/${slug}/dashboard/stock?id=${patient._id}`)}>Add Stock</button></Table.Cell>
            <Table.Cell> <button className="bg-gray-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>handleBarcode(patient)}>{loading? 'Generating...' :  'Generate Barcode'}</button></Table.Cell>
          
            <Table.Cell> 
             
                     
                            
              
                      <Popover>
                        <PopoverTrigger>
                        <a className='bg-black text-white px-2  py-1 rounded-lg uppercase block'>Print Barcode</a>
              
              
                        </PopoverTrigger>
                        <PopoverContent> 
              <BarcodePrinter product={patient}/>
                            </PopoverContent>
                      </Popover>
              </Table.Cell>
       
      </Table.Row>
    ))} 
     
      
    </Table.Body>
  </Table.Root>
  </div>
   </>

    )
}
export default ProductTable