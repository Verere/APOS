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

import { revalidatePath } from "next/cache";
import { signIn } from "@/auth";
import { hash } from "bcryptjs";
import User  from '@/models/user';
import  Sales  from '@/models/sales';
import Order  from '@/models/order';

//update sales qty
export async function updateSalesAction(id, qty, price, stock, path) {
  console.log('u', stock)
    await connectToDB();
    await Sales.findOneAndUpdate(
      {
        _id: id,
      },
      {
       qty:  qty,
       stock:stock,
       amount: price*qty,

      },
      { new: true }
    );
  
    revalidatePath(path);
  }
//update sales qty
export async function updateItemStock(id, qty, totalValue, path) {
    await connectToDB();
  
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
  
    revalidatePath(path);
  }
export async function updateSalesCancel(id, path) {
    await connectToDB();
 
    await Sales.findOneAndUpdate(
      {
        _id: id,
      },
      {
        isCancelled:  true,

      },
      { new: true }
    );
  
    revalidatePath(path);
  }
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
export async function updateEodCancel(id, ) {
    await connectToDB();
 
    await Sales.findOneAndUpdate(
      {
        _id: id,
      },
      {
        isCancelled:  true,

      },
      { new: true }
    );
  
  }
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
export async function updateCompletedOrderDetails(id, amountPaid, bal, items, orderAmount) {
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
       items
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
//update order completed
export async function updateProduct(idd,  price, qty, category, barcode, totalValue ) {
  console.log('updtn',idd, price, totalValue)
  await connectToDB();
   
    await Product.findOneAndUpdate(
      {
        _id: idd,
      },
      {
   
        price, qty, category, barcode, totalValue
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
