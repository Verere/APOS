import { NextResponse } from 'next/server';
import connectToDB from '@/utils/connectDB';
import Credit from '@/models/credit';
import Order from '@/models/order';
import CreditPayment from '@/models/creditPayment';
import Expense from '@/models/expense';
import Store from '@/models/store';

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
    const startOfDay = new Date(`${iso}T00:00:00.000Z`);
    const endOfDay = new Date(`${iso}T23:59:59.999Z`);
    return { startOfDay, endOfDay };
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

    // Calculate total credit for the date
    const credits = await Credit.find({
      storeId: store._id,
      isCancelled: { $ne: true },
      $or: [
        { bDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }).lean();
    
    const totalCredit = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);

    // Calculate total profit from orders for the date
    const orders = await Order.find({
      slug,
      isCancelled: false,
      $or: [{ bDate: legacyDate }, { bDate: date }]
    }).lean();
    
    const totalProfit = orders.reduce((sum, order) => sum + (order.profit || 0), 0);

    // Calculate total credit payments for the date
    const creditPayments = await CreditPayment.find({
      storeId: store._id,
      paymentDate: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Fetch all expenses for today
    const expenses = await Expense.find({
      storeId: store._id,
      slug,
      $or: [
        { bDate: legacyDate },
        { bDate: date },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ],
      isCancelled: false
    }).lean();

    // Calculate totals
    const totalCreditPaid = creditPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return NextResponse.json({
      totalCredit,
      totalProfit,
      totalCreditPaid,
      totalExpenses
    });
  } catch (error) {
    console.error('Error fetching EOD data:', error);
    return NextResponse.json({ error: 'Failed to fetch EOD data' }, { status: 500 });
  }
}
