"use client"

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Table } from '@radix-ui/themes'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import moment from 'moment'
import { useReactToPrint } from 'react-to-print'
import { CheckCircle, Printer } from 'lucide-react'

import { GlobalContext } from '@/context'
import { currencyFormat } from '@/utils/currency'
import { formatTime } from '@/utils/date'
import { updateCancelOrder } from '@/actions/update'
import { toast } from 'react-toastify'

function CancelConfirmToast({ onConfirm, onClose }) {
  const [reason, setReason] = useState('')

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800">Cancel this order?</p>
      <p className="text-xs text-gray-600">Enter a cancellation reason. Stock and related records will be reversed.</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for cancellation"
        rows={3}
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
          onClick={() => {
            const trimmed = reason.trim()
            if (!trimmed) {
              toast.error('Cancellation reason is required')
              return
            }
            onConfirm(trimmed)
          }}
        >
          Yes, Cancel Order
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={onClose}
        >
          No
        </button>
      </div>
    </div>
  )
}

const OrderTable = ({ patients = [], slug }) => {
  const { user, store } = useContext(GlobalContext)
  const pathname = usePathname()
  const { replace } = useRouter()
  const printRef = useRef(null)

  const [selectedDate, setSelectedDate] = useState(null)
  const [cancelingOrderId, setCancelingOrderId] = useState(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
   const [receiptSettings, setReceiptSettings] = useState({
      receiptFontFamily: 'monospace',
      receiptFontSize: 12,
      receiptFooterNote: '',
    })
   const resolvedReceiptFooterNote = String(receiptSettings?.receiptFooterNote || '').trim()
 
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

  const bDate = useMemo(() => moment().format('D/MM/YYYY'), [])

  const filteredOrders = useMemo(() => {
    const targetDate = selectedDate ? format(selectedDate, 'd/MM/yyyy') : bDate
    return (patients || []).filter((order) => order?.bDate === targetDate)
  }, [patients, selectedDate, bDate])

  const selectedOrderItems = useMemo(() => completedOrder?.items || [], [completedOrder])

  const openReceipt = useCallback((order) => {
    setCompletedOrder(order)
    setShowPrintModal(true)
  }, [])

  const handleCancelOrder = useCallback(async (orderId, cancellationReason) => {
    try {
      setCancelingOrderId(orderId)
      const cancelledBy = user?.email || user?.name || 'system'
      const result = await updateCancelOrder(orderId, cancellationReason, cancelledBy)
      if (result?.error) {
        throw new Error(result.error)
      }
      toast.success('Order cancelled successfully')
      replace(pathname)
    } catch (error) {
      console.error('Cancel order error:', error)
      toast.error(error?.message || 'Failed to cancel order')
    } finally {
      setCancelingOrderId(null)
    }
  }, [pathname, replace, user])

  const requestCancelOrder = useCallback((orderId) => {
    toast.warning(
      ({ closeToast }) => (
        <CancelConfirmToast
          onClose={closeToast}
          onConfirm={async (reason) => {
            closeToast()
            await handleCancelOrder(orderId, reason)
          }}
        />
      ),
      { autoClose: false, closeOnClick: false, draggable: false }
    )
  }, [handleCancelOrder])

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print { body { margin: 0; padding: 0; } }
    `
  })

  return (
    <div className="p-6 -mt-[6px]">
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Orders</h2>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Filter by Date:</label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                placeholderText="Select a date..."
                isClearable
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>
          </div>

          {selectedDate ? (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <span className="text-sm text-gray-600">Showing orders for:</span>
              <span className="font-semibold text-blue-600">{format(selectedDate, 'dd/MM/yyyy')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <span className="text-sm text-gray-600">Showing today&apos;s orders:</span>
              <span className="font-semibold text-green-600">{bDate}</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{filteredOrders.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700">
              {currencyFormat(filteredOrders.reduce((sum, order) => sum + Number(order?.amount || 0), 0))}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Amount Collected</p>
            <p className="text-2xl font-bold text-purple-700">
              {currencyFormat(filteredOrders.reduce((sum, order) => sum + Number(order?.amountPaid || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table.Root layout="auto" variant="surface" className="w-full">
            <Table.Header>
              <Table.Row className="bg-gray-50">
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Receipt No.</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Customer</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Items Sold</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Order Amount</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Amount Paid</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">User</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="font-semibold text-gray-700">Action</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <Table.Row key={order?._id} className="hover:bg-gray-50 transition-colors">
                    <Table.RowHeaderCell className="font-semibold text-blue-600">#{order?.orderNum || 'N/A'}</Table.RowHeaderCell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {order?.orderName || order?.customerName || 'Walk-in Customer'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {Array.isArray(order?.items) && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                              <span className="font-semibold text-blue-600 min-w-[30px]">{item.qty}×</span>
                              <span className="text-gray-700 uppercase">{item.item || item.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No items</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="font-semibold text-gray-800">{currencyFormat(order?.amount)}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {currencyFormat(order?.amountPaid)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-gray-700">
                        <div className="font-medium">{order?.bDate}</div>
                        <div className="text-xs text-gray-500">{formatTime(order?.createdAt)}</div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {order?.soldBy || order?.user || 'N/A'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="flex space-x-2">
                      <button
                        onClick={() => openReceipt(order)}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        Print
                      </button>
                      {order?.isCancelled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Cancelled</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestCancelOrder(order?._id)}
                          disabled={cancelingOrderId === order?._id}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {cancelingOrderId === order?._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm">{selectedDate ? 'Try selecting a different date' : 'No orders for today yet'}</p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      </div>

   

      {showPrintModal && completedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Receipt</h2>
              <p className="text-gray-600">Receipt #{completedOrder?.orderNum || 'N/A'}</p>
            </div>

            <div style={{ display: 'none' }}>
              <div ref={printRef} style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '5mm' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{store?.name || 'STORE'}</h2>
                  <p style={{ margin: '2px 0', fontSize: '12px' , fontWeight: '500'}}>{store?.address || 'Address'}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px' , fontWeight: '500'}}>Tel: 0{store?.number || ''} 0{store?.whatsapp || ''}</p>
                  {resolvedReceiptFooterNote ? <p>{resolvedReceiptFooterNote}</p> : null}
                  <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }} />
                </div>

                <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' , fontWeight: '500'}}>
                    <span>Date:</span><span>{completedOrder?.bDate || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                    <span>Receipt #:</span><span>{completedOrder?.orderNum || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                    <span>Customer:</span><span>{completedOrder?.orderName || completedOrder?.customerName || 'Walk-in Customer'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cashier:</span><span>{completedOrder?.soldBy || user?.name || 'N/A'}</span>
                  </div>
                  <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }} />
                </div>

                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                      <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                      <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderItems.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px dotted #ccc', fontWeight: '500' }}>
                        <td style={{ padding: '4px 0', fontSize: '13px' , fontWeight: '500' }}>{item?.name || item?.item || item?.productName || 'Item'}</td>
                        <td style={{ textAlign: 'center', padding: '4px 0' }}>{item?.qty ?? item?.quantity ?? 0}</td>
                        <td style={{ textAlign: 'right', padding: '4px 0' }}>{currencyFormat(item?.amount ?? item?.total ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>TOTAL:</span><span>{currencyFormat(completedOrder?.amount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                    <span>PAID:</span><span>{currencyFormat(completedOrder?.amountPaid || 0)}</span>
                  </div>
                  {(completedOrder?.bal ?? 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                      <span>BALANCE:</span><span>{currencyFormat(completedOrder?.bal || 0)}</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }} />
                <div style={{ textAlign: 'center', fontSize: '12px' }}>
                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Thank you for your patronage</p>
                  <p style={{ margin: '5px 0', fontSize: '10px', fontWeight: '500' }}>Powered by: www.marketbook.app</p>
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
              </div>
              <button
                onClick={() => {
                  setShowPrintModal(false)
                  setCompletedOrder(null)
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
  )
}

export default OrderTable
