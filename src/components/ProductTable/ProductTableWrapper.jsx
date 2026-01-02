'use client'
import { useContext } from 'react'
import { GlobalContext } from '@/context'
import ProductTable from './index'

export default function ProductTableWrapper({ products, slug }) {
  const { membership } = useContext(GlobalContext)
  
  return <ProductTable products={products} slug={slug} userRole={membership?.role} />
}
