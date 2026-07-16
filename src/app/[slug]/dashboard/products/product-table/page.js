import { addCategory, } from '@/actions'
import {  FetchCategory, fetchProducts, FetchProductsByMenu} from '@/actions/fetch'
import Heading from '@/components/Heading'
import React from 'react'
import ProductTableWrapper from '@/components/ProductTable/ProductTableWrapper'
import StoreSettings from '@/models/storeSettings'
import connectDB from '@/utils/connectDB'

const ProductPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

     const patientList = await fetchProducts(slug)
     await connectDB()
     const settings = await StoreSettings.findOne({ slug }).lean()
     const pricingSettings = {
      priceTypes: (settings?.priceTypes || []).filter((pt) => pt?.active !== false),
      defaultPriceTypeId: settings?.defaultPriceTypeId || null
     }
  return (
    <div className='-mt-[6px]'>      
    <ProductTableWrapper products={patientList} slug={slug} pricingSettings={pricingSettings} />
    </div>
  )
}

export default ProductPage