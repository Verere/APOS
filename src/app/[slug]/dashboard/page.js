import { auth } from '@/auth'
import React from 'react'
import {redirect} from 'next/navigation'
import { currentUser, fetchOrders, fetchOrdersBySlug, fetchOrdersBySlugandDate, fetchOrdersBySlugCancelled, fetchOrdersBySlugCompleted, fetchOrdersBySlugPending, fetchProducts, fetchStoreDetailSlug } from '@/actions'

import OverviewPage from '@/components/Overview'


const DashBoardPage =async({params}) => {
  const user= 'Eddy'
  // const user= await auth()
    // const cUser = await currentUser(user?.user.email)
    const {slug}= await params
    const store = await fetchStoreDetailSlug(slug)
    const orders = await fetchOrders(slug)
    const pending = await fetchOrdersBySlugPending(slug)
    const completed = await fetchOrdersBySlugCompleted(slug)
    const cancelled = await fetchOrdersBySlugCancelled(slug)
     const dailyOrders = await fetchOrdersBySlugandDate(slug)
     const products = await fetchProducts(slug)
  if(!user) redirect("/login")
  return (
   <>
   <OverviewPage products={products} slug={slug} store={store} order={dailyOrders} cancelled={cancelled} completed={completed} pending={pending}/>
   </>
    
      
  )
}

export default DashBoardPage