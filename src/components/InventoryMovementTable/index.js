'use client'
import { useState } from 'react'
import { Table, Badge, TextField } from '@radix-ui/themes'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  RotateCcw,
  Package,
  Calendar,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

const InventoryMovementTable = ({ transactions, productName }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'ALL' || transaction.type === filterType

    return matchesSearch && matchesFilter
  })

  // Type configuration with colors and icons
  const typeConfig = {
    SALE: {
      color: 'bg-red-100 text-red-700 border-red-300',
      darkColor: 'bg-red-900/20 text-red-400 border-red-800',
      icon: TrendingDown,
      label: 'Sale',
      badgeColor: 'red'
    },
    RESTOCK: {
      color: 'bg-green-100 text-green-700 border-green-300',
      darkColor: 'bg-green-900/20 text-green-400 border-green-800',
      icon: TrendingUp,
      label: 'Restock',
      badgeColor: 'green'
    },
    ADJUSTMENT: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      darkColor: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      icon: RefreshCw,
      label: 'Adjustment',
      badgeColor: 'yellow'
    },
    RETURN: {
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      darkColor: 'bg-blue-900/20 text-blue-400 border-blue-800',
      icon: RotateCcw,
      label: 'Return',
      badgeColor: 'blue'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Product', 'Date', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Notes']
    // Export only the first 10 rows
    const rowsToExport = filteredTransactions.slice(0, 10)
    const rows = rowsToExport.map(t => [
      productName,
      formatDate(t.createdAt),
      t.type,
      t.quantity,
      t.previousStock,
      t.newStock,
      t.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-movements-${new Date().getTime()}.csv`
    a.click()
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Movements</h2>
          {productName && (
            <p className="text-sm text-gray-600 mt-1">
              <Package className="inline w-4 h-4 mr-1" />
              {productName}
            </p>
          )}
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['ALL', 'SALE', 'RESTOCK', 'ADJUSTMENT', 'RETURN'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
                filterType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {type === 'ALL' ? 'All' : typeConfig[type]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Previous Stock
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                New Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => {
                const config = typeConfig[transaction.type]
                const Icon = config.icon
                const isPositive = transaction.quantity > 0

                return (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-sm',
                        config.color
                      )}>
                        <Icon size={14} />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        'inline-flex items-center px-3 py-1 rounded-lg font-bold text-lg',
                        isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      )}>
                        {isPositive ? '+' : ''}{transaction.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-600 font-medium">
                        {transaction.previousStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-900 font-bold text-lg">
                        {transaction.newStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {transaction.notes || '-'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No transactions found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const config = typeConfig[transaction.type]
            const Icon = config.icon
            const isPositive = transaction.quantity > 0

            return (
              <div
                key={transaction._id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                {/* Product Name */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <Package size={14} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{productName}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium text-sm',
                    config.color
                  )}>
                    <Icon size={14} />
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <Calendar size={12} className="inline mr-1" />
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>

                {/* Stock Changes */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Previous</p>
                    <p className="text-lg font-semibold text-gray-600">
                      {transaction.previousStock}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Change</p>
                    <p className={cn(
                      'text-xl font-bold',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isPositive ? '+' : ''}{transaction.quantity}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">New</p>
                    <p className="text-lg font-bold text-gray-900">
                      {transaction.newStock}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {transaction.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{transaction.notes}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = transactions.filter(t => t.type === type).length
          const Icon = config.icon
          
          return (
            <div
              key={type}
              className={cn(
                'p-4 rounded-lg border-2',
                config.color
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryMovementTable
