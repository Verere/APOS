'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useActionState } from 'react'
import { X, DollarSign, CreditCard, Smartphone, Banknote, ArrowRightLeft, Receipt, CheckCircle, AlertCircle, Printer, History, ShoppingCart, User, Calendar, MessageCircle } from 'lucide-react'
import { addPaymentWithOrder } from "@/actions"
import { toast } from "react-toastify"
import { useReactToPrint } from 'react-to-print'
import { currencyFormat } from '@/utils/currency'

export default function PosPaymentModal({ 
  isOpen, 
  onClose, 
  cartValue, 
  cart, 
  order, 
  busDate, 
  location, 
  user, 
  store,
  slug,
  pathname,
  rcpt,
  isComplimentary = false,
  allowDecimalQuantity = false,
  printingSettings = {},
  customer,
  onSuccess 
}) {
  const [selectedMethods, setSelectedMethods] = useState(isComplimentary ? ['COMPLIMENTARY'] : ['CASH'])
  const [paymentAmounts, setPaymentAmounts] = useState({
    CASH: isComplimentary ? 0 : (cartValue || 0),
    POS: 0,
    TRANSFER: 0,
    OTHER: 0,
    COMPLIMENTARY: 0
  })
  const [showHistory, setShowHistory] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [paymentsData, setPaymentsData] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [approvedBy, setApprovedBy] = useState('')
  const [complimentaryReason, setComplimentaryReason] = useState('')
  const [complimentaryRemarks, setComplimentaryRemarks] = useState('')
  const [receiptSettings, setReceiptSettings] = useState({
    receiptFontFamily: 'monospace',
    receiptFontSize: 12,
    receiptFooterNote: '',
  })
  const printRef = useRef(null)
  const successProcessedRef = useRef(false)
  
  const [state, formAction, isPending] = useActionState(addPaymentWithOrder, {})

  const paymentMethods = useMemo(() => [
    { value: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
    { value: 'POS', label: 'POS', icon: CreditCard, color: 'blue' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'purple' },
    { value: 'OTHER', label: 'Other', icon: DollarSign, color: 'gray' },
    { value: 'COMPLIMENTARY', label: 'Complimentary', icon: Receipt, color: 'violet' }
  ], [])

  const totalPayment = useMemo(() => {
    if (isComplimentary) return 0
    return selectedMethods.reduce((sum, method) => {
      return sum + (parseFloat(paymentAmounts[method]) || 0)
    }, 0)
  }, [isComplimentary, selectedMethods, paymentAmounts])

  const orderTotal = useMemo(() => parseFloat(cartValue || 0) || 0, [cartValue])
  const balance = useMemo(() => (isComplimentary ? 0 : Math.max(0, orderTotal - totalPayment)), [isComplimentary, orderTotal, totalPayment])
  const change = useMemo(() => (isComplimentary ? 0 : Math.max(0, totalPayment - orderTotal)), [isComplimentary, totalPayment, orderTotal])
  const isOverpayment = totalPayment > orderTotal
  const isUnderpayment = !isComplimentary && totalPayment < orderTotal

  const cartItems = useMemo(() => {
    return cart?.cartItems || cart || []
  }, [cart])

  const resolvedReceiptFontFamily = receiptSettings?.receiptFontFamily || 'monospace'
  const resolvedReceiptFontSize = Math.min(18, Math.max(9, Number(receiptSettings?.receiptFontSize) || 12))
  const resolvedReceiptFooterNote = String(receiptSettings?.receiptFooterNote || '').trim()
  const receiptSpecialNote = String(printingSettings?.receiptSpecialNote || '').trim()

  const reactToPrintFn = useReactToPrint({ 
    contentRef: printRef,
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print { body { margin: 0; padding: 0; } }
    `
  })

  useEffect(() => {
    if (!isOpen) return

    setSelectedMethods(isComplimentary ? ['COMPLIMENTARY'] : ['CASH'])
    setPaymentAmounts({
      CASH: isComplimentary ? 0 : (cartValue || 0),
      POS: 0,
      TRANSFER: 0,
      OTHER: 0,
      COMPLIMENTARY: 0
    })
    setApprovedBy('')
    setComplimentaryReason('')
    setComplimentaryRemarks('')
  }, [isOpen, isComplimentary, cartValue])

  useEffect(() => {
    const loadReceiptSettings = async () => {
      try {
        const response = await fetch(`/api/settings/${slug}`)
        if (!response.ok) return
        const data = await response.json()
        const s = data?.settings || {}
        setReceiptSettings({
          receiptFontFamily: s.receiptFontFamily || 'monospace',
          receiptFontSize: Number(s.receiptFontSize) || 12,
          receiptFooterNote: s.receiptFooterNote || '',
        })
      } catch {
        // Keep defaults when settings fetch fails.
      }
    }

    if (slug) loadReceiptSettings()
  }, [slug])

  // Handle form state updates
  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
    if (state.success && !successProcessedRef.current) {
      successProcessedRef.current = true
      toast.success(state.success)
      
      // Prepare payment data
      const paymentsList = isComplimentary
        ? [{ mop: 'Complimentary', amount: 0 }]
        : selectedMethods.map(method => ({
            mop: paymentMethods.find(m => m.value === method)?.label || method,
            amount: parseFloat(paymentAmounts[method]) || 0
          })).filter(p => p.amount > 0)
      
      setPaymentsData(paymentsList)
      setCompletedOrder({
        ...order,
        orderNum: state?.orderNum || order?.orderNum || '',
        cashier: user?.name || order?.soldBy || '',
        bDate: busDate,
        amount: orderTotal,
        amountPaid: totalPayment,
        bal: balance,
        change: Math.max(0, totalPayment - orderTotal),
        isComplimentary,
        customer: customer || null
      })
      console.log('Completed Order:', completedOrder)
      setOrderItems(cartItems)
      setShowPrintModal(true)
      
      // Call success callback to clear cart
      if (onSuccess) onSuccess()
    }
  }, [state, isComplimentary, selectedMethods, paymentMethods, paymentAmounts, order, busDate, orderTotal, totalPayment, balance, customer, cartItems, onSuccess])

  const togglePaymentMethod = useCallback((method) => {
    setSelectedMethods(prev => {
      if (prev.includes(method)) {
        // Remove method and clear amount
        setPaymentAmounts(amounts => ({ ...amounts, [method]: 0 }))
        return prev.filter(m => m !== method)
      }
      return [...prev, method]
    })
  }, [])

  const handleAmountChange = useCallback((method, value) => {
    const numValue = parseFloat(value) || 0
    setPaymentAmounts(prev => ({ ...prev, [method]: numValue }))
  }, [])

  const handlePayFull = useCallback(() => {
    if (selectedMethods.length === 1) {
      setPaymentAmounts(prev => ({
        ...prev,
        [selectedMethods[0]]: orderTotal
      }))
    }
  }, [selectedMethods, orderTotal])

  const handleSplitEvenly = useCallback(() => {
    if (selectedMethods.length > 0) {
      const amountPerMethod = orderTotal / selectedMethods.length
      const newAmounts = {}
      selectedMethods.forEach(method => {
        newAmounts[method] = parseFloat(amountPerMethod.toFixed(2))
      })
      setPaymentAmounts(prev => ({ ...prev, ...newAmounts }))
    }
  }, [selectedMethods, orderTotal])

  const validateBeforeSubmit = useCallback((e) => {
    if (isComplimentary) {
      if (!approvedBy.trim() || !complimentaryReason.trim()) {
        e.preventDefault()
        toast.error('approvedBy and reason are required for complimentary sales')
        return false
      }
      return true
    }

    if (isUnderpayment) {
      e.preventDefault()
      toast.error('Payment amount is less than order total')
      return false
    }
    return true
  }, [isComplimentary, isUnderpayment])

  const handleSendWhatsApp = useCallback(() => {
    const customerData = completedOrder?.customer
    if (!customerData?.phone) {
      toast.error('Customer phone number not available')
      return
    }

    // Format phone number
    let phone = customerData.phone.replace(/[\s-]/g, '')
    if (phone.startsWith('0')) {
      phone = '234' + phone.substring(1)
    } else if (!phone.startsWith('234')) {
      phone = '234' + phone
    }

    // Build receipt message
    const itemsList = orderItems.map((item, i) => 
      `${i + 1}. ${item?.name || item?.item} x${item?.qty} - ${currencyFormat(item?.amount)}`
    ).join('\n')

    const paymentsList = paymentsData.map(p => 
      `${p.mop}: ${currencyFormat(p.amount)}`
    ).join('\n')

    const message = `*${store?.name || 'STORE'}*\n` +
      `${store?.address || ''}\n\n` +
      `*RECEIPT*\n` +
      `Date: ${completedOrder?.bDate}\n` +
      `Receipt #: ${completedOrder?.orderNum}\n` +
      `Customer: ${customerData?.name || 'Walk-in'}\n` +
      `Cashier: ${completedOrder?.cashier || user?.name || ''}\n\n` +
      `*ITEMS*\n${itemsList}\n\n` +
      `*TOTAL:* ${currencyFormat(completedOrder?.amount)}\n\n` +
      `*PAYMENT*\n${paymentsList}\n` +
      `*PAID:* ${currencyFormat(completedOrder?.amountPaid)}\n` +
      (completedOrder?.change > 0 ? `*CHANGE:* ${currencyFormat(completedOrder?.change)}\n\n` : '\n') +
      `Thank you for your patronage!`

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }, [completedOrder, orderItems, paymentsData, store, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Process Payment</h2>
                <p className="text-xs sm:text-sm text-blue-100">{isComplimentary ? 'Complete complimentary sale' : 'Complete transaction'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Left Column - Order Summary */}
            <div className="space-y-4">
              {/* Customer Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Customer</h3>
                </div>
                
                {customer ? (
                  <div className="space-y-2 text-sm">
                    <div className="font-bold text-lg text-gray-900">{customer.name}</div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📱</span>
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <span>✉️</span>
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">Walk-in Customer</div>
                      <div className="text-xs text-gray-500">No customer selected</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Order Summary</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order #:</span>
                    <span className="font-mono font-semibold">{rcpt || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{busDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{cartItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cashier:</span>
                    <span className="font-medium">{user?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Order Total</span>
                    <span className="text-2xl font-bold text-blue-600">{currencyFormat(orderTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm">Items ({cartItems.length})</h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="px-4 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-medium text-gray-900 flex-1">{item.productName || item.name || item.item}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">x{item.quantity ?? item.qty}</span>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {currencyFormat(item.total ?? item.amount ?? ((item.unitPrice ?? item.price) * (item.quantity ?? item.qty ?? 0)))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payment:</span>
                    <span className="font-bold text-blue-600">{currencyFormat(totalPayment)}</span>
                  </div>
                  {balance > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remaining:</span>
                      <span className="font-bold">{currencyFormat(balance)}</span>
                    </div>
                  )}
                  {change > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Change:</span>
                      <span className="font-bold">{currencyFormat(change)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Methods */}
            <div className="space-y-4">
              <form action={formAction} onSubmit={validateBeforeSubmit} className="space-y-4">
                {/* Payment Method Selection */}
                {isComplimentary ? (
                  <div className="bg-violet-50 border-l-4 border-violet-500 rounded-lg px-4 py-3 flex items-start gap-3">
                    <Receipt className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-violet-900 text-sm">Complimentary Sale</p>
                      <p className="text-sm text-violet-700">This order will be completed with no payment and no outstanding balance.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Payment Methods {selectedMethods.length > 1 && <span className="text-blue-600">(Split Payment)</span>}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {paymentMethods.filter(({ value }) => value !== 'COMPLIMENTARY').map(({ value, label, icon: Icon, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => togglePaymentMethod(value)}
                            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                              selectedMethods.includes(value)
                                ? `border-${color}-600 bg-${color}-50 text-${color}-700 shadow-md scale-105`
                                : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>

                      {selectedMethods.length > 1 && (
                        <button
                          type="button"
                          onClick={handleSplitEvenly}
                          className="mt-2 w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Split evenly between {selectedMethods.length} methods
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedMethods.map(method => {
                        const methodInfo = paymentMethods.find(m => m.value === method)
                        const Icon = methodInfo?.icon || Banknote
                        
                        return (
                          <div key={method}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {methodInfo?.label} Amount
                            </label>
                            <div className="relative">
                              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                              <input
                                type="number"
                                value={paymentAmounts[method]}
                                onChange={(e) => handleAmountChange(method, e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold transition-all"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedMethods.length === 1 && (
                      <button
                        type="button"
                        onClick={handlePayFull}
                        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all text-sm font-semibold"
                      >
                        Pay Full Amount ({currencyFormat(orderTotal)})
                      </button>
                    )}
                  </>
                )}

                {isComplimentary && (
                  <div className="space-y-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Approved By</label>
                      <input
                        type="text"
                        value={approvedBy}
                        onChange={(e) => setApprovedBy(e.target.value)}
                        placeholder="Supervisor / manager name"
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                      <input
                        type="text"
                        value={complimentaryReason}
                        onChange={(e) => setComplimentaryReason(e.target.value)}
                        placeholder="Why is this complimentary?"
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                      <textarea
                        value={complimentaryRemarks}
                        onChange={(e) => setComplimentaryRemarks(e.target.value)}
                        placeholder="Optional internal notes"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Error/Warning Messages */}
                {isOverpayment && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900 text-sm">Overpayment</p>
                      <p className="text-sm text-yellow-700">Change: {currencyFormat(change)}</p>
                    </div>
                  </div>
                )}

                {isUnderpayment && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 text-sm">Insufficient Payment</p>
                      <p className="text-sm text-red-700">Short by: {currencyFormat(balance)}</p>
                    </div>
                  </div>
                )}

                {/* Hidden form fields */}
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
                <input type="hidden" name="orderId" value={order?._id || ''} />
                <input type="hidden" name="orderNum" value={order?.orderNum || ''} />
                <input type="hidden" name="orderName" value={order?.orderName || ''} />
                <input type="hidden" name="orderAmount" value={orderTotal} />
                <input type="hidden" name="mop" value={selectedMethods.join(',')} />
                <input type="hidden" name="cashPaid" value={paymentAmounts.CASH || 0} />
                <input type="hidden" name="posPaid" value={paymentAmounts.POS || 0} />
                <input type="hidden" name="transferPaid" value={paymentAmounts.TRANSFER || 0} />
                <input type="hidden" name="amountPaid" value={totalPayment} />
                <input type="hidden" name="bal" value={balance} />
                <input type="hidden" name="location" value={location || ''} />
                <input type="hidden" name="user" value={user?.name || ''} />
                <input type="hidden" name="bDate" value={busDate} />
                <input type="hidden" name="path" value={pathname} />
                <input type="hidden" name="customerId" value={customer?._id || ''} />
                <input type="hidden" name="customerName" value={customer?.name || ''} />
                <input type="hidden" name="isComplimentary" value={isComplimentary ? 'true' : 'false'} />
                <input type="hidden" name="transactionType" value={isComplimentary ? 'COMPLIMENTARY' : 'STANDARD'} />
                <input type="hidden" name="allowDecimalQuantity" value={allowDecimalQuantity ? 'true' : 'false'} />
                <input type="hidden" name="approvedBy" value={approvedBy} />
                <input type="hidden" name="reason" value={complimentaryReason} />
                <input type="hidden" name="remarks" value={complimentaryRemarks} />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || isUnderpayment}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>{isComplimentary ? 'Complete Complimentary Sale' : 'Complete Payment'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && completedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600">Would you like to print the receipt?</p>
                  <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Order #</span>
                      <span className="font-semibold text-gray-900">{completedOrder?.orderNum || 'N/A'}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-medium">Cashier</span>
                      <span className="font-semibold text-gray-900">{completedOrder?.soldBy || user?.name || user?.email || 'N/A'}</span>
                    </div>
                  </div>
                <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order #:</span>
                    <span className="font-semibold text-gray-900">{completedOrder?.orderNum || rcpt || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Cashier:</span>
                    <span className="font-semibold text-gray-900">{completedOrder?.cashier || user?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Hidden Print Content */}
              <div style={{display: 'none', fontFamily: resolvedReceiptFontFamily, fontSize: `${resolvedReceiptFontSize}px`}}>
                <div ref={printRef} style={{ width: '80mm', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '13px', padding: '5mm' }}>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '700' }}>{store?.name || 'STORE'}</h2>
                    <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: '500' }}>{store?.address || 'Address'}</p>
                    <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: '500' }}>Tel: {store.number},  {store.whatsapp}</p>
                      {resolvedReceiptFooterNote ? <p>{resolvedReceiptFooterNote}</p> : null}
                    <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
                  </div>

                  <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '400' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Date:</span><span>{completedOrder?.bDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' , fontWeight: '400'}}>
                      <span>Receipt #:</span><span>{completedOrder?.orderNum || rcpt}</span>
                    </div>
                    <div style={{ display: 'flex', fontWeight: '500', justifyContent: 'space-between' }}>
                      <span>Customer:</span><span>{completedOrder?.customer?.name || 'Walk-in'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '400' }}>
                      <span>Cashier:</span><span>{completedOrder?.cashier || user?.name}</span>
                    </div>
                    <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
                  </div>

                  <table style={{ width: '100%', fontSize: '14px', fontWeight: '400', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                        <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                        <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '4px 0' }}>{item?.name || item?.item}</td>
                          <td style={{ textAlign: 'center', padding: '4px 0' }}>{item?.qty}</td>
                          <td style={{ textAlign: 'right', padding: '4px 0' }}>{currencyFormat(item?.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                      <span>TOTAL:</span><span>{currencyFormat(completedOrder?.amount)}</span>
                    </div>
                    {paymentsData.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{p.mop}:</span><span>{currencyFormat(p.amount)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>PAID:</span><span>{currencyFormat(completedOrder?.amountPaid)}</span>
                    </div>
                    {completedOrder?.change > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>CHANGE:</span><span>{currencyFormat(completedOrder?.change)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }}></div>
                  <div style={{ textAlign: 'center', fontSize: '12px' }}>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Thanks for your Patronage!</p>
                    <p style={{ margin: '5px 0', fontSize: '10px',fontWeight: '500' }}>Powered by: www.marketbook.app</p>
                    
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button 
                    onClick={reactToPrintFn}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Print
                  </button>
                  {completedOrder?.customer?.phone && (
                    <button 
                      onClick={handleSendWhatsApp}
                      className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowPrintModal(false)
                    onClose()
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
