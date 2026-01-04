"use server";
import { redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
import Store from "@/models/store"
import StoreMembership from "@/models/storeMembership"
import Menu from "@/models/menu"
import Category from "@/models/category"
import Product from "@/models/product"
import payments from "@/models/payments"

import Paystack from "@/models/paystack"
import Order from '@/models/order'
import  MenuStock  from '@/models/menuStock';
import StoreSub from '@/models/storesub'
import { revalidatePath } from "next/cache";
// signIn from NextAuth is not used server-side here; authenticate does DB check
import { hash, compare  } from "bcryptjs";
import User  from '@/models/user';
import { createSubAccount } from "./stack/sub";
import { v4 as uuidv4 } from 'uuid'
import moment from "moment";
import {fetchCountOrder, fetchLatestStockItem, fetchPaymentByOrder, fetchProductById, fetchSalesByOrderId ,
 fetchOrderItems,
 fetchOneOrder
} from "./fetch";
import validateCheckout from '@/lib/checkout'
import {updateAllPayment, updateOrderAmount, updateItemStock, updateMenuStock, updateCompletedOrderDetails, updateSuspendOrder, updateProduct } from "./update";
import Pos from './../app/[slug]/pos/page';
import withTransaction from '@/lib/withTransaction'
import InventoryTransaction from '@/models/models/InventoryTransaction'
import { getTokenFromCookies } from '@/lib/auth'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getStoreBySlug } from '@/lib/getStoreBySlug'
import { requireStoreRole } from '@/lib/requireStoreRole'
import { sendVerificationEmail } from '@/utils/email'

export const authenticate = async (prevState, formData) => {
  
  
  

  const slogan = await fetchSlug(user.email);
  if (slogan && slogan[0] && slogan[0].slug) {
    redirect(`/${slogan[0].slug}/pos`);
  }

  return { success: true };
};


export const addSub = async (prvState, formData) => {
  const { name, maxStore } =
    Object.fromEntries(formData);

  try {
    connectToDB();

    const newSubscription = new Subscription({
      name,
      maxStore,
    
    });

    await newSubscription.save();
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create product!");
  }
}




export const insertSub = async (formData) => {
 const {slug, sub, startDate, endDate} =formData
console.log('sub',slug, sub, startDate, endDate)
    try {
    connectToDB();

    const newProduct = new StoreSub({
      slug, sub, startDate, endDate
    });

    await newProduct.save();
    return{success:true,
      message:'Subscription successful.'
    }
  } catch (err) {
    console.log(err);
    return{error:"Failed to create product!"};
  }

};

export const addProduct = async (prvState, formData) => {
  const {up, id, name, barcode, cost, price, profit, qty, reOrder, expiration, category, totalValue, slug, path } =
    Object.fromEntries(formData);
  
    try {
      connectToDB();
      if(up==="true"){
await updateProduct(id,name, price, qty, category, barcode, totalValue, cost, profit, reOrder, expiration)
return{success:true}
      }else{

    // Calculate profit if not provided
    const calculatedProfit = profit || (parseFloat(price) - parseFloat(cost));

    const newProduct = new Product({
      name, barcode, price,  qty, category,totalValue, cost, profit: calculatedProfit, reOrder, expiration, slug, 
    
    });

    await newProduct.save();

    // Create inventory transaction for initial stock if qty > 0
    if (qty && parseInt(qty) > 0) {
      const InventoryTransaction = (await import('@/models/models/InventoryTransaction')).default;
      await new InventoryTransaction({
        productId: newProduct._id,
        slug: slug,
        type: 'RESTOCK',
        quantity: parseInt(qty),
        previousStock: 0,
        newStock: parseInt(qty),
        notes: 'Initial stock - Product created'
      }).save();
    }

    revalidatePath(path);
    return{success:true}
  }

  } catch (err) {
    console.log(err);
    return{error:"Failed to create product!"};
  }

};

