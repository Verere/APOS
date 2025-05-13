'use client'
import LoadingComponent from "@/components/Loader";
import { CartContext } from "@/context/CartContext";
import { addSales, } from "@/actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, useActionState, useRef } from "react";
import { toast } from "react-toastify";
import { useFormState } from 'react-dom';
import { fetchCodeProduct,} from "@/actions/fetch";
import { GlobalContext } from "@/context";
import moment from 'moment'

const CodeItem=({slug})=>{
    
      var date = moment()
      const bDate = date.format('D/MM/YYYY')
    const [code, setCode]=useState('')
    const[item, setItem] = useState([])
         const { cart, order,  currentOrder,  codeItems, setCodeItems} =
                useContext(CartContext);
        const {user, cartTotal}= useContext(GlobalContext)
      const pathname = usePathname();
      const router = useRouter();
      const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false)
      const [state, formAction, pending] = useActionState(addSales, {});
    
   const inputRef = useRef(null);
    const formRef = useRef(null);


    
      useEffect(()=>{
        const getError = async()=>{
    
          if(state.error){
          await  toast.warn(state.error)
        await  setCode('')
        await setItem([])
          }
          if(state.success){
            await setCode('')
            await setItem([])
          }
        }
        getError()
      },[state])
    
      useEffect(()=>{
             const getError = async()=>{
               if(code && code.length){
                const items = await fetchCodeProduct(slug, code)
                if (items && items.length) {
                 
                await  setItem(items)
              }else{
                await setCode('')
            await setItem([])
              }
                
             }}
             getError()
           },[code]) 

     
    

    useEffect(() => {
      const submitForm = async()=>{
        inputRef.current.focus();

        if(item && item.length){
          formRef.current.requestSubmit()
        }
      }
      submitForm()
    }, [item]);
  
    return(
      <>

      <div className="flex items-center border border-gray-400 w-1/3 rounded-lg p-2 mr-3 ">

                  <input ref={inputRef} type="text" autoFocus placeholder="scan barcode" onChange={async(e)=>await setCode(e.target.value)} value={code} className=" outline-none focus:border-none "/>     
      </div>
        <form ref={formRef}  action={formAction} >
        <input type="hidden" name="slug" value={order?.slug} />
                  <input type="hidden" name="order" value={order?._id} />
                  <input type="hidden" name="orderNum" value={order?.orderNum} />
                  <input type="hidden" name="itemId" value={item[0]?._id} />
                  <input type="hidden" name="item" value={item[0]?.name} />
                  <input type="hidden" name="barcode" value={item[0]?.barcode} />
                  <input type="hidden" name="stock" value={item[0]?.qty} />
                  <input type="hidden" name="qty" value="1" />
                  <input type="hidden" name="price" value={item[0]?.price}/>
                  <input type="hidden" name="amount" value={item[0]?.price}/>
                  <input type="hidden" name="bDate" value={bDate}/>
                  <input type="hidden" name="status" value={order?.status}/>
                  <input type="hidden" name="soldBy" value={user?.name} />
                  <input type="hidden" name="path" value={pathname} />
                  <input type="hidden" name="totalOrder" value={cartTotal} />
                  <button onClick={async ()=> await setLoading(true)}></button>
                  {pending ? <LoadingComponent/> : ''}
        </form>
      </>
      
    )
}
export default CodeItem