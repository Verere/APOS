import Expense from '@/models/expense';
import Store from '@/models/store';
import connectToDB from '@/utils/connectDB';
import mongoose from 'mongoose';

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

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const body = await req.json();
    const { status, storeId: bodyStoreId, slug } = body;

    // Build filter including storeId if provided or resolvable from slug
    const filter = { _id: params.id };
    const storeId = await resolveStoreId({ storeId: bodyStoreId, slug });
    if (storeId) {
      filter.storeId = storeId;
    }

    const expense = await Expense.findOneAndUpdate(filter, { status, ...body }, { new: true });
    if (!expense) return new Response(JSON.stringify({ error: 'Expense not found or store access denied.' }), { status: 404 });
    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update expense.' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const storeIdParam = searchParams.get('storeId');

    const filter = { _id: params.id };
    const storeId = await resolveStoreId({ storeId: storeIdParam, slug });
    if (storeId) {
      filter.storeId = storeId;
    }

    const expense = await Expense.findOneAndDelete(filter);
    if (!expense) return new Response(JSON.stringify({ error: 'Expense not found or store access denied.' }), { status: 404 });
    return new Response(JSON.stringify({ message: 'Expense deleted successfully.', id: params.id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete expense.' }), { status: 500 });
  }
}
