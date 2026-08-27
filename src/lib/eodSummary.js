const DEFAULT_THRESHOLDS = {
  largeRefundAmount: 5000,
  largeStockAdjustmentQty: 50,
  largeCreditSaleAmount: 200000,
  largeCashVarianceAmount: 10000,
  debtAttentionThreshold: 50000,
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sum(items, field = 'amount') {
  return (Array.isArray(items) ? items : []).reduce((total, item) => {
    return total + toNumber(item?.[field], 0);
  }, 0);
}

function sumByMethod(payments, method) {
  return (Array.isArray(payments) ? payments : []).reduce((total, payment) => {
    const methods = Array.isArray(payment?.paymentMethods) ? payment.paymentMethods : [];
    const methodTotal = methods
      .filter((item) => String(item?.method || '').toUpperCase() === String(method).toUpperCase())
      .reduce((innerTotal, item) => innerTotal + toNumber(item?.amount, 0), 0);

    if (methodTotal > 0) return total + methodTotal;

    if (String(payment?.mop || '').toUpperCase() === String(method).toUpperCase()) {
      return total + toNumber(payment?.amountPaid || payment?.amount || 0, 0);
    }

    return total + toNumber(payment?.[method.toLowerCase()] || 0, 0);
  }, 0);
}

function groupBy(items, keySelector, valueSelector = (item) => item) {
  return (Array.isArray(items) ? items : []).reduce((acc, item) => {
    const key = keySelector(item);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(valueSelector(item));
    return acc;
  }, {});
}

function buildPaymentBreakdown(payments) {
  const methodNames = ['CASH', 'POS', 'TRANSFER', 'CHEQUE', 'OTHER', 'WALLET'];
  const breakdown = {};

  for (const method of methodNames) {
    breakdown[method.toLowerCase()] = {
      label: method,
      amount: sumByMethod(payments, method),
      count: (Array.isArray(payments) ? payments : []).filter((payment) => {
        const methods = Array.isArray(payment?.paymentMethods) ? payment.paymentMethods : [];
        return methods.some((item) => String(item?.method || '').toUpperCase() === method);
      }).length,
    };
  }

  return breakdown;
}

function buildInventoryAlerts(products, inventoryTransactions, thresholds) {
  const items = Array.isArray(products) ? products : [];
  const alerts = [];

  items.forEach((product) => {
    const qty = toNumber(product?.qty, 0);
    if (qty <= 0) {
      alerts.push({
        type: 'out_of_stock',
        severity: 'high',
        product: product?.name || 'Unknown product',
        amount: qty,
        description: 'Product has no remaining stock.',
      });
    }

    if (product?.reOrder != null && qty <= toNumber(product.reOrder, 0)) {
      alerts.push({
        type: 'low_stock',
        severity: 'medium',
        product: product?.name || 'Unknown product',
        amount: qty,
        description: 'Stock is at or below the reorder point.',
      });
    }
  });

  const bigAdjustments = (Array.isArray(inventoryTransactions) ? inventoryTransactions : []).filter((transaction) => {
    const type = String(transaction?.type || '').toUpperCase();
    return ['ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'TRANSFER_OUT'].includes(type) && Math.abs(toNumber(transaction?.quantity, 0)) >= toNumber(thresholds.largeStockAdjustmentQty, DEFAULT_THRESHOLDS.largeStockAdjustmentQty);
  });

  bigAdjustments.forEach((transaction) => {
    alerts.push({
      type: 'large_adjustment',
      severity: 'high',
      amount: Math.abs(toNumber(transaction?.quantity, 0)),
      description: transaction?.notes || 'Manual stock adjustment was recorded.',
    });
  });

  return alerts;
}

function buildExpenseBreakdown(expenses) {
  const groups = groupBy(expenses, (expense) => {
    const label = String(expense?.Description || expense?.description || expense?.category || 'Miscellaneous').trim();
    return label || 'Miscellaneous';
  }, (expense) => expense);

  return Object.entries(groups).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + toNumber(item?.amount, 0), 0),
    count: items.length,
  })).sort((a, b) => b.total - a.total);
}

