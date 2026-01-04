import {  fetchAllPayments, fetchAllPaymentsByDates } from '@/actions/fetch';
import PaymentTable from '@/components/PaymentTable';


const Payment = async({params})=>{
    const {slug} = await params   

   const     payment= await fetchAllPayments(slug) 
   const     allPayment= await fetchAllPaymentsByDates(slug) 

    return(
        <>            
       <PaymentTable
       payments={payment} 
      allPayment={allPayment}
      slug={slug}
       />
        </>
    )
}
export default Payment;