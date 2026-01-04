'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Search, Info, Phone, Mail, MapPin, Calendar, TrendingUp, CreditCard, DollarSign, ShoppingCart, Edit2, Save, X } from 'lucide-react'
import { currencyFormat } from '@/utils/currency'
import { toast } from 'react-toastify'

export default function CustomersListClient({ customers, slug, currentUserRole, storeId }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [isEditingCreditLimit, setIsEditingCreditLimit] = useState(false)
  const [newCreditLimit, setNewCreditLimit] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filter customers based on search term - memoized for performance
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  const handleMoreInfo = useCallback((customer) => {
    setSelectedCustomer(customer)
    setNewCreditLimit(customer.creditLimit || 0)
    setIsEditingCreditLimit(false)
    setShowInfoModal(true)
  }, []);

  const handleUpdateCreditLimit = useCallback(async () => {
    if (!selectedCustomer) return

    if (newCreditLimit < 0) {
      toast.error('Credit limit cannot be negative')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/customers/update-credit-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          creditLimit: newCreditLimit,
          storeId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Credit limit updated successfully')
        setSelectedCustomer({ ...selectedCustomer, creditLimit: data.creditLimit })
        setIsEditingCreditLimit(false)
        // Refresh the page to get updated data
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to update credit limit')
      }
    } catch (error) {
      console.error('Error updating credit limit:', error)
      toast.error('Failed to update credit limit')
    } finally {
      setIsUpdating(false)
    }
  }, [selectedCustomer, newCreditLimit, storeId, router])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              Customers
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Total: {customers.length} customer{customers.length !== 1 ? 's' : ''}
            </p>
          </div>
          {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
            <button
              onClick={() => router.push(`/${slug}/dashboard/customers/new`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm sm:text-base shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-6 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Customers Table/List */}
      <div className="overflow-x-auto">
        {filteredCustomers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                 
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                   Outstanding Balance
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {customer.address?.city ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{customer.address.city}{customer.address.state ? `, ${customer.address.state}` : ''}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {currencyFormat(customer.outstandingBalance || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleMoreInfo(customer)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Info className="w-4 h-4" />
                        More Info
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{customer.name}</h3>
                      {customer.email && (
                        <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleMoreInfo(customer)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      <Info className="w-3 h-3" />
                      Info
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                    
                    {customer.address?.city && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{customer.address.city}{customer.address.state ? `, ${customer.address.state}` : ''}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">Purchases:</span>
                        <span className="font-semibold text-gray-900">{customer.totalPurchases || 0}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-600">Spent:</span>
                        <span className="font-bold text-green-600 ml-1">
                          {currencyFormat(customer.totalSpent || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users className="w-16 h-16 mb-3" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Try a different search term' : 'Add your first customer to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Customer Details</h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-white hover:bg-blue-500 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                    <p className="text-base font-semibold text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                    <p className="text-base text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  
                  {selectedCustomer.email && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                      <p className="text-base text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {selectedCustomer.email}
                      </p>
                    </div>
                  )}
                  
                  {selectedCustomer.dateOfBirth && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</label>
                      <p className="text-base text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {formatDate(selectedCustomer.dateOfBirth)}
                      </p>
                    </div>
                  )}
                  
                  {selectedCustomer.gender && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gender</label>
                      <p className="text-base text-gray-900 capitalize">{selectedCustomer.gender}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {selectedCustomer.address && (selectedCustomer.address.street || selectedCustomer.address.city) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address
                  </h3>
                  <div className="space-y-2">
                    {selectedCustomer.address.street && (
                      <p className="text-gray-700">{selectedCustomer.address.street}</p>
                    )}
                    <p className="text-gray-700">
                      {[
                        selectedCustomer.address.city,
                        selectedCustomer.address.state,
                        selectedCustomer.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                    {selectedCustomer.address.country && (
                      <p className="text-gray-700">{selectedCustomer.address.country}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Purchase Statistics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Purchase Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-600 uppercase">Total Purchases</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{selectedCustomer.totalPurchases || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-green-600 uppercase">Total Spent</p>
                    </div>
                    <p className="text-lg font-bold text-green-700">{currencyFormat(selectedCustomer.totalSpent || 0)}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-600 uppercase">Loyalty Points</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{selectedCustomer.loyaltyPoints || 0}</p>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <p className="text-xs font-semibold text-indigo-600 uppercase">This Month</p>
                    </div>
                    <p className="text-2xl font-bold text-indigo-700">{selectedCustomer.monthlyPurchases || 0}</p>
                  </div>
                </div>
              </div>

              {/* Credit Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Credit Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs font-semibold text-yellow-600 uppercase">Outstanding Balance</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-yellow-700">{currencyFormat(selectedCustomer.outstandingBalance || 0)}</p>
                    {selectedCustomer.outstandingBalance > 0 && selectedCustomer.creditLimit > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-yellow-600 mb-1">
                          <span>Credit Used</span>
                          <span>{((selectedCustomer.outstandingBalance / selectedCustomer.creditLimit) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-yellow-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((selectedCustomer.outstandingBalance / selectedCustomer.creditLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        <p className="text-xs font-semibold text-orange-600 uppercase">Credit Limit</p>
                      </div>
                      {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && !isEditingCreditLimit && (
                        <button
                          onClick={() => setIsEditingCreditLimit(true)}
                          className="text-orange-600 hover:text-orange-700 transition-colors"
                          title="Edit credit limit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {isEditingCreditLimit ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={newCreditLimit}
                          onChange={(e) => setNewCreditLimit(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Enter credit limit"
                          min="0"
                          step="0.01"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateCreditLimit}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-4 h-4" />
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingCreditLimit(false)
                              setNewCreditLimit(selectedCustomer.creditLimit || 0)
                            }}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-bold text-orange-700">{currencyFormat(selectedCustomer.creditLimit || 0)}</p>
                        {selectedCustomer.creditLimit > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Available: {currencyFormat(Math.max(0, selectedCustomer.creditLimit - selectedCustomer.outstandingBalance))}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {selectedCustomer.outstandingBalance > selectedCustomer.creditLimit && selectedCustomer.creditLimit > 0 && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠️ Warning: Outstanding balance exceeds credit limit by {currencyFormat(selectedCustomer.outstandingBalance - selectedCustomer.creditLimit)}
                    </p>
                  </div>
                )}
              </div>

              {/* Member Since */}
              {selectedCustomer.createdAt && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Customer since <span className="font-semibold text-gray-700">{formatDate(selectedCustomer.createdAt)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
