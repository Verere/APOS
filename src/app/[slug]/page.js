import { fetchStoreDetailSlug, fetchMenus , fetchDirectories} from '@/actions'
// import StoreCover from '@/components/StoreCover'
import { redirect } from 'next/navigation'
import React from 'react'

async function page({params}) {
  
  // if(!user)redirect('/login')
  // const store =await fetchStoreDetailSlug(params.slug)
  // const menus = await fetchMenus(params.slug)
  // const directory = await fetchDirectories(params.slug)


  return <div>store</div>
}

export default page