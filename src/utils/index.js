import * as mdIcons from "react-icons/md";
import { FaNetworkWired } from "react-icons/fa";
import { BiCctv } from "react-icons/bi";

export const navOptions = [
   
    {id: "listings",
label:"All Products",
path:"/"},
   
]
export const navOptions2 = [
   
    
    {id: "cart",
label:"Cart",
path:"/cart"},
    {id: "account",
label:"Account",
path:"/account"},
    {id: "listingKids",
label:"Contact Us",
path:"/product/listing/kids"},
   
]

export const adminNavOptions = [
    {
id: "AdminListing",
label:"Manage All Products",
path: "/admin/products"
},
    {
id: "adminNewProduct",
label:"Add New Product",
path: "/admin/add-product"
},
]


export const registrationFormControl = [
    {
        id: 'firstName',
        type: 'text',
        placeholder: 'Enter your First Name',
        label: 'First Name',
        componentType: 'input'
    },
    {
        id: 'lastName',
        type: 'text',
        placeholder: 'Enter your Last Name',
        label: 'Last Name',
        componentType: 'input'
    },
    {
        id: 'email',
        type: 'text',
        placeholder: 'Enter your email',
        label: 'Email',
        componentType: 'input'
    },
    {
        id: 'phone',
        type: 'text',
        placeholder: 'Enter your Phone Number',
        label: 'Phone Number',
        componentType: 'input'
    },
    {
        id: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        label: 'password',
        componentType: 'input'
    },
    // {
    //     id: 'role',
    //     type: '',
    //     placeholder: '',
    //     label: 'Role',
    //     componentType: 'select',
    //     options:[
    //         {id: 'admin',
    //     label:'Admin'},
    //         {id: 'customer',
    //     label:'Customer'},
    //     ]
    // },
    
]

export const loginFormControls =[
    {
        id: 'email',
        type: 'text',
        placeholder: 'Enter your email',
        label: 'Email',
        componentType: 'input'
    },
    {
        id: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        label: 'password',
        componentType: 'input'
    },
]

export const initialUserData = {
    name: "",
    email: "",
    password: "",    
  };

  export const userFormControls = [
    {
      label: "Name",
      name: "name",
      placeholder: "Name",
      componentType: "input",
    },
    
    {
      label: "Email",
      name: "email",
      placeholder: "Email",
      componentType: "input",
    },
    
    {
      label: "Password",
      name: "password",
      placeholder: "Password",
      componentType: "input",
    },
   
   
 
  ];

export const productFormControls =[
    {
        id: 'name',
        type: 'text',
        placeholder: 'Enter name',
        label: 'Name',
        componentType: 'input'
    },
    {
        id: 'price',
        type: 'number',
        placeholder: '0',
        label: 'price',
        componentType: 'input'
    },
    {
        id: 'description',
        type: 'text',
        placeholder: 'Enter Product Description',
        label: 'Description',
        componentType: 'input'
    },
    {
        id: 'category',
        type: '',
        placeholder: '',
        label: 'Category',
        componentType: 'select',
        options:[
            {
                id: 'COMPUTER',
                label: 'COMPUTER',
            },
            {
                id: 'NETWORKING',
                label: 'NETWORKING',
            },
            {
                id:  'SOLAR ENERGY',
                label: 'SOLAR ENERGY',
            },
            {
                id: 'SECURITY SURVEILLANCE',
                label: 'SECURITY SURVEILLANCE',
            },
            {
                id: 'SMART HOME SYSTEMS',
                label: 'SMART HOME SYSTEMS',
            },
            {
                id: 'LIGHTS AND LEDS',
                label: 'LIGHTS AND LEDS',
            },
            {
                id: 'ELECTRIC FENCE',
                label: 'ELECTRIC FENCE',
            },
        ]
    },
    {
        id: 'deliveryInfo',
        type: 'text',
        placeholder: 'Enter Delivery info',
        label: 'Delivery Info',
        componentType: 'input'
    },
    {
        id: 'onSale',
        type: '',
        placeholder: '',
        label: 'On Sale',
        componentType: 'select',
        options:[
            {id: 'yes',
        label:'Yes'},
            {id: 'no',
        label:'No'},           
        ]
    },
  
    {
        id: 'priceDrop',
        type: 'number',
        placeholder: 'Enter Price Drop',
        label: 'Price Drop',
        componentType: 'input'
    },
    {
        id: 'cost',
        type: 'number',
        placeholder: 'Enter Price Cost',
        label: 'Cost',
        componentType: 'input'
    },
      
    {
        id: 'productLink',
        type: 'text',
        placeholder: 'Enter product Link',
        label: 'productLink',
        componentType: 'input'
    },      
    {
        id: 'videoUrl',
        type: 'text',
        placeholder: 'Enter Video Url',
        label: 'Video Url',
        componentType: 'input'
    }, 
    {
        id: 'deliveryFee',
        type: 'number',
        placeholder: 'Enter Delivery Fee',
        label: 'deliveryFee',
        componentType: 'input'
    }, 
    {
        id: 'isShipped',
        type: '',
        placeholder: '',
        label: 'isShipped',
        componentType: 'select',
        options:[
            {id: 'yes',
        label:'Yes'},
            {id: 'no',
        label:'No'},           
        ]
    },    
]