function buildAttentionRequired({
  walletTransactions = [],
  inventoryTransactions = [],
  credits = [],
  customers = [],
  thresholds = {},
  debtors = {},
}) {
  const alerts = [];
  const thresholdMap = { ...DEFAULT_THRESHOLDS, ...thresholds };

  const largeRefunds = (walletTransactions || []).filter((transaction) => {
    return String(transaction?.type || '').toUpperCase() === 'REFUND' && toNumber(transaction?.amount, 0) >= toNumber(thresholdMap.largeRefundAmount, DEFAULT_THRESHOLDS.largeRefundAmount);
  });

  largeRefunds.forEach((transaction) => {
    alerts.push({
      type: 'large_refund',
      severity: 'high',
      amount: toNumber(transaction?.amount, 0),
      description: transaction?.remarks || 'Refund exceeds the configured threshold.',
      action: 'Review refund record',
    });
  });

  const largeAdjustments = (inventoryTransactions || []).filter((transaction) => {
    const type = String(transaction?.type || '').toUpperCase();
    return ['ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'TRANSFER_OUT'].includes(type) && Math.abs(toNumber(transaction?.quantity, 0)) >= toNumber(thresholdMap.largeStockAdjustmentQty, DEFAULT_THRESHOLDS.largeStockAdjustmentQty);
  });

  largeAdjustments.forEach((transaction) => {
    alerts.push({
      type: 'large_adjustment',
      severity: 'high',
      amount: Math.abs(toNumber(transaction?.quantity, 0)),
      description: transaction?.notes || 'Inventory quantity changed materially.',
      action: 'Review adjustment log',
    });
  });

  const largeCreditSales = (credits || []).filter((credit) => toNumber(credit?.amount, 0) >= toNumber(thresholdMap.largeCreditSaleAmount, DEFAULT_THRESHOLDS.largeCreditSaleAmount));
  largeCreditSales.forEach((credit) => {
    alerts.push({
      type: 'large_credit_sale',
      severity: 'medium',
      amount: toNumber(credit?.amount, 0),
      description: 'A large credit sale was recorded today.',
      action: 'Review customer account',
    });
  });

  const debtAlertThreshold = toNumber(thresholdMap.debtAttentionThreshold, DEFAULT_THRESHOLDS.debtAttentionThreshold);
  const debtorList = Array.isArray(customers) ? customers.filter((customer) => toNumber(customer?.outstandingBalance, 0) > 0) : [];
  debtorList.forEach((customer) => {
    const balance = toNumber(customer?.outstandingBalance, 0);
    if (balance >= debtAlertThreshold) {
      alerts.push({
        type: 'overdue_debtor',
        severity: 'medium',
        amount: balance,
        description: `${customer?.name || 'Customer'} has a large outstanding balance.`,
        action: 'Review debtor account',
      });
    }
  });

  if (toNumber(debtors?.totalOutstandingDebt, 0) > debtAlertThreshold) {
    alerts.push({
      type: 'debt_focus',
      severity: 'medium',
      amount: toNumber(debtors?.totalOutstandingDebt, 0),
      description: 'Total outstanding debt is above the configured attention threshold.',
      action: 'Review debtors list',
    });
  }

  return alerts.slice(0, 20);
}

export function summarizeEod({
  orders = [],
  payments = [],
  expenses = [],
  credits = [],
  creditPayments = [],
  walletTransactions = [],
  inventoryTransactions = [],
  customers = [],
  products = [],
  thresholds = {},
  date = '',
}) {
  const thresholdMap = { ...DEFAULT_THRESHOLDS, ...thresholds };

  const saleOrders = (orders || []).filter((order) => !order?.isCancelled && String(order?.transactionType || 'STANDARD').toUpperCase() !== 'COMPLIMENTARY');
  const complimentaryOrders = (orders || []).filter((order) => String(order?.transactionType || '').toUpperCase() === 'COMPLIMENTARY');

  const revenue = saleOrders.reduce((sum, order) => sum + toNumber(order?.amount, 0), 0);
  const complimentary = complimentaryOrders.reduce((sum, order) => sum + toNumber(order?.amount, 0), 0);
  const refundsTotal = (walletTransactions || []).filter((transaction) => String(transaction?.type || '').toUpperCase() === 'REFUND').reduce((sum, item) => sum + toNumber(item?.amount, 0), 0)
    + (Array.isArray(payments) ? payments.filter((payment) => String(payment?.status || '').toUpperCase() === 'REFUNDED').reduce((sum, item) => sum + toNumber(item?.amountPaid || item?.orderAmount || 0, 0), 0) : 0);
  const netSales = Math.max(0, revenue - refundsTotal);
  const grossProfit = saleOrders.reduce((sum, order) => sum + toNumber(order?.profit, 0), 0);
  const costOfGoodsSold = Math.max(0, revenue - grossProfit);
  const totalExpenses = expenses.reduce((sum, expense) => sum + toNumber(expense?.amount, 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const totalTransactions = saleOrders.length;
  const averageTransactionValue = totalTransactions > 0 ? revenue / totalTransactions : 0;

  const settlementBreakdown = buildPaymentBreakdown(payments);
  const settlement = {
    salesSettledToday: {
      amount: (Array.isArray(payments) ? payments : []).reduce((sum, payment) => sum + toNumber(payment?.amountPaid || payment?.orderAmount || 0, 0), 0),
      count: (Array.isArray(payments) ? payments : []).length,
    },
    moneyReceivedToday: {
      amount: (Array.isArray(payments) ? payments : []).reduce((sum, payment) => sum + toNumber(payment?.amountPaid || payment?.orderAmount || 0, 0), 0) + sum(creditPayments, 'amount') + sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT'), 'amount'),
      count: (Array.isArray(payments) ? payments : []).length + creditPayments.length + walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT').length,
    },
    debtCollectedToday: {
      amount: sum(creditPayments, 'amount'),
      count: creditPayments.length,
    },
    customerDepositsReceivedToday: {
      amount: sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT'), 'amount'),
      count: walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT').length,
    },
    walletTopUpsFunding: {
      amount: sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT'), 'amount'),
      count: walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT').length,
    },
    cash: { ...settlementBreakdown.cash, percentage: settlementBreakdown.cash.amount && revenue > 0 ? (settlementBreakdown.cash.amount / revenue) * 100 : 0 },
    pos: { ...settlementBreakdown.pos, percentage: settlementBreakdown.pos.amount && revenue > 0 ? (settlementBreakdown.pos.amount / revenue) * 100 : 0 },
    transfer: { ...settlementBreakdown.transfer, percentage: settlementBreakdown.transfer.amount && revenue > 0 ? (settlementBreakdown.transfer.amount / revenue) * 100 : 0 },
    wallet: { ...settlementBreakdown.wallet, percentage: settlementBreakdown.wallet.amount && revenue > 0 ? (settlementBreakdown.wallet.amount / revenue) * 100 : 0 },
    other: { ...settlementBreakdown.other, percentage: settlementBreakdown.other.amount && revenue > 0 ? (settlementBreakdown.other.amount / revenue) * 100 : 0 },
    cheque: { ...settlementBreakdown.cheque, percentage: settlementBreakdown.cheque.amount && revenue > 0 ? (settlementBreakdown.cheque.amount / revenue) * 100 : 0 },
  };

  const totalOutstandingDebt = (customers || []).reduce((sum, customer) => sum + toNumber(customer?.outstandingBalance, 0), 0);
  const debtors = {
    creditSalesToday: sum(credits, 'amount'),
    debtPaymentsReceivedToday: sum(creditPayments, 'amount'),
    debtWriteOffsToday: 0,
    netDebtChange: sum(credits, 'amount') - sum(creditPayments, 'amount'),
    totalOutstandingDebt,
    numberOfDebtors: (customers || []).filter((customer) => toNumber(customer?.outstandingBalance, 0) > 0).length,
    overdueDebtAmount: (customers || []).filter((customer) => toNumber(customer?.outstandingBalance, 0) > 0).reduce((sum, customer) => sum + toNumber(customer?.outstandingBalance, 0), 0),
    debtorsRequiringAttention: (customers || []).filter((customer) => toNumber(customer?.outstandingBalance, 0) > 0).map((customer) => ({
      customer: customer?.name || 'Unknown customer',
      outstandingBalance: toNumber(customer?.outstandingBalance, 0),
      amountOverdue: toNumber(customer?.outstandingBalance, 0),
      dueDate: customer?.dueDate || null,
      lastPayment: customer?.lastPayment || null,
      status: toNumber(customer?.outstandingBalance, 0) > 0 ? 'Active' : 'Clear',
    })),
  };

  const walletOpeningBalance = (customers || []).reduce((sum, customer) => sum + toNumber(customer?.walletBalance, 0), 0);
  const walletSalesUsingWallet = sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'SALE'), 'amount');
  const walletTopUpsReceived = sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'DEPOSIT'), 'amount');
  const walletRefundsIssued = sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'REFUND'), 'amount');
  const walletAdjustments = sum(walletTransactions.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'ADJUSTMENT'), 'amount');

  const wallet = {
    summary: {
      openingDepositBalance: walletOpeningBalance,
      depositsReceivedToday: walletTopUpsReceived,
      depositsAppliedToSales: walletSalesUsingWallet,
      depositsRefunded: walletRefundsIssued,
      adjustments: walletAdjustments,
      closingUnusedDepositBalance: walletOpeningBalance,
      salesUsingWallet: walletSalesUsingWallet,
      topUpsReceived: walletTopUpsReceived,
      refundsIssued: walletRefundsIssued,
    },
    activity: (walletTransactions || []).map((transaction) => ({
      type: transaction?.type || 'Unknown',
      amount: toNumber(transaction?.amount, 0),
      reference: transaction?.reference || transaction?.invoice || null,
      paymentMethod: transaction?.paymentMethod || null,
      remarks: transaction?.remarks || '',
      createdAt: transaction?.createdAt || null,
    })),
  };

  const inventoryTransactionsList = Array.isArray(inventoryTransactions) ? inventoryTransactions : [];
  const saleUnits = inventoryTransactionsList.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'SALE').reduce((sum, item) => sum + Math.abs(toNumber(item?.quantity, 0)), 0);
  const stockSoldCost = inventoryTransactionsList.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'SALE').reduce((sum, item) => sum + Math.abs(toNumber(item?.quantity, 0)) * toNumber(item?.unitCost || item?.cost || 0, 0), 0);
  const purchasesStockReceived = inventoryTransactionsList.filter((transaction) => ['RESTOCK', 'RETURN', 'TRANSFER_IN'].includes(String(transaction?.type || '').toUpperCase())).reduce((sum, item) => sum + Math.abs(toNumber(item?.quantity, 0)), 0);
  const stockAdjustments = inventoryTransactionsList.filter((transaction) => ['ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'TRANSFER_OUT'].includes(String(transaction?.type || '').toUpperCase())).reduce((sum, item) => sum + Math.abs(toNumber(item?.quantity, 0)), 0);
  const stockReturns = inventoryTransactionsList.filter((transaction) => String(transaction?.type || '').toUpperCase() === 'RETURN').reduce((sum, item) => sum + Math.abs(toNumber(item?.quantity, 0)), 0);
  const closingStockValue = (products || []).reduce((sum, product) => sum + toNumber(product?.qty, 0) * toNumber(product?.cost, 0), 0);

  const inventoryAlerts = buildInventoryAlerts(products, inventoryTransactionsList, thresholdMap);
  const inventorySummary = {
    openingStockValue: Math.max(0, closingStockValue - purchasesStockReceived + saleUnits),
    purchasesStockReceived,
    stockSoldOrCogs: stockSoldCost,
    stockSoldUnits: saleUnits,
    stockReturns,
    stockAdjustments,
    closingStockValue,
    alerts: inventoryAlerts,
    outOfStockProducts: inventoryAlerts.filter((item) => item.type === 'out_of_stock').length,
    lowStockProducts: inventoryAlerts.filter((item) => item.type === 'low_stock').length,
  };

  const expenseBreakdown = buildExpenseBreakdown(expenses);
  const expensesSummary = {
    totalExpenses,
    expenseCount: expenses.length,
    breakdown: expenseBreakdown,
  };

  const attentionRequired = buildAttentionRequired({
    walletTransactions,
    inventoryTransactions: inventoryTransactionsList,
    credits,
    customers,
    thresholds: thresholdMap,
    debtors,
  });

  const totals = {
    totalRevenue: revenue,
    complementary: complimentary,
    returnsRefunds: refundsTotal,
    netSales,
    cogs: costOfGoodsSold,
    grossProfit,
    grossMarginPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    operatingExpenses: totalExpenses,
    netProfit,
    totalTransactions,
    averageTransactionValue,
    totalPayment: settlement.salesSettledToday.amount,
    totalCash: settlement.cash.amount,
    totalPos: settlement.pos.amount,
    totalTransfer: settlement.transfer.amount,
    totalOther: settlement.other.amount,
    totalCredit: debtors.creditSalesToday,
    totalCreditPaid: debtors.debtPaymentsReceivedToday,
    totalWalletDeposit: wallet.summary.topUpsReceived,
    totalExpensesValue: totalExpenses,
    totalOutstandingDebt,
  };

  return {
    date,
    businessSummary: {
      revenue,
      complementary: complimentary,
      returnsRefunds: refundsTotal,
      netSales,
      cogs: costOfGoodsSold,
      grossProfit,
      grossMarginPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingExpenses: totalExpenses,
      netProfit,
      totalTransactions,
      averageTransactionValue,
    },
    settlement,
    expensesSummary,
    inventorySummary,
    debtors,
    wallet,
    attentionRequired,
    status: attentionRequired.length > 0 ? '⚠️ EOD Requires Attention' : '✅ EOD Balanced',
    ...totals,
  };
}

export default summarizeEod;
