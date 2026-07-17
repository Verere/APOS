import mongoose from 'mongoose';
import connectToDB from '@/utils/connectDB';
import InventoryTransaction from '@/models/models/InventoryTransaction';

type InventoryTxnType =
  | 'SALE'
  | 'RESTOCK'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'COMPLEMENTARY'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

interface InventoryReportInput {
  slug: string;
  startDate: Date | string;
  endDate: Date | string;
  productId?: string;
}

interface InventoryReportRow {
  productId: string;
  openingStock: number;
  restock: number;
  sales: number;
  complimentary: number;
  returns: number;
  damage: number;
  transferIn: number;
  transferOut: number;
  adjustments: number;
  closingStock: number;
  netMovement: number;
  transactionCount: number;
}

interface InventoryReportResult {
  slug: string;
  startDate: string;
  endDate: string;
  filters: {
    productId: string | null;
  };
  totals: Omit<InventoryReportRow, 'productId'>;
  products: InventoryReportRow[];
  generatedAt: string;
}

function toDate(input: Date | string, label: string): Date {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} is invalid`);
  }
  return date;
}

function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function normalizeRange(startDate: Date | string, endDate: Date | string): { start: Date; end: Date } {
  const startRaw = toDate(startDate, 'startDate');
  const endRaw = toDate(endDate, 'endDate');

  const start = toStartOfDay(startRaw);
  const end = toEndOfDay(endRaw);

  if (start > end) {
    throw new Error('startDate cannot be after endDate');
  }

  return { start, end };
}

function toPositiveOutflow(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? Math.abs(value) : value;
}

function toPositiveInflow(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value > 0 ? value : Math.abs(value);
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Computes an inventory report strictly from InventoryTransaction events.
 * No summary tables are written or read.
 */
export async function getInventoryReport(input: InventoryReportInput): Promise<InventoryReportResult> {
  const { slug, startDate, endDate, productId } = input;

  if (!slug || !String(slug).trim()) {
    throw new Error('slug is required');
  }

  const { start, end } = normalizeRange(startDate, endDate);

  const baseMatch: Record<string, unknown> = { slug: String(slug).trim() };
  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('productId is invalid');
    }
    baseMatch.productId = new mongoose.Types.ObjectId(productId);
  }

  await connectToDB();

  const openingBeforeRange = await InventoryTransaction.aggregate([
    {
      $match: {
        ...baseMatch,
        createdAt: { $lt: start },
      },
    },
    { $sort: { productId: 1, createdAt: -1, _id: -1 } },
    {
      $group: {
        _id: '$productId',
        openingStock: { $first: '$newStock' },
      },
    },
  ]);

  const groupedInRange = await InventoryTransaction.aggregate([
    {
      $match: {
        ...baseMatch,
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $sort: { productId: 1, createdAt: 1, _id: 1 } },
    {
      $group: {
        _id: '$productId',
        firstPreviousStock: { $first: '$previousStock' },
        lastNewStock: { $last: '$newStock' },
        transactionCount: { $sum: 1 },
        restockRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'RESTOCK'] }, '$quantity', 0],
          },
        },
        salesRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'SALE'] }, '$quantity', 0],
          },
        },
        complimentaryRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'COMPLEMENTARY'] }, '$quantity', 0],
          },
        },
        returnsRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'RETURN'] }, '$quantity', 0],
          },
        },
        damagedRaw: {
          $sum: {
            $cond: [{ $in: ['$type', ['DAMAGED', 'EXPIRED']] }, '$quantity', 0],
          },
        },
        transferInRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'TRANSFER_IN'] }, '$quantity', 0],
          },
        },
        transferOutRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'TRANSFER_OUT'] }, '$quantity', 0],
          },
        },
        adjustmentsRaw: {
          $sum: {
            $cond: [{ $eq: ['$type', 'ADJUSTMENT'] }, '$quantity', 0],
          },
        },
      },
    },
  ]);

  const openingMap = new Map<string, number>();
  for (const row of openingBeforeRange) {
    openingMap.set(String(row._id), toNumber(row.openingStock));
  }

  const rows: InventoryReportRow[] = groupedInRange.map((row) => {
    const productKey = String(row._id);
    const openingFromHistory = openingMap.get(productKey);
    const openingStock =
      openingFromHistory !== undefined ? openingFromHistory : toNumber(row.firstPreviousStock);

    const restock = toPositiveInflow(toNumber(row.restockRaw));
    const sales = toPositiveOutflow(toNumber(row.salesRaw));
    const complimentary = toPositiveOutflow(toNumber(row.complimentaryRaw));
    const returns = toPositiveInflow(toNumber(row.returnsRaw));
    const damage = toPositiveOutflow(toNumber(row.damagedRaw));
    const transferIn = toPositiveInflow(toNumber(row.transferInRaw));
    const transferOut = toPositiveOutflow(toNumber(row.transferOutRaw));
    const adjustments = toNumber(row.adjustmentsRaw);

    const closingStock = toNumber(row.lastNewStock);
    const netMovement = closingStock - openingStock;

    return {
      productId: productKey,
      openingStock,
      restock,
      sales,
      complimentary,
      returns,
      damage,
      transferIn,
      transferOut,
      adjustments,
      closingStock,
      netMovement,
      transactionCount: toNumber(row.transactionCount),
    };
  });

  // For single-product queries, include a row even if there are no in-range transactions.
  if (rows.length === 0 && productId) {
    const openingStock = openingMap.get(String(productId)) ?? 0;
    rows.push({
      productId: String(productId),
      openingStock,
      restock: 0,
      sales: 0,
      complimentary: 0,
      returns: 0,
      damage: 0,
      transferIn: 0,
      transferOut: 0,
      adjustments: 0,
      closingStock: openingStock,
      netMovement: 0,
      transactionCount: 0,
    });
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.openingStock += row.openingStock;
      acc.restock += row.restock;
      acc.sales += row.sales;
      acc.complimentary += row.complimentary;
      acc.returns += row.returns;
      acc.damage += row.damage;
      acc.transferIn += row.transferIn;
      acc.transferOut += row.transferOut;
      acc.adjustments += row.adjustments;
      acc.closingStock += row.closingStock;
      acc.netMovement += row.netMovement;
      acc.transactionCount += row.transactionCount;
      return acc;
    },
    {
      openingStock: 0,
      restock: 0,
      sales: 0,
      complimentary: 0,
      returns: 0,
      damage: 0,
      transferIn: 0,
      transferOut: 0,
      adjustments: 0,
      closingStock: 0,
      netMovement: 0,
      transactionCount: 0,
    }
  );

  return {
    slug: String(slug).trim(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    filters: {
      productId: productId || null,
    },
    totals,
    products: rows,
    generatedAt: new Date().toISOString(),
  };
}

export default getInventoryReport;
