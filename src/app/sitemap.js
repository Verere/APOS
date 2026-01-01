// import { fetchStoreDetainlSlug } from "@/actions"

import { fetchAllStores } from "@/actions"

export default async function sitemap(){
    const baseUrl= 'https://apos-one.vercel.app/'

    try {
      const stores = await fetchAllStores()
      const productUrls = stores?.map((store) => ({
        url: `${baseUrl}/${store?.slug}`,
        lastModified: store.createdAt ? new Date(store.createdAt) : new Date()
      })) || []
      
      return [
        {
          url: baseUrl, 
          lastModified: new Date()
        },
        ...productUrls
      ]
    } catch (error) {
      console.error('Error generating sitemap:', error)
      // Return minimal sitemap on error
      return [
        {
          url: baseUrl, 
          lastModified: new Date()
        }
      ]
    }
}