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
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {kpi.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                    <div className="flex items-center mt-2">
                      {kpi.isPositive ? (
                        <ArrowUpRight className="text-green-500" size={16} />
                      ) : (
                        <ArrowDownRight className="text-red-500" size={16} />
                      )}
                      <span
                        className={`text-sm ml-1 ${
                          kpi.isPositive ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {kpi.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`${kpi.color} p-3 rounded-lg bg-opacity-10 flex items-center justify-center`}
                  >
                    <Icon className={kpi.color.replace('bg-', 'text-')} size={24} />
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