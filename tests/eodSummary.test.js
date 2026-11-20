import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeEod } from '../src/lib/eodSummary.js';

test('cash sale totals and profit match the real business flow', () => {
  const summary = summarizeEod({
    orders: [{ amount: 5000, profit: 1600 }],
    payments: [{ paymentMethods: [{ method: 'CASH', amount: 5000 }] }],
    expenses: [{ amount: 600 }],
    credits: [],
    creditPayments: [],
    walletTransactions: [],
    inventoryTransactions: [],
    customers: [],
  });

  assert.equal(summary.businessSummary.revenue, 5000);
  assert.equal(summary.businessSummary.grossProfit, 1600);
  assert.equal(summary.businessSummary.netProfit, 1000);
  assert.equal(summary.businessSummary.totalTransactions, 1);
  assert.equal(summary.settlement.cash.amount, 5000);
  assert.equal(summary.attentionRequired.length, 0);
});

test('delivery fees only include active standard sales', () => {
  const summary = summarizeEod({
    orders: [
      { amount: 1100, deliveryCost: 100 },
      { amount: 500, deliveryCost: 250, transactionType: 'COMPLIMENTARY' },
      { amount: 700, deliveryCost: 70, isCancelled: true },
    ],
  });

  assert.equal(summary.totalDelivery, 100);
  assert.equal(summary.businessSummary.totalDelivery, 100);
});

test('revenue excludes delivery fees for new and legacy orders', () => {
  const summary = summarizeEod({
    orders: [
      { amount: 1000, totalAmount: 1250, deliveryCost: 250, profit: 300 },
      { amount: 1250, totalAmount: 1250, deliveryCost: 250, profit: 300 },
    ],
  });

  assert.equal(summary.businessSummary.revenue, 2000);
  assert.equal(summary.totalDelivery, 500);
});

test('service charges are totaled separately and excluded from product revenue', () => {
  const summary = summarizeEod({
    orders: [
      { amount: 1000, totalAmount: 1200, serviceChargeCost: 200, profit: 300 },
      { amount: 900, totalAmount: 1200, deliveryCost: 100, serviceChargeCost: 200, profit: 250 },
    ],
  });

  assert.equal(summary.businessSummary.revenue, 1900);
  assert.equal(summary.totalServiceCharge, 400);
});

test('credit sales and debt collections stay separate from sales revenue', () => {
  const summary = summarizeEod({
    orders: [{ amount: 2500, profit: 700 }],
    payments: [{ paymentMethods: [{ method: 'POS', amount: 1500 }] }],
    credits: [{ amount: 1000 }],
    creditPayments: [{ amount: 400 }],
    expenses: [],
    walletTransactions: [],
    inventoryTransactions: [],
    customers: [],
  });

  assert.equal(summary.businessSummary.revenue, 2500);
  assert.equal(summary.businessSummary.grossProfit, 700);
  assert.equal(summary.settlement.pos.amount, 1500);
  assert.equal(summary.debtors.creditSalesToday, 1000);
  assert.equal(summary.debtors.debtPaymentsReceivedToday, 400);
  assert.equal(summary.debtors.netDebtChange, 600);
});

test('wallet-funded sales and wallet top-ups remain distinct from sales proceeds', () => {
  const summary = summarizeEod({
    orders: [{ amount: 1800, profit: 500 }],
    payments: [{ paymentMethods: [{ method: 'WALLET', amount: 1800 }] }],
    expenses: [],
    credits: [],
    creditPayments: [],
    walletTransactions: [
      { type: 'Sale', amount: 1800 },
      { type: 'Deposit', amount: 1500 },
      { type: 'Refund', amount: 200 },
    ],
    inventoryTransactions: [],
    customers: [],
  });

  assert.equal(summary.businessSummary.revenue, 1800);
  assert.equal(summary.wallet.summary.salesUsingWallet, 1800);
  assert.equal(summary.wallet.summary.topUpsReceived, 1500);
  assert.equal(summary.wallet.summary.refundsIssued, 200);
});

test('large adjustments and large refunds are flagged for attention', () => {
  const summary = summarizeEod({
    orders: [{ amount: 1000, profit: 250 }],
    payments: [{ paymentMethods: [{ method: 'CASH', amount: 1000 }] }],
    expenses: [{ amount: 100 }],
    credits: [],
    creditPayments: [],
    walletTransactions: [{ type: 'Refund', amount: 950 }],
    inventoryTransactions: [{ type: 'ADJUSTMENT', quantity: -700, notes: 'manual stock correction' }],
    customers: [],
    thresholds: { largeRefundAmount: 500, largeStockAdjustmentQty: 100 },
  });

  assert.equal(summary.attentionRequired.length >= 2, true);
  assert.equal(summary.attentionRequired.some((item) => item.type === 'large_refund'), true);
  assert.equal(summary.attentionRequired.some((item) => item.type === 'large_adjustment'), true);
});
