import { NextResponse } from 'next/server';
import connectToDB from '@/utils/connectDB';
import Credit from '@/models/credit';
import Order from '@/models/order';
import CreditPayment from '@/models/creditPayment';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const date = searchParams.get('date');

    if (!slug || !date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectToDB();

    // Calculate total credit for the date
    const credits = await Credit.find({ 
      slug, 
      bDate: date,
      isCancelled: false 
    }).lean();
    
    const totalCredit = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);

    // Calculate total profit from orders for the date
    const orders = await Order.find({ 
      slug, 
      bDate: date,
      isCompleted: true,
      isCancelled: false 
    }).lean();
    
    const totalProfit = orders.reduce((sum, order) => sum + (order.profit || 0), 0);

    // Calculate total credit payments for the date
    const creditPayments = await CreditPayment.find({
      slug,
      bDate: date
    }).lean();
    
    const totalCreditPaid = creditPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return NextResponse.json({
      totalCredit,
      totalProfit,
      totalCreditPaid
    });
  } catch (error) {
    console.error('Error fetching EOD data:', error);
    return NextResponse.json({ error: 'Failed to fetch EOD data' }, { status: 500 });
  }
}
