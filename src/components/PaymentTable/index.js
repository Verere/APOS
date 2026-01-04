

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
  X
} from 'lucide-react';

const PaymentTable=({payments, allPayment, slug})=>{
 
    const { replace } = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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
        completed: 0,
        partial: 0,
        splitPayments: 0
      };

      filteredPayments.forEach(payment => {
        stats.total += payment.amountPaid || 0;

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
  <div className="p-6 -mt-[56px]">
    {/* Header Section with Filters */}
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Payment Records</h2>
        </div>
        
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-600">Cash</p>
          </div>
          <p className="text-lg font-bold text-green-700">{currencyFormat(paymentStats.cash)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-600">POS</p>
          </div>
          <p className="text-lg font-bold text-blue-700">{currencyFormat(paymentStats.pos)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-gray-600">Transfer</p>
          </div>
          <p className="text-lg font-bold text-purple-700">{currencyFormat(paymentStats.transfer)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-600">Other</p>
          </div>
          <p className="text-lg font-bold text-orange-700">{currencyFormat(paymentStats.other)}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-gray-600" />
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <p className="text-lg font-bold text-gray-800">{currencyFormat(paymentStats.total)}</p>
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