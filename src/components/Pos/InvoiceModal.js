'use client'

import { X, Printer, Mail, MessageCircle } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import { currencyFormat } from '@/utils/currency'

export default function InvoiceModal({ isOpen, onClose, invoiceData, storeInfo, printingSettings = {} }) {
  const [sendingEmail, setSendingEmail] = useState(false)

  const receiptFontFamily = printingSettings?.receiptFontFamily || 'monospace'
  const receiptFontSize = Math.min(18, Math.max(9, Number(printingSettings?.receiptFontSize) || 12))
  const receiptFooterNote = String(printingSettings?.receiptFooterNote || printingSettings?.receiptSpecialNote || '').trim()
  const showWalletBalanceOnReceipt = printingSettings?.showWalletBalanceOnReceipt ?? false
  const showOutstandingBalanceOnReceipt = printingSettings?.showOutstandingBalanceOnReceipt ?? false

  const invoiceBalances = useMemo(() => {
    const outstandingBalance = Number(invoiceData?.outstandingBalance ?? invoiceData?.customer?.outstandingBalance ?? invoiceData?.creditAmount ?? 0)
    const walletBalance = Number(invoiceData?.walletBalance ?? invoiceData?.customer?.walletBalance ?? 0)
    return { outstandingBalance, walletBalance }
  }, [invoiceData])

  const formatDateTime = useCallback((date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }, [])

  const handlePrint = useCallback(() => {
    if (!invoiceData) return

    const printWindow = window.open('', '', 'width=420,height=800')
    
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    const itemsRows = (invoiceData.items || []).map((item, index) => `
      <tr>
        <td style="padding: 4px 0; vertical-align: top;">${index + 1}. ${item.productName || item.name || ''}<div style="font-size: 10px; color: #666; margin-top: 2px;">@ ${currencyFormat(item.unitPrice ?? item.price ?? 0)}</div></td>
        <td style="padding: 4px 0; text-align: center; vertical-align: top;">${item.quantity ?? item.qty ?? 0}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">${currencyFormat(item.total ?? item.amount ?? 0)}</td>
      </tr>
    `).join('')

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceData.orderNum || ''}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; width: 80mm; }
            body {
              font-family: ${receiptFontFamily}, Arial, sans-serif;
              font-size: ${receiptFontSize}px;
              color: #0f172a;
              padding: 4mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .title { font-size: 16px; font-weight: 700; margin: 0; }
            .subtle { font-size: 10px; color: #475569; }
            .divider { border-top: 1px dashed #0f172a; margin: 6px 0; }
            .section { margin-bottom: 8px; }
            .row { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; margin: 2px 0; }
            .row strong { font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { padding: 4px 0; vertical-align: top; }
            th { text-align: left; border-bottom: 1px solid #0f172a; font-size: 10px; }
            .num { text-align: right; }
            .qty { text-align: center; }
            .total-line { border-top: 1px solid #0f172a; padding-top: 4px; margin-top: 4px; }
            .footer { text-align: center; font-size: 10px; margin-top: 8px; }
            .emphasis { font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="center section">
            <p class="title">${storeInfo?.name || 'Store Name'}</p>
            <p class="subtle">${storeInfo?.address || ''}</p>
            <p class="subtle">Tel: ${storeInfo?.number || ''}${storeInfo?.whatsapp ? ` | ${storeInfo.whatsapp}` : ''}</p>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="row"><strong>Invoice #:</strong><span>${invoiceData.orderNum || ''}</span></div>
            <div class="row"><strong>Date:</strong><span>${formatDateTime(new Date())}</span></div>
            <div class="row"><strong>Customer:</strong><span>${invoiceData.customer?.name || ''}</span></div>
            <div class="row"><strong>Phone:</strong><span>${invoiceData.customer?.phone || ''}</span></div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="qty">Qty</th>
                  <th class="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <div class="divider"></div>

          <div class="section">
            ${Number(invoiceData.deliveryCost || 0) > 0 ? `<div class="row"><strong>Delivery:</strong><span>${currencyFormat(invoiceData.deliveryCost)}</span></div>` : ''}
            <div class="row"><strong>Total Amount:</strong><span>${currencyFormat(invoiceData.totalAmount || 0)}</span></div>
            <div class="row"><strong>Amount Paid:</strong><span>${currencyFormat(invoiceData.paymentAmount || 0)}</span></div>
            ${showOutstandingBalanceOnReceipt ? `<div class="row"><strong>Outstanding Balance:</strong><span>${currencyFormat(invoiceBalances.outstandingBalance)}</span></div>` : ''}
            ${showWalletBalanceOnReceipt ? `<div class="row"><strong>Wallet Balance:</strong><span>${currencyFormat(invoiceBalances.walletBalance)}</span></div>` : ''}
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p class="emphasis">Thank you for your patronage</p>
            ${receiptFooterNote ? `<p style="margin-top: 4px;">${receiptFooterNote}</p>` : ''}
            <p style="margin-top: 4px;">Powered by www.marketbook.app</p>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(invoiceHTML)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }, [invoiceData, invoiceBalances, receiptFontFamily, receiptFontSize, receiptFooterNote, formatDateTime, storeInfo])

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
    const outstandingBalance = invoiceBalances.outstandingBalance
    const walletBalance = invoiceBalances.walletBalance

    const message = `
*CREDIT SALES INVOICE*
━━━━━━━━━━━━━━━━━━━━
*${storeInfo?.name || 'Store'}*
${storeInfo?.address || ''}
Tel: ${storeInfo?.number || ''}, ${storeInfo?.whatsapp || ''}

*Invoice Details*
━━━━━━━━━━━━━━━━━━━━
Invoice #: *${invoiceData.orderNum}*
Date: ${formatDate(new Date())}
Customer: ${invoiceData.customer.name}

*Items Purchased*
━━━━━━━━━━━━━━━━━━━━
${invoiceData.items?.map((item, i) => 
  `${i + 1}. ${item.productName || item.name}
   ${item.quantity ?? item.qty} × ${currencyFormat(item.unitPrice ?? item.price)} = ${currencyFormat(item.total ?? item.amount)}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━
${Number(invoiceData.deliveryCost || 0) > 0 ? `*Delivery:* ${currencyFormat(invoiceData.deliveryCost)}\n` : ''}*Total Amount:* ${currencyFormat(invoiceData.totalAmount)}
*Amount Paid:* ${currencyFormat(invoiceData.paymentAmount || 0)}
*Balance Due:* ${currencyFormat(invoiceData.creditAmount || invoiceData.totalAmount)}
  ${showOutstandingBalanceOnReceipt ? `*Outstanding Balance:* ${currencyFormat(outstandingBalance)}` : ''}
  ${showWalletBalanceOnReceipt ? `*Wallet Balance:* ${currencyFormat(walletBalance)}` : ''}
Thanks for your patronage!
powered by:  www.marketbook.app
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
          <h2 className="text-xl font-bold text-white">{invoiceData.isPreview ? 'Sales Invoice' : 'Credit Sale Invoice'}</h2>
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
              <p className="text-sm text-gray-600">Tel: {storeInfo?.number || ''}, {storeInfo?.whatsapp || ''} </p>
            </div>

            {!invoiceData.isPreview && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mb-6 text-center">
                <p className="text-lg font-bold text-yellow-800">CREDIT SALE INVOICE</p>
              </div>
            )}

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

            {(showOutstandingBalanceOnReceipt || showWalletBalanceOnReceipt) && (
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {showOutstandingBalanceOnReceipt && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Outstanding Balance</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{currencyFormat(invoiceBalances.outstandingBalance)}</div>
                  </div>
                )}
                {showWalletBalanceOnReceipt && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.08em] text-slate-500">Wallet Balance</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{currencyFormat(invoiceBalances.walletBalance)}</div>
                  </div>
                )}
              </div>
            )}

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
                        <td className="p-3 text-sm font-medium text-gray-900">{item.productName || item.name}</td>
                        <td className="p-3 text-right text-sm text-gray-700">{currencyFormat(item.unitPrice ?? item.price)}</td>
                        <td className="p-3 text-center text-sm font-semibold text-blue-600">{item.quantity ?? item.qty}</td>
                        <td className="p-3 text-right text-sm font-semibold text-gray-900">{currencyFormat(item.total ?? item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {Number(invoiceData.deliveryCost || 0) > 0 && (
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100 font-bold">
                        <td colSpan="3" className="p-3 text-right text-sm text-gray-700">DELIVERY:</td>
                        <td className="p-3 text-right text-base text-gray-900">{currencyFormat(invoiceData.deliveryCost)}</td>
                      </tr>
                    )}
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-bold border-t-2 border-gray-300">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">TOTAL AMOUNT:</td>
                      <td className="p-3 text-right text-base text-gray-900">{currencyFormat(invoiceData.totalAmount)}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-green-50 to-green-100 font-bold">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">AMOUNT PAID:</td>
                      <td className="p-3 text-right text-base text-green-600">{currencyFormat(invoiceData.paymentAmount || 0)}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 font-bold border-t-2 border-yellow-400">
                      <td colSpan="3" className="p-3 text-right text-sm text-gray-700">BALANCE DUE:</td>
                      <td className="p-3 text-right text-lg text-red-600">{currencyFormat(invoiceData.creditAmount || invoiceData.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {invoiceData.items?.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-base flex-1">{item.productName || item.name}</h3>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        ×{item.quantity ?? item.qty}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs block mb-1">Unit Price</span>
                        <span className="font-semibold text-gray-900">{currencyFormat(item.unitPrice ?? item.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-xs block mb-1">Total</span>
                        <span className="font-bold text-gray-900 text-base">{currencyFormat(item.total ?? item.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mobile Summary Cards */}
                <div className="space-y-2 mt-4 pt-4 border-t-2 border-gray-300">
                  {Number(invoiceData.deliveryCost || 0) > 0 && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-semibold text-gray-700 text-sm">Delivery:</span>
                      <span className="font-bold text-gray-900 text-lg">{currencyFormat(invoiceData.deliveryCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">Total Amount:</span>
                    <span className="font-bold text-gray-900 text-lg">{currencyFormat(invoiceData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">Amount Paid:</span>
                    <span className="font-bold text-green-600 text-lg">{currencyFormat(invoiceData.paymentAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-400">
                    <span className="font-bold text-gray-800 text-base">Balance Due:</span>
                    <span className="font-bold text-red-600 text-xl">{currencyFormat(invoiceData.creditAmount || invoiceData.totalAmount)}</span>
                  </div>
                  {showOutstandingBalanceOnReceipt && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-gray-700 text-sm">Outstanding Balance:</span>
                      <span className="font-bold text-gray-900 text-lg">{currencyFormat(invoiceBalances.outstandingBalance)}</span>
                    </div>
                  )}
                  {showWalletBalanceOnReceipt && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-gray-700 text-sm">Wallet Balance:</span>
                      <span className="font-bold text-gray-900 text-lg">{currencyFormat(invoiceBalances.walletBalance)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 border-gray-800 pt-4 mt-6">
              <p className="text-gray-700 font-semibold mt-1">Thank you for your patronage</p>
              <p className="text-xs text-gray-400 mt-1">Powered by www.marketbook.app</p>
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
