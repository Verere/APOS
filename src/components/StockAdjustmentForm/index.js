'use client'
import { useState } from 'react'
import { X, Package, Plus, Minus, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'

const StockAdjustmentForm = ({ product, onClose, onSuccess, slug }) => {
  const [transactionType, setTransactionType] = useState('RESTOCK')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!quantity || parseInt(quantity) === 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          slug: slug,
          type: transactionType,
          quantity: parseInt(quantity),
          notes: notes.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust stock')
      }

      toast.success(`Stock ${transactionType.toLowerCase()} successful!`)
      setQuantity('')
      setNotes('')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error(error.message || 'Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  const typeConfig = {
    RESTOCK: {
      label: 'Restock',
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Add items to inventory'
    },
    ADJUSTMENT: {
      label: 'Adjustment',
      icon: RefreshCw,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Correct inventory count (can be +/-)'
    }
  }

  const currentConfig = typeConfig[transactionType]
  const Icon = currentConfig.icon
  const newStock = product.qty + (transactionType === 'ADJUSTMENT' ? parseInt(quantity || 0) : parseInt(quantity || 0))

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10 text-gray-400" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">Current Stock: <span className="font-bold text-gray-900">{product.qty}</span></p>
            </div>
          </div>
        </div>

        {/* Transaction Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(typeConfig).map(([type, config]) => {
              const TypeIcon = config.icon
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTransactionType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    transactionType === type
                      ? `${config.borderColor} ${config.bgColor} shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <TypeIcon className={`w-6 h-6 ${transactionType === type ? config.color : 'text-gray-400'}`} />
                    <span className={`font-medium ${transactionType === type ? config.color : 'text-gray-600'}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      {config.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Quantity {transactionType === 'ADJUSTMENT' ? '(+/-)' : ''}
          </label>
          <div className="relative">
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={transactionType === 'ADJUSTMENT' ? 'Enter +/- amount' : 'Enter quantity to add'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required
            />
          </div>
          {quantity && (
            <p className="mt-2 text-sm text-gray-600">
              New Stock: <span className="font-bold text-gray-900">{newStock}</span>
              {newStock < 0 && <span className="text-red-600 ml-2">(Warning: Negative stock!)</span>}
            </p>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes {transactionType === 'RESTOCK' ? '(Optional)' : '(Required for adjustments)'}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this transaction..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required={transactionType === 'ADJUSTMENT'}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !quantity}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              loading || !quantity
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `${currentConfig.bgColor} ${currentConfig.color} border-2 ${currentConfig.borderColor} hover:opacity-80`
            }`}
          >
            {loading ? 'Processing...' : `Confirm ${currentConfig.label}`}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StockAdjustmentForm
