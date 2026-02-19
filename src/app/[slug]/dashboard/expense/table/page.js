"use client";
import { useEffect, useState } from "react";

export default function ExpenseTablePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      setError("");
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`/api/expense?bDate=${today}`);
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        setError("Could not load expenses.");
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

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
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Today's Expenses</h2>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No expenses entered for today.</div>
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
