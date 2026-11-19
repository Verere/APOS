"use client"

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Table } from '@radix-ui/themes'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import moment from 'moment'
import { useReactToPrint } from 'react-to-print'
import { CheckCircle, Download, Printer } from 'lucide-react'

import { GlobalContext } from '@/context'
import { currencyFormat } from '@/utils/currency'
import { formatTime } from '@/utils/date'
import { updateCancelOrder } from '@/actions/update'
import { toast } from 'react-toastify'
import db from '@/lib/db/db'

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

const OrderTable = ({ patients = [], slug, serverUnavailable = false, serverErrorMessage = '' }) => {
  const { user, store } = useContext(GlobalContext)
  const pathname = usePathname()
  const { replace } = useRouter()
  const printRef = useRef(null)

  const [selectedDate, setSelectedDate] = useState(null)
  const [cancelingOrderId, setCancelingOrderId] = useState(null)
  const [exportLoading, setExportLoading] = useState('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [queuedItems, setQueuedItems] = useState([])
  const [loadingQueuedItems, setLoadingQueuedItems] = useState(false)
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

  const loadQueuedItems = useCallback(async () => {
    setLoadingQueuedItems(true)
    try {
      const queueItems = await db.syncQueue.orderBy('createdAt').reverse().toArray()
      setQueuedItems(Array.isArray(queueItems) ? queueItems : [])
    } catch {
      setQueuedItems([])
    } finally {
      setLoadingQueuedItems(false)
    }
  }, [])

  useEffect(() => {
    if (!serverUnavailable) {
      setQueuedItems([])
      return
    }

    void loadQueuedItems()
  }, [serverUnavailable, loadQueuedItems])

  const filteredOrders = useMemo(() => {
    const targetDate = selectedDate ? format(selectedDate, 'd/MM/yyyy') : bDate
    return (patients || []).filter((order) => order?.bDate === targetDate)
  }, [patients, selectedDate, bDate])

  const exportReport = async (formatType) => {
    setExportLoading(formatType)

    try {
      const exportedAt = new Date()
      const dateStamp = [
        exportedAt.getFullYear(),
        String(exportedAt.getMonth() + 1).padStart(2, '0'),
        String(exportedAt.getDate()).padStart(2, '0'),
      ].join('-')
      const fileBaseName = `Orders_Report_${dateStamp}`
      const formatReportCurrency = (value) => new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0)
      const amountValue = (value) => {
        const amount = Number(value || 0)
        return Number.isFinite(amount) ? amount : 0
      }
      const exportRows = filteredOrders.map((order) => {
        const isoDate = normalizeOrderDate(order?.bDate, order?.createdAt)
        return {
          orderNumber: order?.orderNum || 'N/A',
          customer: order?.orderName || order?.customerName || 'Walk-in Customer',
          items: Array.isArray(order?.items) && order.items.length
            ? order.items.map((item) => {
                const quantity = Number(item?.qty ?? item?.quantity ?? 0)
                const name = item?.item || item?.name || item?.productName || 'Item'
                return `${quantity} x ${name}`
              }).join('\n')
            : 'No items',
          amount: amountValue(order?.amount),
          amountPaid: amountValue(order?.amountPaid),
          businessDate: isoDate || order?.bDate || '',
          time: order?.createdAt && !Number.isNaN(new Date(order.createdAt).getTime())
            ? formatTime(order.createdAt)
            : '',
          user: order?.soldBy || order?.user || 'N/A',
        }
      })
      const totalOrderAmount = exportRows.reduce((sum, order) => sum + order.amount, 0)
      const totalAmountPaid = exportRows.reduce((sum, order) => sum + order.amountPaid, 0)
      const outstandingBalance = exportRows.reduce(
        (sum, order) => sum + Math.max(0, order.amount - order.amountPaid),
        0
      )
      const formattedExportTime = exportedAt.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
      const reportDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : bDate
      const reportDescription = `Orders for ${reportDate}`
      const headers = [
        'Order No.',
        'Customer',
        'Items Sold',
        'Order Amount (NGN)',
        'Amount Paid (NGN)',
        'Date',
        'Time',
        'User',
      ]
      const csvCell = (value) => {
        let text = String(value ?? '')
        if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) {
          text = `'${text}`
        }
        return `"${text.replace(/"/g, '""')}"`
      }

      if (formatType === 'CSV') {
        const metadataRow = (label, value) => [label, value, '', '', '', '', '', '']
        const csvRows = [
          ['Orders Report', '', '', '', '', '', '', ''],
          ['Report description', reportDescription, '', '', '', '', '', ''],
          ['Organization', 'MarketBook', 'Exported at', formattedExportTime, '', '', '', ''],
          metadataRow('Total records exported', exportRows.length),
          metadataRow('Total order value (NGN)', totalOrderAmount),
          metadataRow('Amount collected (NGN)', totalAmountPaid),
          metadataRow('Outstanding balance (NGN)', outstandingBalance),
          ['', '', '', '', '', '', '', ''],
          headers,
          ...exportRows.map((order) => [
            order.orderNumber,
            order.customer,
            order.items,
            order.amount,
            order.amountPaid,
            order.businessDate,
            order.time,
            order.user,
          ]),
        ]
        const csvContent = `\uFEFF${csvRows
          .map((row) => row.map(csvCell).join(','))
          .join('\r\n')}`
        downloadOrderReport(
          new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
          `${fileBaseName}.csv`
        )
      } else if (formatType === 'Excel') {
        const { default: ExcelJS } = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'MarketBook'
        workbook.created = exportedAt
        const worksheet = workbook.addWorksheet('Orders')
        const displayRows = exportRows.map((order) => [
          order.orderNumber,
          order.customer,
          order.items,
          formatReportCurrency(order.amount),
          formatReportCurrency(order.amountPaid),
          formatExcelBusinessDate(order.businessDate),
          order.time,
          order.user,
        ])
        const columnWidths = headers.map((header) => Math.min(42, Math.max(12, header.length + 2)))
        displayRows.forEach((row) => row.forEach((value, index) => {
          columnWidths[index] = Math.min(
            42,
            Math.max(columnWidths[index], String(value ?? '').length + 2)
          )
        }))
        worksheet.columns = columnWidths.map((width) => ({ width }))
        worksheet.mergeCells('A1:H1')
        worksheet.getCell('A1').value = 'Orders Report'
        worksheet.mergeCells('A2:H2')
        worksheet.getCell('A2').value = reportDescription
        worksheet.getRow(3).values = [
          'Organization',
          'MarketBook',
          'Exported at',
          formattedExportTime,
        ]
        worksheet.getRow(4).values = [
          'Total records',
          exportRows.length,
          'Total order value (NGN)',
          totalOrderAmount,
          'Amount collected (NGN)',
          totalAmountPaid,
          'Outstanding (NGN)',
          outstandingBalance,
        ]
        worksheet.getRow(5).values = headers
        worksheet.getRow(1).height = 30
        worksheet.getRow(2).height = 22
        worksheet.getRow(3).height = 22
        worksheet.getRow(4).height = 26
        worksheet.getRow(5).height = 24
        worksheet.getCell('A1').font = {
          name: 'Arial',
          size: 18,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        }
        worksheet.getCell('A1').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF17365D' },
        }
        worksheet.getCell('A2').font = {
          name: 'Arial',
          size: 11,
          italic: true,
          color: { argb: 'FF44546A' },
        }
        worksheet.getRow(3).eachCell((cell, columnNumber) => {
          cell.font = {
            name: 'Arial',
            size: 9,
            bold: columnNumber % 2 === 1,
            color: { argb: 'FF1F2937' },
          }
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } } }
        })
        worksheet.getRow(4).eachCell((cell, columnNumber) => {
          cell.font = {
            name: 'Arial',
            size: 9,
            bold: columnNumber % 2 === 1,
            color: { argb: 'FF1F2937' },
          }
          cell.alignment = { vertical: 'middle', wrapText: true }
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } } }
        })
        for (const address of ['D4', 'F4', 'H4']) {
          worksheet.getCell(address).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
        }
        worksheet.getRow(5).eachCell((cell) => {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' },
          }
          cell.alignment = { vertical: 'middle', wrapText: true }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
          }
        })
        exportRows.forEach((order, index) => {
          const excelDate = parseExcelBusinessDate(order.businessDate)
          const row = worksheet.addRow([
            order.orderNumber,
            order.customer,
            order.items,
            order.amount,
            order.amountPaid,
            excelDate || order.businessDate,
            order.time,
            order.user,
          ])
          row.height = 24
          row.eachCell((cell, columnNumber) => {
            cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1F2937' } }
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5F9' },
            }
            cell.border = { bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } } }
            cell.alignment = {
              vertical: 'middle',
              horizontal: [4, 5].includes(columnNumber) ? 'right' : 'left',
              wrapText: columnNumber === 3,
            }
          })
          row.getCell(4).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
          row.getCell(5).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
          if (excelDate) row.getCell(6).numFmt = 'dd mmm yyyy'
        })
        worksheet.views = [{ state: 'frozen', ySplit: 5, topLeftCell: 'A6' }]
        worksheet.autoFilter = `A5:H${Math.max(5, exportRows.length + 5)}`
        worksheet.pageSetup = {
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: '5:5',
        }
        const buffer = await workbook.xlsx.writeBuffer()
        downloadOrderReport(
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          `${fileBaseName}.xlsx`
        )
      } else {
        const [{ jsPDF }, { default: autoTable }] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable'),
        ])
        const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        const pageWidth = document.internal.pageSize.getWidth()
        document.setFont('helvetica', 'bold')
        document.setFontSize(19)
        document.setTextColor(23, 54, 93)
        document.text('Orders Report', 12, 17)
        document.setFont('helvetica', 'normal')
        document.setFontSize(9)
        document.setTextColor(71, 85, 105)
        document.text(`MarketBook | ${reportDescription}`, 12, 24)
        document.text(`Exported: ${formattedExportTime}`, 12, 30)
        document.text(
          `Records: ${exportRows.length} | Total order value: ${formatReportCurrency(totalOrderAmount).replace(/₦/g, 'NGN ')} | Collected: ${formatReportCurrency(totalAmountPaid).replace(/₦/g, 'NGN ')} | Outstanding: ${formatReportCurrency(outstandingBalance).replace(/₦/g, 'NGN ')}`,
          12,
          36
        )
        const pdfRows = exportRows.map((order) => [
          order.orderNumber,
          order.customer,
          order.items,
          formatReportCurrency(order.amount).replace(/₦/g, 'NGN '),
          formatReportCurrency(order.amountPaid).replace(/₦/g, 'NGN '),
          formatPdfBusinessDate(order.businessDate),
          order.time,
          order.user,
        ])
        autoTable(document, {
          head: [headers],
          body: pdfRows,
          startY: 42,
          margin: { top: 12, right: 12, bottom: 17, left: 12 },
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 2.5,
            overflow: 'linebreak',
            textColor: [31, 41, 55],
            lineColor: [226, 232, 240],
          },
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [241, 245, 249] },
          columnStyles: {
            0: { cellWidth: 24 },
            1: { cellWidth: 31 },
            2: { cellWidth: 70 },
            3: { cellWidth: 32, halign: 'right' },
            4: { cellWidth: 32, halign: 'right' },
            5: { cellWidth: 24 },
            6: { cellWidth: 19 },
            7: { cellWidth: 28 },
          },
          didDrawPage: (page) => {
            const pageHeight = document.internal.pageSize.getHeight()
            document.setFontSize(8)
            document.setTextColor(100, 116, 139)
            document.text('MarketBook | Orders Report', 12, pageHeight - 7)
            document.text(`Page ${page.pageNumber}`, pageWidth - 12, pageHeight - 7, {
              align: 'right',
            })
          },
        })
        document.save(`${fileBaseName}.pdf`)
      }

      toast.success(`${formatType} report exported successfully (${exportRows.length} orders).`)
    } catch (exportError) {
      console.error('Order report export failed:', exportError)
      toast.error(`Could not create the ${formatType} export. Please try again.`)
    } finally {
      setExportLoading('')
    }
  }

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
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-gray-600">Export:</span>
            {['CSV', 'Excel', 'PDF'].map((formatType) => (
              <button
                key={formatType}
                type="button"
                onClick={() => exportReport(formatType)}
                disabled={Boolean(exportLoading)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportLoading === formatType ? (
                  `Preparing ${formatType}...`
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {formatType === 'Excel' ? 'Excel (.xlsx)' : formatType}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {serverUnavailable && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-semibold">Server unavailable. Showing local queued transactions.</p>
            <p className="text-xs text-amber-700 mt-1">
              {serverErrorMessage || 'Database is temporarily unavailable. Queued items will sync automatically when connection is restored.'}
            </p>
          </div>
        )}

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

      {serverUnavailable && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-amber-50 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Queued Transactions (Offline)</h3>
              <p className="text-xs text-amber-700">These are pending sync items stored locally on this device.</p>
            </div>
            <button
              type="button"
              onClick={() => void loadQueuedItems()}
              disabled={loadingQueuedItems}
              className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingQueuedItems ? 'Refreshing...' : 'Refresh Queue'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <Table.Root layout="auto" variant="surface" className="w-full">
              <Table.Header>
                <Table.Row className="bg-gray-50">
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Transaction ID</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Type</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Items Sold</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Amount</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Attempts</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Next Retry</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-gray-700">Created</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {!loadingQueuedItems && queuedItems.length > 0 ? (
                  queuedItems.map((item) => {
                    const amount = Number(item?.payload?.orderAmount ?? item?.payload?.amountPaid ?? item?.payload?.order?.amount ?? 0)
                    const nextRetryAt = item?.nextRetryAt ? new Date(item.nextRetryAt) : null
                    const createdAt = item?.createdAt ? new Date(item.createdAt) : null
                    const queuedSaleItems = Array.isArray(item?.payload?.items)
                      ? item.payload.items
                      : Array.isArray(item?.payload?.order?.items)
                        ? item.payload.order.items
                        : []

                    return (
                      <Table.Row key={item?.id || item?.transactionId} className="hover:bg-gray-50 transition-colors align-top">
                        <Table.RowHeaderCell className="font-mono text-xs text-blue-700">{item?.transactionId || 'N/A'}</Table.RowHeaderCell>
                        <Table.Cell>{item?.type || 'SALE'}</Table.Cell>
                        <Table.Cell className="min-w-[220px]">
                          {queuedSaleItems.length > 0 ? (
                            <div className="space-y-1">
                              {queuedSaleItems.map((queuedItem, index) => {
                                const qty = Number(queuedItem?.qty ?? queuedItem?.quantity ?? 0)
                                const name = queuedItem?.productName || queuedItem?.name || queuedItem?.item || queuedItem?.product || `Item ${index + 1}`
                                return (
                                  <div key={`${item?.transactionId || 'queue'}-${index}`} className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700 border border-gray-200">
                                    <span className="font-semibold text-blue-700">{qty}×</span>
                                    <span className="truncate">{name}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No item details</span>
                          )}
                        </Table.Cell>
                        <Table.Cell>{currencyFormat(amount)}</Table.Cell>
                        <Table.Cell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                            {item?.status || 'PENDING'}
                          </span>
                        </Table.Cell>
                        <Table.Cell>{Number(item?.attempts || 0)}</Table.Cell>
                        <Table.Cell className="text-xs text-gray-600">
                          {nextRetryAt && !Number.isNaN(nextRetryAt.getTime()) ? nextRetryAt.toLocaleString() : 'Pending'}
                        </Table.Cell>
                        <Table.Cell className="text-xs text-gray-600">
                          {createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : 'N/A'}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-8 text-sm text-gray-500">
                      {loadingQueuedItems ? 'Loading queued items...' : 'No queued items found on this device.'}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </div>
        </div>
      )}

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

function normalizeOrderDate(businessDate, createdAt) {
  const value = String(businessDate || '').trim()
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return value

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, day, month, year] = slashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const parsed = new Date(value || createdAt)
  if (Number.isNaN(parsed.getTime())) return ''
  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatPdfBusinessDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value || '')
}

function formatExcelBusinessDate(value) {
  return formatPdfBusinessDate(value)
}

function parseExcelBusinessDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`) : null
}

function downloadOrderReport(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}
