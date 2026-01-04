import MainNav from "@/components/mainNav";
import { ShoppingCart, BarChart3, Users, Package, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
    <MainNav/>
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                <span className="text-sm sm:text-base font-semibold text-blue-600 uppercase tracking-wide">
                  Modern Point of Sale
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-tight">
                Averit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Point of Sales</span> System
              </h1>
              
              {/* <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
                Streamline your business operations with our powerful, intuitive POS system. Manage sales, inventory, and customers all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/login" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-center text-sm sm:text-base">
                  Get Started
                </a>
                <a href="#features" className="px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-blue-600 text-center text-sm sm:text-base">
                  Learn More
                </a>
              </div> */}
            </div>
            
            {/* Image */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur-3xl opacity-20"></div>
                <img
                  src="/htimg.jpg"
                  alt="Averit POS System"
                  className="relative w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative w-full py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your business efficiently
            </p>
          </div> */}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Cards */}
            {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Sales Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Process transactions quickly and efficiently with our intuitive interface
              </p>
            </div> */}
            
            {/* <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-green-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Inventory Control</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Track stock levels in real-time and get alerts for low inventory
              </p>
            </div>
             */}
            {/* <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Customer Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Build lasting relationships with comprehensive customer data
              </p>
            </div> */}
            
            {/* <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-orange-100">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Analytics & Reports</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Make data-driven decisions with comprehensive reporting tools
              </p>
            </div> */}
            
            {/* <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-teal-100">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Growth Tracking</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Monitor your business growth with real-time performance metrics
              </p>
            </div> */}
            
            {/* <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-indigo-100">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Enterprise-grade security to protect your business data
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-10">
            Join hundreds of businesses already using Averit POS
          </p>
          <a href="/login" className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl text-sm sm:text-base lg:text-lg">
            Get Started Today
          </a>
        </div> */}
      </section>
    </main>
    </>
  );
}