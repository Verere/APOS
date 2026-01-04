import { FetchCategory, fetchOneOrder, fetchSearchedProducts, fetchSalesByOrderId, fetchBDate, fetchPaymentByOrder, fetchSlug, fetchAllOrders, fetchCategory, fetchProducts, fetchCustomers } from '@/actions/fetch';
import { updatePassword } from '@/actions/update';
import PosPage from '@/components/Pos';


const Pos = async({params, searchParams})=>{
    try{
        const {slug} = await params
        const getHotel = await fetchSlug(slug)

       
  
    const    menus = await fetchProducts(slug)
    const customers = await fetchCustomers(slug)

      

        return(
            <>            
             <PosPage 
                 menus={menus} 
                 getHotel={getHotel}
                 slug={slug}
                 customers={customers}
             />
            </>
        )
    }catch(err){
        console.error('Pos page data fetch error:', err)
        return (<div className="p-4 text-red-600">Error loading POS page: {String(err?.message || err)}</div>)
    }
}
export default Pos;