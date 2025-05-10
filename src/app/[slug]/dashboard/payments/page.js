import {  fetchAllPayments } from '@/actions/fetch';
import PaymentTable from '@/components/PaymentTable';


const Payment = async({params})=>{
    const {slug} = await params   

   const     payment= await fetchAllPayments(slug) 
       
console.log(payment, 'p')

    return(
        <>            
       <PaymentTable
       payments={payment} 
      
       />
        </>
    )
}
export default Payment;