export const AddAccount = async (prvState, formData) => {
  const { cName, code, bank, bankNum,  slug, path } =
    Object.fromEntries(formData);
    try {
      const sub= await createSubAccount(code, cName, bankNum)
      
      if(sub.status===true){
      const  payStack= sub.data.subaccount_code
       const name=cName
       const number=bankNum
       console.log(payStack)
        connectToDB();
        
        const newProduct = new Paystack({
          name,  number,bank,  slug, payStack
          
          });
          
          await newProduct.save();
          return{success:true}
        }else{
          return{success:false}
        }
  } catch (err) {
    console.log(err);
    return{error:"Failed to create account!"};
  }

};

//add new store
export const addStore = async (prvState, formData) => {
  console.log('addStore called');
  // ignore any slug provided by client: remove it before destructuring
  const formObj = Object.fromEntries(formData);
  if (Object.prototype.hasOwnProperty.call(formObj, 'slug')) delete formObj.slug;
  const { name, address, email, state, lga, opens, closes, phone, whatsapp, /* user, */ logo, image, sub, starts, ends } = formObj;
  console.log('email from formData:', email);
 
  try {
    await connectToDB();
    // require authenticated and verified user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized: login required' };
    const ownerId = session.user.id;
    let ownerDoc = await User.findById(ownerId).lean();
    if (!ownerDoc) {
      try {
        const byEmail = await User.findOne({ email: (session.user.email || '').toLowerCase() }).lean();
        console.log('findOne by email ->', byEmail ? '[FOUND]' : null, 'email:', session.user.email);
        if (byEmail) {
          // if findById failed but we located user by email, use that document
          ownerDoc = byEmail;
        }
      } catch (e) {
        console.error('findOne by email error', e);
      }

      try {
        const valid = mongoose.Types.ObjectId.isValid(ownerId);
        if (valid) {
          const asObj = new mongoose.Types.ObjectId(ownerId);
          const byObj = await User.findById(asObj).lean();
          console.log('findById with ObjectId ->', byObj ? '[FOUND]' : null);
          if (byObj) ownerDoc = byObj;
        }
      } catch (e) {
        console.error('objectid lookup error', e);
      }
    }
    if (!ownerDoc || !ownerDoc.emailVerified) return { error: 'Forbidden: email not verified' };

    // generate base slug from name: lowercase, URL-safe
    const slugify = (s) =>
      s
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const baseSlug = slugify(name || email || 'store');

    // find existing slugs that start with baseSlug
    const regex = new RegExp('^' + baseSlug + '(?:-(\\d+))?$');
    const existing = await Store.find({ slug: { $regex: '^' + baseSlug } }).select('slug');

    let finalSlug = baseSlug;
    if (existing && existing.length > 0) {
      // collect numeric suffixes
      const suffixes = existing.map((doc) => {
        const m = doc.slug.match(/-(\d+)$/);
        return m ? parseInt(m[1], 10) : (doc.slug === baseSlug ? 0 : null);
      }).filter((n) => n !== null && !isNaN(n));

      if (suffixes.length === 0) finalSlug = baseSlug;
      else {
        const max = Math.max(...suffixes);
        finalSlug = `${baseSlug}-${max + 1}`;
      }
    }

    // create store and membership inside a transaction so both succeed or fail together
    await withTransaction(async (session) => {
      const newStore = new Store({
        name,
        slug: finalSlug,
        address,
        state,
        lga,
        opens,
        email ,
        closes,
        phone,
        whatsapp,
        user: ownerId,
        logo,
        image,
        sub,
        starts,
        ends,
      });

      await newStore.save({ session });

      const newMembership = new StoreMembership({
        userId: ownerId,
        storeId: newStore._id,
        slug: finalSlug,
        role: 'OWNER'
      });
      await newMembership.save({ session });
    });
    return {
      success: true,
      slug: finalSlug,
    };
  } catch (err) {
    console.log(err);
    return { error: 'Failed to create store!' };
  }
};

