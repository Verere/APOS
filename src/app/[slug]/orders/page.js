import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';
import TopBar from '@/components/topbar/topbar';
import StoreSettings from '@/models/storeSettings';


const Orders = async({params})=>{
    const {slug} = await params   

    const result = await fetchAllOrders(slug, { withMeta: true })
    const orders = Array.isArray(result?.orders) ? result.orders : []
    const serverUnavailable = Boolean(result?.serverUnavailable)
    const serverErrorMessage = String(result?.serverErrorMessage || '')
    const storeSettings = serverUnavailable
      ? null
      : await StoreSettings.findOne({ slug }).select('deliveryEnabled serviceChargeEnabled').lean()
       

    return(
        <>  
        <TopBar />          
       <OrderTable
       patients={orders} 
       slug={slug}
         serverUnavailable={serverUnavailable}
         serverErrorMessage={serverErrorMessage}
         deliveryEnabled={storeSettings?.deliveryEnabled === true}
         serviceChargeEnabled={storeSettings?.serviceChargeEnabled === true}
      
       />
        </>
    )
}
export default Orders;