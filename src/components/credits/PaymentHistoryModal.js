'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Receipt, Calendar, User, Banknote, CreditCard, Smartphone, FileText, MoreHorizontal, Clock } from 'lucide-react'

const paymentMethodIcons = {
  CASH: Banknote,
  POS: CreditCard,
  TRANSFER: Smartphone,
  CHEQUE: FileText,
  OTHER: MoreHorizontal
}

const paymentMethodLabels = {
  CASH: 'Cash',
  POS: 'POS',
  TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  OTHER: 'Other'
}

export default function PaymentHistoryModal({ credit, onClose }) {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [credit._id])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/credit-payment?creditId=${credit._id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments')
      }

      setPayments(data.payments || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0)
  }, [payments])

  const remainingBalance = useMemo(() => {
    return credit.amount - totalPaid
  }, [credit.amount, totalPaid])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Payment History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Customer & Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-lg">{credit.customerId?.name || 'Unknown'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-blue-200">
                <div>
                  <p className="text-xs text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg">₦{credit.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Paid</p>
                  <p className="font-bold text-lg text-green-600">₦{totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Balance</p>
                  <p className="font-bold text-lg text-red-600">₦{remainingBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Payments</p>
                  <p className="font-bold text-lg">{payments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading payments...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* No Payments */}
          {!loading && !error && payments.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payments recorded yet</p>
            </div>
          )}

          {/* Payments List */}
          {!loading && !error && payments.length > 0 && (
            <div className="space-y-4">
              {payments.map((payment, index) => {
                const Icon = paymentMethodIcons[payment.paymentMethod] || Banknote
                return (
                  <div
                    key={payment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">₦{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                          Payment #{payments.length - index}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Receipt className="w-4 h-4" />
                        <span className="font-medium">Receipt:</span>
                        <span className="font-mono">{payment.receiptNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Date:</span>
                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time:</span>
                        <span>{new Date(payment.paymentDate).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Recorded by:</span>
                        <span>{payment.recordedBy}</span>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes: </span>
                          {payment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
