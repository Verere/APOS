import { fetchStoreDetailSlug } from "@/actions";
import SubPage from "@/components/SubPage";

const Subscribe=async({params})=>{
const {slug}=params
const sub = await fetchStoreDetailSlug(slug)
    return(
<>
<SubPage slug={slug}/>
</>
    )
}
export default Subscribe;