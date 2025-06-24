import {  fetchAllPayments } from '@/actions/fetch';
import PaymentTable from '@/components/PaymentTable';


const Payment = async({params})=>{
    const {slug} = await params   

   const     payment= await fetchAllPayments(slug) 
       

    return(
        <>            
       <PaymentTable
       payments={payment} 
      
       />
        </>
    )
}
export default Payment;