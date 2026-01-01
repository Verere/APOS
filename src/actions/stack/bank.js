
export const getBanks = async () => {
  const SECRET_KEY= "sk_test_a1be37db4c9696e128e5ea06467542f20703618f"
  try {
      const res = await fetch(
          'https://api.paystack.co/bank',{
            
            method: "GET",  
            country: 'nigeria',   
            headers: {
              Authorization: `Bearer ${SECRET_KEY}`,
              'content-type': 'application/json',
      }
  });
      const data = await res.json();
      console.log('d',data)
      return data;
    } catch (error) {
      console.log("error", error);
    }
};