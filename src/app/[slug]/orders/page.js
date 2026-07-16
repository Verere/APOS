import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';
import TopBar from '@/components/topbar/topbar';


const Orders = async({params})=>{
    const {slug} = await params   

   const     orders= await fetchAllOrders(slug) 
       

    return(
        <>  
        <TopBar />          
       <OrderTable
       patients={orders} 
      
       />
        </>
    )
}
export default Orders;