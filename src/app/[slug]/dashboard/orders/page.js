import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';


const Orders = async({params})=>{
    const {slug} = await params   

   const     orders= await fetchAllOrders(slug) 
   console.log('o', orders)
       

    return(
        <>            
       <OrderTable
       patients={orders} 
      
       />
        </>
    )
}
export default Orders;