"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Text } from "@radix-ui/themes"

const CatLists = ({categories}) =>{
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleSearch = (category) => {
        const params = new URLSearchParams(searchParams);
       const cat= params.get("category");
    
        params.delete("category");
        params.set("category", category); 
      
        if(pathname){
    
          replace(`${pathname}?${params}`);
        }
      }

    return(
        <div className="flex justify-between align-middle"  >
        {categories?.map(cat=>(
<>
<div  className='text-center cursor-pointer px-2  border pb-1 shadow-lg w-full' key={cat._id}>

<div onClick={()=>handleSearch(cat?.name)} className="h-[64px] w-auto  min-w-[64px] px-1 py-2 bg-black/80 hover:bg-black text-white rounded-lg" >
<Text as="div" align="center">
{ cat?.name}
</Text>
</div>
</div>
</>
        ))}


</div>
    )
} 
export default CatLists