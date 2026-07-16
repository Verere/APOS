import { addCategory, } from '@/actions'
import {  FetchCategory, fetchProducts, FetchProductsByMenu} from '@/actions/fetch'
import ProductForm from '@/components/ProductForm'
import ProductTable from '@/components/ProductTable'
import Heading from '@/components/Heading'
import React from 'react'
import StoreSettings from '@/models/storeSettings'
import connectDB from '@/utils/connectDB'

const ProductPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

     const patientList = await fetchProducts(slug) 
     const categories = await FetchCategory(slug) 
     await connectDB()
     const settings = await StoreSettings.findOne({ slug }).lean()
     const pricingSettings = {
      priceTypes: settings?.priceTypes || [],
      defaultPriceTypeId: settings?.defaultPriceTypeId || null
     }
  return (
    <>
    {/* <Heading title="Product Entry"/> */}
    <ProductForm addCat={addCategory} slug={slug} categories={categories} pricingSettings={pricingSettings}/>
    </>
  )
}

export default ProductPage