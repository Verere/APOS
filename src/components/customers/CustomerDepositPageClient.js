'use client'

import { useMemo, useState } from 'react'
import { Search, Wallet, Banknote, CreditCard, ArrowRightLeft, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'

import { currencyFormat } from '@/utils/currency'

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: Banknote, color: 'from-green-600 to-emerald-600' },
  { value: 'POS', label: 'POS', icon: CreditCard, color: 'from-blue-600 to-indigo-600' },
  { value: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'from-purple-600 to-pink-600' },
  { value: 'OTHER', label: 'Other', icon: FileText, color: 'from-gray-600 to-slate-700' },
]

export default function CustomerDepositPageClient({ slug, initialCustomers = [] }) {
  const [customers, setCustomers] = useState(Array.isArray(initialCustomers) ? initialCustomers : [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [reference, setReference] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [latestBalance, setLatestBalance] = useState(null)

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return customers

    return customers.filter((customer) => {
      const name = String(customer?.name || '').toLowerCase()
      const phone = String(customer?.phone || '').toLowerCase()
      const email = String(customer?.email || '').toLowerCase()
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [customers, searchTerm])

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => String(customer?._id) === String(selectedCustomerId)) || null
  }, [customers, selectedCustomerId])

  const displayedBalance = latestBalance ?? Number(selectedCustomer?.walletBalance || 0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')

    if (!selectedCustomerId) {
      toast.error('Please select a customer')
      return
    }

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Deposit amount must be greater than 0')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/customers/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          amount: parsedAmount,
          paymentMethod,
          reference,
          remarks,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || 'Failed to record deposit')
      }

      const updatedBalance = Number(data.walletBalance || 0)

      setCustomers((prev) => prev.map((customer) => (
        String(customer?._id) === String(selectedCustomerId)
          ? { ...customer, walletBalance: updatedBalance }
          : customer
      )))

      setLatestBalance(updatedBalance)
      setAmount('')
      setPaymentMethod('CASH')
      setReference('')
      setRemarks('')

      const message = `Deposit recorded successfully. New wallet balance: ${currencyFormat(updatedBalance)}`
      setSuccessMessage(message)
      toast.success(message)
    } catch (error) {
      toast.error(error?.message || 'Failed to record deposit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Customer Wallet Deposit</h1>
              <p className="mt-2 text-sm text-blue-100">Search a customer, view their wallet balance, and record a new deposit.</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Store</p>
              <p className="text-lg font-semibold">{slug}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Find Customer</h2>
                <p className="text-sm text-gray-500">Search by name, phone, or email.</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              <div className="max-h-[26rem] overflow-y-auto divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => {
                  const isSelected = String(customer?._id) === String(selectedCustomerId)

                  return (
                    <button
                      key={String(customer?._id)}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(String(customer?._id))
                        setLatestBalance(Number(customer?.walletBalance || 0))
                        setSuccessMessage('')
                      }}
                      className={`w-full text-left px-4 py-4 transition-all ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : 'hover:bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{customer?.name || 'Unnamed Customer'}</p>
                          <p className="text-sm text-gray-500 truncate">{customer?.phone || 'No phone'}</p>
                          {customer?.email ? <p className="text-xs text-gray-400 truncate">{customer.email}</p> : null}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs uppercase tracking-wide text-gray-400">Wallet</p>
                          <p className="font-bold text-blue-700">{currencyFormat(Number(customer?.walletBalance || 0))}</p>
                        </div>
                      </div>
                    </button>
                  )
                }) : (
                  <div className="px-4 py-10 text-center text-sm text-gray-500">No customers match your search.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Wallet Balance</h2>
                  <p className="text-sm text-gray-500">Current balance for the selected customer.</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white p-5 shadow-lg">
                <p className="text-sm text-emerald-100">Selected Customer</p>
                <p className="mt-1 text-xl font-bold">{selectedCustomer?.name || 'No customer selected'}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-100">Current Wallet Balance</p>
                <p className="mt-2 text-3xl font-bold">{currencyFormat(displayedBalance)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Record Deposit</h2>
                <p className="text-sm text-gray-500 mt-1">Enter the deposit details below.</p>
              </div>

              {successMessage ? (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deposit Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const active = paymentMethod === method.value

                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${active ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-md` : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Transaction reference"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={4}
                  placeholder="Optional remarks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedCustomerId}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Processing Deposit...' : 'Submit Deposit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
