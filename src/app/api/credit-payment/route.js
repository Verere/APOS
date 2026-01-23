import { NextResponse } from "next/server";
import connectDB from "@/utils/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Credit from "@/models/credit";
import CreditPayment from "@/models/creditPayment";
import Customer from "@/models/customer";
import Order from "@/models/order";
import Store from "@/models/store";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creditId, amount, paymentMethod, notes, receiptNumber } = await req.json();

    if (!creditId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Credit ID and valid amount are required" },
        { status: 400 }
      );
    }

    // Start transaction
    const transactionSession = await mongoose.startSession();
    transactionSession.startTransaction();

    try {
      // Get credit record with customer and order details
      const credit = await Credit.findById(creditId)
        .populate('customerId')
        .populate('orderId')
        .session(transactionSession);

      if (!credit) {
        await transactionSession.abortTransaction();
        return NextResponse.json({ error: "Credit record not found" }, { status: 404 });
      }

      // Check if payment amount exceeds remaining balance
      const remainingBalance = credit.amount - (credit.amountPaid || 0);
      if (amount > remainingBalance) {
        await transactionSession.abortTransaction();
        return NextResponse.json(
          { error: `Payment amount (₦${amount}) exceeds remaining balance (₦${remainingBalance})` },
          { status: 400 }
        );
      }

      // Generate receipt number if not provided
      const finalReceiptNumber = receiptNumber || `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create payment record
      const payment = await CreditPayment.create([{
        storeId: credit.storeId,
        creditId: credit._id,
        orderId: credit.orderId,
        customerId: credit.customerId,
        amount,
        paymentMethod: paymentMethod || 'CASH',
        receiptNumber: finalReceiptNumber,
        notes,
        recordedBy: session.user.name || session.user.email
      }], { session: transactionSession });

      // Update credit record
      const newAmountPaid = (credit.amountPaid || 0) + amount;
      credit.amountPaid = newAmountPaid;
      // Set isPaid to true if amountPaid equals or exceeds amount
      if (typeof credit.amount === 'number' && typeof newAmountPaid === 'number' && newAmountPaid >= credit.amount) {
        credit.isPaid = true;
      }
      await credit.save({ session: transactionSession });

      // Update customer's outstandingBalance
      const customer = await Customer.findById(credit.customerId).session(transactionSession);
      if (customer) {
        // Calculate all outstanding credits for this customer
        const allCredits = await Credit.find({ customerId: customer._id, isCancelled: { $ne: true } }).session(transactionSession);
        const totalOutstanding = allCredits.reduce((sum, c) => sum + Math.max((c.amount || 0) - (c.amountPaid || 0), 0), 0);
        customer.outstandingBalance = totalOutstanding;
        await customer.save({ session: transactionSession });
      }

      // Commit transaction
      await transactionSession.commitTransaction();

      return NextResponse.json({
        success: true,
        payment: payment[0],
        credit: {
          _id: credit._id,
          amount: credit.amount,
          amountPaid: credit.amountPaid,
          remainingBalance: credit.amount - credit.amountPaid,
          paid: credit.paid
        }
      });

    } catch (error) {
      await transactionSession.abortTransaction();
      throw error;
    } finally {
      transactionSession.endSession();
    }

  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch payment history for a credit
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const creditId = searchParams.get('creditId');

    if (!creditId) {
      return NextResponse.json(
        { error: "Credit ID is required" },
        { status: 400 }
      );
    }

    const payments = await CreditPayment.find({ creditId })
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json({ payments });

  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
