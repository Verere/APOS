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
// Sales model is retained (src/models/sales.js) but fetch helpers for sales are deprecated.
import Credits from "@/models/credit"
import Complimentary from "@/models/complimentary"
import Customer from "@/models/customer"

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

  //fetch customers by store
  export async function fetchCustomers(slug) {
    try {
      await connectToDB();
      
      const store = await Store.findOne({ slug });
      if (!store) {
        return [];
      }

      const customers = await Customer.find({ 
        storeId: store._id,
        isDeleted: false 
      })
        .select('name email phone address totalSpent')
        .sort({ name: 1 })
        .lean();
  
      return JSON.parse(JSON.stringify(customers));
    } catch (err) {
      console.log('Error fetching customers:', err);
      return [];
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
        const result = await Product.find({slug, isDeleted:false, name: { $regex: regex }})
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
  // fetch all stores a user belongs to (returns array of { storeId, name, role })
  export async function fetchUserStores(userId) {
    if (!userId) return [];
    await connectToDB();
    console.log('fetching stores for user:', userId)
    try {
      const StoreMembership = await import('@/models/storeMembership').then(m => m.default || m);
      const Store = await import('@/models/store').then(m => m.default || m);

      const memberships = await StoreMembership.find({ userId, isDeleted: { $ne: true } }).lean();
      if (!memberships || memberships.length === 0) return [];

      const storeIds = memberships.map(m => m.storeId);
      const stores = await Store.find({ _id: { $in: storeIds }, isDeleted: { $ne: true } }).select('name').lean();
      const storeMap = new Map(stores.map(s => [String(s._id), s]));

      return memberships.map(m => ({ storeId: m.storeId, name: storeMap.get(String(m.storeId))?.name || null, role: m.role }));
    } catch (err) {
      console.error('fetchUserStores error:', err);
      return [];
    }
  }

  // fetch memberships for a user (returns array of { storeId, slug, role })
  export async function fetchUserMemberships(userId) {
    if (!userId) return [];
    await connectToDB();
    try {
      const StoreMembership = await import('@/models/storeMembership').then(m => m.default || m);

      const memberships = await StoreMembership.find({ userId, isDeleted: { $ne: true } }).select('storeId slug role').lean();
      if (!memberships || memberships.length === 0) return [];

      return memberships.map(m => ({ storeId: m.storeId, slug: m.slug, role: m.role }));
    } catch (err) {
      console.error('fetchUserMemberships error:', err);
      return [];
    }
  }
  // fetch memberships for a user (returns array of { storeId, slug, role })
  export async function fetchAllstoreMembers(slug) {
    if (!slug) return [];
    await connectToDB();
    try {
      const StoreMembership = await import('@/models/storeMembership').then(m => m.default || m);

      const memberships = await StoreMembership.find({ slug, isDeleted: { $ne: true } }).select('storeId slug role').lean();
      if (!memberships || memberships.length === 0) return [];

      return memberships.map(m => ({ storeId: m.storeId, slug: m.slug, role: m.role }));
    } catch (err) {
      console.error('fetchUserMemberships error:', err);
      return [];
    }
  }
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
    await connectToDB();
   
    try {
      connectToDB();
      const result = await Order.find({orderNum:orderId})
  
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
      const result = await Order.find({slug}).sort({createdAt:"desc"})
  
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
  
  // fetch sales helpers removed — return empty results to preserve API compatibility
  export async function fetchSalesByMenuId(order) {
    await connectToDB();
    return [];
  }

  export async function fetchSalesByOrderId(orderId) {
    await connectToDB();
    try {
      const Sales = await import('@/models/sales').then(m => m.default || m);
      const result = await Sales.find({ order: orderId, isCancelled: { $ne: true } }).lean();
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.error('fetchSalesByOrderId error:', err);
      return [];
    }
  }
  
  //fetch sales by location
export async function fetchAllPaymentsByDates(slug) {
  console.log('slug', slug)
    await connectToDB();
   
    try {
      connectToDB();
      const result = await payments.find({slug}).sort({'createdAt':'desc'})
  
      return JSON.parse(JSON.stringify(result));
    } catch (err) {
      console.log(err);
      return{error:"Failed to fetch Order number!"};
    }
  }
  
  //fetch sales by location
export async function fetchAllPayments(slug) {
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
  
  //fetch sales by location
export async function fetchAllPaymentsByDate(slug, Dte) {
  console.log('slug', slug, Dte)
    await connectToDB();
   
    try {
      connectToDB();
      const result = await payments.find({slug, bDate:Dte}).sort({'createdAt':'desc'})
  
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

// Sync products with inventory transactions - creates initial transaction for products without any
export async function syncProductsWithInventory(slug) {
  if (!slug) {
    return { error: "Slug is required" };
  }

  await connectToDB();

  try {
    const InventoryTransaction = (await import('@/models/models/InventoryTransaction')).default;
    const Product = (await import('@/models/product')).default;

    // Fetch all products for the slug
    const products = await Product.find({ slug, isDeleted: false }).lean();

    if (!products || products.length === 0) {
      return { success: true, message: "No products found for this store", synced: 0 };
    }

    let syncedCount = 0;

    for (const product of products) {
      // Check if product already has inventory transactions
      const existingTransaction = await InventoryTransaction.findOne({ 
        productId: product._id 
      });

      // If no transaction exists, create initial inventory transaction
      if (!existingTransaction && product.qty !== undefined) {
        await new InventoryTransaction({
          productId: product._id,
          slug,
          type: 'RESTOCK',
          quantity: product.qty || 0,
          previousStock: 0,
          newStock: product.qty || 0,
          notes: 'Initial inventory sync after login',
        }).save();

        syncedCount++;
      }
    }

    return { 
      success: true, 
      message: `Successfully synced ${syncedCount} products with inventory`,
      synced: syncedCount,
      total: products.length
    };

  } catch (err) {
    console.error('syncProductsWithInventory error:', err);
    return { error: "Failed to sync products with inventory!" };
  }
}