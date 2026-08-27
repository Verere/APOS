import { NextResponse } from 'next/server';
import connectToDB from '@/utils/connectDB';
import Store from '@/models/store';
import Payment from '@/models/payments';
import Order from '@/models/order';
import Credit from '@/models/credit';
import CreditPayment from '@/models/creditPayment';
import Expense from '@/models/expense';
import Customer from '@/models/customer';
import WalletTransaction from '@/models/walletTransaction';
import Product from '@/models/product';
import InventoryTransaction from '@/models/models/InventoryTransaction';
import { summarizeEod } from '@/lib/eodSummary';

function toLegacyBusinessDate(rawDate) {
  if (!rawDate) return '';
  const text = String(rawDate).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const [year, month, day] = text.split('-');
  return `${Number(day)}/${month}/${year}`;
}

function buildDayRange(rawDate) {
  const dateText = String(rawDate || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    const startOfDay = new Date(`${dateText}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateText}T23:59:59.999Z`);
    return { startOfDay, endOfDay };
  }

  const legacyMatch = dateText.match(/^(\d{1,2})\/(\d{2})\/(\d{4})$/);
  if (legacyMatch) {
    const day = String(Number(legacyMatch[1])).padStart(2, '0');
    const month = legacyMatch[2];
    const year = legacyMatch[3];
    const iso = `${year}-${month}-${day}`;
    return {
      startOfDay: new Date(`${iso}T00:00:00.000Z`),
      endOfDay: new Date(`${iso}T23:59:59.999Z`),
    };
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const date = searchParams.get('date');

    if (!slug || !date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectToDB();

    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const legacyDate = toLegacyBusinessDate(date);
    const dayRange = buildDayRange(date);
    if (!dayRange) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    const { startOfDay, endOfDay } = dayRange;

    const customerIds = (await Customer.find({ storeId: store._id, isDeleted: { $ne: true } }, { _id: 1 }).lean()).map((customer) => customer._id);

    const [payments, orders, credits, creditPayments, expenses, customers, walletTransactions, products, inventoryTransactions] = await Promise.all([
      Payment.find({ storeId: store._id.toString(), bDate: legacyDate, isCancelled: false }).lean(),
      Order.find({ slug, isCancelled: false, $or: [{ bDate: legacyDate }, { bDate: date }] }).lean(),
      Credit.find({
        storeId: store._id,
        isCancelled: { $ne: true },
        $or: [
          { bDate: { $gte: startOfDay, $lte: endOfDay } },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      }).lean(),
      CreditPayment.find({
        storeId: store._id,
        paymentDate: { $gte: startOfDay, $lte: endOfDay }
      }).lean(),
      Expense.find({
        storeId: store._id,
        slug,
        $or: [
          { bDate: legacyDate },
          { bDate: date },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ],
        isCancelled: false
      }).lean(),
      Customer.find({ storeId: store._id, isDeleted: { $ne: true } }).lean(),
      WalletTransaction.find({
        customer: { $in: customerIds },
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).lean(),
      Product.find({ slug, isDeleted: { $ne: true } }).lean(),
      InventoryTransaction.find({
        slug,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).lean(),
    ]);

    const summary = summarizeEod({
      orders,
      payments,
      expenses,
      credits,
      creditPayments,
      walletTransactions,
      inventoryTransactions,
      customers,
      products,
      date: legacyDate,
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching EOD data:', error);
    return NextResponse.json({ error: 'Failed to fetch EOD data' }, { status: 500 });
  }
}