//add new menu
export const addOrder= async (prvState, formData) => {
  const {slug, soldBy: soldByClient, bDate, order, payment, amount, orderId, path} =
    Object.fromEntries(formData);
  // require authenticated user via NextAuth server session
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { error: 'Unauthorized' };

  // ensure user's email is verified
  const userDoc = await User.findById(session.user.id).lean();
  if (!userDoc || !userDoc.emailVerified) return { error: 'Email not verified' };

  // fetch store and require OWNER or MANAGER role
  const store = await getStoreBySlug(slug);
  try {
    await requireStoreRole(session.user.id, store._id, ['OWNER', 'MANAGER']);
  } catch (e) {
    return { error: 'Forbidden' };
  }
  const soldBy = session.user.email || soldByClient;

  try {   
    
if(order  ==="newOrder")updateSuspendOrder(orderId)
  if(payment > 0 && amount >0){

    connectToDB(); 
    const order = await fetchOneOrder(slug)
    if(order[0]?.amount ===0 || order[0]?.amount === undefined){
      return{success:true}
    }else{

      const num = await fetchCountOrder(slug) +1
      const orderNum = slug.substring(0, 3) + num 
      
      
      const newMenu = new Order({
        slug, orderNum, soldBy, bDate,
      });
      // if(orderName==="")return{error:`Put a name for this Order`}   
      
      await newMenu.save();
    }
    
    // return{
      //   success:true,
      
      // }
      revalidatePath(path); 
      return{success:true}
    }
    } catch (err) {
      console.log(err);
      return{ error:"error in adding New Order"};
    }

};
// Sales functionality removed — sales model retained but application no longer creates Sales documents.
//add new payment
export const addPayment = async (prvState, formData) => {
  const {slug, orderId, orderNum, orderAmount,amountPaid, bal, mop, user, bDate, path, storeId, recordedBy} =
    Object.fromEntries(formData);
    let items;
  try {   
 const Payments = await fetchPaymentByOrder(orderId)
const orderItems = await fetchOrderItems(orderId)
const oItems = orderItems?.items

 let allPayments=[]
 allPayments =  Payments.map((i) => i.amountPaid)

       const amtTotal = allPayments.reduce((acc, item) => 
     acc + (item)
     ,0)

items = []
  if(amtTotal===0 && amountPaid <= orderAmount || amountPaid <= (orderAmount - amtTotal)){
     connectToDB(); 

      // Get store ID if not provided
      let finalStoreId = storeId;
      if (!finalStoreId && slug) {
        const store = await getStoreBySlug(slug);
        finalStoreId = store?._id;
      }

      const newMenu = new payments({
        storeId: finalStoreId,
        slug, 
        orderId, 
        orderNum: orderNum,
        receiptNumber: orderNum || `${slug?.substring(0, 3)}-${Date.now()}`,
        orderAmount: Number(orderAmount),
        amountPaid: Number(amountPaid),
        balance: Number(bal || 0),
        status: 'COMPLETED',
        paymentType: 'FULL',
        recordedBy: recordedBy || user,
        user, 
        bDate,
        paymentMethods: [{ method: mop?.toUpperCase() || 'CASH', amount: Number(amountPaid) }],
        // Legacy fields
        cash: mop === 'cash' ? Number(amountPaid) : 0,
        pos: mop === 'pos' ? Number(amountPaid) : 0,
        transfer: mop === 'transfer' ? Number(amountPaid) : 0
      });
   
      
      await newMenu.save();
  await updateCompletedOrderDetails(orderId, amountPaid, bal, items, orderAmount, bDate)
  // await updateAllPayment()
      revalidatePath(path); 
      return{success:"Payment Succesfull"}}
      else if(amtTotal===orderAmount){
          return{
            error : `Payment of ${amtTotal} has been made`
          }
        }
      else if(amountPaid >orderAmount){
          return{
            error : "Your Payment  is higher than what you ordered. please enter the correct Amount"
          }
        }
      else{
        return{
          error : `Payment of ${amtTotal} has been made`
        }
      }
    } catch (error) {
      console.log(error);
      return{ error:"Failed to make Payment, Please try again"};
    }

};

