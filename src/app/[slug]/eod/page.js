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
import TopBar from "@/components/topbar/topbar";

async function getEodData(slug) {
  await connectDB();
  const bDate = moment().format('D/MM/YYYY');
  const isoDate = moment().format('YYYY-MM-DD');
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const store = await Store.findOne({ slug }).lean();
  if (!store) return null;

  try {
    const payments = await Payment.find({
      storeId: store._id.toString(),
      bDate,
      isCancelled: false
    }).lean();

    const orders = await Order.find({
      slug,
      bDate,
      isCancelled: false
    }).lean();

    const credits = await Credit.find({
      storeId: store._id,
      $or: [
        { bDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ],
      isCancelled: { $ne: true }
    }).lean();

    const creditPayments = await CreditPayment.find({
      storeId: store._id,
      paymentDate: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    const expenses = await Expense.find({
      storeId: store._id,
      slug,
      $or: [
        { bDate },
        { bDate: isoDate },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ],
      isCancelled: false
    }).lean();

    let totalCash = 0;
    let totalPos = 0;
    let totalTransfer = 0;
    let totalOther = 0;

    payments.forEach(payment => {
      if (payment.paymentMethods && Array.isArray(payment.paymentMethods)) {
        payment.paymentMethods.forEach(method => {
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
        totalCash += payment.cash || 0;
        totalPos += payment.pos || 0;
        totalTransfer += payment.transfer || 0;
        totalOther += payment.card || 0;
      }
    });

    const totalPayment = totalCash + totalPos + totalTransfer + totalOther;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalProfit = orders.reduce((sum, order) => sum + (order.profit || 0), 0);
    const totalCredit = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
    const totalCreditPaid = creditPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

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
      transactionCount: orders.length,
      creditCount: credits.length
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

  return (
    <>
      <TopBar />
      <EodDisplay eodData={eodData} slug={slug} />
    </>
  );
}
