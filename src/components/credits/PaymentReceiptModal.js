'use client'

import { useRef } from 'react'
import { X, Printer } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

export default function PaymentReceiptModal({ payment, credit, onClose }) {
  const receiptRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={receiptRef} className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">Payment Receipt</h3>
            <p className="text-sm text-gray-600">Receipt #{payment.receiptNumber}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(payment.paymentDate).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{credit.customerId?.name || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{credit.orderId?.orderNum || 'N/A'}</span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{payment.paymentMethod}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-lg">₦{payment.amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Previous Balance:</span>
                <span>₦{(credit.amount - (credit.amountPaid - payment.amount)).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Remaining Balance:</span>
                <span>₦{(credit.amount - credit.amountPaid).toLocaleString()}</span>
              </div>
            </div>

            {payment.notes && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-gray-600 text-xs">Notes:</p>
                <p className="text-gray-800">{payment.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
              <p>Recorded by: {payment.recordedBy}</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Thank you for your payment!</p>
          </div>
        </div>

        <div className="border-t p-4 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
