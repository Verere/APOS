'use client'

import { X, Printer, Mail, Download, MessageCircle } from 'lucide-react'
import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { currencyFormat } from '@/utils/currency'

export default function InvoiceModal({ isOpen, onClose, invoiceData, storeInfo }) {
  const [sendingEmail, setSendingEmail] = useState(false)

  const handlePrint = useCallback(() => {
    if (!invoiceData) return
    
    const printContent = document.getElementById('invoice-content')
    const printWindow = window.open('', '', 'width=800,height=600')
    
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceData.orderNum}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 12px; }
            .section { margin-bottom: 20px; }
            .section h2 { font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
            .info-label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { text-align: left; padding: 8px; font-size: 12px; border-bottom: 1px solid #ddd; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 14px; background-color: #f9f9f9; }
            .footer { text-align: center; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; font-size: 12px; }
            .credit-notice { background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }, [invoiceData])

  const handleSendEmail = useCallback(async () => {
    if (!invoiceData?.customer?.email) {
      toast.error('Customer email not available')
      return
    }

    setSendingEmail(true)

    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceData,
          storeInfo,
          customerEmail: invoiceData.customer.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invoice sent successfully!')
      } else {
        toast.error(data.error || 'Failed to send invoice')
      }
    } catch (error) {
      console.error('Send email error:', error)
      toast.error('Failed to send invoice')
    } finally {
      setSendingEmail(false)
    }
  }, [invoiceData, storeInfo])

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const handleSendWhatsApp = useCallback(() => {
    if (!invoiceData?.customer?.phone) {
      toast.error('Customer phone number not available')
      return
    }

    // Format phone number (remove spaces, dashes, and ensure it starts with country code)
    let phoneNumber = invoiceData.customer.phone.replace(/\s|-/g, '')
    
    // If phone doesn't start with +, assume it needs country code (example: Nigeria +234)
    if (!phoneNumber.startsWith('+')) {
      // Remove leading 0 if present and add country code
      phoneNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber
      phoneNumber = `234${phoneNumber}` // Change this to your country code
    } else {
      phoneNumber = phoneNumber.substring(1) // Remove + for WhatsApp API
    }

    // Create invoice message
    const message = `
*CREDIT SALE INVOICE*
━━━━━━━━━━━━━━━━━━━━
*${storeInfo?.name || 'Store'}*
${storeInfo?.address || ''}
Tel: ${storeInfo?.number || ''}

*Invoice Details*
━━━━━━━━━━━━━━━━━━━━
Invoice #: *${invoiceData.orderNum}*
Date: ${formatDate(new Date())}
Customer: ${invoiceData.customer.name}

*Items Purchased*
━━━━━━━━━━━━━━━━━━━━
${invoiceData.items?.map((item, i) => 
  `${i + 1}. ${item.name}
   ${item.qty} × ${currencyFormat(item.price)} = ${currencyFormat(item.amount)}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━
*Total Amount:* ${currencyFormat(invoiceData.totalAmount)}
*Amount Paid:* ${currencyFormat(0)}
*Balance Due:* ${currencyFormat(invoiceData.totalAmount)}

Thank you for your business!
    `.trim()

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp...')
  }, [invoiceData, storeInfo, formatDate])

  // Conditional return AFTER all hooks
  if (!isOpen || !invoiceData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-bold text-white">Credit Sale Invoice</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div id="invoice-content">
            {/* Store Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{storeInfo?.name || 'Store Name'}</h1>
              <p className="text-sm text-gray-600">{storeInfo?.address || ''}</p>
              <p className="text-sm text-gray-600">Tel: {storeInfo?.number || ''} | Email: {storeInfo?.email || ''}</p>
            </div>

            {/* Credit Notice */}
            <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mb-6 text-center">
              <p className="text-lg font-bold text-yellow-800">CREDIT SALE INVOICE</p>
            </div>

            {/* Order Info */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3">Order Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Invoice #:</span>
                  <span className="ml-2 text-gray-900">{invoiceData.orderNum}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date:</span>
                  <span className="ml-2 text-gray-900">{formatDate(new Date())}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{invoiceData.customer?.name || ''}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{invoiceData.customer?.phone || ''}</span>
                </div>
                {invoiceData.customer?.email && (
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{invoiceData.customer.email}</span>
                  </div>
                )}
                {invoiceData.customer?.address && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-gray-700">Address:</span>
                    <span className="ml-2 text-gray-900">
                      {[
                        invoiceData.customer.address.street,
                        invoiceData.customer.address.city,
                        invoiceData.customer.address.state,
                        invoiceData.customer.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table/Cards */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-3">Items Ordered</h2>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <th className="text-left p-3 border-b-2 border-gray-400 text-sm font-bold text-gray-700">Item</th>
                      <th className="text-right p-3 border-b-2 border-gray-400 text-sm font-bold text-gray-700">Price</th>
                      <th className="text-center p-3 border-b-2 border-gray-400 text-sm font-bold text-gray-700">Qty</th>
                      <th className="text-right p-3 border-b-2 border-gray-400 text-sm font-bold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="p-3 text-right text-sm text-gray-700">{currencyFormat(item.price)}</td>
                        <td className="p-3 text-center text-sm font-semibold text-blue-600">{item.qty}</td>
                        <td className="p-3 text-right text-sm font-semibold text-gray-900">{currencyFormat(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold border-t-2 border-gray-300">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">TOTAL AMOUNT:</td>
                      <td className="p-3 text-right text-base text-gray-900">{currencyFormat(invoiceData.totalAmount)}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-green-50 to-green-100 font-bold">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">AMOUNT PAID:</td>
                      <td className="p-3 text-right text-base text-green-600">{currencyFormat(0)}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 font-bold border-t-2 border-yellow-400">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">BALANCE DUE:</td>
                      <td className="p-3 text-right text-lg text-red-600">{currencyFormat(invoiceData.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {invoiceData.items?.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-base flex-1">{item.name}</h3>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        ×{item.qty}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Unit Price</span>
                        <span className="font-semibold text-gray-900">{currencyFormat(item.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-xs block mb-1">Total</span>
                        <span className="font-bold text-gray-900 text-base">{currencyFormat(item.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mobile Summary Cards */}
                <div className="space-y-2 mt-4 pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">Total Amount:</span>
                    <span className="font-bold text-gray-900 text-lg">{currencyFormat(invoiceData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">Amount Paid:</span>
                    <span className="font-bold text-green-600 text-lg">{currencyFormat(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-400">
                    <span className="font-bold text-gray-800 text-base">Balance Due:</span>
                    <span className="font-bold text-red-600 text-xl">{currencyFormat(invoiceData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 border-gray-800 pt-4 mt-6">
              <p className="text-gray-700 font-semibold">Thank you for your business!</p>
              <p className="text-xs text-gray-500 mt-2">This is a computer-generated invoice</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 bg-gray-50 flex flex-wrap gap-3 justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          
          {invoiceData.customer?.email && (
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sendingEmail ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Email to Customer
                </>
              )}
            </button>
          )}

          {invoiceData.customer?.phone && (
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
