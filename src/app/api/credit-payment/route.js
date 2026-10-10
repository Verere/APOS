import { NextResponse } from "next/server";
import connectDB from "@/utils/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Credit from "@/models/credit";
import CreditPayment from "@/models/creditPayment";
import Customer from "@/models/customer";
import Order from "@/models/order";
import Store from "@/models/store";
import StoreSettings from "@/models/storeSettings";
import WalletTransaction from "@/models/walletTransaction";
import withTransaction from "@/lib/withTransaction";
import { toClientSafeDbError } from "@/lib/dbError";

function paymentError(message, status) {
  return Object.assign(new Error(message), { status });
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creditId, amount, paymentMethod, notes, receiptNumber, otherPaymentMethod, bankName, reference } = await req.json();
    const paymentAmount = Number(amount);

    if (!creditId || !Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Credit ID and valid amount are required" },
        { status: 400 }
      );
    }

    const result = await withTransaction(async (transactionSession) => {
      const credit = await Credit.findById(creditId).session(transactionSession);
      if (!credit) throw paymentError("Credit record not found", 404);

      const remainingBalance = credit.amount - (credit.amountPaid || 0);
      if (paymentAmount > remainingBalance) {
        throw paymentError(
          `Payment amount (₦${paymentAmount}) exceeds remaining balance (₦${remainingBalance})`,
          400
        );
      }

      const normalizedPaymentMethod = String(paymentMethod || 'CASH').trim().toUpperCase();
      const normalizedOtherPaymentMethod = String(otherPaymentMethod || '').trim();
      const normalizedBankName = String(bankName || '').trim();
      const normalizedReference = String(reference || '').trim();
      const settings = await StoreSettings.findOne({ storeId: credit.storeId }).session(transactionSession).lean();

      if (normalizedPaymentMethod === 'OTHER' && !(settings?.otherPaymentMethods || []).includes(normalizedOtherPaymentMethod)) {
        throw paymentError('Invalid or missing Other payment method', 400);
      }
      if (normalizedPaymentMethod === 'TRANSFER' && (!(settings?.bankNames || []).includes(normalizedBankName) || !normalizedReference)) {
        throw paymentError('Invalid or missing transfer bank/reference', 400);
      }

      const customer = await Customer.findById(credit.customerId).session(transactionSession);
      if (!customer) throw paymentError('Customer record not found for this credit', 404);
      if (normalizedPaymentMethod === 'WALLET' && paymentAmount > Number(customer.walletBalance || 0)) {
        throw paymentError('Payment amount exceeds customer wallet balance', 400);
      }
      const order = await Order.findById(credit.orderId).select('orderNum').session(transactionSession).lean();

      const finalReceiptNumber = receiptNumber || `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
      const payment = await CreditPayment.create([{
        storeId: credit.storeId,
        creditId: credit._id,
        orderId: credit.orderId,
        customerId: credit.customerId,
        amount: paymentAmount,
        paymentMethod: normalizedPaymentMethod,
        otherPaymentMethod: normalizedOtherPaymentMethod || undefined,
        bankName: normalizedBankName || undefined,
        reference: normalizedReference || undefined,
        receiptNumber: finalReceiptNumber,
        notes,
        recordedBy: session.user.name || session.user.email
      }], { session: transactionSession });

      credit.amountPaid = (credit.amountPaid || 0) + paymentAmount;
      credit.isPaid = credit.amountPaid >= credit.amount;
      await credit.save({ session: transactionSession });

      if (normalizedPaymentMethod === 'WALLET') {
        const walletBalanceBefore = Number(customer.walletBalance || 0);
        customer.walletBalance = walletBalanceBefore - paymentAmount;
        await new WalletTransaction({
          customer: customer._id,
          invoice: order?.orderNum || String(credit._id),
          type: 'Sale',
          amount: paymentAmount,
          balanceBefore: walletBalanceBefore,
          balanceAfter: customer.walletBalance,
          paymentMethod: 'WALLET',
          reference: receiptNumber || `credit-payment-${credit._id}`,
          remarks: 'Wallet used for credit payment',
          createdBy: session.user.name || session.user.email,
          createdAt: new Date()
        }).save({ session: transactionSession });
      }

      const [outstandingResult] = await Credit.aggregate([
        { $match: { customerId: customer._id, isCancelled: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $cond: [
                  { $gt: [{ $subtract: ['$amount', { $ifNull: ['$amountPaid', 0] }] }, 0] },
                  { $subtract: ['$amount', { $ifNull: ['$amountPaid', 0] }] },
                  0
                ]
              }
            }
          }
        }
      ]).session(transactionSession);
      customer.outstandingBalance = Number(outstandingResult?.total || 0);
      await customer.save({ session: transactionSession });

      const store = await Store.findById(credit.storeId).select('name slug').session(transactionSession).lean();
      const paymentRecord = payment[0].toObject();

      return {
        success: true,
        payment: paymentRecord,
        credit: {
          _id: credit._id,
          amount: credit.amount,
          amountPaid: credit.amountPaid,
          remainingBalance: Math.max(0, credit.amount - credit.amountPaid),
          paid: credit.isPaid
        },
        receipt: {
          receiptNumber: finalReceiptNumber,
          paymentAmount,
          currentOutstandingBalance: Number(customer.outstandingBalance || 0),
          currentWalletBalance: Number(customer.walletBalance || 0),
          customerName: customer.name || 'Unknown Customer',
          customerPhone: customer.phone || '',
          storeName: store?.name || '',
          storeSlug: store?.slug || '',
          paymentMethod: normalizedPaymentMethod,
          otherPaymentMethod: normalizedOtherPaymentMethod || undefined,
          bankName: normalizedBankName || undefined,
          reference: normalizedReference || undefined,
          paymentDate: paymentRecord.paymentDate || new Date(),
          orderNumber: order?.orderNum || '',
          notes: notes || '',
        },
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error recording payment:", error);
    const safeDbError = toClientSafeDbError(error);
    if (safeDbError) {
      return NextResponse.json(safeDbError, { status: 503 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to record payment" },
      { status: error?.status || 500 }
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
