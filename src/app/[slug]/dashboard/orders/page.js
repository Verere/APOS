import {  fetchAllOrders } from '@/actions/fetch';
import OrderTable from '@/components/OrderTable';
import StoreSettings from '@/models/storeSettings';


const Orders = async({params})=>{
    const {slug} = await params   

   const result = await fetchAllOrders(slug, { withMeta: true })
   const orders = Array.isArray(result?.orders) ? result.orders : []
   const storeSettings = result?.serverUnavailable
     ? null
     : await StoreSettings.findOne({ slug }).select('deliveryEnabled serviceChargeEnabled').lean()
       

    return(
        <>            
       <OrderTable
       patients={orders} 
       slug={slug}
       deliveryEnabled={storeSettings?.deliveryEnabled === true}
       serviceChargeEnabled={storeSettings?.serviceChargeEnabled === true}
      
       />
        </>
    )
}
export default Orders;