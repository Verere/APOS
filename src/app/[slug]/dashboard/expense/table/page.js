"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function ExpenseTablePage() {
  const { slug } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
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
    return expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [expenses]);

  const monthlyCount = useMemo(() => expenses.length, [expenses]);

  const dailyExpenses = useMemo(() => {
    return expenses.filter((exp) => normalizeToISODate(exp.bDate || exp.createdAt) === todayISO);
  }, [expenses, todayISO]);

  const dailyTotal = useMemo(() => {
    return dailyExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [dailyExpenses]);

  const dailyCount = useMemo(() => dailyExpenses.length, [dailyExpenses]);

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