// add payment and create order from cart items atomically
export const addPaymentWithOrder = async (prvState, formData) => {
  const { slug, user, bDate, path, cartItems, amountPaid, mop, orderAmount, cashPaid, posPaid, transferPaid, customerId, customerName } = Object.fromEntries(formData);
  try {
    await connectToDB();
    const items = cartItems ? JSON.parse(cartItems) : [];
    // require authenticated user via NextAuth server session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: 'Unauthorized' };

    // ensure user's email is verified
    const userDoc = await User.findById(session.user.id).lean();
    if (!userDoc || !userDoc.emailVerified) return { error: 'Email not verified' };

    // fetch store and require OWNER or MANAGER role
    const store = await getStoreBySlug(slug);
    try {
      await requireStoreRole(session.user.id, store._id, ['OWNER', 'MANAGER']);
    } catch (e) {
      return { error: 'Forbidden' };
    }
    const soldBy = session.user.email || user;

    if (!items.length) return { error: 'Cart is empty' };

    // validate cart items against DB (existence, slug ownership, sufficient stock)
    try { await validateCheckout(items, slug) } catch (err) { return { error: err.message } }

    // run entire checkout flow inside a transaction
    try{
      const result = await withTransaction(async (session) => {
        // reserve stock and create inventory transactions
        const updatedProducts = [];
        const ids = items.map(i => i.product);

        // fetch fresh product docs (for price and previous stock)
        const prods = await Product.find({ _id: { $in: ids } }).session(session);
        const prodMap = new Map(prods.map(p => [String(p._id), p]));

        for (const it of items) {
          const qtyToTake = Number(it.qty || 0);
          if (qtyToTake <= 0) continue;
          const p = prodMap.get(String(it.product));
          if (!p) throw Object.assign(new Error(`Product not found ${it.product}`), { code: 'NOT_FOUND', product: it.product });
          if (p.qty < qtyToTake) throw Object.assign(new Error(`Insufficient stock for ${it.name || it.item || p._id}`), { code: 'INSUFFICIENT', product: it.product });

          // decrement
          const updated = await Product.findOneAndUpdate(
            { _id: p._id, qty: { $gte: qtyToTake } },
            { 
              $inc: { qty: -qtyToTake },
              $set: { totalValue: (p.qty - qtyToTake) * p.price }
            },
            { new: true, session }
          );
          if (!updated) throw Object.assign(new Error(`Insufficient stock for ${it.name || it.item || it.product}`), { code: 'INSUFFICIENT', product: it.product });

          // record inventory transaction
          const inv = new InventoryTransaction({
            productId: p._id,
            slug,
            type: 'SALE',
            quantity: -qtyToTake,
            previousStock: p.qty,
            newStock: updated.qty,
            orderId: null,
            notes: `Sale during checkout by ${soldBy}`,
          });
          await inv.save({ session });

          updatedProducts.push({ 
            id: p._id, 
            qty: qtyToTake, 
            price: updated.price, 
            cost: updated.cost || 0,
            newQty: updated.qty,
            profit: (updated.price - (updated.cost || 0)) * qtyToTake
          });
        }

        // create order
        const num = await fetchCountOrder(slug) + 1;
        const orderNum = slug.substring(0, 3) + num;
        const newOrder = new Order({ slug, orderNum, soldBy, bDate });
        await newOrder.save({ session });

        // compute total order amount and profit using authoritative DB prices
        let totalOrderAmount = 0;
        let totalOrderProfit = 0;
        const itemsWithCostProfit = [];
        
        for (const it of items) {
          const upd = updatedProducts.find(u => String(u.id) === String(it.product));
          const price = (upd && upd.price) || 0;
          const cost = (upd && upd.cost) || 0;
          const qty = Number(it.qty || 0);
          const amount = Number(qty * price) || 0;
          const profit = Number((price - cost) * qty) || 0;
          
          totalOrderAmount += amount;
          totalOrderProfit += profit;
          
          itemsWithCostProfit.push({
            ...it,
            price,
            cost,
            amount,
            profit
          });
        }

        // payment amount sanity
        const paid = Number(amountPaid || 0);
        if (paid > totalOrderAmount) throw Object.assign(new Error('Payment amount exceeds order total based on current prices'), { code: 'BAD_PAYMENT' });

        // finalize order with items, amount, and profit
        newOrder.items = itemsWithCostProfit;
        newOrder.amount = totalOrderAmount;
        newOrder.profit = totalOrderProfit;
        newOrder.status = 'Completed';
        newOrder.isCompleted = true;
        newOrder.bDate = bDate;
        await newOrder.save({ session });

        // update inventory transactions to reference orderId
        await InventoryTransaction.updateMany({ orderId: null, productId: { $in: ids } }, { $set: { orderId: newOrder._id } }, { session });

        // save payment with new schema
        const paymentMethodsArray = [];
        const methods = (mop || '').split(',').filter(Boolean);
        
        // Build paymentMethods array
        if (methods.includes('CASH') && Number(cashPaid || 0) > 0) {
          paymentMethodsArray.push({ method: 'CASH', amount: Number(cashPaid) });
        }
        if (methods.includes('POS') && Number(posPaid || 0) > 0) {
          paymentMethodsArray.push({ method: 'POS', amount: Number(posPaid) });
        }
        if (methods.includes('TRANSFER') && Number(transferPaid || 0) > 0) {
          paymentMethodsArray.push({ method: 'TRANSFER', amount: Number(transferPaid) });
        }

        // If no payment methods array built, use default CASH
        if (paymentMethodsArray.length === 0) {
          paymentMethodsArray.push({ method: 'CASH', amount: Number(amountPaid || 0) });
        }

        // Ensure all required fields are present
        if (!store || !store._id) {
          throw new Error('Store ID is required');
        }
        if (!orderNum) {
          throw new Error('Order number is required');
        }
        if (!soldBy) {
          throw new Error('Recorded by is required');
        }

        const newPay = new payments({ 
          storeId: store._id,
          slug, 
          orderId: newOrder._id, 
          orderNum: orderNum,
          receiptNumber: orderNum, // Use orderNum as receipt number
          paymentMethods: paymentMethodsArray,
          orderAmount: Number(orderAmount) || totalOrderAmount, 
          amountPaid: Number(amountPaid || 0),
          balance: 0,
          change: Math.max(0, Number(amountPaid || 0) - (Number(orderAmount) || totalOrderAmount)),
          status: 'COMPLETED',
          paymentType: 'FULL',
          recordedBy: soldBy,
          user: soldBy, 
          bDate: bDate,
          // Legacy fields for backward compatibility
          cash: Number(cashPaid || 0),
          pos: Number(posPaid || 0),
          transfer: Number(transferPaid || 0),
          // Customer info if provided
          ...(customerId && { customerId: customerId }),
          ...(customerName && { customerName: customerName }),
          customerType: customerId ? 'REGISTERED' : 'WALK_IN'
        });
        await newPay.save({ session });

        // Update order with amount paid
        newOrder.amountPaid = Number(amountPaid || 0);
        newOrder.bal = Math.max(0, totalOrderAmount - Number(amountPaid || 0));
        await newOrder.save({ session });

        return { success: true, orderId: newOrder._id };
      });

      if (result && result.success) {
        revalidatePath(path);
        return { success: 'Order and payment saved', orderId: result.orderId };
      }
    }catch(err){
      console.log('transaction error', err);
      console.log('Error details:', {
        store: store?._id,
        orderNum: err.message.includes('orderNum'),
        receiptNumber: err.message.includes('receiptNumber'),
        recordedBy: err.message.includes('recordedBy'),
        storeId: err.message.includes('storeId')
      });
      // If insufficient stock or other known error, return current DB stock snapshot to client
      if(err && err.code === 'INSUFFICIENT'){
        const ids = items.map(i=>i.product)
        const prods = await Product.find({_id: { $in: ids }}).lean();
        const stockUpdates = prods.map(p=>({ product: p._id, qty: p.qty || 0 }));
        return { error: err.message, stockUpdates };
      }
      if(err && err.code === 'BAD_PAYMENT'){
        return { error: err.message };
      }
      return { error: err.message || 'Failed to create order and payment' };
    }
  } catch (err) {
    console.log(err);
    return { error: 'Failed to create order and payment' };
  }
};



