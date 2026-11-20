

"use client"
import Link from "next/link";
import { Table } from "@radix-ui/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { updateProd, updateProdPrice } from "@/actions";
import { fetchOrderItems, fetchProductById, fetchSearchedProducts, updateOrderDate } from "@/actions/fetch";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { currencyFormat } from "@/utils/currency";
import { MdSearch } from "react-icons/md";
import { useDebouncedCallback } from "use-debounce";
import ExportButtons from "@/components/ExportButtons";
import BarcodePrinter from "../BarCodePrinter";
import { updateBarcode } from "@/actions/update";
import { toast } from "react-toastify";
import { generateEAN13FromUUID } from "@/lib/genBarcode";
import InventoryMovementTable from "../InventoryMovementTable";
import StockAdjustmentForm from "../StockAdjustmentForm";

function getMappedPrice(prices, priceTypeId) {
  if (!prices || !priceTypeId) return undefined;

  if (typeof prices?.get === 'function') {
    const v = Number(prices.get(priceTypeId));
    return Number.isFinite(v) ? v : undefined;
  }

  if (typeof prices === 'object') {
    const v = Number(prices[priceTypeId]);
    return Number.isFinite(v) ? v : undefined;
  }

  return undefined;
}

function hasAnyMappedPrices(prices) {
  if (!prices) return false;
  if (typeof prices?.size === 'number') return prices.size > 0;
  if (typeof prices === 'object') return Object.keys(prices).length > 0;
  return false;
}

