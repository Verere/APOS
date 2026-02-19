import Expense from '@/models/expense';
import connectToDB from '@/utils/connectDB';

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { status } = await req.json();
    const expense = await Expense.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!expense) return new Response(JSON.stringify({ error: 'Expense not found.' }), { status: 404 });
    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update expense.' }), { status: 500 });
  }
}
