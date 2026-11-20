import {  fetchAllPayments, fetchAllPaymentsByDates } from '@/actions/fetch';
import PaymentTable from '@/components/PaymentTable';
import StoreSettings from '@/models/storeSettings';


const Payment = async({params})=>{
    const {slug} = await params   

   const     payment= await fetchAllPayments(slug) 
   const     allPayment= await fetchAllPaymentsByDates(slug) 
   const storeSettings = await StoreSettings.findOne({ slug }).select('deliveryEnabled serviceChargeEnabled').lean()

    return(
        <>            
       <PaymentTable
       payments={payment} 
      allPayment={allPayment}
      slug={slug}
      deliveryEnabled={storeSettings?.deliveryEnabled === true}
      serviceChargeEnabled={storeSettings?.serviceChargeEnabled === true}
       />
        </>
    )
}
export default Payment;