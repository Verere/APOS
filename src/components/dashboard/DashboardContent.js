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
    <div className="space-y-6 p-4 sm:p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 border-l-4 hover:scale-105"
              style={{ borderLeftColor: kpi.color.replace('bg-', '#') }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-3">
                  {/* Icon and Title Row */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`${kpi.color} p-2.5 sm:p-3 rounded-xl shadow-md flex items-center justify-center`}
                    >
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.isPositive ? (
                        <div className="bg-green-100 p-1 rounded-full">
                          <ArrowUpRight className="text-green-600" size={14} />
                        </div>
                      ) : (
                        <div className="bg-red-100 p-1 rounded-full">
                          <ArrowDownRight className="text-red-600" size={14} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {kpi.title}
                    </p>
                  </div>

                  {/* Value */}
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                      {kpi.value}
                    </h3>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-gray-100">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        kpi.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart will be loaded here</p>
              {/* Integration point for recharts/chartjs */}
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Activity chart will be loaded here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.length > 0 ? (
                  recentOrders.slice(0, 5).map((order, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">#{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.customer}</td>
                      <td className="py-3 px-4 text-sm">{order.date}</td>
                      <td className="py-3 px-4 text-sm font-semibold">
                        {currencyFormat(order.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
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
                      className="py-8 text-center text-gray-500"
                    >
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent