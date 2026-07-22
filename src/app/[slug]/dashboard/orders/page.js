import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';


const Orders = async({params})=>{
    const {slug} = await params   

   const     orders= await fetchAllOrders(slug) 
       

    return(
        <>            
       <OrderTable
       patients={orders} 
       slug={slug}
      
       />
        </>
    )
}
export default Orders;