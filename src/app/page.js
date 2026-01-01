import MainNav from "@/components/mainNav";

export default function Home() {
  return (
    <>
    <section className="relative">
    <MainNav/>
    </section>
    <section className="relative w-full h-full min-h-screen pb-10" >
    <div className="w-full h-full relative ">
      <div className="flex flex-col lg:flex-row gap-6 p-3 items-center">
        <section className="w-full lg:w-1/2 flex flex-col px-3 py-3 lg:p-10 order-2 lg:order-1">
          <div className="w-full flex justify-center align-middle flex-col h-auto lg:pt-7">
            <span className="flex space-x-2 items-end">
              <span className="block w-12 mb-2 dark:border-white border-b-2 border-gray-700"></span>
              <span className="text-xl md:text-2xl font-bold dark:text-white text-blue-600 uppercase">
                Get the Job done with...
              </span>
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-6xl dark:text-white mt-4 text-black font-extrabold">
              Averit Point of Sales System
            </h1>
          </div>
        </section>
        <section className="relative w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2 px-3 py-3">
        <picture>
          <img
            src="/htimg.jpg"
            alt="Hero"
            className="w-full h-auto max-h-[420px] object-contain z-10"
            />
            </picture>  
        </section>
      </div>
    </div>
  </section>
  </>
  );
}