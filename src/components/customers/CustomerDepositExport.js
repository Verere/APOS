'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import ExportButtons from '@/components/ExportButtons'

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toFiniteNumber(value))
}

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-NG', { maximumFractionDigits }).format(toFiniteNumber(value))
}

function formatValue(value, type) {
  if (type === 'currency') return formatCurrency(value)
  if (type === 'integer') return formatNumber(value, 0)
  if (type === 'number') return formatNumber(value)
  if (type === 'date') {
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-NG')
  }
  return String(value ?? '')
}

function toCsvCell(value) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? '')
  if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) {
    text = `'${text}`
  }
  return `"${text.replace(/"/g, '""')}"`
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

export default function CustomerDepositExport({
  title,
  description,
  filePrefix,
  organization = 'MarketBook',
  filtersDescription = 'No filters',
  columns,
  rows,
  summary,
  label = 'Export report',
}) {
  const [exportLoading, setExportLoading] = useState('')

  const exportReport = async (formatType) => {
    setExportLoading(formatType)

    try {
      const exportedAt = new Date()
      const dateStamp = [
        exportedAt.getFullYear(),
        String(exportedAt.getMonth() + 1).padStart(2, '0'),
        String(exportedAt.getDate()).padStart(2, '0'),
      ].join('-')
      const fileName = `${filePrefix}_${dateStamp}`
      const headers = columns.map((column) => column.label)
      const formattedExportTime = exportedAt.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })

      if (formatType === 'CSV') {
        const metadataRow = (name, value) => [
          name,
          value,
          ...Array(Math.max(0, headers.length - 2)).fill(''),
        ]
        const csvRows = [
          [title, ...Array(headers.length - 1).fill('')],
          metadataRow('Report description', description),
          ['Organization', organization, 'Exported at', formattedExportTime, ...Array(Math.max(0, headers.length - 4)).fill('')],
          metadataRow('Active filters', filtersDescription),
          metadataRow('Total records exported', rows.length),
          ...summary.map((item) => metadataRow(item.label, item.value)),
          Array(headers.length).fill(''),
          headers,
          ...rows.map((row) => row.map((value) => value)),
        ]
        const csvContent = `\uFEFF${csvRows
          .map((row) => row.map(toCsvCell).join(','))
          .join('\r\n')}`
        downloadReport(
          new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
          `${fileName}.csv`
        )
      } else if (formatType === 'Excel') {
        const { default: ExcelJS } = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        workbook.creator = organization
        workbook.created = exportedAt
        const worksheet = workbook.addWorksheet('Report')
        const visibleRows = rows.map((row) => row.map((value, index) =>
          formatValue(value, columns[index].type)
        ))
        const columnWidths = headers.map((header) => Math.min(42, Math.max(12, header.length + 2)))
        visibleRows.forEach((row) => row.forEach((value, index) => {
          columnWidths[index] = Math.min(
            42,
            Math.max(columnWidths[index], String(value ?? '').length + 2)
          )
        }))
        worksheet.columns = columnWidths.map((width) => ({ width }))
        const lastColumn = getColumnName(headers.length)

        worksheet.mergeCells(`A1:${lastColumn}1`)
        worksheet.getCell('A1').value = title
        worksheet.mergeCells(`A2:${lastColumn}2`)
        worksheet.getCell('A2').value = description
        worksheet.getRow(3).values = ['Organization', organization, 'Exported at', formattedExportTime]
        worksheet.mergeCells(`B4:${lastColumn}4`)
        worksheet.getCell('A4').value = 'Active filters'
        worksheet.getCell('B4').value = filtersDescription

        const summaryPairsPerRow = Math.max(1, Math.floor(headers.length / 2))
        const summaryStartRow = 5
        for (let offset = 0; offset < summary.length; offset += summaryPairsPerRow) {
          const summaryRow = Array(headers.length).fill('')
          summary.slice(offset, offset + summaryPairsPerRow).forEach((item, index) => {
            const column = index * 2
            summaryRow[column] = item.label
            summaryRow[column + 1] = item.value
          })
          worksheet.getRow(summaryStartRow + Math.floor(offset / summaryPairsPerRow)).values = summaryRow
        }
        const summaryRowCount = Math.ceil(summary.length / summaryPairsPerRow)
        const headerRowNumber = summaryStartRow + summaryRowCount
        worksheet.getRow(headerRowNumber).values = headers

        worksheet.getRow(1).height = 30
        worksheet.getRow(2).height = 22
        worksheet.getRow(3).height = 22
        worksheet.getRow(4).height = 28
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
        for (const rowNumber of [3, 4, ...Array.from(
          { length: summaryRowCount },
          (_, index) => summaryStartRow + index
        )]) {
          const row = worksheet.getRow(rowNumber)
          row.height = 24
          row.eachCell((cell, columnNumber) => {
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
        summary.forEach((item, index) => {
          const summaryRow = summaryStartRow + Math.floor(index / summaryPairsPerRow)
          const valueColumn = (index % summaryPairsPerRow) * 2 + 2
          const valueCell = worksheet.getRow(summaryRow).getCell(valueColumn)
          if (item.type === 'currency') valueCell.numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
          else if (item.type === 'integer') valueCell.numFmt = '#,##0'
          else if (item.type === 'number') valueCell.numFmt = '#,##0.##'
        })
        worksheet.getRow(headerRowNumber).height = 25
        worksheet.getRow(headerRowNumber).eachCell((cell, columnNumber) => {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' },
          }
          cell.alignment = {
            vertical: 'middle',
            horizontal: columns[columnNumber - 1].type === 'text' ? 'left' : 'right',
            wrapText: true,
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
          }
        })
        rows.forEach((values, index) => {
          const row = worksheet.addRow(values)
          row.height = 22
          row.eachCell((cell, columnIndex) => {
            const column = columns[columnIndex - 1]
            cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1F2937' } }
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5F9' },
            }
            cell.border = { bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } } }
            cell.alignment = {
              vertical: 'middle',
              horizontal: column.type === 'text' ? 'left' : 'right',
              wrapText: column.type === 'text',
            }
            if (column.type === 'currency') {
              cell.numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
            } else if (column.type === 'integer') {
              cell.numFmt = '#,##0'
            } else if (column.type === 'number') {
              cell.numFmt = '#,##0.##'
            } else if (column.type === 'date') {
              cell.numFmt = 'dd mmm yyyy hh:mm'
            }
          })
        })
        worksheet.views = [{
          state: 'frozen',
          ySplit: headerRowNumber,
          topLeftCell: `A${headerRowNumber + 1}`,
        }]
        worksheet.autoFilter = `A${headerRowNumber}:${lastColumn}${Math.max(headerRowNumber, rows.length + headerRowNumber)}`
        worksheet.pageSetup = {
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: `${headerRowNumber}:${headerRowNumber}`,
        }

        const buffer = await workbook.xlsx.writeBuffer()
        downloadReport(
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          `${fileName}.xlsx`
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
        document.text(title, 12, 17)
        document.setFont('helvetica', 'normal')
        document.setFontSize(9)
        document.setTextColor(71, 85, 105)
        document.text(`${organization} | ${description}`, 12, 24)
        const metadataLines = [
          `Exported: ${formattedExportTime}`,
          `Filters: ${filtersDescription}`,
          ...summary.map((item) =>
            `${item.label}: ${item.type === 'currency'
              ? formatCurrency(item.value).replace(/₦/g, 'NGN ')
              : formatNumber(item.value, item.type === 'integer' ? 0 : 2)}`
          ),
        ].flatMap((line) => document.splitTextToSize(line, pageWidth - 24))
        document.text(metadataLines, 12, 31)
        const tableStartY = 31 + metadataLines.length * 4.5 + 2
        const pdfRows = rows.map((row) => row.map((value, index) => {
          const type = columns[index].type
          if (type === 'currency') return formatCurrency(value).replace(/₦/g, 'NGN ')
          if (type === 'integer') return formatNumber(value, 0)
          if (type === 'number') return formatNumber(value)
          return formatValue(value, type)
        }))

        autoTable(document, {
          head: [headers],
          body: pdfRows,
          startY: tableStartY,
          margin: { top: 12, right: 12, bottom: 17, left: 12 },
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: columns.length > 8 ? 7 : 8,
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
          ...(columns.length > 8
            ? { horizontalPageBreak: true, horizontalPageBreakRepeat: [0, 1] }
            : {}),
          didDrawPage: (page) => {
            const pageHeight = document.internal.pageSize.getHeight()
            document.setFontSize(8)
            document.setTextColor(100, 116, 139)
            document.text(`${organization} | ${title}`, 12, pageHeight - 7)
            document.text(`Page ${page.pageNumber}`, pageWidth - 12, pageHeight - 7, {
              align: 'right',
            })
          },
        })
        document.save(`${fileName}.pdf`)
      }

      toast.success(`${formatType} export completed (${rows.length} records).`)
    } catch (error) {
      console.error('Customer deposit report export failed:', error)
      toast.error(`Could not create the ${formatType} export. Please try again.`)
    } finally {
      setExportLoading('')
    }
  }

  return (
    <ExportButtons label={label} onExport={exportReport} exportLoading={exportLoading} />
  )
}
