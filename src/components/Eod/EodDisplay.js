"use client";

import { Calendar, TrendingUp, DollarSign, CreditCard, Smartphone, Receipt, Clock, CheckCircle, Printer, ArrowDownCircle } from "lucide-react";
import { currencyFormat } from "@/utils/currency";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function EodDisplay({ eodData, slug }) {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `EOD-Report-${eodData.date}`
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">End of Day Report</h1>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg mt-1">{eodData.date}</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white hover:bg-blue-50 text-blue-600 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              Print Report
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="space-y-8">
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Total Revenue</h3>
              </div>
              <p className="text-3xl font-bold text-green-700 mb-2">{currencyFormat(eodData.totalRevenue)}</p>
              <p className="text-sm text-gray-600">{eodData.transactionCount} orders</p>
            </div>

            {/* Total Credit */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Total Credit</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 mb-2">{currencyFormat(eodData.totalCredit)}</p>
              <p className="text-sm text-gray-600">{eodData.creditCount || 0} credit sales</p>
            </div>

            {/* Total Debt Paid */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-teal-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Debt Paid</h3>
              </div>
              <p className="text-3xl font-bold text-teal-700">{currencyFormat(eodData.totalCreditPaid)}</p>
            </div>

            {/* Total Profit */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Total Profit</h3>
              </div>
              <p className="text-3xl font-bold text-indigo-700 mb-2">{currencyFormat(eodData.totalProfit)}</p>
              <p className="text-sm text-gray-600">{eodData.transactionCount} orders</p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Total Expenses</h3>
              </div>
              <p className="text-3xl font-bold text-amber-700">{currencyFormat(eodData.totalExpenses || 0)}</p>
            </div>
          </div>

          {/* Total Payment Section with Breakdown */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-xl border-2 border-cyan-200 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-cyan-100 p-3 sm:p-4 rounded-xl">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Total Payment</h3>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-cyan-600 mt-1 sm:mt-2">{currencyFormat(eodData.totalPayment)}</p>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {/* Cash */}
              <div className="bg-white rounded-xl shadow-md border border-emerald-200 p-4 sm:p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Cash</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700">{currencyFormat(eodData.totalCash)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${eodData.totalPayment > 0 ? ((eodData.totalCash / eodData.totalPayment) * 100).toFixed(1) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {eodData.totalPayment > 0 ? ((eodData.totalCash / eodData.totalPayment) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* POS */}
              <div className="bg-white rounded-xl shadow-md border border-blue-200 p-4 sm:p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700">POS</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-700">{currencyFormat(eodData.totalPos)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${eodData.totalPayment > 0 ? ((eodData.totalPos / eodData.totalPayment) * 100).toFixed(1) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {eodData.totalPayment > 0 ? ((eodData.totalPos / eodData.totalPayment) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Transfer */}
              <div className="bg-white rounded-xl shadow-md border border-purple-200 p-4 sm:p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="bg-purple-100 p-1.5 sm:p-2 rounded-lg">
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Transfer</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-purple-700">{currencyFormat(eodData.totalTransfer)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${eodData.totalPayment > 0 ? ((eodData.totalTransfer / eodData.totalPayment) * 100).toFixed(1) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {eodData.totalPayment > 0 ? ((eodData.totalTransfer / eodData.totalPayment) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Others */}
              <div className="bg-white rounded-xl shadow-md border border-orange-200 p-4 sm:p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Others</h4>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-orange-700">{currencyFormat(eodData.totalOther)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${eodData.totalPayment > 0 ? ((eodData.totalOther / eodData.totalPayment) * 100).toFixed(1) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {eodData.totalPayment > 0 ? ((eodData.totalOther / eodData.totalPayment) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Method Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Cash', amount: eodData.totalCash, color: 'bg-emerald-500', icon: DollarSign, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                { label: 'POS', amount: eodData.totalPos, color: 'bg-blue-500', icon: CreditCard, iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
                { label: 'Transfer', amount: eodData.totalTransfer, color: 'bg-purple-500', icon: Smartphone, iconColor: 'text-purple-600', bgColor: 'bg-purple-50' },
                { label: 'Others', amount: eodData.totalOther, color: 'bg-orange-500', icon: Receipt, iconColor: 'text-orange-600', bgColor: 'bg-orange-50' }
              ].map((item, idx) => {
                const percent = eodData.totalPayment > 0 
                  ? ((item.amount / eodData.totalPayment) * 100).toFixed(1) 
                  : 0;
                const Icon = item.icon;

                return (
                  <div key={idx} className={`${item.bgColor} p-4 rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                        <span className="font-semibold text-gray-800">{item.label}</span>
                      </div>
                      <span className="text-gray-700 font-medium">{currencyFormat(item.amount)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Daily Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Collections</p>
                <p className="text-3xl font-bold">{currencyFormat(eodData.totalPayment + eodData.totalCreditPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">Payments + Debt Paid</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Outstanding Credit</p>
                <p className="text-3xl font-bold text-red-400">{currencyFormat(eodData.totalCredit)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Net Profit</p>
                <p className="text-3xl font-bold text-green-400">{currencyFormat(eodData.totalProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
