

"use client"
import { Table } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { currencyFormat } from "@/utils/currency";
import { formatTime } from "@/utils/date";
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  User,
  UserCheck,
  Receipt,
  Calendar,
  TrendingUp,
  Truck,
  X
} from 'lucide-react';
import ExportButtons from '@/components/ExportButtons';

const PaymentTable=({payments, allPayment, slug, deliveryEnabled = false, serviceChargeEnabled = false})=>{
 
    const { replace } = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [exportLoading, setExportLoading] = useState('');
    const [exportMessage, setExportMessage] = useState(null);

    const filteredPayments = useMemo(() => {
      let filtered = selectedDate
        ? allPayment.filter((payment) =>
            payment.bDate === format(selectedDate, 'd/MM/yyyy')
          )    
        : payments;

      // Filter by status
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(p => p.status?.toLowerCase() === selectedStatus.toLowerCase());
      }

      // Filter by search term (receipt, customer name)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.receiptNumber?.toLowerCase().includes(term) ||
          p.receipt?.toLowerCase().includes(term) ||
          p.customerName?.toLowerCase().includes(term) ||
          p.user?.toLowerCase().includes(term)
        );
      }

      return filtered;
    }, [selectedDate, allPayment, payments, selectedStatus, searchTerm]);

    // Calculate totals by payment method
    const paymentStats = useMemo(() => {
      const stats = {
        total: 0,
        cash: 0,
        pos: 0,
        transfer: 0,
        other: 0,
        delivery: 0,
        serviceCharge: 0,
        completed: 0,
        partial: 0,
        splitPayments: 0
      };

      filteredPayments.forEach(payment => {
        stats.total += payment.amountPaid || 0;
        stats.delivery += Number(payment.deliveryCost || 0);
        stats.serviceCharge += Number(payment.serviceChargeCost || 0);

        // Check if it's new schema with paymentMethods array
        if (payment.paymentMethods && Array.isArray(payment.paymentMethods)) {
          if (payment.paymentMethods.length > 1) {
            stats.splitPayments++;
          }
          payment.paymentMethods.forEach(pm => {
            const method = pm.method?.toLowerCase();
            if (method === 'cash') stats.cash += pm.amount || 0;
            else if (method === 'pos') stats.pos += pm.amount || 0;
            else if (method === 'transfer') stats.transfer += pm.amount || 0;
            else stats.other += pm.amount || 0;
          });
        } else {
          // Legacy schema - mop or individual fields
          const amount = payment.amountPaid || 0;
          if (payment.mop === 'cash' || payment.cash) stats.cash += payment.cash || amount;
          else if (payment.mop === 'pos' || payment.pos) stats.pos += payment.pos || amount;
          else if (payment.mop === 'transfer' || payment.transfer) stats.transfer += payment.transfer || amount;
          else stats.other += amount;
        }

        // Count by status
        const status = payment.status?.toLowerCase();
        if (status === 'completed') stats.completed++;
        else if (status === 'partial') stats.partial++;
      });

      return stats;
    }, [filteredPayments]);

    const exportReport = async (formatType) => {
      setExportLoading(formatType);
      setExportMessage(null);

      try {
        const exportedAt = new Date();
        const dateStamp = [
          exportedAt.getFullYear(),
          String(exportedAt.getMonth() + 1).padStart(2, '0'),
          String(exportedAt.getDate()).padStart(2, '0'),
        ].join('-');
        const fileBaseName = `Payments_Report_${dateStamp}`;
        const formatReportCurrency = (value) =>
          new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(value) || 0);
        const normalizePayment = (payment) => {
          const amount = (value) => {
            const numericValue = Number(value || 0);
            return Number.isFinite(numericValue) ? numericValue : 0;
          };
          const methods = Array.isArray(payment.paymentMethods) && payment.paymentMethods.length
            ? payment.paymentMethods
                .map((method) => `${String(method.method || 'Other').toUpperCase()}: ${formatReportCurrency(method.amount)}`)
                .join(' | ')
            : String(
                payment.mop ||
                (payment.cash ? 'CASH' : payment.pos ? 'POS' : payment.transfer ? 'TRANSFER' : 'OTHER')
              ).toUpperCase();
          const status = String(payment.status || 'completed');
          const isoDate = normalizePaymentDate(payment.bDate, payment.createdAt);

          return {
            receipt: payment.receiptNumber || payment.receipt || '',
            customer: payment.customerName || (
              String(payment.customerType || '').toUpperCase() === 'REGISTERED' ? 'Registered' : 'Walk-in'
            ),
            methods,
            amountPaid: amount(payment.amountPaid),
            change: amount(payment.change),
            balance: amount(payment.balance),
            deliveryCost: amount(payment.deliveryCost),
            serviceChargeCost: amount(payment.serviceChargeCost),
            status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
            businessDate: payment.bDate || (isoDate ? formatReportDate(isoDate) : ''),
            isoDate,
            time: payment.createdAt && !Number.isNaN(new Date(payment.createdAt).getTime())
              ? formatTime(payment.createdAt)
              : '',
            user: payment.user || '',
          };
        };
        const exportRows = filteredPayments.map(normalizePayment);
        const headers = [
          'Receipt No.',
          'Customer',
          'Payment Method(s)',
          'Amount Paid (NGN)',
          'Change (NGN)',
          'Balance (NGN)',
          'Status',
          'Business Date',
          'Time',
          'User',
          ...(deliveryEnabled ? ['Delivery Fee (NGN)'] : []),
          ...(serviceChargeEnabled ? ['Service Charge (NGN)'] : []),
        ];
        const filterDescription = [
          `Date: ${selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'All dates'}`,
          `Status: ${selectedStatus === 'all' ? 'All statuses' : selectedStatus}`,
          `Search: ${searchTerm.trim() || 'None'}`,
        ].join(' | ');
        const formattedExportTime = exportedAt.toLocaleString('en-NG', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        const csvCell = (value) => {
          let text = String(value ?? '');
          if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) {
            text = `'${text}`;
          }
          return `"${text.replace(/"/g, '""')}"`;
        };

        if (formatType === 'CSV') {
          const metadataRow = (...values) => [...values, ...Array(Math.max(0, headers.length - values.length)).fill('')];
          const csvRows = [
            metadataRow('Payments Report'),
            metadataRow('Report description', 'Payment records matching the selected filters'),
            metadataRow('Organization', 'MarketBook', 'Exported at', formattedExportTime),
            metadataRow('Active filters', filterDescription),
            metadataRow('Total records exported', exportRows.length, 'Total amount paid (NGN)', paymentStats.total),
            metadataRow('Cash (NGN)', paymentStats.cash, 'POS (NGN)', paymentStats.pos, 'Transfer (NGN)', paymentStats.transfer, 'Other (NGN)', paymentStats.other, 'Split payments', paymentStats.splitPayments),
            ...(deliveryEnabled ? [metadataRow('Total delivery fees (NGN)', paymentStats.delivery)] : []),
            ...(serviceChargeEnabled ? [metadataRow('Total service charges (NGN)', paymentStats.serviceCharge)] : []),
            metadataRow(),
            headers,
            ...exportRows.map((payment) => [
              payment.receipt,
              payment.customer,
              payment.methods.replace(/₦/g, 'NGN '),
              payment.amountPaid,
              payment.change,
              payment.balance,
              payment.status,
              payment.businessDate,
              payment.time,
              payment.user,
              ...(deliveryEnabled ? [payment.deliveryCost] : []),
              ...(serviceChargeEnabled ? [payment.serviceChargeCost] : []),
            ]),
          ];
          const csvContent = `\uFEFF${csvRows
            .map((row) => row.map(csvCell).join(','))
            .join('\r\n')}`;
          downloadReportFile(
            new Blob([csvContent], { type: 'text/csv;charset=utf-8' }),
            `${fileBaseName}.csv`
          );
        } else if (formatType === 'Excel') {
          const { default: ExcelJS } = await import('exceljs');
          const workbook = new ExcelJS.Workbook();
          workbook.creator = 'MarketBook';
          workbook.created = exportedAt;
          const worksheet = workbook.addWorksheet('Payments');
          const columnWidths = headers.map((header) => Math.min(42, Math.max(12, header.length + 2)));
          exportRows.forEach((payment) => {
            const values = [
              payment.receipt,
              payment.customer,
              payment.methods,
              formatReportCurrency(payment.amountPaid),
              formatReportCurrency(payment.change),
              formatReportCurrency(payment.balance),
              payment.status,
              payment.businessDate,
              payment.time,
              payment.user,
              ...(deliveryEnabled ? [formatReportCurrency(payment.deliveryCost)] : []),
              ...(serviceChargeEnabled ? [formatReportCurrency(payment.serviceChargeCost)] : []),
            ];
            values.forEach((value, index) => {
              columnWidths[index] = Math.min(
                42,
                Math.max(columnWidths[index], String(value ?? '').length + 2)
              );
            });
          });
          worksheet.columns = columnWidths.map((width) => ({ width }));
          const reportLastColumn = worksheet.getColumn(headers.length).letter;
          const summaryLastColumn = worksheet.getColumn(
            Math.max(headers.length, 10 + (deliveryEnabled ? 2 : 0) + (serviceChargeEnabled ? 2 : 0))
          ).letter;
          let feeSummaryColumn = 11;
          const lastColumn = summaryLastColumn;
          worksheet.mergeCells(`A1:${lastColumn}1`);
          worksheet.getCell('A1').value = 'Payments Report';
          worksheet.mergeCells(`A2:${lastColumn}2`);
          worksheet.getCell('A2').value = 'Payment records matching the selected filters';
          worksheet.getRow(3).values = [
            'Organization',
            'MarketBook',
            'Exported at',
            formattedExportTime,
          ];
          worksheet.mergeCells(`B4:${lastColumn}4`);
          worksheet.getCell('A4').value = 'Active filters';
          worksheet.getCell('B4').value = filterDescription;
          worksheet.getRow(5).values = [
            'Total records',
            exportRows.length,
            'Total paid (NGN)',
            paymentStats.total,
            'Cash (NGN)',
            paymentStats.cash,
            'POS (NGN)',
            paymentStats.pos,
            'Transfer (NGN)',
            paymentStats.transfer,
          ];
          worksheet.getRow(6).values = [
            'Other (NGN)',
            paymentStats.other,
            'Split payments',
            paymentStats.splitPayments,
            'Date filter',
            selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'All dates',
            'Status filter',
            selectedStatus === 'all' ? 'All statuses' : selectedStatus,
            'Search',
            searchTerm.trim() || 'None',
          ];
          if (deliveryEnabled) {
            worksheet.getCell(6, feeSummaryColumn).value = 'Delivery fees (NGN)';
            worksheet.getCell(6, feeSummaryColumn + 1).value = paymentStats.delivery;
            feeSummaryColumn += 2;
          }
          if (serviceChargeEnabled) {
            worksheet.getCell(6, feeSummaryColumn).value = 'Service charges (NGN)';
            worksheet.getCell(6, feeSummaryColumn + 1).value = paymentStats.serviceCharge;
            feeSummaryColumn += 2;
          }
          worksheet.getRow(7).values = headers;

          worksheet.getRow(1).height = 30;
          worksheet.getRow(2).height = 22;
          for (const rowNumber of [3, 4, 5, 6, 7]) {
            worksheet.getRow(rowNumber).height = 24;
          }
          worksheet.getCell('A1').font = {
            name: 'Arial',
            size: 18,
            bold: true,
            color: { argb: 'FFFFFFFF' },
          };
          worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF17365D' },
          };
          worksheet.getCell('A2').font = {
            name: 'Arial',
            size: 11,
            italic: true,
            color: { argb: 'FF44546A' },
          };
          for (const rowNumber of [3, 4, 5, 6]) {
            worksheet.getRow(rowNumber).eachCell((cell, columnNumber) => {
              cell.font = {
                name: 'Arial',
                size: 9,
                bold: columnNumber % 2 === 1,
                color: { argb: 'FF1F2937' },
              };
              cell.alignment = { vertical: 'middle', wrapText: true };
              cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } },
              };
            });
          }
          for (const address of ['D5', 'F5', 'H5', 'J5', 'B6']) {
            worksheet.getCell(address).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
          }
          if (deliveryEnabled) {
            const deliveryAmountColumn = 12;
            worksheet.getCell(6, deliveryAmountColumn).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
          }
          if (serviceChargeEnabled) {
            const serviceChargeAmountColumn = deliveryEnabled ? 14 : 12;
            worksheet.getCell(6, serviceChargeAmountColumn).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
          }
          worksheet.getRow(7).eachCell((cell) => {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF2563EB' },
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
              bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            };
          });
          exportRows.forEach((payment, index) => {
            const excelDate = payment.isoDate
              ? new Date(`${payment.isoDate}T00:00:00.000Z`)
              : payment.businessDate;
            const row = worksheet.addRow([
              payment.receipt,
              payment.customer,
              payment.methods,
              payment.amountPaid,
              payment.change,
              payment.balance,
              payment.status,
              excelDate,
              payment.time,
              payment.user,
              ...(deliveryEnabled ? [payment.deliveryCost] : []),
              ...(serviceChargeEnabled ? [payment.serviceChargeCost] : []),
            ]);
            row.height = 21;
            row.eachCell((cell, columnNumber) => {
              cell.font = { name: 'Arial', size: 9, color: { argb: 'FF1F2937' } };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF1F5F9' },
              };
              cell.border = {
                bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } },
              };
              cell.alignment = {
                vertical: 'middle',
                horizontal: [4, 5, 6].includes(columnNumber) ? 'right' : 'left',
                wrapText: [2, 3].includes(columnNumber),
              };
            });
            for (const columnNumber of [4, 5, 6]) {
              row.getCell(columnNumber).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
            }
            if (payment.isoDate) row.getCell(8).numFmt = 'dd mmm yyyy';
          });
          worksheet.views = [{ state: 'frozen', ySplit: 7, topLeftCell: 'A8' }];
          worksheet.autoFilter = `A7:${reportLastColumn}${Math.max(7, exportRows.length + 7)}`;
          worksheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printTitlesRow: '7:7',
          };
          const buffer = await workbook.xlsx.writeBuffer();
          downloadReportFile(
            new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `${fileBaseName}.xlsx`
          );
        } else {
          const [{ jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
          ]);
          const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const pageWidth = document.internal.pageSize.getWidth();
          document.setFont('helvetica', 'bold');
          document.setFontSize(19);
          document.setTextColor(23, 54, 93);
          document.text('Payments Report', 12, 17);
          document.setFont('helvetica', 'normal');
          document.setFontSize(9);
          document.setTextColor(71, 85, 105);
          document.text('Payment records matching the selected filters | MarketBook', 12, 24);
          document.text(`Exported: ${formattedExportTime}`, 12, 30);
          const wrappedFilters = document.splitTextToSize(`Filters: ${filterDescription}`, pageWidth - 24);
          document.text(wrappedFilters, 12, 36);
          const summaryY = 36 + wrappedFilters.length * 4.5;
          const summary = `Records: ${exportRows.length} | Total paid: ${formatReportCurrency(paymentStats.total).replace(/₦/g, 'NGN ')} | Cash: ${formatReportCurrency(paymentStats.cash).replace(/₦/g, 'NGN ')} | POS: ${formatReportCurrency(paymentStats.pos).replace(/₦/g, 'NGN ')} | Transfer: ${formatReportCurrency(paymentStats.transfer).replace(/₦/g, 'NGN ')} | Other: ${formatReportCurrency(paymentStats.other).replace(/₦/g, 'NGN ')}`;
          const summaryLines = document.splitTextToSize(summary, pageWidth - 24);
          document.text(summaryLines, 12, summaryY);
          const feeSummary = [
            ...(deliveryEnabled ? [`Delivery fees: ${formatReportCurrency(paymentStats.delivery).replace(/₦/g, 'NGN ')}`] : []),
            ...(serviceChargeEnabled ? [`Service charges: ${formatReportCurrency(paymentStats.serviceCharge).replace(/₦/g, 'NGN ')}`] : []),
          ];
          const feeSummaryLines = feeSummary.length
            ? document.splitTextToSize(feeSummary.join(' | '), pageWidth - 24)
            : [];
          if (feeSummaryLines.length) document.text(feeSummaryLines, 12, summaryY + 5);
          const tableStartY = summaryY + summaryLines.length * 4.5 + 2 + feeSummaryLines.length * 4.5;

          autoTable(document, {
            head: [headers],
            body: exportRows.map((payment) => [
              payment.receipt,
              payment.customer,
              payment.methods.replace(/₦/g, 'NGN '),
              formatReportCurrency(payment.amountPaid).replace(/₦/g, 'NGN '),
              formatReportCurrency(payment.change).replace(/₦/g, 'NGN '),
              formatReportCurrency(payment.balance).replace(/₦/g, 'NGN '),
              payment.status,
              payment.businessDate,
              payment.time,
              payment.user,
              ...(deliveryEnabled
                ? [formatReportCurrency(payment.deliveryCost).replace(/₦/g, 'NGN ')]
                : []),
              ...(serviceChargeEnabled
                ? [formatReportCurrency(payment.serviceChargeCost).replace(/₦/g, 'NGN ')]
                : []),
            ]),
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
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 24 },
              2: { cellWidth: 35 },
              3: { cellWidth: 20, halign: 'right' },
              4: { cellWidth: 17, halign: 'right' },
              5: { cellWidth: 17, halign: 'right' },
              6: { cellWidth: 17 },
              7: { cellWidth: 20 },
              8: { cellWidth: 14 },
              9: { cellWidth: 19 },
              ...(deliveryEnabled ? { 10: { cellWidth: 20, halign: 'right' } } : {}),
              ...(serviceChargeEnabled ? { [deliveryEnabled ? 11 : 10]: { cellWidth: 20, halign: 'right' } } : {}),
            },
            didDrawPage: (page) => {
              const pageHeight = document.internal.pageSize.getHeight();
              document.setFontSize(8);
              document.setTextColor(100, 116, 139);
              document.text('MarketBook | Payments Report', 12, pageHeight - 7);
              document.text(`Page ${page.pageNumber}`, pageWidth - 12, pageHeight - 7, {
                align: 'right',
              });
            },
          });
          document.save(`${fileBaseName}.pdf`);
        }

        setExportMessage({
          type: 'success',
          text: `${formatType} report exported successfully (${exportRows.length} records).`,
        });
      } catch (exportError) {
        console.error('Payment report export failed:', exportError);
        setExportMessage({
          type: 'error',
          text: `Could not create the ${formatType} export. Please try again.`,
        });
      } finally {
        setExportLoading('');
      }
    };

    const getPaymentMethodIcon = (method) => {
      const methodLower = method?.toLowerCase();
      switch(methodLower) {
        case 'cash':
          return <DollarSign className="w-4 h-4" />;
        case 'pos':
          return <CreditCard className="w-4 h-4" />;
        case 'transfer':
          return <Smartphone className="w-4 h-4" />;
        default:
          return <DollarSign className="w-4 h-4" />;
      }
    };

    const getPaymentMethodColor = (method) => {
      const methodLower = method?.toLowerCase();
      switch(methodLower) {
        case 'cash':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'pos':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'transfer':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getStatusBadge = (status) => {
      const statusLower = status?.toLowerCase();
      switch(statusLower) {
        case 'completed':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          );
        case 'partial':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <Clock className="w-3 h-3" />
              Partial
            </span>
          );
        case 'refunded':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
              <RefreshCw className="w-3 h-3" />
              Refunded
            </span>
          );
        case 'cancelled':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              <XCircle className="w-3 h-3" />
              Cancelled
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          );
      }
    };

    const getCustomerTypeBadge = (customerType, customerName) => {
      if (customerType === 'REGISTERED' || customerName) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3 h-3" />
            {customerName || 'Registered'}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <User className="w-3 h-3" />
          Walk-in
        </span>
      );
    };

    const renderPaymentMethods = (payment) => {
      // Check if it's new schema with paymentMethods array
      if (payment.paymentMethods && Array.isArray(payment.paymentMethods) && payment.paymentMethods.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {payment.paymentMethods.map((pm, index) => (
              <span 
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getPaymentMethodColor(pm.method)}`}
              >
                {getPaymentMethodIcon(pm.method)}
                {pm.method}: {currencyFormat(pm.amount)}
              </span>
            ))}
          </div>
        );
      }
      
      // Legacy schema - show mop or infer from fields
      const method = payment.mop || 'cash';
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getPaymentMethodColor(method)}`}>
          {getPaymentMethodIcon(method)}
          {method.toUpperCase()}
        </span>
      );
    };

return( 
  <div className="p-6 ">
    {/* Header Section with Filters */}
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Payment Records</h2>
          <ExportButtons onExport={exportReport} exportLoading={exportLoading} />
        </div>
        {exportMessage && (
          <div
            role={exportMessage.type === 'error' ? 'alert' : 'status'}
            className={`rounded-lg px-4 py-3 text-sm ${
              exportMessage.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {exportMessage.text}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Date Filter */}
            <div className="flex-1 sm:flex-initial sm:w-64">
              <label className="block mb-1 text-xs font-semibold text-gray-700">Filter by Date:</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors text-sm"
                placeholderText="Select a date..."
                isClearable
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>

            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial sm:w-48">
              <label className="block mb-1 text-xs font-semibold text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search by receipt number, customer name, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <div className="min-w-0 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-3 dark:border-green-800 dark:from-green-950/60 dark:to-green-900/40">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-300" />
            <p className="text-xs text-gray-600 dark:text-slate-300">Cash</p>
          </div>
          <p className="break-words text-lg font-bold leading-tight tabular-nums text-green-700 dark:text-green-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.cash)}</p>
        </div>
        <div className="min-w-0 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 dark:border-blue-800 dark:from-blue-950/60 dark:to-blue-900/40">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            <p className="text-xs text-gray-600 dark:text-slate-300">POS</p>
          </div>
          <p className="break-words text-lg font-bold leading-tight tabular-nums text-blue-700 dark:text-blue-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.pos)}</p>
        </div>
        <div className="min-w-0 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-3 dark:border-purple-800 dark:from-purple-950/60 dark:to-purple-900/40">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <p className="text-xs text-gray-600 dark:text-slate-300">Transfer</p>
          </div>
          <p className="break-words text-lg font-bold leading-tight tabular-nums text-purple-700 dark:text-purple-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.transfer)}</p>
        </div>
        <div className="min-w-0 rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-3 dark:border-orange-800 dark:from-orange-950/60 dark:to-orange-900/40">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-300" />
            <p className="text-xs text-gray-600 dark:text-slate-300">Other</p>
          </div>
          <p className="break-words text-lg font-bold leading-tight tabular-nums text-orange-700 dark:text-orange-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.other)}</p>
        </div>
        {deliveryEnabled && (
          <div className="min-w-0 rounded-lg border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 dark:border-cyan-800 dark:from-cyan-950/60 dark:to-cyan-900/40">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
              <p className="text-xs text-gray-600 dark:text-slate-300">Delivery Fees</p>
            </div>
            <p className="break-words text-lg font-bold leading-tight tabular-nums text-cyan-700 dark:text-cyan-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.delivery)}</p>
          </div>
        )}
        {serviceChargeEnabled && (
          <div className="min-w-0 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100 p-3 dark:border-violet-800 dark:from-violet-950/60 dark:to-violet-900/40">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-300" />
              <p className="text-xs text-gray-600 dark:text-slate-300">Service Charges</p>
            </div>
            <p className="break-words text-lg font-bold leading-tight tabular-nums text-violet-700 dark:text-violet-200 [overflow-wrap:anywhere]">{currencyFormat(paymentStats.serviceCharge)}</p>
          </div>
        )}
        <div className="min-w-0 rounded-lg border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-3 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-gray-600 dark:text-slate-300" />
            <p className="text-xs text-gray-600 dark:text-slate-300">Total</p>
          </div>
          <p className="break-words text-lg font-bold leading-tight tabular-nums text-gray-800 dark:text-white [overflow-wrap:anywhere]">{currencyFormat(paymentStats.total)}</p>
        </div>
      </div>

      {/* Count Summary */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Transactions:</span>
          <span className="font-semibold text-gray-800">{filteredPayments?.length || 0}</span>
        </div>
        {paymentStats.splitPayments > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Split Payments:</span>
              <span className="font-semibold text-blue-600">{paymentStats.splitPayments}</span>
            </div>
          </>
        )}
        {selectedDate && (
          <>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-blue-600">{format(selectedDate, 'dd/MM/yyyy')}</span>
            </div>
          </>
        )}
        {selectedStatus !== 'all' && (
          <>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-blue-600 capitalize">{selectedStatus}</span>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Table Section */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table.Root layout="auto" variant="surface" className="w-full">
          <Table.Header>
            <Table.Row className="bg-gray-50">
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Receipt No.</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Customer</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Payment Method(s)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Amount</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Date/Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">User</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-gray-700 text-xs">Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        
          <Table.Body>
            {filteredPayments && filteredPayments?.length > 0 ? (
              filteredPayments.map((payment) => {
                const isSplitPayment = payment.paymentMethods?.length > 1;
                const receiptNum = payment.receiptNumber || payment.receipt;
                
                return (
                  <Table.Row key={payment?._id} className="hover:bg-gray-50 transition-colors">
                    {/* Receipt Number */}
                    <Table.RowHeaderCell className="font-semibold text-blue-600">
                      <div className="flex items-center gap-1">
                        <Receipt className="w-3 h-3" />
                        <span className="text-sm">#{receiptNum}</span>
                      </div>
                      {isSplitPayment && (
                        <span className="text-[10px] text-purple-600 font-medium">SPLIT</span>
                      )}
                    </Table.RowHeaderCell>

                    {/* Customer */}
                    <Table.Cell>
                      {getCustomerTypeBadge(payment.customerType, payment.customerName)}
                    </Table.Cell>

                    {/* Payment Method(s) */}
                    <Table.Cell>
                      {renderPaymentMethods(payment)}
                    </Table.Cell>

                    {/* Amount */}
                    <Table.Cell>
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                          {currencyFormat(payment?.amountPaid)}
                        </span>
                        {deliveryEnabled && Number(payment.deliveryCost || 0) > 0 && (
                          <span className="text-xs text-cyan-700">
                            Delivery: {currencyFormat(payment.deliveryCost)}
                          </span>
                        )}
                        {serviceChargeEnabled && Number(payment.serviceChargeCost || 0) > 0 && (
                          <span className="text-xs text-violet-700">
                            Service charge: {currencyFormat(payment.serviceChargeCost)}
                          </span>
                        )}
                        {payment.change > 0 && (
                          <span className="text-xs text-gray-500">
                            Change: {currencyFormat(payment.change)}
                          </span>
                        )}
                        {payment.balance > 0 && (
                          <span className="text-xs text-orange-600 font-medium">
                            Balance: {currencyFormat(payment.balance)}
                          </span>
                        )}
                      </div>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      {getStatusBadge(payment.status)}
                    </Table.Cell>

                    {/* Date/Time */}
                    <Table.Cell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-gray-700 font-medium">{payment?.bDate}</span>
                        <span className="text-gray-500">{formatTime(payment?.createdAt)}</span>
                      </div>
                    </Table.Cell>

                    {/* User */}
                    <Table.Cell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {payment.user}
                      </span>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-white text-xs font-semibold rounded-md transition-colors shadow-sm hover:shadow-md"
                        onClick={() => replace(`/${slug}/dashboard/stock?id=${payment._id}`)}
                      >
                        View Order
                      </button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No payments found</p>
                    <p className="text-gray-400 text-sm">
                      {searchTerm ? 'No results match your search' :
                       selectedDate ? 'No payments on this date' : 
                       selectedStatus !== 'all' ? `No ${selectedStatus} payments` :
                       'No payments recorded yet'}
                    </p>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  </div>
)
}
export default PaymentTable

function normalizePaymentDate(businessDate, createdAt) {
  const value = String(businessDate || '').trim();
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return value;

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(value || createdAt);
  if (Number.isNaN(parsed.getTime())) return '';
  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatReportDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function downloadReportFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}