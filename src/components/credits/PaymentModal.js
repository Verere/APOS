'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { X, DollarSign, CreditCard, Smartphone, FileText, Banknote, MoreHorizontal, Receipt, User, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react'

export default function PaymentModal({ credit, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
    receiptNumber: ''
  })

  const remainingBalance = useMemo(() => {
    return credit.amount - (credit.amountPaid || 0)
  }, [credit.amount, credit.amountPaid])

  const customerLocation = useMemo(() => {
    if (!credit.customerId?.address) return 'N/A'
    const { city, state } = credit.customerId.address
    return [city, state].filter(Boolean).join(', ') || 'N/A'
  }, [credit.customerId?.address])

  const paymentMethods = useMemo(() => [
    { value: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
    { value: 'POS', label: 'POS', icon: CreditCard, color: 'blue' },
    { value: 'TRANSFER', label: 'Transfer', icon: Smartphone, color: 'purple' },
    { value: 'CHEQUE', label: 'Cheque', icon: FileText, color: 'indigo' },
    { value: 'OTHER', label: 'Other', icon: MoreHorizontal, color: 'gray' }
  ], [])

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [success, onClose])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }, [])

  const handlePayFull = useCallback(() => {
    setFormData(prev => ({ ...prev, amount: remainingBalance.toString() }))
    setError('')
  }, [remainingBalance])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    
    const amount = parseFloat(formData.amount)
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > remainingBalance) {
      setError(`Amount cannot exceed remaining balance of ₦${remainingBalance.toLocaleString()}`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/credit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditId: credit._id,
          amount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          receiptNumber: formData.receiptNumber || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment')
      }

      setSuccess(true)
      onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [formData, credit._id, remainingBalance, onSuccess])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Record Payment</h2>
                <p className="text-xs sm:text-sm text-green-100">Process credit payment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-b-2 border-green-200 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 animate-in zoom-in" />
              <div>
                <p className="font-semibold text-green-900">Payment Recorded Successfully!</p>
                <p className="text-sm text-green-700">Closing automatically...</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Customer Information Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border border-blue-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-blue-600 p-2.5 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium mb-0.5">Customer</p>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                    {credit.customerId?.name || 'Unknown Customer'}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                    {credit.customerId?.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{credit.customerId.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{customerLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-sm sm:text-base text-gray-900">₦{credit.amount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Already Paid</p>
                  <p className="font-bold text-sm sm:text-base text-green-600">₦{(credit.amountPaid || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                  <p className="font-bold text-base sm:text-lg text-red-600">₦{remainingBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 text-sm">Payment Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    max={remainingBalance}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold transition-all"
                    required
                    disabled={loading || success}
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95"
                  disabled={loading || success}
                >
                  Pay Full Amount
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter any amount up to ₦{remainingBalance.toLocaleString()}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {paymentMethods.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    disabled={loading || success}
                    className={`flex items-center justify-center gap-2 px-3 py-3 sm:py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                      formData.paymentMethod === value
                        ? `border-${color}-600 bg-${color}-50 text-${color}-700 shadow-md scale-105`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Receipt Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if left empty"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Add payment details, remarks, or any additional information..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                disabled={loading || success}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 px-4 sm:px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Payment Recorded</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Record Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
