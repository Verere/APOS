'use client'
import { useState, useEffect } from 'react'
import { X, CreditCard, Wallet, Banknote, Building2, ArrowRightLeft, FileText } from 'lucide-react'
import { currencyFormat } from '@/utils/currency'

const CreditPaymentModal = ({ isOpen, onClose, totalAmount, customerName, onConfirm }) => {
  const [wantToPayNow, setWantToPayNow] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [remainingCredit, setRemainingCredit] = useState(totalAmount)

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Banknote, color: 'from-green-600 to-emerald-600' },
    { value: 'POS', label: 'POS/Card', icon: CreditCard, color: 'from-blue-600 to-indigo-600' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'from-purple-600 to-pink-600' },
    { value: 'OTHER', label: 'Other', icon: FileText, color: 'from-gray-600 to-slate-600' },
  ]

  useEffect(() => {
    if (wantToPayNow) {
      setRemainingCredit(Math.max(0, totalAmount - paymentAmount))
    } else {
      setPaymentAmount(0)
      setRemainingCredit(totalAmount)
    }
  }, [wantToPayNow, paymentAmount, totalAmount])

  const handleConfirm = () => {
    onConfirm({
      paymentAmount: wantToPayNow ? Number(paymentAmount) : 0,
      creditAmount: remainingCredit,
      paymentMethod: wantToPayNow ? paymentMethod : null
    })
  }

  const handlePaymentChange = (value) => {
    const amount = Number(value) || 0
    if (amount <= totalAmount) {
      setPaymentAmount(amount)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 sm:p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Credit Sale</h2>
                <p className="text-xs sm:text-sm text-orange-100">{customerName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Total Amount */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{currencyFormat(totalAmount)}</p>
          </div>

          {/* Payment Option */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 group">
              <input
                type="checkbox"
                checked={wantToPayNow}
                onChange={(e) => setWantToPayNow(e.target.checked)}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">Make Partial Payment Now</span>
                </div>
                <p className="text-sm text-gray-600">
                  Pay some amount now and record the remaining as credit
                </p>
              </div>
            </label>

            {/* Payment Details */}
            {wantToPayNow && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === method.value
                              ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-lg`
                              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{method.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Payment Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    min="0"
                    max={totalAmount}
                    step="0.01"
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentAmount(totalAmount * 0.25)}
                    className="px-3 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => setPaymentAmount(totalAmount * 0.5)}
                    className="px-3 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setPaymentAmount(totalAmount)}
                    className="px-3 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    100%
                  </button>
                </div>

                {/* Summary */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Payment Method:</span>
                    <span className="font-bold text-gray-900">{paymentMethods.find(m => m.value === paymentMethod)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Payment Now:</span>
                    <span className="font-bold text-green-700">{currencyFormat(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Credit Amount:</span>
                    <span className="font-bold text-orange-700">{currencyFormat(remainingCredit)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Credit Notice */}
            {!wantToPayNow && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-orange-800">
                  Full amount will be recorded as credit
                </p>
                <p className="text-2xl font-bold text-orange-900 mt-2">{currencyFormat(totalAmount)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gray-50 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 shrink-0 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={wantToPayNow && (!paymentAmount || paymentAmount <= 0)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wantToPayNow ? 'Process Payment & Credit' : 'Record as Credit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditPaymentModal
