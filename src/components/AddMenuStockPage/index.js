"use client"
import { fetchProductById } from "@/actions/fetch";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AddMenuStockPage = ({ slug }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [action, setAction] = useState("")
  const [productId, setProductId] = useState("")
  const [productName, setProductName] = useState("")
  const [cost, setCost] = useState(0)
  const [stockBal, setStockBal] = useState(0)
  const [prevStock, setPrevStock] = useState(0)
  const [qty, setQty] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      const id = searchParams.get('id')
      if (!id) return

      const prod = await fetchProductById(id)
      const product = prod?.[0]
      if (!product) return

      setProductId(product._id)
      setProductName(product.name || '')
      setCost(Number(product.price) || 0)
      setPrevStock(Number(product.qty) || 0)
      setStockBal(Number(product.qty) || 0)
    }

    loadProduct()
  }, [searchParams])

  const handleStockBal = async (value) => {
    const numericQty = Number(value || 0)
    setQty(numericQty)

    if (!action) {
      setStockBal(prevStock)
      return
    }

    const delta = action === 'writeOff' ? -numericQty : numericQty
    const nextStock = Number(prevStock) + delta
    setStockBal(nextStock)

    if (nextStock < 0) {
      toast.warn("bal stock cannot be less than zero!")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const quantity = Number(qty || 0)
    if (!productId) {
      toast.error('Missing product selection')
      return
    }
    if (!action) {
      toast.error('Please choose an action')
      return
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Quantity must be greater than zero')
      return
    }

    const mapping = {
      addStock: { type: 'RESTOCK', signedQty: quantity },
      return: { type: 'RETURN', signedQty: quantity },
      writeOff: { type: 'DAMAGED', signedQty: -quantity },
    }

    const tx = mapping[action]
    if (!tx) {
      toast.error('Unsupported action')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          slug,
          type: tx.type,
          quantity: tx.signedQty,
          notes: `${action} via dashboard stock page`,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update stock')
      }

      toast.success('Stock updated successfully')
      setPrevStock(Number(data?.product?.qty) || 0)
      setStockBal(Number(data?.product?.qty) || 0)
      setQty(0)
    } catch (err) {
      toast.error(err?.message || 'Failed to update stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col justify-between w-full mt-0 mr-0 ml-0 ">
      <div className="mb-2 px-2">
        <div className="text-sm font-medium">Product: <span className="font-bold">{productName || '—'}</span></div>
        <div className="text-sm">Current stock: <span className="font-semibold">{prevStock}</span></div>
      </div>
      <input type="text" placeholder="Product" value={productName} readOnly className="border w-full mx-2 border-gray-400 p-2 mb-2 bg-gray-100" required />


                            <div className="flex flex-wrap gap-2 mt-2 p-2 justify-between">
      <div>
        <label htmlFor="path">Path</label>
        <input type="text" value={pathname} readOnly className="border w-44 mx-2 border-gray-400 p-2 bg-gray-100" />
      </div>




        <select name="action" id="cat" value={action} onChange={async(e)=>await setAction(e.target.value)}>
          <option value="">Action</option>
          <option value="addStock">Add Stock</option>
          <option value="writeOff">Write Off</option>
          <option value="return">Return</option>

        </select>
        <div>
                            <label htmlFor="prevStock">Previous Stock</label>
      <input type="number" value={prevStock}  readOnly  name="stock" className="border w-20  mx-2 bg-gray-100 p-2" />

      </div>
      <div>
                            <label htmlFor="qty">Qty Added</label>
      <input type="number" value={qty} name="qty" onChange={async(e)=> await handleStockBal(e.target.value)} className="border w-20 mx-2 border-gray-400 p-2" required />

      </div>

      <div>
                            <label htmlFor="stockBal">Stock Balance</label>
      <input type="number"  value={stockBal}  readOnly  name="balanceStock" className="border w-20  outline-none focus:outline-none text-center mx-2 bg-gray-100 p-2" />

      </div>
      <div>
                            <label htmlFor="price">Price/Unit</label>

      <input type="number" name="price" value={cost} readOnly className="border w-20 mx-2 border-gray-400 p-2 bg-gray-100" required />

      </div>
      <div>
                            <label htmlFor="totalValue">Total Value</label>

      <input type="number" value={(Number(stockBal) || 0) * (Number(cost) || 0)} name="totalValue" readOnly className="border w-20 mx-2 border-gray-400 p-2 bg-gray-100" required />

      </div>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="menuId" value={productId} />
      <input type="hidden" name="path" value={pathname} />
      </div>

      <button type="submit" disabled={loading} className="border border-gray-400 rounded-md bg-black text-white p-2 disabled:opacity-60">
        {loading ? 'Updating...' : 'Update Stock'}
      </button>



            </form>
    </>
  );
};

export default AddMenuStockPage;

