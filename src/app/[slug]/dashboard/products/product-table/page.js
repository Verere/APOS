import { addCategory, } from '@/actions'
import {  FetchCategory, fetchProducts, FetchProductsByMenu} from '@/actions/fetch'
import Heading from '@/components/Heading'
import React from 'react'
import ProductTableWrapper from '@/components/ProductTable/ProductTableWrapper'

const ProductPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

     const patientList = await fetchProducts(slug) 
  return (
    <div className='-mt-[6px]'>      
    <ProductTableWrapper products={patientList} slug={slug}/>
    </div>
  )
}

export default ProductPage