function getAnyMappedPrice(prices) {
  if (!prices) return undefined;

  if (typeof prices?.values === 'function') {
    const first = prices.values().next()?.value;
    const parsed = Number(first);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof prices === 'object') {
    const first = Object.values(prices)[0];
    const parsed = Number(first);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getDefaultSellingPrice(product, defaultPriceTypeId) {
  const defaultMapped = getMappedPrice(product?.prices, defaultPriceTypeId);
  if (defaultMapped !== undefined) return defaultMapped;

  const legacyPrice = Number(product?.price);
  if (Number.isFinite(legacyPrice)) return legacyPrice;

  const anyMapped = getAnyMappedPrice(product?.prices);
  if (anyMapped !== undefined) return anyMapped;

  return 0;
}


const ProductTable=({products, slug, userRole, pricingSettings = {}})=>{
 
    const { replace } = useRouter();
    const pathname = usePathname()
    const [price, setPrice] = useState(0)
    const [qty, setQty] = useState(0)
    const [loading, setLoading]= useState(false)
    const [total, setTotal] = useState(0)
    const [prod, setProd]= useState([])
     const [code, setCode]=useState('')
     const [selectedProduct, setSelectedProduct] = useState(null)
     const [inventoryTransactions, setInventoryTransactions] = useState([])
     const [loadingTransactions, setLoadingTransactions] = useState(false)
     const [showStockAdjustment, setShowStockAdjustment] = useState(false)
     const [productToAdjust, setProductToAdjust] = useState(null)
     const [exportLoading, setExportLoading] = useState('')
     const [exportMessage, setExportMessage] = useState(null)
   
    const searchParams = useSearchParams()

    const  handleDUpdate = useCallback(async(id, path)=>{
      console.log('de',id)
await updateProd(id, path)
 const del =await fetchProductById(id)
   console.log('de',del)
    }, [])

      //  const handleSearch = useDebouncedCallback((e) => {
                   
      //                  if (e.target.value) {
      //                       let tempOrders= [...products]   
      //                  console.log(tempOrders,'tord')
      //                 const items = tempOrders.filter(product=>product?.barcode===e.target.value)  
      //                 console.log(items,'it')
      //                 if (items && items.length) {                 
      //                   setItem(items)
      //                   e.target.value=""
      //                  } else {
      //                    toast.warn('no item with this barcode')
      //                  setCode('')
      //                  e.target.value=""
      //                  }
      //                 }
      //                }, 300);
    
       const filteredProducts = useMemo(() => {
          if (!code) return products;
          const searchTerm = code.toLowerCase();
          return products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.barcode?.toLowerCase().includes(searchTerm) ||
            product.category?.toLowerCase().includes(searchTerm)
          );
       }, [code, products]);

      const priceTypes = useMemo(() => {
       const all = pricingSettings?.priceTypes || [];
       return all.filter((pt) => pt?.active !== false);
      }, [pricingSettings]);

      const defaultPriceTypeId = pricingSettings?.defaultPriceTypeId || null;
      const defaultPriceTypeName = useMemo(() => {
        if (!defaultPriceTypeId) return 'Not set';
        const found = priceTypes.find((pt) => pt.id === defaultPriceTypeId);
        return found?.name || defaultPriceTypeId;
      }, [defaultPriceTypeId, priceTypes]);

      const showLegacyPriceColumn = useMemo(() => {
       if (!Array.isArray(filteredProducts) || filteredProducts.length === 0) return false;
       return filteredProducts.some((p) => !hasAnyMappedPrices(p?.prices));
      }, [filteredProducts]);

      const exportColumns = useMemo(() => [
        { key: 'name', label: 'Product', type: 'text', value: (product) => product?.name || '' },
        { key: 'category', label: 'Category', type: 'text', value: (product) => product?.category || '' },
        {
          key: 'cost',
          label: 'Cost (NGN)',
          type: 'currency',
          value: (product) => Number.isFinite(Number(product?.cost)) ? Number(product.cost) : 0,
        },
        ...priceTypes.map((priceType) => ({
          key: `price-${priceType.id}`,
          label: `${priceType.name || 'Price'} (NGN)`,
          type: 'currency',
          value: (product) => getMappedPrice(product?.prices, priceType.id) ?? '',
        })),
        ...(showLegacyPriceColumn ? [{
          key: 'legacy-price',
          label: 'Selling Price (Legacy) (NGN)',
          type: 'currency',
          value: (product) => hasAnyMappedPrices(product?.prices)
            ? ''
            : Number.isFinite(Number(product?.price)) ? Number(product.price) : 0,
        }] : []),
        {
          key: 'profit',
          label: 'Profit (NGN)',
          type: 'currency',
          value: (product) => Number.isFinite(Number(product?.profit)) ? Number(product.profit) : 0,
        },
        {
          key: 'qty',
          label: 'Quantity',
          type: 'number',
          value: (product) => Number(product?.qty) || 0,
        },
        {
          key: 'stock-value',
          label: 'Stock Value (NGN)',
          type: 'currency',
          value: (product) => (Number(product?.qty) || 0) * getDefaultSellingPrice(product, defaultPriceTypeId),
        },
      ], [defaultPriceTypeId, priceTypes, showLegacyPriceColumn])

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
          const fileBaseName = `Products_Report_${dateStamp}`
          const headers = exportColumns.map((column) => column.label)
          const exportRows = filteredProducts.map((product) =>
            exportColumns.map((column) => column.value(product))
          )
          const quantityColumnIndex = exportColumns.findIndex((column) => column.key === 'qty')
          const stockValueColumnIndex = exportColumns.findIndex((column) => column.key === 'stock-value')
          const totalUnits = exportRows.reduce(
            (sum, row) => sum + (Number(row[quantityColumnIndex]) || 0),
            0
          )
          const totalStockValue = exportRows.reduce(
            (sum, row) => sum + (Number(row[stockValueColumnIndex]) || 0),
            0
          )
          const formatReportCurrency = (value) => new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(value) || 0)
          const formatReportNumber = (value) => new Intl.NumberFormat('en-NG', {
            maximumFractionDigits: 2,
          }).format(Number(value) || 0)
          const formattedExportTime = exportedAt.toLocaleString('en-NG', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
          const filtersDescription = [
            `Search: ${code.trim() || 'None'}`,
            `Default price type: ${defaultPriceTypeName}`,
          ].join(' | ')
          const csvCell = (value) => {
            let text = String(value ?? '')
            if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) {
              text = `'${text}`
            }
            return `"${text.replace(/"/g, '""')}"`
          }

          if (formatType === 'CSV') {
            const metadataRow = (label, value) => {
              const row = Array(headers.length).fill('')
              row[0] = label
              row[1] = value
              return row
            }
            const csvRows = [
              metadataRow('Products Report', ''),
              metadataRow('Report description', 'Current product list matching the search filter'),
              metadataRow('Organization', 'MarketBook'),
              metadataRow('Exported at', formattedExportTime),
              metadataRow('Active filters', filtersDescription),
              metadataRow('Total records exported', exportRows.length),
              metadataRow('Total units', totalUnits),
              metadataRow('Total stock value (NGN)', totalStockValue),
              Array(headers.length).fill(''),
              headers,
              ...exportRows,
            ]
            const csvContent = `\uFEFF${csvRows
              .map((row) => row.map(csvCell).join(','))
              .join('\r\n')}`
            downloadReportFile(
              new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
              `${fileBaseName}.csv`
            )
          } else if (formatType === 'Excel') {
            const { default: ExcelJS } = await import('exceljs')
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'MarketBook'
            workbook.created = exportedAt
            const worksheet = workbook.addWorksheet('Products')
            const columnWidths = headers.map((header) => Math.min(44, Math.max(12, header.length + 2)))
            exportRows.forEach((row) => row.forEach((value, index) => {
              const displayValue = exportColumns[index].type === 'currency'
                ? formatReportCurrency(value)
                : String(value ?? '')
              columnWidths[index] = Math.min(
                44,
                Math.max(columnWidths[index], displayValue.length + 2)
              )
            }))
            worksheet.columns = columnWidths.map((width) => ({ width }))
            const lastColumn = getExcelColumnName(headers.length)
            worksheet.mergeCells(`A1:${lastColumn}1`)
            worksheet.getCell('A1').value = 'Products Report'
            worksheet.mergeCells(`A2:${lastColumn}2`)
            worksheet.getCell('A2').value = 'Current product list matching the search filter'
            worksheet.getRow(3).values = [
              'Organization',
              'MarketBook',
              'Exported at',
              formattedExportTime,
            ]
            worksheet.mergeCells(`B4:${lastColumn}4`)
            worksheet.getCell('A4').value = 'Active filters'
            worksheet.getCell('B4').value = filtersDescription
            worksheet.getRow(5).values = [
              'Total records',
              exportRows.length,
              'Total units',
              totalUnits,
              'Total stock value (NGN)',
              totalStockValue,
            ]
            worksheet.getRow(6).values = headers

            worksheet.getRow(1).height = 30
            worksheet.getRow(2).height = 22
            worksheet.getRow(3).height = 22
            worksheet.getRow(4).height = 26
            worksheet.getRow(5).height = 24
            worksheet.getRow(6).height = 24
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
            for (const rowNumber of [3, 4, 5]) {
              worksheet.getRow(rowNumber).eachCell((cell, columnNumber) => {
                cell.font = {
                  name: 'Arial',
                  size: 9,
                  bold: columnNumber % 2 === 1,
                  color: { argb: 'FF1F2937' },
                }
                cell.alignment = { vertical: 'middle', wrapText: true }
                cell.border = {
                  bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } },
                }
              })
            }
            worksheet.getCell('F5').numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
            worksheet.getRow(6).eachCell((cell) => {
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
            exportRows.forEach((rowValues, rowIndex) => {
              const row = worksheet.addRow(rowValues)
              row.height = 21
              row.eachCell((cell, columnIndex) => {
                const column = exportColumns[columnIndex - 1]
                cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1F2937' } }
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: rowIndex % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5F9' },
                }
                cell.border = {
                  bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } },
                }
                cell.alignment = {
                  vertical: 'middle',
                  horizontal: column.type === 'text' ? 'left' : 'right',
                  wrapText: column.type === 'text',
                }
                if (column.type === 'currency') {
                  cell.numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00'
                } else if (column.type === 'number') {
                  cell.numFmt = '#,##0.##'
                }
              })
            })
            worksheet.views = [{ state: 'frozen', ySplit: 6, topLeftCell: 'A7' }]
            worksheet.autoFilter = `A6:${lastColumn}${Math.max(6, exportRows.length + 6)}`
            worksheet.pageSetup = {
              orientation: 'landscape',
              fitToPage: true,
              fitToWidth: 1,
              fitToHeight: 0,
              printTitlesRow: '6:6',
            }
            const buffer = await workbook.xlsx.writeBuffer()
            downloadReportFile(
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
            document.text('Products Report', 12, 17)
            document.setFont('helvetica', 'normal')
            document.setFontSize(9)
            document.setTextColor(71, 85, 105)
            document.text('Current product list matching the search filter | MarketBook', 12, 24)
            const reportDetails = [
              `Exported: ${formattedExportTime}`,
              `Filters: ${filtersDescription}`,
              `Records: ${exportRows.length} | Total units: ${formatReportNumber(totalUnits)} | Stock value: ${formatReportCurrency(totalStockValue).replace(/₦/g, 'NGN ')}`,
            ].flatMap((line) => document.splitTextToSize(line, pageWidth - 24))
            document.text(reportDetails, 12, 31)
            const tableStartY = 31 + reportDetails.length * 4.5 + 2
            const pdfRows = exportRows.map((row) => row.map((value, index) => {
              const columnType = exportColumns[index].type
              if (columnType === 'currency') {
                return formatReportCurrency(value).replace(/₦/g, 'NGN ')
              }
              if (columnType === 'number') return formatReportNumber(value)
              return String(value ?? '')
            }))

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
              horizontalPageBreakRepeat: [0],
              didDrawPage: (page) => {
                const pageHeight = document.internal.pageSize.getHeight()
                document.setFontSize(8)
                document.setTextColor(100, 116, 139)
                document.text('MarketBook | Products Report', 12, pageHeight - 7)
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
          console.error('Product report export failed:', exportError)
          setExportMessage({
            type: 'error',
            text: `Could not create the ${formatType} export. Please try again.`,
          })
        } finally {
          setExportLoading('')
        }
      }

   

    const handleEdit = useCallback(async(id, price, qty, path)=>{
      setLoading(true)
     const update = await updateProdPrice(id, price, qty, path)
     setLoading(false)
     setPrice(0)
     setQty(0)
    }, [])

    const handleViewInventory = useCallback(async (product) => {
      setSelectedProduct(product)
      setLoadingTransactions(true)
      try {
        // Fetch inventory transactions for this product
        const response = await fetch(`/api/inventory/transactions?productId=${product._id}`)
        const data = await response.json()
        setInventoryTransactions(data.transactions || [])
      } catch (error) {
        console.error('Error fetching inventory transactions:', error)
        toast.error('Failed to load inventory history')
        setInventoryTransactions([])
      } finally {
        setLoadingTransactions(false)
      }
    }, [])

    const handleStockAdjustmentSuccess = useCallback(() => {
      // Refresh the page to show updated stock
      window.location.reload()
    }, [])
    // useEffect(()=>{
    //   if(code!=='')setItem(initialItems)
    // },[code])


