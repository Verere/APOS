import Expense from '@/models/expense';
import connectToDB from '@/utils/connectDB';

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const bDate = searchParams.get('bDate');
    const month = searchParams.get('month');
    const slug = searchParams.get('slug');

    const query = {};

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
      query.bDate = bDate;
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
    const expense = await Expense.create(data);
    return new Response(JSON.stringify(expense), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create expense.' }), { status: 500 });
  }
}
