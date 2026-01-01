'use client'
import { Badge, DataList, Table, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const StockTable = ()=>{
    return(
        <>
        <div className="flex justify-between pb-2">
              
        <div>
            <button onClick={()=>setShowForm(!showForm)} className="px-4 bg-black text-white font-bold">Add New Stock</button>
        </div>
            </div>
           
        <div className="w-1/2 ">
        <TextField.Root onChange={(e)=>handleSearch(e.target.value)} placeholder="Search Menu to add Stock">
        <TextField.Slot>
        <FaMagnifyingGlass height="16" width="16" />
        </TextField.Slot>
        </TextField.Root>
   

</div>
          <div className="w-full mt-3">
      <Table.Root layout="auto" variant="surface">
  <Table.Header>   
    <Table.Row>
      <Table.ColumnHeaderCell>Location</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Menu Item</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Prev Stock</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>BalStock</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell >  Detail</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell >  Update</Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>

  <Table.Body>
  {menustock?.map((product) => (
            
    <Table.Row key={product?._id}>
      <Table.RowHeaderCell> {product?.menu}</Table.RowHeaderCell>
      <Table.Cell>{product?.stock}</Table.Cell>
      <Table.Cell><button className={` font-bold ${product?.action==="addStock" ? "text-blue-500 ":"text-red-500"}`}>{product?.qty}</button></Table.Cell>
      <Table.Cell><button className={` font-bold ${product?.action==="addStock" ? "text-blue-500 ":"text-red-500"}`}>{product?.balanceStock}</button></Table.Cell>
      <Table.Cell>{formatDate(product?.bDate)}</Table.Cell>
   <Table.Cell><Link href={`/${slug}/menuStockDetails?menuId=${product?.menuId}`}>
                    <button  className={`bg-blue-800 text-white p-1`}>
                     Detail
                    </button>
                    </Link>   </Table.Cell>
   <Table.Cell>
                    <button onClick={()=>handleStockUpdate(product?._id)}  className={`bg-green-700 text-white p-1`}>
                     Update
                    </button>
                  </Table.Cell>
    {/*      <Table.Cell>
      <form action={deleteMenuCategory}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
      </Table.Cell> */}
    </Table.Row>
  ))}
   
    
  </Table.Body>
</Table.Root>
</div>
        </>
    )
}