useEffect(()=>{
  const getTotal= async()=>{
//  const  u = await updateOrderDate()
//      const ord =await fetchOrderItems('uz-2090')
//  console.log('orrd', ord)
          let tempOrders= [...products]      
        let counter = 0;
for (const obj of tempOrders) {
   counter++;
}
await   setQty(counter)
        const amtTotal = (products || []).reduce((acc, item) => {
          const productQty = Number(item?.qty) || 0
          const unitSellingPrice = getDefaultSellingPrice(item, defaultPriceTypeId)
          return acc + (productQty * unitSellingPrice)
        }, 0)
        await setTotal(amtTotal)
  }
  getTotal()
},[products, defaultPriceTypeId])




return(
   <>
 {/* Stats and Search Section - Mobile Responsive */}
 <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
     
     {/* Stats Cards - Only visible to owners */}
     {userRole === 'OWNER' && (
     <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:flex lg:flex-1 lg:gap-4">
       {/* Total Stock Value Card */}
       <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
         <div className="flex items-center gap-3">
           <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 shadow-lg">
             <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Stock Value</p>
             <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 truncate">{currencyFormat(total)}</p>
             <p className="text-[11px] sm:text-xs text-blue-700 mt-1">total stock value is calculated with default selling price</p>
           </div>
         </div>
       </div>

       {/* Total Products Card */}
       <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
         <div className="flex items-center gap-3">
           <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-3 shadow-lg">
             <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
             </svg>
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Total Products</p>
             <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{qty}</p>
           </div>
         </div>
       </div>
     </div>
     )}

     {/* Search Input */}
     <div className={userRole === 'OWNER' ? 'w-full lg:w-96' : 'w-full max-w-2xl mx-auto'}>
       <div className="relative group">
         <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
           <MdSearch className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
         </div>
         <input
           type="text"
           placeholder="Search by name, category, or barcode..."
           onChange={(e) => setCode(e.target.value)}
           value={code}
           name="code"
           className="w-full pl-12 sm:pl-14 pr-12 py-3 sm:py-4 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md font-medium"
         />
         {code && (
           <button
             onClick={() => setCode('')}
             className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-red-500 transition-colors group"
             aria-label="Clear search"
           >
             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         )}
         {code && (
           <div className="absolute -bottom-8 left-0 text-xs sm:text-sm text-gray-600 font-medium">
             Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
           </div>
         )}
       </div>
       <div className="mt-4">
         <ExportButtons onExport={exportReport} exportLoading={exportLoading} />
       </div>
       {exportMessage && (
         <div
           role={exportMessage.type === 'error' ? 'alert' : 'status'}
           className={`mt-3 rounded-lg px-4 py-3 text-sm ${
             exportMessage.type === 'error'
               ? 'bg-red-50 text-red-700'
               : 'bg-green-50 text-green-700'
           }`}
         >
           {exportMessage.text}
         </div>
       )}
     </div>
   </div>
 </div>

 {/* Table Section */}
        <div className="mb-3 px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-900 font-medium">
          Selected default price type: <span className="font-bold">{defaultPriceTypeName}</span>
        </div>
        <div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <Table.Root layout="auto" variant="surface">
    <Table.Header>
      <Table.Row className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide py-4">Product</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Category</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Cost</Table.ColumnHeaderCell>
        {priceTypes.map((pt) => (
          <Table.ColumnHeaderCell key={`price-header-${pt.id}`} className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">
            {pt.name}
          </Table.ColumnHeaderCell>
        ))}
        {showLegacyPriceColumn && (
          <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Selling Price (Legacy)</Table.ColumnHeaderCell>
        )}
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Profit</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Qty</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Stock Value</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Stock</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Update</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell className="font-bold text-gray-700 dark:text-slate-100 text-xs uppercase tracking-wide">Delete</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  
    <Table.Body>
     {filteredProducts && filteredProducts?.map((patient, index) => (
              
      <Table.Row key={patient?._id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
        <Table.RowHeaderCell className="font-semibold text-gray-900 py-4">{patient?.name || ''}</Table.RowHeaderCell>
        <Table.Cell className="text-gray-700">
          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {patient?.category || ''}
          </span>
        </Table.Cell>
        <Table.Cell className="text-gray-700 font-medium">{currencyFormat(typeof patient?.cost === 'number' && !isNaN(patient.cost) ? patient.cost : 0)}</Table.Cell>
        {priceTypes.map((pt) => {
          const mapped = getMappedPrice(patient?.prices, pt.id)
          return (
            <Table.Cell key={`price-${patient?._id}-${pt.id}`} className="text-blue-600 font-semibold">
              {mapped !== undefined ? currencyFormat(mapped) : '-'}
            </Table.Cell>
          )
        })}
        {showLegacyPriceColumn && (
          <Table.Cell className="text-blue-600 font-semibold">
            {!hasAnyMappedPrices(patient?.prices) ? currencyFormat(typeof patient?.price === 'number' && !isNaN(patient.price) ? patient.price : 0) : '-'}
          </Table.Cell>
        )}
        <Table.Cell className="text-green-600 font-semibold">{currencyFormat(typeof patient?.profit === 'number' && !isNaN(patient.profit) ? patient.profit : 0)}</Table.Cell>
        <Table.Cell>
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={() => handleViewInventory(patient)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                {patient?.qty}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Inventory Movement History - {selectedProduct?.name}
                </DialogTitle>
              </DialogHeader>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <InventoryMovementTable
                  transactions={inventoryTransactions}
                  productName={selectedProduct?.name}
                />
              )}
            </DialogContent>
          </Dialog>
        </Table.Cell>
        <Table.Cell className="font-bold text-gray-900">{
          currencyFormat((Number(patient?.qty) || 0) * getDefaultSellingPrice(patient, defaultPriceTypeId))
        }</Table.Cell>
        {/* <Table.Cell>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            patient?.qty <= patient?.reOrder 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {patient?.reOrder}
          </span>
        </Table.Cell> */}
        <Table.Cell>
          <Dialog open={showStockAdjustment && productToAdjust?._id === patient._id} onOpenChange={(open) => {
            if (!open) {
              setShowStockAdjustment(false)
              setProductToAdjust(null)
            }
          }}>
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setProductToAdjust(patient)
                  setShowStockAdjustment(true)
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
              >
                Adjust
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Stock Adjustment
                </DialogTitle>
              </DialogHeader>
              <StockAdjustmentForm
                product={productToAdjust || patient}
                slug={slug}
                onClose={() => {
                  setShowStockAdjustment(false)
                  setProductToAdjust(null)
                }}
                onSuccess={handleStockAdjustmentSuccess}
              />
            </DialogContent>
          </Dialog>
        </Table.Cell>
        <Table.Cell>
          <button className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md" onClick={()=>replace(`/${slug}/dashboard/products?id=${patient._id}`)}>
            <FaEdit className="w-4 h-4"/>
          </button>
        </Table.Cell>
      
        <Table.Cell>
          <button onClick={()=>handleDUpdate(patient._id, pathname)} className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md">
            Delete
          </button>
        </Table.Cell>
     
            {/* <Table.Cell> <button className="bg-green-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>replace(`/${slug}/dashboard/stock?id=${patient._id}`)}>Add Stock</button></Table.Cell> */}
            {/* <Table.Cell> <button className="bg-gray-700 px-2 py-1 text-white font-bold rounded-lg" onClick={()=>handleBarcode(patient)}>{loading? 'Generating...' :  'Generate Barcode'}</button></Table.Cell> */}
          
            {/* <Table.Cell> 
             
                     
                            
              
                      <Popover>
                        <PopoverTrigger>
                        <a className='bg-black text-white px-2  py-1 rounded-lg uppercase block'>Print Barcode</a>
              
              
                        </PopoverTrigger>
                        <PopoverContent> 
              <BarcodePrinter product={patient}/>
                            </PopoverContent>
                      </Popover>
              </Table.Cell> */}
       
      </Table.Row>
    ))} 
     
      
    </Table.Body>
  </Table.Root>
  </div>
   </>

    )
}
export default ProductTable

function getExcelColumnName(columnNumber) {
  let name = ''
  let remaining = columnNumber
  while (remaining > 0) {
    const remainder = (remaining - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    remaining = Math.floor((remaining - 1) / 26)
  }
  return name
}

function downloadReportFile(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}