//add new user
export const addUser= async (prvState,formData) => {
  const { name, email, password, image  } =
    Object.fromEntries(formData);

  try {
    connectToDB();
    const user = await User.findOne({ email: email });

    // if (!user){

      
      const hashPasswrd = await hash(password, 12)
      // generate email verification token (plain) and store a hashed value + expiry
      const plainEmailToken = uuidv4();
      const hashedEmailToken = await hash(plainEmailToken, 12);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const newUser = new User({
        name,
        email,
        password: hashPasswrd,
        image,
        // keep existing emailToken field for compatibility (stores plain token)
        emailToken: plainEmailToken,
        // new fields: store hashed token and expiry; do not mark email as verified
        emailVerificationToken: hashedEmailToken,
        emailVerificationExpires: expires,
        emailVerified: null,
      });
      
      await newUser.save();
      
      // Send verification email
      const emailResult = await sendVerificationEmail(email, plainEmailToken);
      
      if (!emailResult.ok) {
        console.error('Failed to send verification email:', emailResult.error);
        return { 
          success: true, 
          warning: 'User created but verification email failed to send. Please check your email configuration.' 
        };
      }
      
      return { success: true, message: 'User has been created and verification email sent.' };
     
  } catch (err) {
    console.error('addUser error:', err);
    return{error:"Failed to create user!"};
  }

};

