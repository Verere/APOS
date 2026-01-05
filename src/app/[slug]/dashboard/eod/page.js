import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import connectDB from "@/utils/connectDB";
import Store from "@/models/store";
import Payment from "@/models/payments";
import Order from "@/models/order";
import Credit from "@/models/credit";
import CreditPayment from "@/models/creditPayment";
import Expense from "@/models/expense";
import EodDisplay from "@/components/Eod/EodDisplay";
import moment from 'moment';

async function getEodData(slug) {
  await connectDB();
  
  // Get current date formatted as bDate (matches moment format D/MM/YYYY)
  const bDate = moment().format('D/MM/YYYY');

  // Verify store exists and get storeId
  const store = await Store.findOne({ slug }).lean();
  if (!store) {
    return null;
  }

  try {
    console.log('EOD Query - Store:', store.name, 'Slug:', slug, 'Date:', bDate);
    
    // Fetch all payments for today
    const payments = await Payment.find({
      storeId: store._id.toString(),
      bDate
    }).lean();
    console.log('Payments found:', payments.length);

    // Fetch all completed orders for today (Order model uses slug, not storeId)
    // Include all orders regardless of completion status to count credit sales
    const orders = await Order.find({
      slug: slug,
      bDate,
      // Remove isCompleted filter to include credit sales (partial/no payment)
      isCancelled: { $ne: true } // Exclude cancelled orders only
    }).lean();
    console.log('Orders found:', orders.length);
    if (orders.length > 0) {
      console.log('Sample order:', JSON.stringify(orders[0], null, 2));
    }

    // Fetch all credits for today (Credit model uses storeId and bDate/createdAt as Date fields)
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    
    console.log('Querying credits with storeId:', store._id, 'Date range:', startOfDay, 'to', endOfDay);
    
    // Try both bDate and createdAt since we're not sure which is used
    const credits = await Credit.find({
      storeId: store._id,
      $or: [
        { bDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    }).lean();
    console.log('Credits found:', credits.length);
    if (credits.length > 0) {
      console.log('Sample credit:', JSON.stringify(credits[0], null, 2));
    } else {
      // Also try querying all credits for debugging
      const allCredits = await Credit.find({ storeId: store._id }).limit(5).lean();
      console.log('Sample of all store credits (for debugging):', allCredits.length > 0 ? JSON.stringify(allCredits[0], null, 2) : 'No credits found for store');
    }

    // Fetch all credit payments for today (using paymentDate since bDate doesn't exist in schema)
    const creditPayments = await CreditPayment.find({
      storeId: store._id,
      paymentDate: { $gte: startOfDay, $lte: endOfDay }
    }).lean();
    console.log('Credit Payments found:', creditPayments.length);
    if (creditPayments.length > 0) {
      console.log('Sample credit payment:', JSON.stringify(creditPayments[0], null, 2));
    }

    // Fetch all expenses for today
    const expenses = await Expense.find({
      slug: slug,
      bDate,
      isCancelled: { $ne: true }
    }).lean();
    console.log('Expenses found:', expenses.length);

    // Calculate totals
    let totalCash = 0;
    let totalPos = 0;
    let totalTransfer = 0;
    let totalOther = 0;

    // Sum up payment methods from split payments
    payments.forEach(payment => {
      console.log('Processing payment:', payment.receiptNumber, 'Methods:', payment.paymentMethods);
      if (payment.paymentMethods && Array.isArray(payment.paymentMethods)) {
        payment.paymentMethods.forEach(method => {
          console.log('Payment method:', method.method, 'Amount:', method.amount);
          switch (method.method) {
            case 'CASH':
              totalCash += method.amount || 0;
              break;
            case 'POS':
              totalPos += method.amount || 0;
              break;
            case 'TRANSFER':
              totalTransfer += method.amount || 0;
              break;
            case 'OTHER':
            case 'CHEQUE':
              totalOther += method.amount || 0;
              break;
          }
        });
      } else {
        // Fallback to legacy fields if paymentMethods array doesn't exist
        console.log('Using legacy fields - Cash:', payment.cash, 'POS:', payment.pos, 'Transfer:', payment.transfer);
        totalCash += payment.cash || 0;
        totalPos += payment.pos || 0;
        totalTransfer += payment.transfer || 0;
        totalOther += payment.card || 0;
      }
    });

    // Calculate total payment
    const totalPayment = totalCash + totalPos + totalTransfer + totalOther;

    // Calculate total revenue from orders (using 'amount' field from Order model)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Calculate total profit from orders
    const totalProfit = orders.reduce((sum, order) => sum + (order.profit || 0), 0);
    
    // Calculate total credit (using 'amount' field from Credit model)
    const totalCredit = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
    console.log('Total Credit calculated:', totalCredit, 'from', credits.length, 'credits');
    
    // Calculate total credit paid
    const totalCreditPaid = creditPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    console.log('Total Expenses calculated:', totalExpenses, 'from', expenses.length, 'expenses');

    // Verify the relationship: Total Revenue should equal Total Payment + Total Credit
    const calculatedRevenue = totalPayment + totalCredit;
    const difference = totalRevenue - calculatedRevenue;
    console.log('=== REVENUE VERIFICATION ===');
    console.log('Total Revenue (from orders):', totalRevenue);
    console.log('Total Payment:', totalPayment);
    console.log('Total Credit:', totalCredit);
    console.log('Payment + Credit:', calculatedRevenue);
    console.log('Difference:', difference);
    if (difference !== 0) {
      console.warn('MISMATCH: Revenue does not equal Payment + Credit!');
      // Log order details for debugging
      console.log('Order amounts:', orders.map(o => ({ orderNum: o.orderNum, amount: o.amount, status: o.status, isCompleted: o.isCompleted })));
      console.log('Payment amounts:', payments.map(p => ({ receiptNumber: p.receiptNumber, amountPaid: p.amountPaid, orderAmount: p.orderAmount })));
      console.log('Credit amounts:', credits.map(c => ({ amount: c.amount, isPaid: c.isPaid })));
    }
    console.log('===========================');

    // Get transaction counts
    const transactionCount = orders.length;
    const creditCount = credits.length;

    console.log('Totals - Revenue:', totalRevenue, 'Cash:', totalCash, 'POS:', totalPos, 'Transfer:', totalTransfer, 'Other:', totalOther, 'Payment:', totalPayment, 'Credit:', totalCredit, 'CreditCount:', creditCount);

    return {
      date: bDate,
      totalRevenue,
      totalPayment,
      totalCash,
      totalPos,
      totalTransfer,
      totalOther,
      totalCredit,
      totalCreditPaid,
      totalProfit,
      totalExpenses,
      transactionCount,
      creditCount
    };
  } catch (error) {
    console.error("Error fetching EOD data:", error);
    return null;
  }
}

export default async function EodPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const eodData = await getEodData(slug);

  if (!eodData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h1>
          <p className="text-gray-600">Unable to load End of Day report.</p>
        </div>
      </div>
    );
  }

  return <EodDisplay eodData={eodData} slug={slug} />;
}
