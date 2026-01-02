import { NextResponse } from 'next/server'
import { fetchSalesByOrderId } from '@/actions/fetch'

export async function GET(request, { params }) {
  try {
    const { orderId } = await params
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const sales = await fetchSalesByOrderId(orderId)
    
    return NextResponse.json({ sales }, { status: 200 })
  } catch (error) {
    console.error('Error fetching sales by order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}
