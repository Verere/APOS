"use server";
import {redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
import Store from "@/models/store"
import Menu from "@/models/menu"
import Location from "@/models/location"
import Category from "@/models/category"
import MenuStock from "@/models/menuStock"
import Order from "@/models/order"
import Sales from "@/models/sales"
import Credits from "@/models/credit"
import Complimentary from "@/models/complimentary"

import User  from '@/models/user';
// import businessDate from '@/models/businessDate';
import payments from "@/models/payments";
// import roomPackage from "@/models/roomPackage";
// import  roomType  from '@/models/roomType';
// import  Room  from '@/models/room';
import  Product  from '@/models/product';
import  Eod  from '@/models/eod';
import moment from 'moment'

    var date = moment();
const bDate = date.format('D/MM/YYYY')
  //fetch category by menu
  export async function FetchCategory(slug) {
  
    try {
      await connectToDB();
  
      const result = await Category.find({slug, isDeleted:false});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Category!"};
    }
  }
// fetch One menu by sku
export async function fetchMenuBySku(hotelId, sku, location) {
    await connectToDB();
  
    try {
      connectToDB();
     
  
        const result = await Menu.findOne({$and:[{hotelId},{sku}, {location}]});
        return  JSON.parse(JSON.stringify(result));
     
    } catch (err) {
      console.log(err);
      // return {Error:"Failed to fetch menu!"};
    }
  }
  // fetch menu query
  export async function fetchSearchedProducts(slug,  q) {
    const regex = new RegExp(q, "i");
    await connectToDB();
  
    try {
      connectToDB();
      if(q){
        const result = await Product.find({slug,  name: { $regex: regex }})
         if (!result)return {error : "Network error"}
                  return JSON.parse(JSON.stringify(result));
      }
    
     
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch product"};
    }
  }
  // fetch menu query
  export async function fetchCodeProduct(slug,  code) {
    await connectToDB();
  
    try {
      connectToDB();
        const result = await Product.find({slug,  barcode: code})
        return JSON.parse(JSON.stringify(result));
    
     
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch product"};
    }
  }
  // fetch menustock query by location
  export async function fetchMenuStockSearch(slug, ) {
    await connectToDB();
  
    try {
      connectToDB();
        const result = await MenuStock.find({$and:[{slug}  ]})
        return JSON.parse(JSON.stringify(result));
     
     
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch menu!");
    }
  }
  // fetch menuStock item details
  export async function fetchMenuStockItemDetails(menuId) {
    await connectToDB();
  
    try {
      connectToDB();
   
        const result = await MenuStock.find({menuId}).sort({createdAt:-1})

        return JSON.parse(JSON.stringify(result));  
    } catch (err) {
      console.log(err);
     return{error:"Failed to fetch menu!"};
    }
  }

  
    // fetch menuStock item
    export async function fetchLatestStockItem(menuId) {
      await connectToDB();
    
      try {
        connectToDB();     
          const result = await MenuStock.find({menuId}).sort({createdAt:-1}).limit(1)
          return JSON.parse(JSON.stringify(result));  
      } catch (err) {
        console.log(err);
       return{error:"Failed to fetch menu!"};
      }
    }


 //fetch sub
export async function fetchProductById(id) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Product.find({_id:id});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Product!"};
  }
}
  
  //fetch sub
  export async function fetchProducts(slug) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Product.find({slug, isDeleted:false}).sort({'createdAt': 'desc'});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch menu!"};
    }
  }
  //fetch products by menu
  export async function fetchProductsByMenu(params) {
    const {storeid, id }=params
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Product.find({$and:[{storeid}, {menu: id}]});
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch menu!"};
    }
  }
  //fetch products by category
  export async function fetchProductsByCategory(storeid, id, cat) {
    
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Product.find({$and:[{storeid}, {menu: id}, {category: cat}]});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch menu!"};
    }
  }
 
  

  //fetch sub
  export async function fetchSubscriptions() {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Subscription.find({});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch subscription!"};
    }
  }

  //fetch sub
