"use client";

import {
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  Smartphone,
  Receipt,
  Printer,
  Wallet,
  AlertTriangle,
  Archive,
  Box,
  BriefcaseBusiness,
  ArrowDownCircle,
  CheckCircle,
} from "lucide-react";
import { currencyFormat } from "@/utils/currency";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const safeNumber = (value) => Number(value || 0);

export default function EodDisplay({ eodData, slug }) {
  const printRef = useRef(null);
  const summary = eodData?.businessSummary || eodData || {};
  const settlement = eodData?.settlement || {};
  const expensesSummary = eodData?.expensesSummary || { totalExpenses: safeNumber(eodData?.totalExpenses), expenseCount: 0, breakdown: [] };
  const inventorySummary = eodData?.inventorySummary || { openingStockValue: 0, purchasesStockReceived: 0, stockSoldOrCogs: 0, stockReturns: 0, stockAdjustments: 0, closingStockValue: 0, alerts: [] };
  const debtors = eodData?.debtors || { creditSalesToday: 0, debtPaymentsReceivedToday: 0, netDebtChange: 0, totalOutstandingDebt: 0, numberOfDebtors: 0, overdueDebtAmount: 0, debtorsRequiringAttention: [] };
  const wallet = eodData?.wallet || { summary: { salesUsingWallet: 0, topUpsReceived: 0, refundsIssued: 0, openingDepositBalance: 0 }, activity: [] };
  const attentionRequired = eodData?.attentionRequired || [];
  const statusLabel = eodData?.status || "✅ EOD Balanced";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `EOD-Report-${eodData?.date || 'today'}`
  });

  const metricCards = [
    { label: "Revenue", value: summary.revenue ?? eodData?.totalRevenue ?? 0, tone: "green", icon: TrendingUp },
    { label: "Gross Profit", value: summary.grossProfit ?? eodData?.totalProfit ?? 0, tone: "indigo", icon: TrendingUp },
    { label: "Net Profit", value: summary.netProfit ?? 0, tone: "emerald", icon: CheckCircle },
    { label: "Money Received", value: settlement?.moneyReceivedToday?.amount ?? eodData?.totalPayment ?? 0, tone: "cyan", icon: DollarSign },
    { label: "Expenses", value: expensesSummary.totalExpenses ?? eodData?.totalExpenses ?? 0, tone: "amber", icon: ArrowDownCircle },
    { label: "Outstanding Debt", value: debtors.totalOutstandingDebt ?? 0, tone: "red", icon: BriefcaseBusiness },
  ];

  const paymentRows = [
    { label: 'Cash', amount: settlement?.cash?.amount ?? eodData?.totalCash ?? 0, count: settlement?.cash?.count ?? 0 },
    { label: 'POS/Card', amount: settlement?.pos?.amount ?? eodData?.totalPos ?? 0, count: settlement?.pos?.count ?? 0 },
    { label: 'Bank Transfer', amount: settlement?.transfer?.amount ?? eodData?.totalTransfer ?? 0, count: settlement?.transfer?.count ?? 0 },
    { label: 'Wallet', amount: settlement?.wallet?.amount ?? 0, count: settlement?.wallet?.count ?? 0 },
    { label: 'Other', amount: settlement?.other?.amount ?? eodData?.totalOther ?? 0, count: settlement?.other?.count ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EOD</h1>
                <p className="text-blue-100">{eodData?.date || 'Business Date'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${attentionRequired.length ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {statusLabel}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md hover:bg-blue-50"
              >
                <Printer className="w-4 h-4" />
                Print / Export
              </button>
            </div>
          </div>
        </div>

        <div ref={printRef} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              const toneClasses = {
                green: 'border-green-200 bg-green-50',
                indigo: 'border-indigo-200 bg-indigo-50',
                emerald: 'border-emerald-200 bg-emerald-50',
                cyan: 'border-cyan-200 bg-cyan-50',
                amber: 'border-amber-200 bg-amber-50',
                red: 'border-red-200 bg-red-50'
              }[card.tone] || 'border-slate-200 bg-white';

              return (
                <div key={card.label} className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">{card.label}</h3>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{currencyFormat(card.value)}</p>
                </div>
              );
            })}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Business Performance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                ['Revenue', summary.revenue ?? eodData?.totalRevenue ?? 0],
                ['Complementary', summary.complementary ?? 0],
                ['Returns / Refunds', summary.returnsRefunds ?? 0],
                ['Net Sales', summary.netSales ?? 0],
                ['COGS', summary.cogs ?? 0],
                ['Gross Profit', summary.grossProfit ?? 0],
                ['Gross Margin %', summary.grossMarginPercent ?? 0],
                ['Operating Expenses', summary.operatingExpenses ?? expensesSummary.totalExpenses ?? 0],
                ['Net Profit', summary.netProfit ?? 0],
                ['Transactions', summary.totalTransactions ?? 0],
                ['Avg Transaction Value', summary.averageTransactionValue ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {label.includes('%') ? `${Number(value).toFixed(1)}%` : (label === 'Transactions' || label === 'Avg Transaction Value' ? `${Number(value).toFixed(0)}` : currencyFormat(value))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-bold text-slate-900">Settlement / Money Received</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paymentRows.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-600">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{currencyFormat(item.amount)}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.count} transactions</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {[
                ['Sales settled today', settlement?.salesSettledToday?.amount ?? 0],
                ['Money actually received today', settlement?.moneyReceivedToday?.amount ?? 0],
                ['Debt collected today', settlement?.debtCollectedToday?.amount ?? 0],
                ['Customer deposits received today', settlement?.customerDepositsReceivedToday?.amount ?? 0],
                ['Wallet top-ups/funding', settlement?.walletTopUpsFunding?.amount ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{currencyFormat(value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Box className="h-5 w-5 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Total expenses</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{currencyFormat(expensesSummary.totalExpenses || 0)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Expense count</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{expensesSummary.expenseCount || 0}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Categories</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{expensesSummary.breakdown?.length || 0}</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {(expensesSummary.breakdown || []).map((item) => (
                <div key={item.category} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span className="font-bold text-slate-900">{currencyFormat(item.total)} ({item.count})</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Archive className="h-5 w-5 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-900">Inventory / Stock Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              {[
                ['Opening stock value', inventorySummary.openingStockValue || 0],
                ['Purchases / stock received', inventorySummary.purchasesStockReceived || 0],
                ['Stock sold / COGS', inventorySummary.stockSoldOrCogs || 0],
                ['Stock returns', inventorySummary.stockReturns || 0],
                ['Stock adjustments', inventorySummary.stockAdjustments || 0],
                ['Closing stock value', inventorySummary.closingStockValue || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{currencyFormat(value)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-700">Alerts</div>
              <div className="mt-3 space-y-2">
                {(inventorySummary.alerts || []).length ? inventorySummary.alerts.map((alert, index) => (
                  <div key={`${alert.type}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {alert.description}
                  </div>
                )) : <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">No inventory anomalies detected.</div>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <BriefcaseBusiness className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-bold text-slate-900">Debtors / Credit</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              {[
                ['Credit sales today', debtors.creditSalesToday || 0],
                ['Debt payments received today', debtors.debtPaymentsReceivedToday || 0],
                ['Debt write-offs today', debtors.debtWriteOffsToday || 0],
                ['Net change in debt', debtors.netDebtChange || 0],
                ['Total outstanding debt', debtors.totalOutstandingDebt || 0],
                ['Number of debtors', debtors.numberOfDebtors || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{label.includes('Number') ? value : currencyFormat(value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Customer Deposits / Wallet</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {[
                ['Opening deposit balance', wallet.summary.openingDepositBalance || 0],
                ['Deposits received today', wallet.summary.depositsReceivedToday || 0],
                ['Deposits applied to sales', wallet.summary.depositsAppliedToSales || 0],
                ['Deposits refunded', wallet.summary.depositsRefunded || 0],
                ['Closing unused deposit balance', wallet.summary.closingUnusedDepositBalance || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{currencyFormat(value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Attention Required</h2>
            </div>
            {attentionRequired.length ? (
              <div className="space-y-3">
                {attentionRequired.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="rounded-xl border border-red-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-red-800">{item.severity}</span>
                      <span className="text-xs text-slate-500">{item.action || 'Investigate'}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{item.description}</div>
                    {item.amount ? <div className="mt-2 text-sm font-semibold text-slate-900">Amount: {currencyFormat(item.amount)}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">No material exceptions detected for this business date.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
