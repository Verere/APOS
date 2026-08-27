import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import connectDB from "@/utils/connectDB";
import Store from "@/models/store";
import StoreMembership from "@/models/storeMembership";
import Payment from "@/models/payments";
import Order from "@/models/order";
import Credit from "@/models/credit";
import CreditPayment from "@/models/creditPayment";
import Expense from "@/models/expense";
import Customer from "@/models/customer";
import WalletTransaction from "@/models/walletTransaction";
import Product from "@/models/product";
import InventoryTransaction from "@/models/models/InventoryTransaction";
import EodDisplay from "@/components/Eod/EodDisplay";
import { summarizeEod } from "@/lib/eodSummary";
import { isDatabaseConnectivityError } from "@/lib/dbError";
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

  const customerIds = (await Customer.find({ storeId: store._id, isDeleted: { $ne: true } }, { _id: 1 }).lean()).map((customer) => customer._id);

  const [payments, orders, credits, creditPayments, expenses, customers, walletTransactions, products, inventoryTransactions] = await Promise.all([
    Payment.find({ storeId: store._id.toString(), bDate, isCancelled: false }).lean(),
    Order.find({ slug, bDate, isCancelled: false }).lean(),
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
        { bDate },
        { bDate: isoDate },
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

  return summarizeEod({
    orders,
    payments,
    expenses,
    credits,
    creditPayments,
    walletTransactions,
    inventoryTransactions,
    customers,
    products,
    date: bDate,
  });
}

export default async function EodPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const { slug } = await params;
  let eodData = null;

  try {
    await connectDB();
    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      redirect('/dashboard');
    }

    const membership = await StoreMembership.findOne({
      userId: session.user.id,
      storeId: store._id,
      isDeleted: { $ne: true },
    }).lean();

    if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
      redirect(`/${slug}`);
    }

    eodData = await getEodData(slug);
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return (
        <>
          <TopBar />
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-amber-900 mb-2">Database Temporarily Unavailable</h1>
              <p className="text-amber-800">
                Unable to load End of Day report right now. Please check internet connection and try again.
              </p>
            </div>
          </div>
        </>
      );
    }

    throw error;
  }

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
