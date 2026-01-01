import { addCategory, } from '@/actions'
import {  FetchCategory , fetchGroupsByLab} from '@/actions/fetch'
import CategoryForm from '@/components/CategoryForm'
import CategoryTable from '@/components/CategoryTable'
import Heading from '@/components/Heading'
import React from 'react'

const CategoryPage = async({params}) => {
    // const groups = await fetchGroupsByLab(params.slug) 
    const {slug} = await params

    const patientList = await FetchCategory(slug) 
    console.log('p', patientList)

  return (
    <div className='w-full flex flex-col'>
    <Heading title="Category Entry"/>
    <CategoryForm addCat={addCategory} slug={slug}/>
    <CategoryTable categories={patientList}/>
    </div>
  )
}

export default CategoryPage