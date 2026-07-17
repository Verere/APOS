import { fetchProducts } from '@/actions/fetch'
import { getInventoryReport } from '@/lib/inventory-report.service'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

function formatDateInput(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultDateRange() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatDateInput(firstDay),
    endDate: formatDateInput(today),
  }
}

function toSafeString(value) {
  return String(value || '').trim()
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function sortRows(rows, sortBy, sortOrder) {
  const orderFactor = sortOrder === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]

    if (typeof aVal === 'string' || typeof bVal === 'string') {
      return String(aVal || '').localeCompare(String(bVal || '')) * orderFactor
    }

    return (toNumber(aVal) - toNumber(bVal)) * orderFactor
  })
}

export default async function InventoryReportPage({ params, searchParams }) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const defaults = getDefaultDateRange()

  const startDate = toSafeString(resolvedSearchParams?.startDate) || defaults.startDate
  const endDate = toSafeString(resolvedSearchParams?.endDate) || defaults.endDate
  const productId = toSafeString(resolvedSearchParams?.productId)
  const q = toSafeString(resolvedSearchParams?.q).toLowerCase()
  const sortBy = toSafeString(resolvedSearchParams?.sortBy) || 'closingStock'
  const sortOrder = toSafeString(resolvedSearchParams?.sortOrder) === 'asc' ? 'asc' : 'desc'

  const products = await fetchProducts(slug)
  const safeProducts = Array.isArray(products) ? products : []

  const productMap = new Map(
    safeProducts.map((product) => [
      String(product._id),
      {
        id: String(product._id),
        name: product.name || 'Unnamed Product',
        category: product.category || '',
        barcode: product.barcode || '',
      },
    ])
  )

  const report = await getInventoryReport({
    slug,
    startDate,
    endDate,
    productId: productId || undefined,
  })

  const mergedRows = report.products.map((row) => {
    const details = productMap.get(String(row.productId))
    return {
      ...row,
      productName: details?.name || `Product ${row.productId.slice(-6)}`,
      category: details?.category || '-',
      barcode: details?.barcode || '-',
    }
  })

  const filteredRows = q
    ? mergedRows.filter((row) => {
        const haystack = `${row.productName} ${row.category} ${row.barcode}`.toLowerCase()
        return haystack.includes(q)
      })
    : mergedRows

  const allowedSorts = new Set([
    'productName',
    'openingStock',
    'restock',
    'sales',
    'complimentary',
    'returns',
    'damage',
    'transferIn',
    'transferOut',
    'adjustments',
    'closingStock',
    'transactionCount',
  ])

  const safeSortBy = allowedSorts.has(sortBy) ? sortBy : 'closingStock'
  const rows = sortRows(filteredRows, safeSortBy, sortOrder)

  const totals = rows.reduce(
    (acc, row) => {
      acc.openingStock += row.openingStock
      acc.restock += row.restock
      acc.sales += row.sales
      acc.complimentary += row.complimentary
      acc.returns += row.returns
      acc.damage += row.damage
      acc.transferIn += row.transferIn
      acc.transferOut += row.transferOut
      acc.adjustments += row.adjustments
      acc.closingStock += row.closingStock
      acc.transactionCount += row.transactionCount
      return acc
    },
    {
      openingStock: 0,
      restock: 0,
      sales: 0,
      complimentary: 0,
      returns: 0,
      damage: 0,
      transferIn: 0,
      transferOut: 0,
      adjustments: 0,
      closingStock: 0,
      transactionCount: 0,
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Report</h1>
        <p className="text-sm md:text-base text-gray-600">
          Stock movement summary from transactions between {startDate} and {endDate}.
        </p>
      </div>

      <form method="get" className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              name="productId"
              defaultValue={productId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All products</option>
              {safeProducts.map((product) => (
                <option key={String(product._id)} value={String(product._id)}>
                  {product.name || 'Unnamed Product'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Name, category, barcode"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              name="sortBy"
              defaultValue={safeSortBy}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="productName">Product</option>
              <option value="openingStock">Opening Stock</option>
              <option value="restock">Restock</option>
              <option value="sales">Sales</option>
              <option value="complimentary">Complimentary</option>
              <option value="returns">Returns</option>
              <option value="damage">Damage</option>
              <option value="transferIn">Transfer In</option>
              <option value="transferOut">Transfer Out</option>
              <option value="adjustments">Adjustments</option>
              <option value="closingStock">Closing Stock</option>
              <option value="transactionCount">Transactions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <select
              name="sortOrder"
              defaultValue={sortOrder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <a
              href={`/${slug}/dashboard/inventory-report`}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
            >
              Reset
            </a>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Opening</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(totals.openingStock)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Restock</p>
          <p className="text-lg font-bold text-emerald-700">+{formatNumber(totals.restock)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Sales</p>
          <p className="text-lg font-bold text-red-700">-{formatNumber(totals.sales)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Complimentary</p>
          <p className="text-lg font-bold text-red-700">-{formatNumber(totals.complimentary)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Transfer In / Out</p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(totals.transferIn)} / {formatNumber(totals.transferOut)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Closing</p>
          <p className="text-lg font-bold text-blue-700">{formatNumber(totals.closingStock)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Inventory Movement Report</h2>
          <span className="text-xs md:text-sm text-gray-500">{rows.length} product(s) • {formatNumber(totals.transactionCount)} txn(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Opening</th>
                <th className="text-right px-4 py-3 font-semibold">Restock</th>
                <th className="text-right px-4 py-3 font-semibold">Sales</th>
                <th className="text-right px-4 py-3 font-semibold">Complimentary</th>
                <th className="text-right px-4 py-3 font-semibold">Returns</th>
                <th className="text-right px-4 py-3 font-semibold">Damage</th>
                <th className="text-right px-4 py-3 font-semibold">Transfer In</th>
                <th className="text-right px-4 py-3 font-semibold">Transfer Out</th>
                <th className="text-right px-4 py-3 font-semibold">Adjustments</th>
                <th className="text-right px-4 py-3 font-semibold">Closing</th>
                <th className="text-right px-4 py-3 font-semibold">Txn</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-gray-500">
                    No transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.productId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.openingStock)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">+{formatNumber(row.restock)}</td>
                    <td className="px-4 py-3 text-right text-red-700">-{formatNumber(row.sales)}</td>
                    <td className="px-4 py-3 text-right text-red-700">-{formatNumber(row.complimentary)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">+{formatNumber(row.returns)}</td>
                    <td className="px-4 py-3 text-right text-red-700">-{formatNumber(row.damage)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">+{formatNumber(row.transferIn)}</td>
                    <td className="px-4 py-3 text-right text-red-700">-{formatNumber(row.transferOut)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.adjustments)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">{formatNumber(row.closingStock)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(row.transactionCount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-4 py-3 font-bold text-gray-900" colSpan={2}>Totals</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNumber(totals.openingStock)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatNumber(totals.restock)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">-{formatNumber(totals.sales)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">-{formatNumber(totals.complimentary)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatNumber(totals.returns)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">-{formatNumber(totals.damage)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatNumber(totals.transferIn)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-700">-{formatNumber(totals.transferOut)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNumber(totals.adjustments)}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">{formatNumber(totals.closingStock)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNumber(totals.transactionCount)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
