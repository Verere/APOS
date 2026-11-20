"use client"

import { useState } from 'react'
import ExportButtons from '@/components/ExportButtons'

const REPORT_COLUMNS = [
  { key: 'productName', label: 'Product', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'openingStock', label: 'Opening', type: 'quantity' },
  { key: 'restock', label: 'Restock', type: 'quantity' },
  { key: 'sales', label: 'Sales', type: 'quantity' },
  { key: 'complimentary', label: 'Complimentary', type: 'quantity' },
  { key: 'returns', label: 'Returns', type: 'quantity' },
  { key: 'damage', label: 'Damage', type: 'quantity' },
  { key: 'transferIn', label: 'Transfer In', type: 'quantity' },
  { key: 'transferOut', label: 'Transfer Out', type: 'quantity' },
  { key: 'adjustments', label: 'Adjustments', type: 'quantity' },
  { key: 'closingStock', label: 'Closing', type: 'quantity' },
  { key: 'transactionCount', label: 'Transactions', type: 'integer' },
]

const SUMMARY_FIELDS = [
  ['Total products', 'productCount'],
  ['Transactions', 'transactionCount'],
  ['Opening stock', 'openingStock'],
  ['Restock', 'restock'],
  ['Sales', 'sales'],
  ['Complimentary', 'complimentary'],
  ['Returns', 'returns'],
  ['Damage', 'damage'],
  ['Transfer in', 'transferIn'],
  ['Transfer out', 'transferOut'],
  ['Adjustments', 'adjustments'],
  ['Closing stock', 'closingStock'],
]

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(toFiniteNumber(value))
}

