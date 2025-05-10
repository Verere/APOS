
export const InitPay = async(email, amount, account)=>{
   const SECRET_KEY= "sk_test_a1be37db4c9696e128e5ea06467542f20703618f"



       const response = await fetch('https://api.paystack.co/transaction/initialize', {
        port: 443,
            method:'POST',  
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                'content-type': 'application/json',
                
            },
            body: JSON.stringify({
                "email": `${email}`, 
                "amount": `${amount}`, 
                "subaccount": `${account}`, 
                "transaction_charge": 10000,
            })
        }) 
      const data = response.json()
       return data
      
}
