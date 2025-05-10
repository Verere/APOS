export const verifyPayStack = async (reference) => {
    const SECRET_KEY= "sk_test_a1be37db4c9696e128e5ea06467542f20703618f"
  console.log(reference)
    try {
        const res = await fetch(
            `https://api/paystack.co/transaction/verify/reference`,{
              
              method: "GET",     
              headers: {
                Authorization: `Bearer ${SECRET_KEY}`,
                'content-type': 'application/json',
                 'Access-Control-Allow-Origin': '*',
        }
    });
        const data = await res.json();
        return data;
      } catch (error) {
        console.log("error", error);
      }
};