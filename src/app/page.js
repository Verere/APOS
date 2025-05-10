import MainNav from "@/components/mainNav";

export default function Home() {
  return (
    <>
    <section className="relative">
    <MainNav/>
    </section>
    <section className="relative w-full h-full min-h-screen pb-10" >
    <div className="w-full h-full relative ">
      <div className="flex  flex-row gap-10 p-3 ">
        <section className="w-full lg:w-[50%] flex flex-col md:px-2  p-3 lg:p-10 sm:order-2 sm:w-full">
          <div className="w-full flex justify-center align-middle flex-col h-auto lg:pt-7">
            <span className="flex space-x-2">
              <span className="block w-14 mb-2 dark:border-white border-b-2 border-gray-700"></span>
              <span className="text-4xl font-bold dark:text-white text-blue-600 uppercase">
                Get the Job done with...
              </span>
            </span>
            <h1 className="text-6xl sm:text-4xl dark:text-white mt-5 lg:text-6xl text-black font-extrabold">
             Averit Point of Sales System
            </h1>            
          </div>
        </section>
        <section className="relative w-full lg:w-[50%] flex items-center justify-end sm:w-full">
        <picture>
          <img
            src="/htimg.jpg"
            alt="Hero"
            className="h-full w-full object-contain z-10"
            />
            </picture>  
        </section>
      </div>
    </div>
  </section>
  </>
  );
}