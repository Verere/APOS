"use client"
import { fetchLocation, fetchMenuItem, fetchMenuSearch, fetchMenuStockItem } from "@/actions/fetch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { GlobalContext } from "@/context";


 const AddMenuStockPage = ({addMenuStock,  slug,  }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
 const [values1, setValues1] = useState("")
 const [menuId, setMenuId]= useState("")
 const [menu, setMenu]= useState("")
 const [uom, setUom]= useState("")
 const [cost, setCost]= useState(0)
 const [totalValue, setTotalValue]= useState(0)
 const [reOrder, setReOrder]= useState(0)
 const [stockBal, setStockBal] = useState(0)
 const [prevStock, setPrevStock] = useState(0)
 const [qty, setQty] = useState(0)

 const [state, formAction, isPending] = useActionState(addMenuStock, {});

//  const user = JSON.parse(localStorage.getItem('location'))
//  if(!user)replace("/login")

 useEffect(()=>{

const setItems= async()=>{
   const men = searchParams.get('menu')
   const menuStock = searchParams.get('Stock')
   if(men){
    const menuItem = await fetchMenuItem(men)
    await setMenuId(menuItem?._id)
    await setMenu(menuItem.menu)
    await     setCost(menuItem?.price )
    await  setUom(menuItem?.uom )
   }
   if(menuStock){
    const menuItem = await fetchMenuStockItem(menuStock)
    await setMenuId(menuItem?.menuId)
    await setMenu(menuItem.menu)
    await  setUom(menuItem?.uom )
   await setPrevStock(menuItem?.balanceStock )
   await     setCost(menuItem?.price )
   await      setReOrder(menuItem?.reOrder)
   }
   

}
setItems()
},[searchParams])




   const handleStockBal= async(e)=>{
    await setQty(e)
    if(values1=="addStock"){
    const stock= parseInt(prevStock)  + parseInt(e)
   await  setStockBal(stock)
    const tt= stock*cost
    setTotalValue(tt)
}else if(values1=="writeOff"){
    const stock= parseInt(prevStock)  - parseInt(e)
    setStockBal(stock)
    const tt= stock*cost
    setTotalValue(tt)
    if(stock < 0) toast.warn("bal stock cannot be less than zero!");
}else if(values1=="return"){
    const stock= parseInt(prevStock)  - parseInt(e)
    setStockBal(stock)
    const tt= stock*cost
    setTotalValue(tt)
    if(stock < 0) toast.warn("bal stock cannot be less than zero!");
}else { toast.warn("Please choose an Action");}
   }

   useEffect(()=>{
    const getState=()=>{

  if(state.error){
   toast.error("Something went wrong")
 }
  if(state.success){
   toast.success("Stock added Successfully!")
 }
}
getState()
   },[state])
  return (
    <>

      <form action={formAction}   className="flex flex-col justify-between  w-full mt-0 mr-0 ml-0 ">
      <input type="text" placeholder="Enter Product"  value={menu}  onChange={async (e) => {
          await setMenu(e.target.value)
        }} name="menu" className="border w-full mx-2 border-gray-400 p-2 mb-2" required />


                            <div className="flex flex-wrap gap-2 mt-2 p-2 justify-between">
      <input type="text"  name="uom" placeholder="Enter UOM"
      value={uom}  onChange={async (e) => {
          await setUom(e.target.value)
        }}
        className="border  mx-2 border-gray-400 p-2" />


      <div>
                            <label htmlFor="reOrder">ReOrder</label>

      <input type="number" value={reOrder}
      onChange={async (e) => {
          await setReOrder(e.target.value)
        }}
        name="reOrder" className="border w-20 mx-2 border-gray-400 p-2" required />
      </div>




      <select name="action" id="cat"  value={values1} onChange={async(e)=>await setValues1(e.target.value)}>
          <option value="">Action</option>
          <option value="addStock">Add Stock</option>
          <option value="writeOff">Write Off</option>
          <option value="return">Return</option>

        </select>
        <div>
                            <label htmlFor="prevStock">Previous Stock</label>
      <input type="number" value={prevStock}  readOnly  name="stock" className="border w-20  mx-2 bg-gray-100 p-2" />

      </div>
      <div>
                            <label htmlFor="qty">Qty Added</label>
      <input type="number"  value={qty} name="qty" onChange={async(e)=> await handleStockBal(e.target.value)} className="border w-20 mx-2 border-gray-400 p-2" required />

      </div>

      <div>
                            <label htmlFor="stockBal">Stock Balance</label>
      <input type="number"  value={stockBal}  readOnly  name="balanceStock" className="border w-20  outline-none focus:outline-none text-center mx-2 bg-gray-100 p-2" />

      </div>
      <div>
                            <label htmlFor="price">Price/Unit</label>

      <input type="number"  name="price"
      value={cost}  onChange={async (e) => {
        await setCost(e.target.value)
      }}  className="border  w-20 mx-2 border-gray-400 p-2" required />

      </div>
      <div>
                            <label htmlFor="totalValue">Total Value</label>

      <input type="number"
        value={totalValue}
         onChange={async (e) => {
        await setTalValue(e.target.value)    }}
        name="totalValue"
        className="border w-20 mx-2 border-gray-400 p-2"
        required />

      </div>
      <input type="hidden"  name="slug" value={slug} />
      <input type="text"  name="menuId" value={menuId} />
      <input type="hidden"  name="path" value={pathname} />
      <input type="hidden" name="user" value="Eddy" />
      </div>

      <button type="submit" className="border border-gray-400 rounded-md bg-black text-white p-2 ">Add Stock</button>



            </form>
    </>
  );
};

export default AddMenuStockPage;

