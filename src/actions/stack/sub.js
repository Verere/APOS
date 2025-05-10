

export const createSubAccount = async(code, cName, bankNum)=>{
    try {

  const SECRET_KEY= "sk_test_a1be37db4c9696e128e5ea06467542f20703618f"
      const response = await fetch('https://api.paystack.co/subaccount', {
       port: 443,
           method:'POST',  
           headers: {
               Authorization: `Bearer ${SECRET_KEY}`,
               'content-type': 'application/json',
               
           },
           body: JSON.stringify({
               "business_name": `${cName}`, 
               "bank_code": `${code}`, 
               "account_number": `${bankNum}`, 
               "percentage_charge": 10
             
           })
       }) 
     const data = response.json()
      return data
    } catch (error) {
      console.log("error", error);
    }
     
}