function getColumnName(columnNumber) {
  let name = ''
  let remaining = columnNumber
  while (remaining > 0) {
    const remainder = (remaining - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    remaining = Math.floor((remaining - 1) / 26)
  }
  return name
}

function downloadReport(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

export default function InventoryReportExport({
  rows = [],
  totals = {},
  startDate,
  endDate,
  productFilter = 'All products',
  searchTerm = '',
  sortBy = 'closingStock',
  sortOrder = 'desc',
}) {
  const [exportLoading, setExportLoading] = useState('')
  const [exportMessage, setExportMessage] = useState(null)

  const exportReport = async (formatType) => {
    setExportLoading(formatType)
    setExportMessage(null)

    try {
      const exportedAt = new Date()
      const dateStamp = [
        exportedAt.getFullYear(),
        String(exportedAt.getMonth() + 1).padStart(2, '0'),
        String(exportedAt.getDate()).padStart(2, '0'),
      ].join('-')
      const fileBaseName = `Inventory_Report_${dateStamp}`
      const headers = REPORT_COLUMNS.map((column) => column.label)
      const exportRows = rows.map((row) =>
        REPORT_COLUMNS.map((column) =>
          column.type === 'text'
            ? String(row?.[column.key] || '')
            : toFiniteNumber(row?.[column.key])
        )
      )
      const safeTotals = Object.fromEntries(
        SUMMARY_FIELDS.map(([label, key]) => [
          key,
          key === 'productCount' ? rows.length : toFiniteNumber(totals?.[key]),
        ])
      )
      const formattedExportTime = exportedAt.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
      const reportDescription = `Stock movement summary from ${startDate} to ${endDate}`
      const filtersDescription = [
        `Date range: ${startDate} to ${endDate}`,
        `Product: ${productFilter}`,
        `Search: ${searchTerm.trim() || 'None'}`,
        `Sorted by: ${sortBy} (${sortOrder})`,
      ].join(' | ')
      const csvCell = (value) => {
        let text = String(value ?? '')
        if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) {
          text = `'${text}`
        }
        return `"${text.replace(/"/g, '""')}"`
      }

      if (formatType === 'CSV') {
        const metadataRow = (label, value) => [label, value, ...Array(headers.length - 2).fill('')]
        const csvRows = [
          ['Inventory Movement Report', ...Array(headers.length - 1).fill('')],
          metadataRow('Report description', reportDescription),
          ['Organization', 'MarketBook', 'Exported at', formattedExportTime, ...Array(headers.length - 4).fill('')],
          metadataRow('Active filters', filtersDescription),
          ...SUMMARY_FIELDS.map(([label, key]) => metadataRow(label, safeTotals[key])),
          Array(headers.length).fill(''),
          headers,
          ...exportRows,
        ]
        const csvContent = `\uFEFF${csvRows
          .map((row) => row.map(csvCell).join(','))
          .join('\r\n')}`
        downloadReport(
          new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
          `${fileBaseName}.csv`
        )
      } else if (formatType === 'Excel') {
        const { default: ExcelJS } = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'MarketBook'
        workbook.created = exportedAt
        const worksheet = workbook.addWorksheet('Inventory')
        const columnWidths = headers.map((header) => Math.min(42, Math.max(12, header.length + 2)))
        exportRows.forEach((row) => row.forEach((value, index) => {
          columnWidths[index] = Math.min(
            42,
            Math.max(columnWidths[index], String(value ?? '').length + 2)
          )
        }))
        worksheet.columns = columnWidths.map((width) => ({ width }))
        const lastColumn = getColumnName(headers.length)

        worksheet.mergeCells(`A1:${lastColumn}1`)
        worksheet.getCell('A1').value = 'Inventory Movement Report'
        worksheet.mergeCells(`A2:${lastColumn}2`)
        worksheet.getCell('A2').value = reportDescription
        worksheet.getRow(3).values = [
          'Organization',
          'MarketBook',
          'Exported at',
          formattedExportTime,
        ]
        worksheet.mergeCells(`B4:${lastColumn}4`)
        worksheet.getCell('A4').value = 'Active filters'
        worksheet.getCell('B4').value = filtersDescription
        worksheet.getRow(5).values = SUMMARY_FIELDS
          .slice(0, 6)
          .flatMap(([label, key]) => [label, safeTotals[key]])
        worksheet.getRow(6).values = SUMMARY_FIELDS
          .slice(6)
          .flatMap(([label, key]) => [label, safeTotals[key]])
        worksheet.getRow(7).values = headers

        worksheet.getRow(1).height = 30
        worksheet.getRow(2).height = 22
        worksheet.getRow(3).height = 22
        worksheet.getRow(4).height = 30
        worksheet.getRow(5).height = 25
        worksheet.getRow(6).height = 25
        worksheet.getRow(7).height = 24
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
        for (const rowNumber of [3, 4, 5, 6]) {
          worksheet.getRow(rowNumber).eachCell((cell, columnNumber) => {
            cell.font = {
              name: 'Arial',
              size: 9,
              bold: rowNumber === 4 ? columnNumber === 1 : columnNumber % 2 === 1,
              color: { argb: 'FF1F2937' },
            }
            cell.alignment = { vertical: 'middle', wrapText: true }
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } } }
          })
        }
        worksheet.getRow(5).eachCell((cell, columnNumber) => {
          if (columnNumber % 2 === 0) cell.numFmt = '#,##0.##'
        })
        worksheet.getRow(6).eachCell((cell, columnNumber) => {
          if (columnNumber % 2 === 0) cell.numFmt = '#,##0.##'
        })
        worksheet.getRow(7).eachCell((cell, columnNumber) => {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' },
          }
          cell.alignment = {
            vertical: 'middle',
            horizontal: columnNumber > 2 ? 'right' : 'left',
            wrapText: true,
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
          }
        })
        exportRows.forEach((values, rowIndex) => {
          const row = worksheet.addRow(values)
          row.height = 21
          row.eachCell((cell, columnIndex) => {
            const column = REPORT_COLUMNS[columnIndex - 1]
            cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1F2937' } }
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: rowIndex % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5F9' },
            }
            cell.border = { bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } } }
            cell.alignment = {
              vertical: 'middle',
              horizontal: column.type === 'text' ? 'left' : 'right',
              wrapText: column.type === 'text',
            }
            if (column.type === 'integer') cell.numFmt = '#,##0'
            else if (column.type === 'quantity') cell.numFmt = '#,##0.##'
          })
        })

        worksheet.views = [{ state: 'frozen', ySplit: 7, topLeftCell: 'A8' }]
        worksheet.autoFilter = `A7:${lastColumn}${Math.max(7, exportRows.length + 7)}`
        worksheet.pageSetup = {
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: '7:7',
        }
        const buffer = await workbook.xlsx.writeBuffer()
        downloadReport(
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
        document.text('Inventory Movement Report', 12, 17)
        document.setFont('helvetica', 'normal')
        document.setFontSize(9)
        document.setTextColor(71, 85, 105)
        document.text(`MarketBook | ${reportDescription}`, 12, 24)
        document.text(`Exported: ${formattedExportTime}`, 12, 30)
        const summaryLines = [
          `Filters: ${filtersDescription}`,
          `Products: ${formatNumber(safeTotals.productCount, 0)} | Transactions: ${formatNumber(safeTotals.transactionCount, 0)} | Opening: ${formatNumber(safeTotals.openingStock)} | Restock: ${formatNumber(safeTotals.restock)} | Sales: ${formatNumber(safeTotals.sales)} | Complimentary: ${formatNumber(safeTotals.complimentary)}`,
          `Returns: ${formatNumber(safeTotals.returns)} | Damage: ${formatNumber(safeTotals.damage)} | Transfer in: ${formatNumber(safeTotals.transferIn)} | Transfer out: ${formatNumber(safeTotals.transferOut)} | Adjustments: ${formatNumber(safeTotals.adjustments)} | Closing: ${formatNumber(safeTotals.closingStock)}`,
        ].flatMap((line) => document.splitTextToSize(line, pageWidth - 24))
        document.text(summaryLines, 12, 36)
        const tableStartY = 36 + summaryLines.length * 4.5 + 2
        const pdfRows = exportRows.map((row) => row.map((value, index) =>
          REPORT_COLUMNS[index].type === 'integer'
            ? formatNumber(value, 0)
            : REPORT_COLUMNS[index].type === 'quantity'
              ? formatNumber(value)
              : String(value ?? '')
        ))

        autoTable(document, {
          head: [headers],
          body: pdfRows,
          startY: tableStartY,
          margin: { top: 12, right: 12, bottom: 17, left: 12 },
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 7,
            cellPadding: 2,
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
          horizontalPageBreak: true,
          horizontalPageBreakRepeat: [0, 1],
          didDrawPage: (page) => {
            const pageHeight = document.internal.pageSize.getHeight()
            document.setFontSize(8)
            document.setTextColor(100, 116, 139)
            document.text('MarketBook | Inventory Movement Report', 12, pageHeight - 7)
            document.text(`Page ${page.pageNumber}`, pageWidth - 12, pageHeight - 7, {
              align: 'right',
            })
          },
        })
        document.save(`${fileBaseName}.pdf`)
      }

      setExportMessage({
        type: 'success',
        text: `${formatType} report exported successfully (${exportRows.length} products).`,
      })
    } catch (exportError) {
      console.error('Inventory report export failed:', exportError)
      setExportMessage({
        type: 'error',
        text: `Could not create the ${formatType} export. Please try again.`,
      })
    } finally {
      setExportLoading('')
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <ExportButtons onExport={exportReport} exportLoading={exportLoading} />
      {exportMessage && (
        <div
          role={exportMessage.type === 'error' ? 'alert' : 'status'}
          className={`rounded-lg px-3 py-2 text-sm ${
            exportMessage.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {exportMessage.text}
        </div>
      )}
    </div>
  )
}
