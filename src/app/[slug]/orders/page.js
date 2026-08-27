import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';
import TopBar from '@/components/topbar/topbar';


const Orders = async({params})=>{
    const {slug} = await params   

    const result = await fetchAllOrders(slug, { withMeta: true })
    const orders = Array.isArray(result?.orders) ? result.orders : []
    const serverUnavailable = Boolean(result?.serverUnavailable)
    const serverErrorMessage = String(result?.serverErrorMessage || '')
       

    return(
        <>  
        <TopBar />          
       <OrderTable
       patients={orders} 
       slug={slug}
         serverUnavailable={serverUnavailable}
         serverErrorMessage={serverErrorMessage}
      
       />
        </>
    )
}
export default Orders;