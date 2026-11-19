"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function ExpenseTablePage() {
  const { slug } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [exportLoading, setExportLoading] = useState("");
  const [exportMessage, setExportMessage] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const formatAmount = (value) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const normalizeToISODate = (rawDate) => {
    if (!rawDate) return "";
    const value = String(rawDate).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const day = slashMatch[1].padStart(2, "0");
      const month = slashMatch[2].padStart(2, "0");
      const year = slashMatch[3];
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }

    return "";
  };

  const monthlyTotal = useMemo(() => {
    return expenses
      .filter((exp) => exp.status !== "rejected")
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [expenses]);

  const monthlyCount = useMemo(
    () => expenses.filter((exp) => exp.status !== "rejected").length,
    [expenses]
  );

  const dailyExpenses = useMemo(() => {
    return expenses.filter(
      (exp) =>
        exp.status !== "rejected" &&
        normalizeToISODate(exp.bDate || exp.createdAt) === todayISO
    );
  }, [expenses, todayISO]);

  const dailyTotal = useMemo(() => {
    return dailyExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [dailyExpenses]);

  const dailyCount = useMemo(() => dailyExpenses.length, [dailyExpenses]);

  const exportReport = async (format) => {
    setExportLoading(format);
    setExportMessage(null);

    try {
      const exportedAt = new Date();
      const dateStamp = [
        exportedAt.getFullYear(),
        String(exportedAt.getMonth() + 1).padStart(2, "0"),
        String(exportedAt.getDate()).padStart(2, "0"),
      ].join("-");
      const fileBaseName = `Expenses_Report_${selectedMonth}_${dateStamp}`;
      const exportRows = expenses.map((expense) => {
        const isoDate = normalizeToISODate(expense.bDate || expense.createdAt);
        const amount = Number(expense.amount || 0);

        return {
          description: expense.Description || expense.description || "",
          amount: Number.isFinite(amount) ? amount : 0,
          status: String(expense.status || "pending"),
          date: isoDate,
        };
      });
      const totalIncludedExpenses = exportRows.reduce(
        (sum, expense) =>
          expense.status.toLowerCase() === "rejected" ? sum : sum + expense.amount,
        0
      );
      const rejectedCount = exportRows.filter(
        (expense) => expense.status.toLowerCase() === "rejected"
      ).length;
      const headers = ["Description", "Amount (NGN)", "Status", "Date"];
      const formattedExportTime = exportedAt.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      if (format === "CSV") {
        const csvCell = (value) => {
          let text = String(value ?? "");
          if (typeof value !== "number" && /^[\t\r ]*[=+\-@]/.test(text)) {
            text = `'${text}`;
          }
          return `"${text.replace(/"/g, '""')}"`;
        };
        const csvRows = [
          ["Expenses Report", "", "", ""],
          ["Report period", selectedMonth, "", ""],
          ["Organization", "MarketBook", "", ""],
          ["Exported at", formattedExportTime, "", ""],
          ["Total records exported", exportRows.length, "", ""],
          ["Total expenses (excluding rejected)", totalIncludedExpenses, "", ""],
          ["Rejected records", rejectedCount, "", ""],
          ["", "", "", ""],
          headers,
          ...exportRows.map((expense) => [
            expense.description,
            expense.amount,
            expense.status,
            expense.date,
          ]),
        ];
        const csvContent = `\uFEFF${csvRows
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n")}`;
        downloadFile(
          new Blob([csvContent], { type: "text/csv;charset=utf-8" }),
          `${fileBaseName}.csv`
        );
      } else if (format === "Excel") {
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "MarketBook";
        workbook.created = exportedAt;
        const worksheet = workbook.addWorksheet("Expenses", {
          views: [{ state: "frozen", ySplit: 5 }],
        });

        worksheet.columns = [
          { key: "description", width: 42 },
          { key: "amount", width: 20 },
          { key: "status", width: 18 },
          { key: "date", width: 20 },
        ];
        worksheet.mergeCells("A1:D1");
        worksheet.getCell("A1").value = "Expenses Report";
        worksheet.mergeCells("A2:D2");
        worksheet.getCell("A2").value = `Expense records for ${selectedMonth}`;
        worksheet.getRow(3).values = [
          "Organization",
          "MarketBook",
          "Exported at",
          formattedExportTime,
        ];
        worksheet.getRow(4).values = [
          "Total records exported",
          exportRows.length,
          "Total expenses (excluding rejected)",
          totalIncludedExpenses,
        ];
        worksheet.getRow(5).values = headers;

        worksheet.getRow(1).height = 30;
        worksheet.getRow(2).height = 22;
        worksheet.getRow(3).height = 22;
        worksheet.getRow(4).height = 24;
        worksheet.getRow(5).height = 24;
        worksheet.getCell("A1").font = {
          name: "Arial",
          size: 18,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        worksheet.getCell("A1").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF17365D" },
        };
        worksheet.getCell("A2").font = {
          name: "Arial",
          size: 11,
          italic: true,
          color: { argb: "FF44546A" },
        };
        for (const rowNumber of [3, 4]) {
          const row = worksheet.getRow(rowNumber);
          row.font = { name: "Arial", size: 10, color: { argb: "FF1F2937" } };
          row.alignment = { vertical: "middle" };
          row.eachCell((cell, columnNumber) => {
            cell.border = {
              bottom: { style: "thin", color: { argb: "FFD9E2F3" } },
            };
            if ([1, 3].includes(columnNumber)) {
              cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF17365D" } };
            }
          });
        }
        worksheet.getCell("D4").numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
        worksheet.getRow(5).eachCell((cell) => {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" },
          };
          cell.alignment = { vertical: "middle", horizontal: "left" };
          cell.border = {
            top: { style: "thin", color: { argb: "FF1D4ED8" } },
            bottom: { style: "thin", color: { argb: "FF1D4ED8" } },
          };
        });

        exportRows.forEach((expense, index) => {
          const row = worksheet.addRow([
            expense.description,
            expense.amount,
            expense.status,
            expense.date ? new Date(`${expense.date}T00:00:00.000Z`) : "",
          ]);
          row.height = 20;
          row.eachCell((cell, columnNumber) => {
            cell.font = { name: "Arial", size: 10, color: { argb: "FF1F2937" } };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: index % 2 === 0 ? "FFFFFFFF" : "FFF1F5F9" },
            };
            cell.border = {
              bottom: { style: "hair", color: { argb: "FFD9E2F3" } },
            };
            cell.alignment = {
              vertical: "middle",
              horizontal: columnNumber === 2 || columnNumber === 4 ? "right" : "left",
              wrapText: columnNumber === 1,
            };
          });
          row.getCell(2).numFmt = '"₦"#,##0.00;[Red]-"₦"#,##0.00';
          if (expense.date) row.getCell(4).numFmt = "dd mmm yyyy";
        });

        worksheet.views = [{ state: "frozen", ySplit: 5, topLeftCell: "A6" }];
        worksheet.autoFilter = `A5:D${Math.max(5, exportRows.length + 5)}`;
        worksheet.pageSetup = {
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: "5:5",
        };
        const buffer = await workbook.xlsx.writeBuffer();
        downloadFile(
          new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `${fileBaseName}.xlsx`
        );
      } else {
        const [{ jsPDF }, { default: autoTable }] = await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);
        const document = new jsPDF({ unit: "mm", format: "a4" });
        document.setFont("helvetica", "bold");
        document.setFontSize(19);
        document.setTextColor(23, 54, 93);
        document.text("Expenses Report", 15, 20);
        document.setFont("helvetica", "normal");
        document.setFontSize(10);
        document.setTextColor(71, 85, 105);
        document.text(`MarketBook | Expense records for ${selectedMonth}`, 15, 28);
        document.text(`Exported: ${formattedExportTime}`, 15, 34);
        document.text(`Total records exported: ${exportRows.length}`, 15, 42);
        document.text(
          `Expenses excluding rejected: ${formatAmount(totalIncludedExpenses).replace(/₦/g, "NGN ")} | Rejected: ${rejectedCount}`,
          15,
          48
        );

        autoTable(document, {
          head: [headers],
          body: exportRows.map((expense) => [
            expense.description,
            formatAmount(expense.amount).replace(/₦/g, "NGN "),
            expense.status,
            expense.date,
          ]),
          startY: 54,
          margin: { top: 15, right: 15, bottom: 18, left: 15 },
          theme: "grid",
          styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
            textColor: [31, 41, 55],
            lineColor: [226, 232, 240],
          },
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [241, 245, 249] },
          columnStyles: {
            0: { cellWidth: 76 },
            1: { cellWidth: 34, halign: "right" },
            2: { cellWidth: 32 },
            3: { cellWidth: 33 },
          },
          didDrawPage: (page) => {
            const pageHeight = document.internal.pageSize.getHeight();
            const pageWidth = document.internal.pageSize.getWidth();
            document.setFontSize(8);
            document.setTextColor(100, 116, 139);
            document.text("MarketBook | Expenses Report", 15, pageHeight - 8);
            document.text(
              `Page ${page.pageNumber}`,
              pageWidth - 15,
              pageHeight - 8,
              { align: "right" }
            );
          },
        });
        document.save(`${fileBaseName}.pdf`);
      }

      setExportMessage({
        type: "success",
        text: `${format} report exported successfully (${exportRows.length} records).`,
      });
    } catch (exportError) {
      console.error("Expense report export failed:", exportError);
      setExportMessage({
        type: "error",
        text: `Could not create the ${format} export. Please try again.`,
      });
    } finally {
      setExportLoading("");
    }
  };

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/expense?month=${selectedMonth}&slug=${slug}`);
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        setError("Could not load expenses.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchExpenses();
    }
  }, [selectedMonth, slug]);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/expense/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update expense");
      setExpenses((prev) => prev.map((exp) => exp._id === id ? { ...exp, status } : exp));
    } catch (err) {
      alert("Failed to update expense status.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Expenses</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="month-filter" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Filter Month
            </label>
            <input
              id="month-filter"
              type="month"
              value={selectedMonth}
              max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="mr-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Export report:
          </span>
          {["CSV", "Excel", "PDF"].map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => exportReport(format)}
              disabled={Boolean(exportLoading) || loading || Boolean(error)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700"
            >
              {exportLoading === format
                ? `Preparing ${format}...`
                : format === "Excel"
                  ? "Excel (.xlsx)"
                  : format}
            </button>
          ))}
        </div>
        {exportMessage && (
          <div
            role={exportMessage.type === "error" ? "alert" : "status"}
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${
              exportMessage.type === "error"
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            {exportMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-blue-700">Total Daily Expenses</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{formatAmount(dailyTotal)}</p>
            <p className="text-xs text-blue-700 mt-1">{dailyCount} expense{dailyCount === 1 ? "" : "s"} today</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">Total Monthly Expenses</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{formatAmount(monthlyTotal)}</p>
            <p className="text-xs text-emerald-700 mt-1">{monthlyCount} expense{monthlyCount === 1 ? "" : "s"} in selected month ({selectedMonth})</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No expenses found for the selected month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden shadow">
              <thead className="bg-blue-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{exp.Description}</td>
                    <td className="px-4 py-3 text-sm text-blue-700 dark:text-blue-300 font-semibold">₦{exp.amount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${exp.status === 'approved' ? 'bg-green-100 text-green-700' : exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{exp.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{exp.bDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="mr-2 px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold disabled:opacity-60"
                        disabled={actionLoading === exp._id + 'approved' || exp.status === 'approved'}
                        onClick={() => handleAction(exp._id, 'approved')}
                      >
                        {actionLoading === exp._id + 'approved' ? '...' : 'Approve'}
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-60"
                        disabled={actionLoading === exp._id + 'rejected' || exp.status === 'rejected'}
                        onClick={() => handleAction(exp._id, 'rejected')}
                      >
                        {actionLoading === exp._id + 'rejected' ? '...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
