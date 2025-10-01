import { FetchCategory, fetchOneOrder, fetchSearchedProducts, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts } from '@/actions/fetch';
import { updatePassword } from '@/actions/update';
import PosPage from '@/components/Pos';


const Pos = async({params, searchParams})=>{
    const {slug} = await params
    const {q,o,category} = await searchParams
    const orderRcpt=  await fetchOneOrder(slug)
    const getHotel = await fetchSlug(slug)
    const fetchOrders = await fetchAllOrders(slug, )   
    const categories  = await FetchCategory(slug)  
  
     let menus;
     let sales;
     let payment
     menus=await fetchProducts(slug)
    
    if(q){
        //  menus  = await fetchSearchedProducts(slug, q)  
         sales=await fetchSalesByOrderId(o)
         payment=await fetchPaymentByOrder(o)
         if(sales === undefined){ sales= []}
      
        
    }else{
         sales=  await fetchSalesByOrderId(orderRcpt[0]?._id) 
         if(sales === undefined){ sales= []}
     payment= await fetchPaymentByOrder(orderRcpt[0]?._id) 
         if(payment === undefined){ payment = []}
       

    }

    return(
        <>            
       <PosPage 
       menus={menus} 
       getHotel={getHotel} slug={slug} 
       orderRcpt={orderRcpt} 
       sales={sales} 
       pays={payment}
       orders={fetchOrders}
       categories={categories}
       />
        </>
    )
}
export default Pos;