'use client'
import { useState } from 'react'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currencyFormat } from '@/utils/currency'

const DashboardContent = ({ stats, recentOrders }) => {
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: currencyFormat(stats?.totalRevenue || 0),
      subtitle: `${stats?.totalOrders || 0} orders`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Profit',
      value: currencyFormat(stats?.totalProfit || 0),
      change: '+15.3%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+5.1%',
      isPositive: true,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '-2.4%',
      isPositive: false,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
            <Activity size={20} />
            <span className="font-semibold text-sm sm:text-base">Live Updates</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card 
              key={index} 
              className="hover:shadow-2xl transition-all duration-300 border-0 hover:scale-105 bg-gradient-to-br from-white to-gray-50 shadow-lg overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col space-y-3">
                  {/* Icon and Change Indicator Row */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`${kpi.color} p-2.5 sm:p-3 rounded-xl shadow-lg flex items-center justify-center transform hover:rotate-12 transition-transform`}
                    >
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.isPositive ? (
                        <div className="bg-green-100 p-1.5 rounded-full shadow-sm">
                          <ArrowUpRight className="text-green-600" size={16} />
                        </div>
                      ) : (
                        <div className="bg-red-100 p-1.5 rounded-full shadow-sm">
                          <ArrowDownRight className="text-red-600" size={16} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">
                      {kpi.title}
                    </p>
                  </div>

                  {/* Value */}
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 break-words">
                      {kpi.value}
                    </h3>
                    {kpi.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                        {kpi.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Change Indicator */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-gray-100">
                    <span
                      className={`text-xs sm:text-sm font-bold px-2 py-1 rounded-full ${
                        kpi.isPositive 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      vs last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800">
              <TrendingUp className="text-blue-600" size={24} />
              Sales Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 sm:h-72 lg:h-80 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
              <div className="bg-blue-100 p-4 rounded-full mb-3">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
              <p className="text-gray-600 font-semibold text-sm sm:text-base">Sales Chart</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Coming soon...</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-shadow">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800">
              <Activity className="text-green-600" size={24} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 sm:h-72 lg:h-80 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200">
              <div className="bg-green-100 p-4 rounded-full mb-3">
                <Activity className="text-green-600" size={32} />
              </div>
              <p className="text-gray-600 font-semibold text-sm sm:text-base">Activity Chart</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="shadow-lg border-0 bg-white hover:shadow-2xl transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-800">
            <ShoppingCart className="text-blue-600" size={24} />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 sm:px-6 font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-bold text-xs sm:text-sm text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.length > 0 ? (
                  recentOrders.slice(0, 5).map((order, index) => (
                    <tr key={index} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 text-sm font-semibold text-blue-600">#{order.id.slice(0, 8)}</td>
                      <td className="py-4 px-4 sm:px-6 text-sm font-medium text-gray-900">{order.customer}</td>
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">{order.date}</td>
                      <td className="py-4 px-4 sm:px-6 text-sm font-bold text-gray-900">
                        {currencyFormat(order.amount)}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-gray-500"
                    >
                      <ShoppingCart className="mx-auto mb-3 text-gray-300" size={48} />
                      <p className="font-semibold">No recent orders</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {recentOrders?.length > 0 ? (
              recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">#{order.id.slice(0, 8)}</p>
                      <p className="font-semibold text-gray-900">{order.customer}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{order.date}</span>
                    <span className="font-bold text-gray-900">{currencyFormat(order.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-3 text-gray-300" size={48} />
                <p className="font-semibold">No recent orders</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent