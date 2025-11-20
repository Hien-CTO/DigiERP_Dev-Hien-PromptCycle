'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import ProtectedLayout from '@/components/layout/protected-layout';
import AdminLayout from '@/components/layout/admin-layout';

// Mock data for demonstration
const revenueData = [
  { label: 'Jan', value: 120000 },
  { label: 'Feb', value: 150000 },
  { label: 'Mar', value: 180000 },
  { label: 'Apr', value: 160000 },
  { label: 'May', value: 200000 },
  { label: 'Jun', value: 220000 },
];

const topProductsData = [
  { label: 'Laptop', value: 45000 },
  { label: 'Monitor', value: 32000 },
  { label: 'Keyboard', value: 18000 },
  { label: 'Mouse', value: 12000 },
  { label: 'Tablet', value: 8000 },
];

const salesByCategoryData = [
  { label: 'Electronics', value: 45, color: '#3b82f6' },
  { label: 'Accessories', value: 25, color: '#10b981' },
  { label: 'Software', value: 20, color: '#f59e0b' },
  { label: 'Services', value: 10, color: '#ef4444' },
];

const ordersData = [
  { label: 'Jan', value: 45 },
  { label: 'Feb', value: 52 },
  { label: 'Mar', value: 48 },
  { label: 'Apr', value: 61 },
  { label: 'May', value: 55 },
  { label: 'Jun', value: 67 },
];

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <AdminLayout>
        <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Overview of your business performance</p>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">$1,250,000</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">328</p>
                <p className="text-sm text-blue-600">+8.2% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-purple-600">89</p>
                <p className="text-sm text-purple-600">+15.3% from last month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-orange-600">$450,000</p>
                <p className="text-sm text-orange-600">+5.1% from last month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <LineChart data={revenueData} color="#10b981" />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Month</h3>
            <BarChart data={ordersData} color="#3b82f6" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
            <BarChart data={topProductsData} color="#8b5cf6" />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <PieChart data={salesByCategoryData} />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {[
                { id: 'SO-2024-001', customer: 'ABC Company', amount: '$15,000', status: 'Completed' },
                { id: 'SO-2024-002', customer: 'XYZ Corp', amount: '$8,500', status: 'Processing' },
                { id: 'SO-2024-003', customer: 'DEF Ltd', amount: '$12,300', status: 'Pending' },
                { id: 'SO-2024-004', customer: 'GHI Inc', amount: '$6,800', status: 'Completed' },
                { id: 'SO-2024-005', customer: 'JKL Co', amount: '$9,200', status: 'Processing' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {[
                { product: 'Wireless Mouse', current: 5, min: 20, status: 'Critical' },
                { product: 'USB Cable', current: 12, min: 30, status: 'Low' },
                { product: 'Monitor Stand', current: 8, min: 15, status: 'Low' },
                { product: 'Laptop Bag', current: 3, min: 10, status: 'Critical' },
                { product: 'Keyboard', current: 25, min: 50, status: 'Warning' },
              ].map((item) => (
                <div key={item.product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.product}</p>
                    <p className="text-sm text-gray-600">Current: {item.current} | Min: {item.min}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Critical' 
                      ? 'bg-red-100 text-red-800'
                      : item.status === 'Low'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
      </AdminLayout>
    </ProtectedLayout>
  );
}
