import connectToDB from '@/utils/connectDB'
import Product from '@/models/product'
import InventoryTransaction from '@/models/models/InventoryTransaction'

export async function GET(req) {
  try{
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const product = searchParams.get('product') || searchParams.get('productId')
    if(!product) return new Response(JSON.stringify({ error: 'product id required' }), { status: 400 })
    const prod = await Product.findById(product).lean()
    const qty = prod ? (prod.qty || 0) : 0
    const transactions = await InventoryTransaction.find({ productId: product }).sort({ createdAt: -1 }).lean()
    return new Response(JSON.stringify({ product, qty, transactions }), { status: 200 })
  }catch(err){
    console.error(err)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}