export const AvailableSizes =[
    {
        id: 's',
        label: 'S'
    },
    {
        id: 'm',
        label: 'M'
    },
    {
        id: 'l',
        label: 'L'
    },
    {
        id: 'xl',
        label: 'XL'
    },
]

export const Categories =[
    {
        id: 0,
        category: 'COMPUTER',
        icon: <mdIcons.MdComputer/>

    },
    {
        id: 1,
        category: 'NETWORKING',
        icon: <FaNetworkWired/>

    },
    {
        id: 2,
        category: 'SOLAR ENERGY',
        icon: <mdIcons.MdOutlineSolarPower/>

    },
    {
        id: 3,
        category: 'SECURITY SURVEILLANCE',
        icon: <BiCctv/>

    },
    {
        id: 4,
        category: 'SMART HOME SYSTEMS',
        icon: <mdIcons.MdOutlineSmartScreen />

    },
    {
        id: 5,
        category: 'LIGHTS AND LEDS',
        icon: <mdIcons.MdLightMode/>

    },
    {
        id: 6,
        category: 'ELECTRIC FENCE',
        icon: <mdIcons.MdElectricBolt/>

    },
]

export const AddressFormControl = [
    {
id: 'fullName', 
type: 'input',
placeholder: 'Enter your full name',
label: 'full name',
componentType: 'input'
},   
    {
id: 'address', 
type: 'input',
placeholder: 'Enter your Address',
label: 'address',
componentType: 'input'
},
    {
id: 'city', 
type: 'input',
placeholder: 'Enter your city',
label: 'city',
componentType: 'input'
},
    {
id: 'phoneNo', 
type: 'input',
placeholder: 'Enter your Phone Number',
label: 'Phone Number',
componentType: 'input'
},
    {
id: 'email', 
type: 'input',
placeholder: 'Enter your email',
label: 'email',
componentType: 'input'
},
{
    id: 'state', 
    type: '',
    placeholder: '',
    label: 'State',
    componentType: 'select',
        options:[
            {id: 'abuja',
        label:'Abuja'},  
            {id: 'abia',
        label:'Abia'},
            {id: 'adamawa',
        label:'Adamawa'},           
            {id: 'AkwaIbom',
        label:'Akwa Ibom'},
            {id: 'Anambra',
        label:'Anambra'},           
            {id: 'Bauchi',
        label:'Bauchi'},
            {id: 'Bayelsa',
        label:'Bayelsa'},           
            {id: 'Benue',
        label:'Benue'},
            {id: 'Borno',
        label:'Borno'},           
            {id: 'Cross River',
        label:'Cross River'},
            {id: 'Delta',
        label:'Delta'},           
            {id: 'Ebonyi',
        label:'Ebonyi'},
            {id: 'Edo',
        label:'Benin'},           
            {id: 'Ekiti',
        label:'Ekiti'},           
            {id: 'Enugu',
        label:'Enugu'},
            {id: 'Gombe',
        label:'Gombe'},           
            {id: 'Imo',
        label:'Imo'},
            {id: 'Jigawa',
        label:'Jigawa'},           
            {id: 'Kaduna',
        label:'Kaduna'},
            {id: 'Kano',
        label:'Kano'},           
            {id: 'Kastina',
        label:'Kastina'},
            {id: 'Kebbi',
        label:'Kebbi'},           
            {id: 'Kogi',
        label:'Kogi'},
            {id: 'Kwara',
        label:'Kwara'},           
            {id: 'Lagos',
        label:'Lagos'},
            {id: 'Nasarawa',
        label:'Nasarawa'},           
            {id: 'Niger',
        label:'Niger'},
            {id: 'Ogun',
        label:'Ogun'},           
            {id: 'Ondo',
        label:'Ondo'},
            {id: 'Osun',
        label:'Osun'},           
            {id: 'Oyo',
        label:'Oyo'},
            {id: 'Plateau',
        label:'Plateau'},           
            {id: 'River',
        label:'River'},
            {id: 'Sokoto',
        label:'Sokoto'},           
            {id: 'Taraba',
        label:'Taraba'},
            {id: 'Yobe',
        label:'Yobe'},           
            {id: 'Zamfara',
        label:'Zamfara'},                     
        ]
    }
]