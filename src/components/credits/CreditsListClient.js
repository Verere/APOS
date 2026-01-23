'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  UserCheck, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Receipt,
  History,
  CreditCard
} from 'lucide-react'
import { currencyFormat } from '@/utils/currency'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic'

const PaymentModal = dynamic(() => import('./PaymentModal'), { ssr: false })
const PaymentHistoryModal = dynamic(() => import('./PaymentHistoryModal'), { ssr: false })

export default function CreditsListClient({ credits, stats, slug }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, paid, unpaid
  const [selectedCredit, setSelectedCredit] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [creditsData, setCreditsData] = useState(credits)

  // Filter credits based on search and status
  const filteredCredits = useMemo(() => {
    let result = creditsData;

    // Filter by payment status
    if (filterStatus === 'paid') {
      result = result.filter(credit => credit.isPaid);
    } else if (filterStatus === 'unpaid') {
      // Only show credits with outstanding balance > 0
      result = result.filter(credit => {
        const outstanding = (credit.amount || 0) - (credit.amountPaid || 0);
        return !credit.isPaid && outstanding > 0;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(credit => 
        credit.customerId?.name?.toLowerCase().includes(term) ||
        credit.customerId?.phone?.includes(term) ||
        credit.orderId?.orderNum?.toLowerCase().includes(term) ||
        credit.soldBy?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [creditsData, searchTerm, filterStatus]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const handleRecordPayment = useCallback((credit) => {
    setSelectedCredit(credit)
    setShowPaymentModal(true)
  }, [])

  const handleViewHistory = useCallback((credit) => {
    setSelectedCredit(credit)
    setShowHistoryModal(true)
  }, [])

  const handlePaymentSuccess = useCallback((data) => {
    // Update credits data with new payment info
    setCreditsData(prevCredits => 
      prevCredits.map(credit => 
        credit._id === data.credit._id 
          ? { 
              ...credit, 
              amountPaid: data.credit.amountPaid, 
              isPaid: data.credit.paid,
              paidAt: data.credit.paidAt 
            }
          : credit
      )
    )
    toast.success(`Payment of ${currencyFormat(data.payment.amount)} recorded successfully!`)
    // Close modal and refresh
    setShowPaymentModal(false)
    setSelectedCredit(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <UserCheck className="w-8 h-8" />
              Who Owe Me
            </h1>
            <p className="text-orange-100 text-sm mt-2">
              Track and manage all credit sales
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{currencyFormat(stats.totalCredits)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Unpaid</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaidCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2 font-semibold">{currencyFormat(stats.totalUnpaid)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.paidCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 font-semibold">{currencyFormat(stats.totalPaid)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.totalCredits > 0 ? Math.round((stats.totalPaid / stats.totalCredits) * 100) : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, order number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredCredits.length}</span> of <span className="font-semibold">{creditsData.length}</span> credit sales
        </div>
      </div>

      {/* Credits List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredCredits.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No credit sales found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Credit sales will appear here when customers purchase on credit'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Outstanding Balance
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCredits.map((credit) => {
                    const outstandingBalance = (credit.amount || 0) - (credit.amountPaid || 0)
                    const location = credit.customerId?.address ? 
                      [credit.customerId.address.city, credit.customerId.address.state].filter(Boolean).join(', ') || 'N/A' 
                      : 'N/A'
                    
                    return (
                      <tr key={credit._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="font-semibold text-gray-900">
                              {credit.customerId?.name || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            <div className="flex items-center gap-1 mb-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {credit.customerId?.phone || 'N/A'}
                            </div>
                            {credit.customerId?.email && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                {credit.customerId.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-bold text-xl text-red-600">
                              {currencyFormat(outstandingBalance)}
                            </div>
                            {outstandingBalance === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Fully Paid
                              </span>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Paid: {currencyFormat(credit.amountPaid || 0)} / {currencyFormat(credit.amount || 0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {outstandingBalance > 0 && (
                              <button
                                onClick={() => handleRecordPayment(credit)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                Record Payment
                              </button>
                            )}
                            <button
                              onClick={() => handleViewHistory(credit)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <History className="w-3 h-3" />
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredCredits.map((credit) => {
                const outstandingBalance = (credit.amount || 0) - (credit.amountPaid || 0)
                const location = credit.customerId?.address ? 
                  [credit.customerId.address.city, credit.customerId.address.state].filter(Boolean).join(', ') || 'N/A' 
                  : 'N/A'
                
                return (
                  <div key={credit._id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Header with Name and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {credit.customerId?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      {outstandingBalance === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{credit.customerId?.phone || 'N/A'}</span>
                      </div>
                      {credit.customerId?.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{credit.customerId.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Location and Balance */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="text-sm text-gray-700 font-medium">
                          {location}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Outstanding Balance</div>
                        <div className="font-bold text-lg text-red-600">
                          {currencyFormat(outstandingBalance)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">{currencyFormat(credit.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span className="font-semibold">{currencyFormat(credit.amountPaid || 0)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {outstandingBalance > 0 && (
                        <button
                          onClick={() => handleRecordPayment(credit)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <CreditCard className="w-4 h-4" />
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(credit)}
                        className={`${outstandingBalance === 0 ? 'flex-1' : 'flex-shrink-0'} px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1`}
                      >
                        <History className="w-4 h-4" />
                        History
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCredit && (
        <PaymentModal
          credit={selectedCredit}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedCredit(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment History Modal */}
      {showHistoryModal && selectedCredit && (
        <PaymentHistoryModal
          credit={selectedCredit}
          onClose={() => {
            setShowHistoryModal(false)
            setSelectedCredit(null)
          }}
        />
      )}
    </div>
  )
}
