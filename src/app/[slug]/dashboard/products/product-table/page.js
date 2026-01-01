import { addCategory, } from '@/actions'
import {  FetchCategory, fetchProducts, FetchProductsByMenu} from '@/actions/fetch'
import ProductTable from '@/components/ProductTable'
import Heading from '@/components/Heading'
import React from 'react'

const ProductPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

     const patientList = await fetchProducts(slug) 
  return (
    <div className='-mt-[56px]'>      
    <ProductTable products={patientList} slug={slug}/>
    </div>
  )
}

export default ProductPage