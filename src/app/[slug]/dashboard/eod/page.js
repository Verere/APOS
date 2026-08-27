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
import moment from 'moment';

async function getEodData(slug) {
  await connectDB();

  const bDate = moment().format('D/MM/YYYY');
  const isoDate = moment().format('YYYY-MM-DD');
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const store = await Store.findOne({ slug }).lean();
  if (!store) return null;

  const [payments, orders, credits, creditPayments, expenses, customers, walletTransactions, products, inventoryTransactions] = await Promise.all([
    Payment.find({ storeId: store._id.toString(), bDate, isCancelled: false }).lean(),
    Order.find({ slug, bDate, isCancelled: false }).lean(),
    Credit.find({
      storeId: store._id,
      isCancelled: { $ne: true },
      $or: [
        { bDate: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ],
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
      customer: { $in: (await Customer.find({ storeId: store._id, isDeleted: { $ne: true } }, { _id: 1 }).lean()).map((customer) => customer._id) },
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
