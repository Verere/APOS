import LoginForm from "@/components/loginForm/loginForm";
import { Suspense } from "react";


export const metadata = {
  title:  'login page',
  description: 'Quick Ordering online lets you make your order with your favourite plug with ease. Order from your restaurant, eatery, lounge, hotel etc and have your product deliver to your doorstep.',
  alternates:{
    canonical: '/login',
    languages:{
      en: '/en/login'
    }
      },

}



const NextLoginPage =async () => {

  return (
     
         <div className="flex min-h-screen items-center justify-center ">
          <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
            <LoginForm/>
          </Suspense>
         </div>    
     
  );
};

export default NextLoginPage;