//add new menu
export const addMenu= async (prvState, formData) => {
  const { name, storeid, slug, path} =
    Object.fromEntries(formData);
  try {   
    connectToDB(); 
  

       let newMenu = new Menu({
        name, slug
      });
      await newMenu.save();
      
  
      revalidatePath(path); 
      return{
        success:true
      }
  } catch (err) {
    console.log(err);
    return{error:"Failed to create menu!"};
  }

};




//fetch account
export async function fetchAccount(slug) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Paystack.find({slug, isDeleted:false});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch acc!"};
  }
}


//fetch sub
export async function fetchOrders(slug) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug}).sort({createdAt:-1});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}
export async function fetchOrdersBySlug(slug) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, status:'pending'});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}
export async function fetchOrdersBySlugandDate(slug) {
  var date = moment();

var currentDate = date.format('D/MM/YYYY');
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, orderDate:currentDate});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}
export async function fetchOrdersBySlugPending(slug) {
  var date = moment();

var currentDate = date.format('D/MM/YYYY');
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, orderDate:currentDate, isDeleted:false, status:'pending'});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}
export async function fetchOrdersBySlugCompleted(slug) {
  var date = moment();

var currentDate = date.format('D/MM/YYYY');
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, orderDate:currentDate, isDeleted:false, status:'completed'});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}
export async function fetchOrdersBySlugCancelled(slug) {
  var date = moment();

var currentDate = date.format('D/MM/YYYY');
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, orderDate:currentDate, isDeleted:false, status:'cancelled'});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Orders!"};
  }
}


//fetch sub
export async function fetchSlug(email) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Store.find({user:email});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Store!"};
  }
}
//fetch sub
export async function fetchMenuSlug(slug) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Menu.find({slug});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch menu!"};
  }
}

//fetch sub
export async function fetchAllProducts() {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Product.find({isDeleted:false}).sort({createdAt:-1})

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Product!"};
  }
}
//fetch products by menu
export async function fetchProductsByMenu(params) {
  const {slug, id }=params
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Product.find({$and:[{slug}, {menu: id}, {isDeleted:false}]});
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Product!"};
  }
}
//fetch products by category
export async function fetchProductsByCategory(slug, id, cat) {
  
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Product.find({$and:[{slug}, {menu: id}, {category: cat}, {isDeleted:false}]});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Product!"};
  }
}

