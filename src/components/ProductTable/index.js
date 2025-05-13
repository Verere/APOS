

"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateProd, updateProdPrice } from "@/actions";
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


const ProductTable=({products, slug})=>{
 
    const { replace } = useRouter();
    const pathname = usePathname()
    const [price, setPrice] = useState(0)
    const [qty, setQty] = useState(0)
    const [loading, setLoading]= useState(false)
    const [total, setTotal] = useState(0)
   
    const searchParams = useSearchParams()
    const  handleUpdate =async(id, path)=>{
await updateProd(id, path)
    }

    const handleEdit=async(id, price, qty, path)=>{
      setLoading(true)
     const update = await updateProdPrice(id, price, qty, path)
     setLoading(false)
     setPrice(0)
     setQty(0)
    }
useEffect(()=>{
  const getTotal= async()=>{
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


        const handleSearch = useDebouncedCallback((e) => {
           const params = new URLSearchParams(searchParams);
       
       
           if (e.target.value) {
             e.target.value.length > 2 && params.set("q", e.target.value);
           } else {
             params.delete("q");
           }
           if(pathname){
       
             replace(`${pathname}?${params}`);
           }else{
             replace(`/?${params}`);
           }
         }, 300);

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
                <div className="flex items-center border border-gray-400 w-1/3  rounded-lg p-2 mx-auto ">
                   <MdSearch />
                   <input type="text" placeholder="Search Item" onChange={(e)=>handleSearch(e)} name="name" className=" outline-none focus:border-none "/>     
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
      </Table.Row>
    </Table.Header>
  
    <Table.Body>
     {products && products?.map((patient) => (
              
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
                      <button onClick={()=>handleUpdate(patient._id, pathname)}  className="px-2 py-1 bg-red-500 text-white font-bold rounded-lg">
                      Delete
                      </button>
                    </Table.Cell>
     
            <Table.Cell> <button className="bg-green-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>replace(`/${slug}/dashboard/stock?id=${patient._id}`)}>Add Stock</button></Table.Cell>
       
      </Table.Row>
    ))} 
     
      
    </Table.Body>
  </Table.Root>
  </div>
   </>

    )
}
export default ProductTable