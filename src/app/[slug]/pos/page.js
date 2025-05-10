import { FetchCategory, fetchOneOrder, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts } from '@/actions/fetch';
import PosPage from '@/components/Pos';


const Pos = async({params, searchParams})=>{
    const {slug} = await params
    const {q,o,category} = await searchParams
     const menus=await fetchProducts(slug)
    const orderRcpt=  await fetchOneOrder(slug)
    const getHotel = await fetchSlug(slug)
    const fetchOrders = await fetchAllOrders(slug, q, )   
    const categories  = await FetchCategory(slug)  
    console.log('r', orderRcpt)
    
    let sales;
    let payment
    
    if(o){
        sales=await fetchSalesByOrderId(o)
        payment=await fetchPaymentByOrder(o)
        
    }else{
        sales=  await fetchSalesByOrderId(orderRcpt[0]?._id) 
        // if(sales === undefined){ sales= []}
        payment= await fetchPaymentByOrder(orderRcpt[0]?._id) 
        // if(payment === undefined){ payment = []}
       

    }

    return(
        <>            
       <PosPage 
       menus={menus} 
       getHotel={getHotel} slug={slug} 
       orderRcpt={orderRcpt} sales={sales} 
       pays={payment}
       orders={fetchOrders}
       categories={categories}
       />
        </>
    )
}
export default Pos;