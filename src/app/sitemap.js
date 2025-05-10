// import { fetchStoreDetainlSlug } from "@/actions"

import { fetchAllStores } from "@/actions"

export default async function sitemap({params}){
    const baseUrl= 'https://quickordering.online'

      const stores =await fetchAllStores()
    const productUrls = stores?.map((store) =>(
        {url: `${baseUrl}/${store?.slug}`,
        lastModified: store.createdAt

        }
    ))
    return[
        {
url: baseUrl, lastModified: new Date()
        },
     ...productUrls
    ]
}