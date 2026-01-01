
import SignupPage from "@/components/SignupPage";

export const metadata = {
  title:  'Quick Order',
  description: 'Quick Ordering online lets you make your order with your favourite plug with ease. Order from your restaurant, eatery, lounge, hotel etc and have your product deliver to your doorstep.',
  alternates:{
    canonical: '/signup',
    languages:{
      en: '/en/signup'
    }
      },
      robots:{
        index:false,
        nocache:true
      }

}
export default function Register() {
 
  return (
    <>
    <SignupPage/>
   
    </>
  );
}
