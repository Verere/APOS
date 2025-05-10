import { addCategory, } from '@/actions'
import {  FetchCategory, fetchProducts, FetchProductsByMenu} from '@/actions/fetch'
import ProductForm from '@/components/ProductForm'
import ProductTable from '@/components/ProductTable'
import Heading from '@/components/Heading'
import React from 'react'

const ProductPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

     const patientList = await fetchProducts(slug) 
     const categories = await FetchCategory(slug) 
  return (
    <>
    {/* <Heading title="Product Entry"/> */}
    <ProductForm addCat={addCategory} slug={slug}   categories={categories}/>
    </>
  )
}

export default ProductPage