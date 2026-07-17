import Expense from '@/models/expense';
import Store from '@/models/store';
import connectToDB from '@/utils/connectDB';
import mongoose from 'mongoose';

function normalizeBusinessDate(rawDate) {
  if (!rawDate) return rawDate;
  const asText = String(rawDate).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asText)) return asText;

  const [year, month, day] = asText.split('-');
  return `${Number(day)}/${month}/${year}`;
}

async function resolveStoreId({ storeId, slug }) {
  if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
    return storeId;
  }
  if (slug) {
    const store = await Store.findOne({ slug }).lean();
    if (store?._id) return store._id;
  }
  return null;
}

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const bDate = searchParams.get('bDate');
    const month = searchParams.get('month');
    const slug = searchParams.get('slug');
    const storeIdParam = searchParams.get('storeId');

    const storeId = await resolveStoreId({ storeId: storeIdParam, slug });
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'storeId or valid store slug is required to fetch expenses.' }), { status: 400 });
    }

    const query = { storeId, isCancelled: false };

    if (slug) {
      query.slug = slug;
    }

    if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      const [yearPart, monthPart] = month.split('-');
      // Support both ISO (YYYY-MM-DD) and legacy (D/MM/YYYY or DD/MM/YYYY) bDate formats.
      query.$or = [
        { bDate: { $regex: `^${month}` } },
        { bDate: { $regex: `^(?:[1-9]|[12][0-9]|3[01])/${monthPart}/${yearPart}$` } },
        {
          createdAt: {
            $gte: new Date(`${month}-01T00:00:00.000Z`),
            $lt: new Date(new Date(`${month}-01T00:00:00.000Z`).setUTCMonth(new Date(`${month}-01T00:00:00.000Z`).getUTCMonth() + 1))
          }
        }
      ];
    } else if (bDate) {
      const normalizedBDate = normalizeBusinessDate(bDate);
      query.$or = [{ bDate }, { bDate: normalizedBDate }];
    }

    const expenses = await Expense.find(query).sort({ bDate: -1, createdAt: -1 });
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch expenses.' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const data = await req.json();
    const storeId = await resolveStoreId({ storeId: data?.storeId, slug: data?.slug });
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'storeId or valid store slug is required to create an expense.' }), { status: 400 });
    }

    const expensePayload = { ...data, storeId, bDate: normalizeBusinessDate(data?.bDate) };
    const expense = await Expense.create(expensePayload);
    return new Response(JSON.stringify(expense), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to create expense.' }), { status: 500 });
  }
}
