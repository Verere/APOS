import Image from "next/image";
import { forwardRef, useContext } from "react";
 import MenuLink from "./menuLink/menuLink";
 import { useSearchParams, usePathname } from "next/navigation";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdWork,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdLogout,
} from "react-icons/md";
import { auth, signOut } from "@/auth";
import { GlobalContext } from "@/context";


const StoreItems = [
  {
    title: "Pages",
    list: [
      {
        title: "Stores",
        path: "/dashboard/stores",
        icon: <MdShoppingBag />,
      },
      
      {
        title: "Products",
        path: "/dashboard/products",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Menu",
        path: "/dashboard/menu",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Category",
        path: "/dashboard/category",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
     
      {
        title: "Transactions",
        path: "/",
        icon: <MdAttachMoney />,
      },
    ],
  },
  {
    title: "Analytics",
    list: [
      {
        title: "Revenue",
        path: "/dashboard/revenue",
        icon: <MdWork />,
      },
      {
        title: "Reports",
        path: "/dashboard/reports",
        icon: <MdAnalytics />,
      },
      {
        title: "Teams",
        path: "/dashboard/teams",
        icon: <MdPeople />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/dashboard/help",
        icon: <MdHelpCenter />,
      },
    ],
  },
];

const Sidebar = forwardRef(({showNav, setShowNav}, ref) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
   const slug = (pathname.split('/')[1])
const { store}= useContext(GlobalContext)
const {sub}=store
   const menuItems = [
    {
      title: "",
      list: [
        {
          title: "Home",
          path: `/${slug}`,
          icon: <MdPeople />,
        },     
        {
          title: "Dashboard",
          path: `/${slug}/dashboard`,
          icon: <MdWork />,
        },     
           
        {
          title: "live Orders",
          path: `/${slug}/dashboard/order`,
          icon: <MdDashboard />,
        },     
        {
          title: "Orders",
          path: `/${slug}/dashboard/all-orders`,
          icon: <MdShoppingBag />,
        },     
        {
          title: "Menu",
          path: `/${slug}/dashboard/menu`,
          icon: <MdShoppingBag />,
        },     
        {
          title: "Generate Qr",
          path: `/${slug}/dashboard/qr`,
          icon: <MdDashboard />,
        },     
           
        
        {
          title: "Location",
          path: `/${slug}/dashboard/locations`,
          icon: <MdShoppingBag />,
        },     
        {
          title: "Tables",
          path: `/${slug}/dashboard/tables`,
          icon: <MdShoppingBag />,
        },     
   
        {
          title: "Account",
          path: `/${slug}/dashboard/account`,
          icon: <MdAttachMoney />,
        },     
           
        {
          title: "Subscribe",
          path: `/${slug}/sub/`,
          icon: <MdShoppingBag />,
        },   
        // {
        //   title: "Rooms",
        //   path: `/${slug}/dashboard/rooms`,
        //   icon: <MdShoppingBag />,
        // },        
        // {
        //   title: "Dirctories",
        //   path: `/${slug}/dashboard/directories`,
        //   icon: <MdShoppingBag />,
        // },   
      ],
    }, 

  ];
   const roomItems = [
       

  ];

  return (
    <div  ref={ref} className="fixed w-56 shadow-sm h-full bg-black text-white overflow-y-scroll z-10">
      {/* <div className="flex flex-col mt-6 mb-14 justify-center items-center">
        <picture>
        <img
          className="w-16 h-auto"
          src= "/logo.png"
          alt="userLogo"       
          />
          </picture>
          <span className="text-sm font-bold uppercase">username</span>
          <span className="text-xs">Admin</span>
        </div>
        <div className="">
      </div> */}
       <ul className="flex flex-col" onClick={()=> setShowNav(!showNav)}>
        {menuItems.map((cat) => (
          <li key={cat.title} >
            <span className="ml-2">{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul> 
      {sub==="Hotel" || sub ==="HotelPro" && 
      <ul className="flex flex-col" onClick={()=> setShowNav(!showNav)}>
        {roomItems.map((item) => (
          
              <MenuLink item={item} key={item.title} />
            ))}
      </ul> }
      <form
        action=""
      >
        <button className="flex space-x-4 items-center px-2">
          <MdLogout className="mr-2"/>
          Logout
        </button>
      </form>
    </div>
  );
});

Sidebar.displayName="Sidebar"
export default Sidebar;
