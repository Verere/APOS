'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useActionState, startTransition } from 'react'
import { X, DollarSign, CreditCard, Smartphone, Banknote, ArrowRightLeft, Receipt, CheckCircle, AlertCircle, Printer, History, ShoppingCart, User, Calendar, MessageCircle, Wallet } from 'lucide-react'
import { addPaymentWithOrder } from "@/actions"
import { toast } from "react-toastify"
import { useReactToPrint } from 'react-to-print'
import { currencyFormat } from '@/utils/currency'
import { completeLocalCashSale } from '@/lib/pos/localSaleService'
import { syncPendingTransactions } from '@/lib/pos/syncEngine'
import { isLocalFirstCheckoutEligible, shouldTryImmediateServerSync } from '@/lib/pos/operationRouter'
import { validateLocalCartStock } from '@/lib/pos/localStockValidator'
import { getLocalProductsBySlug } from '@/lib/pos/localCatalogService'

const OFFLINE_POS_ENABLED = process.env.NEXT_PUBLIC_OFFLINE_POS_ENABLED !== 'false'

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
    WALLET: 0,
    COMPLIMENTARY: 0
  })
  const [showHistory, setShowHistory] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [isPaymentVisible, setIsPaymentVisible] = useState(true)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [paymentsData, setPaymentsData] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [approvedBy, setApprovedBy] = useState('')
  const [complimentaryReason, setComplimentaryReason] = useState('')
  const [complimentaryRemarks, setComplimentaryRemarks] = useState('')
  const [walletAmount, setWalletAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptSettings, setReceiptSettings] = useState({
    receiptFontFamily: 'monospace',
    receiptFontSize: 12,
    receiptFooterNote: '',
  })
  const printRef = useRef(null)
  const successProcessedRef = useRef(false)
  const submitLockRef = useRef(false)
  const pendingPrintOpenRef = useRef(false)
  const lastDbRetryToastAtRef = useRef(0)
  
  const [state, formAction, isPending] = useActionState(addPaymentWithOrder, {})
  const formRef = useRef(null)
  const currentSubmissionIdRef = useRef(null)
  const lastHandledSubmissionIdRef = useRef(null)

  const paymentMethods = useMemo(() => [
    { value: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
    { value: 'POS', label: 'POS', icon: CreditCard, color: 'blue' },
    { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'purple' },
    { value: 'OTHER', label: 'Other', icon: DollarSign, color: 'gray' },
    { value: 'WALLET', label: 'Wallet', icon: Wallet, color: 'emerald' },
    { value: 'COMPLIMENTARY', label: 'Complimentary', icon: Receipt, color: 'violet' }
  ], [])

  const manualPaymentTotal = useMemo(() => {
    if (isComplimentary) return 0
    return selectedMethods.reduce((sum, method) => {
      return sum + (parseFloat(paymentAmounts[method]) || 0)
    }, 0)
  }, [isComplimentary, selectedMethods, paymentAmounts])

  const orderTotal = useMemo(() => parseFloat(cartValue || 0) || 0, [cartValue])
  const customerWalletBalance = useMemo(() => Number(customer?.walletBalance || 0), [customer])
  const customerOutstandingBalance = useMemo(() => Number(customer?.outstandingBalance || 0), [customer])
  const canUseWallet = useMemo(
    () => Boolean(customer) && !isComplimentary && customerWalletBalance > 0,
    [customer, isComplimentary, customerWalletBalance]
  )
  const maxWalletUsable = useMemo(() => Math.min(customerWalletBalance, orderTotal), [customerWalletBalance, orderTotal])
  const walletSelected = selectedMethods.includes('WALLET')
  const walletUsed = useMemo(() => {
    if (!walletSelected || isComplimentary) return 0
    return Math.min(Math.max(0, Number(walletAmount || 0)), maxWalletUsable)
  }, [walletSelected, isComplimentary, walletAmount, maxWalletUsable])
  const invoiceRemainingAfterWallet = useMemo(() => {
    if (!walletSelected || isComplimentary) return orderTotal
    return Math.max(0, orderTotal - walletUsed)
  }, [walletSelected, isComplimentary, orderTotal, walletUsed])
  const walletBalanceAfterUse = useMemo(() => {
    if (!walletSelected || isComplimentary) return customerWalletBalance
    return Math.max(0, customerWalletBalance - walletUsed)
  }, [walletSelected, isComplimentary, customerWalletBalance, walletUsed])
  const totalPayment = useMemo(() => {
    if (isComplimentary) return 0
    return manualPaymentTotal + walletUsed
  }, [isComplimentary, manualPaymentTotal, walletUsed])
  const balance = useMemo(() => (isComplimentary ? 0 : Math.max(0, orderTotal - totalPayment)), [isComplimentary, orderTotal, totalPayment])
  const change = useMemo(() => (isComplimentary ? 0 : Math.max(0, totalPayment - orderTotal)), [isComplimentary, totalPayment, orderTotal])
  const isOverpayment = totalPayment > orderTotal
  const isUnderpayment = !isComplimentary && totalPayment < orderTotal
  const submittedPaymentMethods = useMemo(() => {
    const methods = new Set(selectedMethods.filter((method) => method !== 'WALLET' || walletUsed > 0))
    if (walletSelected && walletUsed > 0) {
      methods.add('WALLET')
    }
    return Array.from(methods)
  }, [selectedMethods, walletSelected, walletUsed])
  const hasInvalidWalletAmount = useMemo(() => {
    if (!walletSelected || isComplimentary) return false
    const parsed = Number(walletAmount)
    if (!Number.isFinite(parsed) || parsed < 0) return true
    return parsed > maxWalletUsable
  }, [walletSelected, isComplimentary, walletAmount, maxWalletUsable])

  const localFirstEligible = useMemo(() => {
    return isLocalFirstCheckoutEligible({
      offlineEnabled: OFFLINE_POS_ENABLED,
      isComplimentary,
      walletSelected,
      selectedMethods,
      paymentAmounts,
    })
  }, [isComplimentary, walletSelected, selectedMethods, paymentAmounts])

  const saleMode = useMemo(() => {
    if (isComplimentary) {
      return {
        label: 'Online Sale',
        hint: 'Complimentary sales require server authorization.',
        classes: 'bg-white/15 text-blue-50 border border-white/30',
      }
    }

    if (localFirstEligible) {
      return {
        label: 'Offline Sale',
        hint: 'This sale is saved locally first and synced to server later.',
        classes: 'bg-emerald-500/20 text-emerald-50 border border-emerald-200/40',
      }
    }

    return {
      label: 'Online Sale',
      hint: walletSelected
        ? 'Wallet checkout requires live server validation.'
        : 'This sale will be processed directly on the server.',
      classes: 'bg-white/15 text-blue-50 border border-white/30',
    }
  }, [isComplimentary, localFirstEligible, walletSelected])

  const cartItems = useMemo(() => {
    return Array.isArray(cart?.cartItems) ? cart.cartItems : Array.isArray(cart) ? cart : []
  }, [cart])

  const openReceipt = useCallback((nextOrder, nextItems = [], nextPayments = []) => {
    setCompletedOrder(nextOrder)
    setOrderItems(Array.isArray(nextItems) ? nextItems : [])
    setPaymentsData(Array.isArray(nextPayments) ? nextPayments : [])
    pendingPrintOpenRef.current = false
    setShowPrintModal(true)
  }, [])

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

  const resetReceiptState = useCallback(() => {
    setShowPrintModal(false)
    setIsPaymentVisible(true)
    setCompletedOrder(null)
    setPaymentsData([])
    setOrderItems([])
    setIsSubmitting(false)
    pendingPrintOpenRef.current = false
    successProcessedRef.current = false
    submitLockRef.current = false
    currentSubmissionIdRef.current = null
    lastHandledSubmissionIdRef.current = null
  }, [])

  useEffect(() => {
    if (!isOpen) return

    resetReceiptState()
    successProcessedRef.current = false
    submitLockRef.current = false
    setIsSubmitting(false)
    setIsPaymentVisible(true)
    setSelectedMethods(isComplimentary ? ['COMPLIMENTARY'] : ['CASH'])
    setPaymentAmounts({
      CASH: isComplimentary ? 0 : (cartValue || 0),
      POS: 0,
      TRANSFER: 0,
      OTHER: 0,
      WALLET: 0,
      COMPLIMENTARY: 0
    })
    setApprovedBy('')
    setComplimentaryReason('')
    setComplimentaryRemarks('')
    setWalletAmount(0)
  }, [isOpen, isComplimentary, resetReceiptState])

  useEffect(() => {
    if (!walletSelected || isComplimentary) {
      if (walletAmount !== 0) setWalletAmount(0)
      return
    }

    if (walletAmount > maxWalletUsable) {
      setWalletAmount(maxWalletUsable)
    }
  }, [walletSelected, isComplimentary, walletAmount, maxWalletUsable])

  useEffect(() => {
    if (!canUseWallet && walletSelected) {
      setSelectedMethods(prev => prev.filter(method => method !== 'WALLET'))
      setWalletAmount(0)
    }
  }, [canUseWallet, walletSelected])

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

  const completeLocalFallbackSale = useCallback(async ({ message }) => {
    setIsSubmitting(true)
    submitLockRef.current = true

    try {
      const localCatalogProducts = slug ? await getLocalProductsBySlug(slug) : []
      const hasLocalCatalog = Array.isArray(localCatalogProducts) && localCatalogProducts.length > 0

      if (hasLocalCatalog) {
        validateLocalCartStock({
          cartItems: cartItems || cart?.cartItems || [],
          localProducts: localCatalogProducts,
          allowDecimalQuantity,
        })
      } else {
        toast.info('Local catalog is temporarily empty. Continuing with offline sale processing.')
      }

      const localPaymentMethods = selectedMethods
        .filter((method) => method !== 'WALLET' && method !== 'COMPLIMENTARY')
        .map((method) => ({ method, amount: Number(paymentAmounts[method] || 0) }))
        .filter((entry) => entry.amount > 0)

      const localAmountPaid = localPaymentMethods.reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

      if (!localPaymentMethods.length || localAmountPaid <= 0) {
        throw new Error('No valid offline payment methods to save locally')
      }

      const result = await completeLocalCashSale({
        cartItems,
        storeId: store?._id || slug,
        storeSlug: slug,
        customer,
        cashier: user?.name || user?.email || 'Cashier',
        paymentMethods: localPaymentMethods,
        paymentMethod: localPaymentMethods[0]?.method || 'CASH',
        amountPaid: localAmountPaid,
        change: Number(change || 0),
        orderMeta: {
          location: location || '',
          busDate,
          bDate: busDate,
          path: pathname || `/${slug}/pos`,
          orderAmount: orderTotal,
          allowDecimalQuantity,
        },
      })

      const fallbackPaymentRows = localPaymentMethods.map((entry) => ({
        mop: paymentMethods.find((item) => item.value === entry.method)?.label || entry.method,
        amount: Number(entry.amount || 0),
      }))

      const localCompletedOrder = {
        ...order,
        orderNum: result?.orderNum || rcpt || 'OFFLINE',
        cashier: user?.name || order?.soldBy || 'Cashier',
        soldBy: user?.name || order?.soldBy || 'Cashier',
        bDate: busDate,
        amount: orderTotal,
        amountPaid: localAmountPaid,
        bal: 0,
        change: Number(change || 0),
        walletUsed: 0,
        walletBalance: customer?.walletBalance || 0,
        outstandingBalance: customer?.outstandingBalance || 0,
        isComplimentary: false,
        customer: customer || null,
        syncStatus: result?.syncStatus || 'PENDING',
      }

      openReceipt(localCompletedOrder, cartItems, fallbackPaymentRows)
      setIsPaymentVisible(false)
      setIsSubmitting(false)
      submitLockRef.current = false
      currentSubmissionIdRef.current = null
      lastHandledSubmissionIdRef.current = null
      successProcessedRef.current = true
      toast.success(message || result?.message || 'Sale saved locally. It will sync when internet is available.')
      if (onSuccess) onSuccess()
      return { success: true }
    } catch (error) {
      setIsSubmitting(false)
      submitLockRef.current = false
      currentSubmissionIdRef.current = null
      lastHandledSubmissionIdRef.current = null
      toast.error(error?.message || 'Could not save sale locally')
      return { success: false }
    }
  }, [selectedMethods, paymentAmounts, cartItems, store, slug, customer, user, change, location, busDate, pathname, orderTotal, allowDecimalQuantity, paymentMethods, order, rcpt, onSuccess])

  const isDbRetryableSyncIssue = useCallback((syncResult) => {
    const message = String(syncResult?.error || '').toLowerCase()
    const classification = String(syncResult?.classification || '').toUpperCase()

    if (!message && !classification) return false

    const connectivityMatch =
      message.includes('db_unavailable') ||
      message.includes('database is temporarily unavailable') ||
      message.includes('querysrv') ||
      message.includes('eservfail') ||
      message.includes('server selection timed out') ||
      message.includes('enotfound') ||
      message.includes('econnrefused')

    return connectivityMatch || (classification === 'TRANSIENT' && message.includes('temporarily unavailable'))
  }, [])

  const notifyDbRetryIfNeeded = useCallback((syncResult) => {
    if (!isDbRetryableSyncIssue(syncResult)) return

    const now = Date.now()
    if (now - lastDbRetryToastAtRef.current < 12000) return

    lastDbRetryToastAtRef.current = now
    toast.info('Database unavailable, queued sales will auto-retry when connection stabilizes.')
  }, [isDbRetryableSyncIssue])

  useEffect(() => {
    if (!OFFLINE_POS_ENABLED || typeof window === 'undefined') return

    const triggerSync = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      try {
        const result = await syncPendingTransactions()
        notifyDbRetryIfNeeded(result)
        if (result?.pending && result.pending > 0) {
          toast.info(`Syncing ${result.pending} queued sale${result.pending > 1 ? 's' : ''}...`)
        }
      } catch (error) {
        // Silent fail: reconnect logic handles retry later.
      }
    }

    void triggerSync()

    const handleOnline = () => {
      void triggerSync()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [notifyDbRetryIfNeeded])

  // Handle form state updates
  useEffect(() => {
    if (!state || typeof state !== 'object') return

    const submissionId = state?.submissionId ?? null
    const expectedSubmissionId = currentSubmissionIdRef.current

    if (!submissionId || !expectedSubmissionId) {
      return
    }

    if (submissionId !== expectedSubmissionId) {
      return
    }

    if (lastHandledSubmissionIdRef.current === submissionId) {
      return
    }

    lastHandledSubmissionIdRef.current = submissionId

    if (state.error) {
      const supportsLocalFallback =
        OFFLINE_POS_ENABLED &&
        !isComplimentary &&
        !walletSelected &&
        selectedMethods.some((method) => ['CASH', 'POS', 'TRANSFER', 'OTHER'].includes(method) && Number(paymentAmounts[method] || 0) > 0)

      if (state?.code === 'DB_UNAVAILABLE' && supportsLocalFallback) {
        const localFallbackMessage =
          'Server is unavailable. Sale was saved locally and queued for sync.'
        void completeLocalFallbackSale({ message: localFallbackMessage })
        return
      }

      submitLockRef.current = false
      setIsSubmitting(false)
      toast.error(state.error)
      currentSubmissionIdRef.current = null
      return
    }

    if (state.success && !successProcessedRef.current) {
      successProcessedRef.current = true
      submitLockRef.current = false
      setIsSubmitting(false)
      toast.success(state.success)

      const paymentsList = isComplimentary
        ? [{ mop: 'Complimentary', amount: 0 }]
        : selectedMethods.map(method => ({
            mop: paymentMethods.find(m => m.value === method)?.label || method,
            amount: parseFloat(paymentAmounts[method]) || 0
          })).filter(p => p.amount > 0)

      if (!isComplimentary && walletSelected && walletUsed > 0) {
        paymentsList.push({ mop: 'Wallet', amount: walletUsed })
      }

      const successfulOrder = {
        ...order,
        orderNum: state?.orderNum || order?.orderNum || '',
        cashier: user?.name || order?.soldBy || '',
        soldBy: user?.name || order?.soldBy || '',
        bDate: busDate,
        amount: orderTotal,
        amountPaid: totalPayment,
        bal: balance,
        change: Math.max(0, totalPayment - orderTotal),
        walletUsed,
        walletBalance: walletBalanceAfterUse,
        outstandingBalance: customerOutstandingBalance,
        isComplimentary,
        customer: customer || null
      }

      openReceipt(successfulOrder, cartItems, paymentsList)
      setIsPaymentVisible(false)

      if (onSuccess) onSuccess()
      currentSubmissionIdRef.current = null
    }
  }, [state, isComplimentary, selectedMethods, paymentMethods, paymentAmounts, order, busDate, orderTotal, totalPayment, balance, customer, cartItems, onSuccess, walletSelected, walletUsed, walletBalanceAfterUse, customerOutstandingBalance, completeLocalFallbackSale])

  useEffect(() => {
    if (!pendingPrintOpenRef.current) return
    if (!completedOrder || orderItems.length === 0 || paymentsData.length === 0) return

    setShowPrintModal(true)
    pendingPrintOpenRef.current = false
  }, [completedOrder, orderItems, paymentsData])

  const togglePaymentMethod = useCallback((method) => {
    setSelectedMethods(prev => {
      if (prev.includes(method)) {
        if (method === 'WALLET') {
          setWalletAmount(0)
        } else {
          setPaymentAmounts(amounts => ({ ...amounts, [method]: 0 }))
        }
        return prev.filter(m => m !== method)
      }

      if (method === 'WALLET' && maxWalletUsable > 0 && Number(walletAmount || 0) === 0) {
        setWalletAmount(maxWalletUsable)
      }
      return [...prev, method]
    })
  }, [maxWalletUsable, walletAmount])

  const handleAmountChange = useCallback((method, value) => {
    const parsedValue = Number(value)
    const cleanValue = Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0

    setPaymentAmounts(prev => {
      const otherMethodsTotal = selectedMethods.reduce((sum, selectedMethod) => {
        if (selectedMethod === method) return sum
        return sum + (Number(prev[selectedMethod]) || 0)
      }, 0)

      const maxAllowedForMethod = Math.max(0, invoiceRemainingAfterWallet - otherMethodsTotal)
      const boundedValue = Math.min(cleanValue, maxAllowedForMethod)

      return { ...prev, [method]: boundedValue }
    })
  }, [selectedMethods, invoiceRemainingAfterWallet])

  const handlePayFull = useCallback(() => {
    if (selectedMethods.length === 1) {
      if (selectedMethods[0] === 'WALLET') {
        setWalletAmount(invoiceRemainingAfterWallet)
        return
      }
      setPaymentAmounts(prev => ({
        ...prev,
        [selectedMethods[0]]: invoiceRemainingAfterWallet
      }))
    }
  }, [selectedMethods, invoiceRemainingAfterWallet])

  const handleSplitEvenly = useCallback(() => {
    const splitMethods = selectedMethods.filter(method => method !== 'WALLET')
    if (splitMethods.length > 0) {
      const amountPerMethod = invoiceRemainingAfterWallet / splitMethods.length
      const newAmounts = {}
      splitMethods.forEach(method => {
        newAmounts[method] = parseFloat(amountPerMethod.toFixed(2))
      })
      setPaymentAmounts(prev => ({ ...prev, ...newAmounts }))
    } else if (selectedMethods.length === 1 && selectedMethods[0] === 'WALLET') {
      setWalletAmount(invoiceRemainingAfterWallet)
    }
  }, [selectedMethods, invoiceRemainingAfterWallet])

  const validateBeforeSubmit = useCallback((e) => {
    if (submitLockRef.current || isSubmitting || isPending) {
      e?.preventDefault?.()
      toast.info('Payment is already being processed')
      return false
    }

    if (isComplimentary) {
      if (!approvedBy.trim() || !complimentaryReason.trim()) {
        e?.preventDefault?.()
        toast.error('approvedBy and reason are required for complimentary sales')
        return false
      }
      submitLockRef.current = true
      setIsSubmitting(true)
      return true
    }

    if (!selectedMethods.length && !(walletSelected && walletUsed > 0)) {
      e?.preventDefault?.()
      toast.error('Select at least one payment method')
      return false
    }

    const hasInvalidMethodAmount = selectedMethods.some((method) => {
      const amount = Number(paymentAmounts[method])
      return !Number.isFinite(amount) || amount < 0
    })

    if (hasInvalidMethodAmount) {
      e?.preventDefault?.()
      toast.error('Each payment amount must be a valid positive number')
      return false
    }

    if (isUnderpayment) {
      e?.preventDefault?.()
      toast.error('Payment amount is less than order total')
      return false
    }

    if (isOverpayment) {
      e?.preventDefault?.()
      toast.error('Total payment cannot exceed order total')
      return false
    }

    if (walletSelected) {
      if (!customer) {
        e?.preventDefault?.()
        toast.error('Select a customer before using wallet')
        return false
      }

      const parsedWalletAmount = Number(walletAmount || 0)

      if (!Number.isFinite(parsedWalletAmount) || parsedWalletAmount < 0) {
        e?.preventDefault?.()
        toast.error('Wallet amount must be a valid positive number')
        return false
      }

      if (parsedWalletAmount === 0) {
        e?.preventDefault?.()
        toast.error('Enter wallet amount greater than 0')
        return false
      }

      if (parsedWalletAmount > customerWalletBalance) {
        e?.preventDefault?.()
        toast.error('Wallet amount cannot exceed wallet balance')
        return false
      }

      if (parsedWalletAmount > orderTotal) {
        e?.preventDefault?.()
        toast.error('Wallet amount cannot exceed invoice total')
        return false
      }
    }

    submitLockRef.current = true
    setIsSubmitting(true)
    return true
  }, [isComplimentary, isUnderpayment, isOverpayment, walletSelected, walletUsed, walletAmount, customerWalletBalance, orderTotal, selectedMethods, paymentAmounts, customer, isSubmitting, isPending, approvedBy, complimentaryReason])

  const handleWalletAmountChange = useCallback((value) => {
    const normalizedValue = String(value || '').trim()
    if (normalizedValue === '') {
      setWalletAmount(0)
      return
    }

    const parsedValue = Number(normalizedValue)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      setWalletAmount(0)
      return
    }

    setWalletAmount(Math.min(parsedValue, maxWalletUsable))
  }, [maxWalletUsable])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    if (!validateBeforeSubmit(event)) {
      return
    }

    if (localFirstEligible) {
      try {
        const localCatalogProducts = slug ? await getLocalProductsBySlug(slug) : []
        const hasLocalCatalog = Array.isArray(localCatalogProducts) && localCatalogProducts.length > 0

        if (hasLocalCatalog) {
          validateLocalCartStock({
            cartItems: cartItems || cart?.cartItems || [],
            localProducts: localCatalogProducts,
            allowDecimalQuantity,
          })
        } else {
          toast.info('Local catalog is temporarily empty. Continuing with offline sale processing.')
        }
      } catch (error) {
        toast.error(error.message)
        return
      }

      await completeLocalFallbackSale({
        message: 'Sale saved locally. Receipt generated and queued for sync.',
      })

      if (shouldTryImmediateServerSync()) {
        try {
          const syncResult = await syncPendingTransactions()
          if (syncResult?.synced > 0) {
            toast.success(`Synced ${syncResult.synced} queued sale${syncResult.synced > 1 ? 's' : ''} to server.`)
          }
          notifyDbRetryIfNeeded(syncResult)
        } catch {
          // Keep local-first UX resilient: queue remains pending for automatic retry.
        }
      }
      return
    }

    const nextSubmissionId = String(Date.now() + Math.random())
    currentSubmissionIdRef.current = nextSubmissionId
    const formData = new FormData(formRef.current)
    formData.set('submissionId', nextSubmissionId)

    startTransition(() => {
      formAction(formData)
    })
  }, [formAction, validateBeforeSubmit, localFirstEligible, completeLocalFallbackSale, notifyDbRetryIfNeeded])

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
    const itemsList = orderItems.map((item, i) => {
      const unitPrice =  item?.price ?? 0
      const lineTotal = item?.amount ?? item?.total ?? (Number(item?.qty || 0) * Number(unitPrice || 0))

      return `${i + 1}. ${item?.name || item?.item} x${item?.qty} @ ${currencyFormat(unitPrice)} = ${currencyFormat(lineTotal)}`
    }).join('\n')

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
      (completedOrder?.change > 0 ? `*CHANGE:* ${currencyFormat(completedOrder?.change)}\n` : '') +
      `*CURRENT BILL:* ${currencyFormat(completedOrder?.outstandingBalance ?? customerData?.outstandingBalance ?? 0)}\n` +
      `*CURRENT WALLET BALANCE:* ${currencyFormat(completedOrder?.walletBalance ?? customerData?.walletBalance ?? 0)}\n\n` +
      `Thank you for your patronage!`

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }, [completedOrder, orderItems, paymentsData, store, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {isPaymentVisible && (
          <>
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${saleMode.classes}`}>
                    {saleMode.label}
                  </span>
                  <span className="text-[11px] text-blue-100">{saleMode.hint}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                resetReceiptState()
                onClose?.()
              }}
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
                     <div className="flex justify-between text-black bg-green-500 p-2 rounded-lg border border-purple-200">
                              <span>Wallet Balance</span>
                              <span className="font-semibold text-gray-900">{currencyFormat(customerWalletBalance)}</span>
                            </div>
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
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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

                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-700" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-900">Use Wallet</p>
                              <p className="text-xs text-emerald-700">
                                Available: {currencyFormat(customerWalletBalance)}
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={walletSelected}
                            onChange={() => togglePaymentMethod('WALLET')}
                            disabled={!canUseWallet}
                            className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                          />
                        </div>

                        {walletSelected && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Amount</label>
                              <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={walletAmount}
                                  onChange={(e) => handleWalletAmountChange(e.target.value)}
                                  className="w-full pl-16 pr-4 py-3 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold transition-all"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                              <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
                                <p className="text-gray-500">Max wallet usable</p>
                                <p className="font-semibold text-gray-900">{currencyFormat(maxWalletUsable)}</p>
                              </div>
                              <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
                                <p className="text-gray-500">Invoice remaining</p>
                                <p className="font-semibold text-gray-900">{currencyFormat(invoiceRemainingAfterWallet)}</p>
                              </div>
                              <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 col-span-2">
                                <p className="text-gray-500">Wallet balance after payment</p>
                                <p className="font-semibold text-gray-900">{currencyFormat(walletBalanceAfterUse)}</p>
                              </div>
                            </div>

                            {hasInvalidWalletAmount && (
                              <p className="text-xs text-red-600">
                                Wallet amount must be between 0 and {currencyFormat(maxWalletUsable)}
                              </p>
                            )}
                          </>
                        )}

                        {!canUseWallet && (
                          <p className="text-xs text-amber-700">
                            Select a customer with wallet balance to use wallet payment.
                          </p>
                        )}
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
                      {selectedMethods.filter(method => method !== 'WALLET').map(method => {
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
                {hasInvalidWalletAmount && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 text-sm">Invalid Wallet Amount</p>
                      <p className="text-sm text-red-700">Wallet cannot be greater than {currencyFormat(maxWalletUsable)}</p>
                    </div>
                  </div>
                )}

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
                <input type="hidden" name="mop" value={submittedPaymentMethods.join(',')} />
                <input type="hidden" name="cashPaid" value={paymentAmounts.CASH || 0} />
                <input type="hidden" name="posPaid" value={paymentAmounts.POS || 0} />
                <input type="hidden" name="transferPaid" value={paymentAmounts.TRANSFER || 0} />
                <input type="hidden" name="walletPaid" value={walletSelected ? walletUsed : 0} />
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
                <input type="hidden" name="submissionId" value={currentSubmissionIdRef.current || ''} />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || isSubmitting || isUnderpayment || isOverpayment || hasInvalidWalletAmount}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isPending || isSubmitting) ? (
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
          </>
        )}

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
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Outstanding Bill:</span>
                    <span className="font-semibold text-gray-900">
                      {currencyFormat(completedOrder?.outstandingBalance ?? completedOrder?.customer?.outstandingBalance ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Wallet Balance:</span>
                    <span className="font-semibold text-gray-900">
                      {currencyFormat(completedOrder?.walletBalance ?? completedOrder?.customer?.walletBalance ?? 0)}
                    </span>
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
                          <td style={{ padding: '4px 0' }}>
                            <div>{item?.name || item?.item}</div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                              @ {currencyFormat(item?.price ?? item?.unitPrice )} 
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '4px 0' }}>{item?.qty}</td>
                          <td style={{ textAlign: 'right', padding: '4px 0' }}>{currencyFormat(item?.amount ?? item?.total ?? 0)}</td>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '4px' }}>
                      <span>CURRENT BILL:</span><span>{currencyFormat(completedOrder?.outstandingBalance ?? completedOrder?.customer?.outstandingBalance ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>CURRENT WALLET BALANCE:</span><span>{currencyFormat(completedOrder?.walletBalance ?? completedOrder?.customer?.walletBalance ?? 0)}</span>
                    </div>
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
                    resetReceiptState()
                    onClose?.()
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
