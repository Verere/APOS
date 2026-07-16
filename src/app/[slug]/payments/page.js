import {  fetchAllPayments, fetchAllPaymentsByDates } from '@/actions/fetch';
import PaymentTable from '@/components/PaymentTable';
import TopBar from '@/components/topbar/topbar';

const Payment = async({params})=>{
    const {slug} = await params   

   const     payment= await fetchAllPayments(slug) 
   const     allPayment= await fetchAllPaymentsByDates(slug) 

    return(
        <>   
         <TopBar />           
       <PaymentTable
       payments={payment} 
      allPayment={allPayment}
      slug={slug}
       />
        </>
    )
}
export default Payment;