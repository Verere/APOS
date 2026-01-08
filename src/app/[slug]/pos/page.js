import { FetchCategory, fetchOneOrder, fetchSearchedProducts, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts, fetchCustomers } from '@/actions/fetch';
import { updatePassword } from '@/actions/update';
import PosPage from '@/components/Pos';
import connectDB from '@/utils/connectDB';
import StoreSettings from '@/models/storeSettings';
import Store from '@/models/store';


const Pos = async({params, searchParams})=>{
    try{
        const {slug} = await params
        const getHotel = await fetchSlug(slug)

        await connectDB()
        const store = await Store.findOne({ slug }).lean()
        
        // Fetch or create store settings
        let settings = await StoreSettings.findOne({ slug }).lean()
        if (!settings && store) {
          // Create default settings if none exist
          settings = await StoreSettings.create({
            storeId: store._id,
            slug: slug,
            allowCreditSales: true,
            allowPriceAdjustment: false
          })
          settings = settings.toObject()
        }
  
        const menus = await fetchProducts(slug)
        const customers = await fetchCustomers(slug)

        return(
            <>            
             <PosPage 
                 menus={menus} 
                 getHotel={getHotel}
                 slug={slug}
                 customers={customers}
                 allowCreditSales={settings?.allowCreditSales ?? true}
                 allowPriceAdjustment={settings?.allowPriceAdjustment ?? false}
             />
            </>
        )
    }catch(err){
        console.error('Pos page data fetch error:', err)
        return (<div className="p-4 text-red-600">Error loading POS page: {String(err?.message || err)}</div>)
    }
}
export default Pos;