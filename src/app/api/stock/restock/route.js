import connectToDB from '@/utils/connectDB'
import Product from '@/models/product'
import Store from '@/models/store'
import InventoryTransaction from '@/models/models/InventoryTransaction'
import withTransaction from '@/lib/withTransaction'
import User from '@/models/user'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getStoreBySlug } from '@/lib/getStoreBySlug'
import { requireStoreRole } from '@/lib/requireStoreRole'

export async function POST(req){
  try{
    const body = await req.json();
    const { productId, qty, slug, notes } = body || {};
    const q = Number(qty || 0);
    if(!productId) return new Response(JSON.stringify({ error: 'productId is required' }), { status: 400 })
    if(!slug) return new Response(JSON.stringify({ error: 'slug is required' }), { status: 400 })
    if(!Number.isFinite(q) || q <= 0) return new Response(JSON.stringify({ error: 'qty must be a positive number' }), { status: 400 })

    await connectToDB();

    // require authentication via NextAuth server session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // ensure user's email is verified
    const userDoc = await User.findById(session.user.id).lean();
    if (!userDoc || !userDoc.emailVerified) {
      return new Response(JSON.stringify({ error: 'Email not verified' }), { status: 403 });
    }

    // fetch store by slug and enforce membership role (OWNER or MANAGER)
    const store = await getStoreBySlug(slug);
    try {
      await requireStoreRole(session.user.id, store._id, ['OWNER', 'MANAGER']);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const res = await withTransaction(async (session) => {
      const prod = await Product.findById(productId).session(session);
      if(!prod) throw Object.assign(new Error('Product not found'), { code: 'NOT_FOUND' });

      const previousStock = prod.qty || 0;
      const newStock = previousStock + q;

      const updated = await Product.findOneAndUpdate({ _id: prod._id }, { $set: { qty: newStock } }, { new: true, session }).lean();
      if(!updated) throw new Error('Failed to update product stock');

      const inv = new InventoryTransaction({
        productId: prod._id,
        slug,
        type: 'RESTOCK',
        quantity: q,
        previousStock,
        newStock,
        orderId: null,
        notes: notes || 'Restock via API'
      });

      await inv.save({ session });

      return { product: updated, transaction: inv };
    });

    return new Response(JSON.stringify(res), { status: 200 })
  }catch(err){
    console.error(err);
    if(err && err.code === 'NOT_FOUND') return new Response(JSON.stringify({ error: err.message }), { status: 404 })
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}
