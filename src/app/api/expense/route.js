export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const bDate = searchParams.get('bDate');
    let query = {};
    if (bDate) query.bDate = bDate;
    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch expenses.' }), { status: 500 });
  }
}
import Expense from '@/models/expense';
import connectToDB from '@/utils/connectDB';

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