export async function fetchCategory(storeid) {
 
    try {
      await connectToDB();
  
      const result = await Category.find({storeid});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch category!"};
    }
  }
  
  //fetch currentUser
  export async function currentUser(email) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await User.findOne({email});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log('err', err);
      return{error:"Failed to fetch user!"};
    }
  }


  //fetch Hotel by Id
  export async function fetchUser(id) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await User.findOne({email:id});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch user!"};
    }
  }
  

  //fetch store
export async function fetchStoreDetails(id) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Store.findOne({_id:id});
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch store!"};
    }
  }

  //fetch count order
export async function fetchCountOrder(slug ) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug, }).countDocuments().exec()
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch count Completed orders  
export async function fetchCountCompletedOrder(slug,  bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug,  bDate, isCompleted:true}).countDocuments().exec()
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch count suspended order
export async function fetchCountSuspendedOrder(slug,  bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug, bDate, isSuspended:true}).countDocuments().exec()
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch count canceled order
export async function fetchCountCancelledOrder(slug,  bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug, bDate, isCancelled:true}).countDocuments().exec()
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }

  //fetch order
export async function fetchOneOrder(slug) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug}).sort({createdAt:-1}).limit(1)
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch order
export async function fetchOrderItems(orderId) {
  console.log(orderId)
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({orderId})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
 
  
  //fetch order suspended
export async function fetchSuspendedOrders(slug, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug, bDate, isSuspended:true}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
  //fetch order suspended
export async function fetchEods(slug,  bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Eod.find({slug, bDate:{"$gte":bDate}, isCancelled:false}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
  //fetch All  orders
export async function fetchAllOrders(slug) {

    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({slug, bDate}).sort({createdAt:"desc"})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order !"};
    }
  }
  //fetch All  payments by location
export async function fetchAllPaymentsByLocation(hotelId, location, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await payments.find({hotelId, location, bDate:{"$gte" : bDate}}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Payments !"};
    }
  }
  //fetch All  orders
export async function fetchAllComplementaryByLocation(hotelId, location, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Complimentary.find({hotelId, location, bDate:{"$gte" : bDate}}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Payments !"};
    }
  }
  //fetch All  orders
export async function fetchAllCreditsByLocation(hotelId, location, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Credits.find({hotelId, location, bDate:{"$gte" : bDate}}).sort({createdAt:'desc'})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Payments !"};
    }
  }
  //fetch All  orders  
export async function fetchCompletedOrders(hotelId, location, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({hotelId, location, bDate, isCompleted:true}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch cancelled  orders
export async function fetchCancelledOrders(hotelId, location, bDate) {
    await connectToDB();
   
    try {
      connectToDB();
 
  const result = await Order.find({hotelId, location, bDate, isCancelled:true}).sort({createdAt:-1})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
  //fetch sales by menuId
export async function fetchSalesByMenuId(order) {
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Sales.findOne({_id: order})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  //fetch sales by orderId
export async function fetchSalesByOrderId(order) {
  console.log('fetch', order)

    await connectToDB();
    try {
      connectToDB();
      const result = await Sales.find({order, isCancelled:false})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
  //fetch sales by location
export async function fetchAllPayments(slug) {
  console.log('slug', slug)
    await connectToDB();
   
    try {
      connectToDB();
      const result = await payments.find({slug, bDate}).sort({'createdAt':'desc'})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
 

 //fetch pment by orderId
 export async function fetchPaymentByOrder(order) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await payments.find({orderId:order})

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Order number!"};
  }
}



//fetch store
export async function fetchStoreDetailSlug(slug) {
  try {
    connectToDB();
    const result = await Store.findOne({slug});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Store!"};
  }
}


//fetch sub
export async function fetchSlug(slug) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Store.find({slug});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Store!"};
  }
}