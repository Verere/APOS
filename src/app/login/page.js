import LoginForm from "@/components/loginForm/loginForm";


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
          <LoginForm/>
         </div>    
     
  );
};

export default NextLoginPage;
