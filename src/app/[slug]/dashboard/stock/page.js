
 import { addMenuStock, } from "@/actions";
 import {  fetchMenuStockSearch,  fetchLocation,fetchMenuGroup, fetchMenu, fetchMenuSearch, fetchMenuStockItem} from "@/actions/fetch";
 import {  deleteMenuCategory , } from "@/actions/delete";

import AddMenuStockPage from "@/components/AddMenuStockPage";
import { StockTable } from "@/components/StockTable";

const  StockPage =async ({ params, searchParams}) => {

 
    const {slug}=await params
    const {id}=await searchParams
    console.log(id,'i')
    // const menustock = await fetchMenuStockItem(slug)
//     const [ showForm, setShowForm]= useState(false)
//     const [menustock, setMenuStock] = useState([])
//     const [item, setItem] = useState([])
//     const { replace } = useRouter();
//   const pathname = usePathname();

//   useEffect(()=>{
//   const getStocks = async()=>{ 
//     if(menu) {      
//       const loc1 = await fetchMenuStockItem(menu)
//       await setMenuStock(loc1)
//     }else{
//       const loc1 = await fetchMenuStockSearch(slug)
     
//       const key = "menuId"
//       let namesSet =   [...new Map(loc1.map(item =>
//         [item[key], item])).values()]
//         await setMenuStock(namesSet)
//     }
//   }
//   getStocks()
// },[slug, menu])

 
// const handleStockUpdate = async(id) => {
//   const params = new URLSearchParams(searchParams);

//   params.set("Stock",id);
  
//   if(pathname){

//     replace(`${pathname}?${params}`);
//   }
// }



  return (
    <div className="min-h-screen w-full">
      
    {/* <StockTable menustock={menustock}   slug={slug}/>  */}
    <AddMenuStockPage addMenuStock={addMenuStock}   slug={slug} /> 

    </div>
  );
};

export default StockPage;


