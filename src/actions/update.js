"use server";
import {redirect } from "next/navigation";
import connectToDB from "@/utils/connectDB";
import Subscription from "@/models/subscription"
// import Hotel from "@/models/hotel"
import Store from '@/models/store'
import Menu from "@/models/menu"
import payments from "@/models/payments"
import Group from "@/models/group"
import Product from "@/models/product"
import Customer from '@/models/customer'
import Credit from '@/models/credit'
import Complimentary from '@/models/complimentary'
// Stock model removed; historical stock movements are handled via InventoryTransaction
import { applyInventoryChange } from '@/lib/inventoryService'
import withTransaction from '@/lib/withTransaction'

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
    if (!prev) {
      throw new Error('Product not found')
    }

    const prevQty = prev ? (prev.qty || 0) : 0;

    const nextQty = Number(qty || 0)
    const change = nextQty - prevQty

    if (change !== 0) {
      await applyInventoryChange({
        productId: id,
        slug: prev.slug,
        quantityChange: change,
        type: 'ADJUSTMENT',
        notes: 'sync from updateItemStock',
      })
    } else {
      await Product.findOneAndUpdate(
        { _id: id },
        { totalValue },
        { new: true }
      )
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
export async function updateCancelOrder(id, cancellationReason = '', cancelledBy = '') {
    await connectToDB();

    try {
      const result = await withTransaction(async (session) => {
        const order = await Order.findById(id).session(session)
        if (!order) {
          throw new Error('Order not found')
        }

        if (order.isCancelled) {
          return { success: true, message: 'Order already cancelled', orderId: String(order._id) }
        }

        const reasonText = String(cancellationReason || '').trim()
        if (!reasonText) {
          throw new Error('Cancellation reason is required')
        }
        const cancelledByText = String(cancelledBy || '').trim() || 'system'

        // Reverse stock movement by returning sold quantities back into inventory.
        for (const item of order.items || []) {
          const productId = item?.productId || item?.product
          const quantity = Number(item?.quantity ?? item?.qty ?? 0)

          if (!productId || !Number.isFinite(quantity) || quantity <= 0) continue

          await applyInventoryChange({
            productId,
            slug: order.slug,
            quantityChange: quantity,
            type: 'RETURN',
            notes: `Order cancellation restock for ${order.orderNum}`,
            orderId: order._id,
            session,
          })
        }

        await payments.updateMany(
          { orderId: order._id },
          {
            $set: {
              status: 'CANCELLED',
              isCancelled: true,
              refundReason: reasonText,
              notes: `Order cancelled: ${reasonText}`,
              updatedBy: cancelledByText,
              updatedAt: new Date(),
            },
          },
          { session }
        )

        const credit = await Credit.findOne({ orderId: order._id, isCancelled: { $ne: true } }).session(session)
        if (credit) {
          const outstandingCredit = Math.max(0, Number(credit.amount || 0) - Number(credit.amountPaid || 0))

          credit.isCancelled = true
          credit.updatedBy = cancelledByText
          credit.updatedAt = new Date()
          await credit.save({ session })

          if (credit.customerId) {
            const customer = await Customer.findById(credit.customerId).session(session)
            if (customer) {
              customer.outstandingBalance = Math.max(0, Number(customer.outstandingBalance || 0) - outstandingCredit)
              customer.totalPurchases = Math.max(0, Number(customer.totalPurchases || 0) - 1)
              customer.totalSpent = Math.max(0, Number(customer.totalSpent || 0) - Number(order.amount || 0))
              await customer.save({ session })
            }
          }
        }

        if (order.transactionType === 'COMPLIMENTARY') {
          await Complimentary.updateMany(
            { orderNum: order.orderNum, isCancelled: { $ne: true } },
            {
              $set: {
                isCancelled: true,
                updatedBy: cancelledByText,
                updatedAt: new Date(),
              },
            },
            { session }
          )
        }

        order.status = 'Cancelled'
        order.isCancelled = true
        order.isCompleted = false
        order.cancellationReason = reasonText
        order.cancelledBy = cancelledByText
        order.cancelledAt = new Date()
        order.updatedBy = cancelledByText
        order.updatedAt = new Date()
        await order.save({ session })

        return { success: true, message: 'Order cancelled successfully', orderId: String(order._id) }
      })

      return result
    } catch (error) {
      console.error('updateCancelOrder error:', error)
      return { error: error?.message || 'Failed to cancel order' }
    }
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
  // Deprecated: legacy MenuStock writes are disabled.
  return { success: true, deprecated: true };
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
export async function updateProduct(idd, name,  price, qty, category, barcode, totalValue , cost, profit, reOrder, expiration, prices = {}) {
  console.log('updtn',cost, profit, reOrder, expiration)
  await connectToDB();
   
    await Product.findOneAndUpdate(
      {
        _id: idd,
      },
      {
   
       name, price, qty, category, barcode, totalValue, isDeleted:false, cost, profit, reOrder, expiration
      , prices
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
