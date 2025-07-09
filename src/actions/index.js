"use server";
import { redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
import Store from "@/models/store"
import Menu from "@/models/menu"
import Category from "@/models/category"
import Product from "@/models/product"
import payments from "@/models/payments"
import Room from "@/models/room"
import MyTable from "@/models/mytable"
import Paystack from "@/models/paystack"
import Order from '@/models/order'
import  MenuStock  from '@/models/menuStock';
import Sales from '@/models/sales'
import StoreSub from '@/models/storesub'
import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { hash } from "bcryptjs";
import User  from '@/models/user';
import { createSubAccount } from "./stack/sub";
import { v4 as uuidv4 } from 'uuid'
import moment from "moment";
import { fetchCountOrder, fetchLatestStockItem, fetchPaymentByOrder, fetchProductById, fetchSalesByOrderId ,
 fetchOrderItems,
 fetchOneOrder
} from "./fetch";
import {updateAllPayment, updateOrderAmount, updateSalesAction, updateItemStock, updateMenuStock, updateCompletedOrderDetails, updateSuspendOrder, updateProduct } from "./update";
import Pos from './../app/[slug]/pos/page';



export const authenticate = async (prevState, formData) => {
  const { email, password } = Object.fromEntries(formData);
  try {
    await signIn("credentials", { email, password });
    return{success:true}
  } catch (error) {
    if(!error.type){
      const user = await currentUser(email)
      if(!user)return{error:"Invalid Username or Password"}
      const slogan = await fetchSlug(user._id)
      if(slogan){  redirect(`/${slogan[0]?.slug}/pos`)}
  

    } 
    if (error) {
      switch (error.type) {
        case 'CredentialsSignin':
          console.log(error);
          return{ error:"Invalid Credentials"};
        default:
          return error.type;
      }
    }
    }
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
  const {up, id, name, barcode, price, qty, category, totalValue, slug, path } =
    Object.fromEntries(formData);
  
    try {
      if(up==="true"){
await updateProduct(id, price, qty, category, barcode, totalValue)
return{success:true}
      }else{
    connectToDB();

    const newProduct = new Product({
      name, barcode, price,  qty, category,totalValue, slug, 
    
    });

    await newProduct.save();
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
  const { name, slug, address, email, state, lga, opens, closes, phone, whatsapp, user, logo, image, sub, starts, ends   } =   Object.fromEntries(formData);
  try {
    connectToDB();

    const newStore = new Store({
      name,slug, address, state, lga, opens, email, closes, phone, whatsapp, user, logo, image, sub, starts, ends 
    });

    await newStore.save();
    return{
      success: true,
    }
  } catch (err) {
    console.log(err);
    return{error:"Failed to create store!"};
  }

};

//add new menu
export const addOrder= async (prvState, formData) => {
  const {slug, soldBy, bDate, order, payment, amount, orderId, path} =
    Object.fromEntries(formData);

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
//add new sales
export const addSales = async (prvState, formData) => {
  const {order, slug, orderNum, itemId, barcode, item, qty, price, amount, soldBy, stock, bDate, totalOrder, status, path} =
    Object.fromEntries(formData);
    
     const Payments = await fetchPaymentByOrder(order)
   
    if(Payments.length !== 0)return{error:"Payment has been taken for this order. Please create a new order"}
    const sales = await fetchSalesByOrderId(order)


    const  sale= sales.filter(item => item.itemId === itemId)
    const amountTotal = parseInt(totalOrder) + parseInt(price)
    
    if(status === "Completed" ){
      return{error:"This Order is Completed. Create a new Order"}
    }
    
    if(stock< 1 || stock=== 0){
      return{error:"This Product has Zero Stock. Please restock"}
    }
    // if(sale && sale.length){

      const prvSales = sale[0]?._id
      console.log(sale)
    // }
      
      
      if(prvSales  !== undefined){
        console.log('updating sales')
    const qtyy = sale[0]?.qty 
    const pStock = sale[0]?.stock

    const nqty = parseInt(qtyy +1)
        
        const balanceStock = parseInt(pStock-1)
        const totalValue = price*balanceStock
        console.log('p qty', qtyy, 'new qty', nqty, 'p st', pStock, 'bal st', balanceStock)
        await  updateSalesAction(prvSales, nqty, price, balanceStock, path)
        
        await  updateItemStock(itemId, balanceStock, totalValue, path)
        await  updateMenuStock(itemId, nqty, balanceStock, path)       
        await   updateOrderAmount(order, amountTotal)
            revalidatePath(path); 
        return{success:true}
      }else{
        try {   
          console.log('adding sales')
          
          const balanceStock = stock-qty
          console.log('qty', qty, 'p st', stock, 'bal st', balanceStock)
          const totalValue = price*balanceStock
   // add new sales")
   const form=new FormData
   form.set("slug", slug)
   form.set("itemId", itemId)
   form.set("item", item)
   form.set("stock", stock)
   form.set("action", "Sales")
   form.set("qty", qty)
   form.set("price", price)
   form.set("path", path)
   form.set("balanceStock", balanceStock)
   form.set("user", soldBy)

   form.set("bDate", bDate)
   await addMenuStock({},form)
await  updateItemStock(itemId, balanceStock, totalValue, path)

updateOrderAmount(order, amountTotal)
    connectToDB(); 

      const newMenu = new Sales({
        order,  slug, orderNum,itemId, item, qty, stock:balanceStock, price, amount, soldBy, bDate,
      });
      
      await newMenu.save();

      revalidatePath(path); 
      return{success:true}
    } catch (err) {
      console.log(err);
      return{ error:"Failed to add Product to Cart, Please try again"};
    }
  }
  
};
//add new payment
export const addPayment = async (prvState, formData) => {
  const {slug, orderId, orderNum, orderAmount,amountPaid, bal, mop, user, bDate, path} =
    Object.fromEntries(formData);
    let items;
  try {   
 const Payments = await fetchPaymentByOrder(orderId)
const sales = await fetchSalesByOrderId(orderId)
const orderItems = await fetchOrderItems(orderId)
const oItems = orderItems?.items

 let allPayments=[]
 allPayments =  Payments.map((i) => i.amountPaid)

       const amtTotal = allPayments.reduce((acc, item) => 
     acc + (item)
     ,0)

if(oItems && oItems.length){
items = []
}else{

  items =sales

}
  if(amtTotal===0 && amountPaid <= orderAmount || amountPaid <= (orderAmount - amtTotal)){
     connectToDB(); 

      const newMenu = new payments({
        slug, orderId, receipt:orderNum, orderAmount, amountPaid, mop, user, bDate
      });
   
      
      await newMenu.save();
  await updateCompletedOrderDetails(orderId, amountPaid, bal, items, orderAmount)
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



//add new user
export const addUser= async (prvState,formData) => {
  const { name, email, password, image  } =
    Object.fromEntries(formData);

  try {
    connectToDB();
    const user = await User.findOne({ email: email });

    // if (!user){

      
      const hashPasswrd = await hash(password, 12)
      const emailToken = uuidv4();
      const newUser = new User({
        name, email, password:hashPasswrd, image, emailToken
      });
      
      await newUser.save();
      // await sendVerificationEmail(email, emailToken);
      // message: 'User has been created and verification email sent.' ,
      // redirect("/store");
      return   {success:true,
      message: 'User has been created.' ,
    }
     
  } catch (err) {
    console.log(err);
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
  await Product.findOneAndUpdate(
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
export async function updateProdPrice(id, price, qty, pathToRevalidate) {
  console.log('up',id, price, qty)
  await connectToDB();
  await Product.findOneAndUpdate(
    {
      _id: id,
    },
    {
      price,    
      qty 
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
