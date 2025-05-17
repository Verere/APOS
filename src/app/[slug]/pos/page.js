import { FetchCategory, fetchOneOrder, fetchSearchedProducts, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts } from '@/actions/fetch';
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
    
    if(q){
         menus  = await fetchSearchedProducts(slug, q)  
         sales=await fetchSalesByOrderId(o)
         payment=await fetchPaymentByOrder(o)
         console.log('s',sales)
         console.log('s',q, o)
        
    }else{
         menus=await fetchProducts(slug)
         sales=  await fetchSalesByOrderId(orderRcpt[0]?._id) 
         if(sales === undefined){ sales= []}
     payment= await fetchPaymentByOrder(orderRcpt[0]?._id) 
         if(payment === undefined){ payment = []}
         console.log('s',sales)
       

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