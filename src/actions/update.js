"use server";
import {redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
// import Hotel from "@/models/hotel"
import Store from '@/models/store'
import Menu from "@/models/menu"
import payments from "@/models/payments"
import MenuStock from "@/models/menuStock"
import Group from "@/models/group"
import Product from "@/models/product"
// Stock model removed; historical stock movements are handled via InventoryTransaction

import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { hash } from "bcryptjs";
import User  from '@/models/user';
import Order  from '@/models/order';

//update sales qty
// Sales operations removed — Sales model retained but application no longer updates sales documents.
//update sales qty
export async function updateItemStock(id, qty, totalValue, path) {
    await connectToDB();
  
    const prev = await Product.findById(id).lean();
    const prevQty = prev ? (prev.qty || 0) : 0;

    await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
       qty,
       totalValue

      },
      { new: true }
    );

    // record stock movement in Stock collection
    try{
      const change = qty - prevQty;
      if(change !== 0){
        const type = change < 0 ? 'out' : 'in';
        await Stock.addStockMovement({ product: id, change: Math.abs(change), type, reference: null, notes: `sync from updateItemStock`, location: undefined });
      }
    }catch(err){
      console.error('Failed recording stock movement', err)
    }

    revalidatePath(path);
  }
// Sales cancel helper removed.
export async function updateBarcode(id, barcodes, pathname) {
    await connectToDB();
 
     await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        barcode:barcodes,

      },
      { new: true }
    );
  
    revalidatePath(pathname);
  }
// EOD sales cancel removed.
//update order suspended
export async function updateSuspendOrder(id) {
    await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status:"Suspended",
       isSuspended: true
      },
      { new: true }
    );
  
  }
//update order canceled
export async function updateCancelOrder(id) {
    await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status:"Cancelled",
       isCancelled: true
      },
      { new: true }
    );
  
  }
//update order completed
export async function updateCompletedOrder(id) {
    await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status:"Completed",
       isCompleted: true
      },
      { new: true }
    );
  
  }
export async function updateCompletedOrderDetails(id, amountPaid, bal, items, orderAmount, bDate) {
    await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status:"Completed",
       isCompleted: true, 
       amount: orderAmount,
       amountPaid,
       bal, 
       items,
       bDate
      },
      { new: true }
    );
  
  }
//update order completed
export async function updateMenuStock(idd, qtyy, balanceStock,  ) {
  await connectToDB();
   
    await MenuStock.findOneAndUpdate(
      {
        _id: idd,
      },
      {
   
   qty: qtyy, 
   balanceStock, 
      },
      { new: true }
    );
  
  }
//update order completed
export async function updateOrderAmount(idd,  amountTotal ) {
  await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        _id: idd,
      },
      {
   
    amount:amountTotal
      },
      { new: true }
    );
  
  }
export async function updateOrderDate() {
  await connectToDB();
   
    await Order.findOneAndUpdate(
      {
        orderNum: 'uz-2090',
      },
      {
   
   bDate:'8/08/2025'
      },
      { new: true }
    );
  
  }
export async function updatePassword(email, password) {
  console.log('pass', email, password)
   const hashPasswrd = await hash(password, 12)
  await connectToDB();
  // const user = await User.findOne({ email: email });
   
    await User.findOneAndUpdate(
      {
        email
      },
      {
   
   password:hashPasswrd
      },
      { new: true }
    );
  
  }
//update order completed
export async function updateProduct(idd, name,  price, qty, category, barcode, totalValue , cost, profit, reOrder, expiration) {
  console.log('updtn',cost, profit, reOrder, expiration)
  await connectToDB();
   
    await Product.findOneAndUpdate(
      {
        _id: idd,
      },
      {
   
       name, price, qty, category, barcode, totalValue, isDeleted:false, cost, profit, reOrder, expiration
      },
      { new: true }
    );
  
  }
export async function updateAllPayment() {
  console.log('updated')
  await connectToDB();
   
    await payments.updateMany(
      {
        user: '',
      },
      {
   
        slug:'uz-mall',
      },
      { multi: true }
    );
  
  }