//fetch category by menu
export async function FetchCategoryByMenu(params) {
  const {slug, id }=params

  try {
    await connectToDB();

    const result = await Category.find({$and:[{slug}, {menu: id}, {isDeleted:false}]});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Category!"};
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
    return{error:"Failed to fetch Subscription!"};
  }
}
//add new menu
export const addCategory= async (prvState, formData) => {
  const { name, slug, path} =
  Object.fromEntries(formData);
  try {   
    connectToDB(); 
      const newCategory = new Category({
        name,  slug
      });
      
      await newCategory.save();
  
      revalidatePath(path); 
      return{
        success:true
      }
  } catch (err) {
    console.log(err);
    return{error:"Failed to fetch Category!"};
  }

}; 


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
//fetch userStores
export async function fetchStores(id) {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Store.find({user:id});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
}
//fetch userStores
export async function fetchAllStores() {
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Store.find({});

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch stores!");
  }
}
export async function fetchOneOrderSlug(slug, email) {
console.log('slug', slug, email)
  await connectToDB();
 
  try {
    connectToDB();
    const result = await Order.find({slug, email}).sort({createdAt:-1}).limit(1)

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
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

//create payment logic
export async function deleteMenu() {
  
  return {
    success: true,
    id: session?.id,
  };
}
//create payment logic
export async function deleteProduct() {
  
  return {
    success: true,
    id: session?.id,
  };
}


//update post action
export async function updateProd(id, pathToRevalidate) {
  await connectToDB();
  console.log('del', id)
  await Product.findOneAndUpdate(
    {
      _id: id,
    },
    {
      isDeleted: true,     
    },
    { new: true },
  
  );
  
  revalidatePath(pathToRevalidate);
}

//update post action
export async function updateProdPrice(id, price, qty, pathToRevalidate) {
  console.log('up',id, price, qty)
  await connectToDB();
  
  // Calculate totalValue
  const totalValue = Number(qty) * Number(price);
  
  await Product.findOneAndUpdate(
    {
      _id: id,
    },
    {
      price,    
      qty,
      totalValue
    },
    { new: true }
  );
  
  revalidatePath(pathToRevalidate);
}

//update post action
export async function updateCat(id, pathToRevalidate) {
  await connectToDB();
  await Category.findOneAndUpdate(
    {
      _id: id,
    },
    {
      isDeleted: true,     
    },
    { new: true }
  );

  revalidatePath(pathToRevalidate);
}

//update post action
export async function updateAcc(id, pathToRevalidate) {
  await connectToDB();
  await Paystack.findOneAndUpdate(
    {
      _id: id,
    },
    {
      isDeleted: true,     
    },
    { new: true }
  );

  revalidatePath(pathToRevalidate);
}

export async function updateOrder(id, payment) {
  console.log('p',id, payment)
  await connectToDB();
  await Order.findOneAndUpdate(
    {
      _id: id,
    },
    {
      payment,     
    },
    { new: true }
  );

}
//update post action
export async function updateStoreSub(slug, sub,starts, ends, reference) {
  console.log(starts, ends, reference, 'dd')
  await connectToDB();
  await Store.findOneAndUpdate(
    {
      slug
    },
    {
      sub,
    starts,
    ends
    },
    { new: true }
  );

}
//add new inventory
export const addMenuStock= async (prevState, formData) => {
  const {slug, itemId, item,  action,  qty, balanceStock, price,  user,  bDate, path} =
    Object.fromEntries(formData);
    const prod = await fetchProductById(itemId)
 const pStock = prod[0].qty
 const balStock = parseInt(pStock) + parseInt(qty)
 const balStock2 = parseInt(pStock) - parseInt(qty)
  try {   
    if(action==="Return"){
   const totalValue = balStock * price
   connectToDB(); 
   await updateItemStock(itemId, balStock, totalValue, path)
   const newMenu = new MenuStock({
     slug, itemId, item,  stock: pStock, action,  qty, balanceStock:balStock, price, user,  bDate,
    });
    await newMenu.save();
   revalidatePath(path);   
    return{
      success:true
    }
    }else{
    connectToDB(); 
    const totalValue = balStock2 * price
    await updateItemStock(itemId, balStock2, totalValue, path)

     const newMenu = new MenuStock({
      slug, itemId, item,  stock:pStock, action, qty, balanceStock:balStock2, price, user,  bDate,
       });
      
      await newMenu.save();
      revalidatePath(path); 
  
      return{
        success:true,

      }}

  } catch (err) {
    console.log(err);
    return{
      error:"Failed to add Stock"
    }
  }

};
