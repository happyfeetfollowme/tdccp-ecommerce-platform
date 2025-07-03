"use client"; // For stateful components, interactions, and potential client-side data fetching

import Link from 'next/link';
import { useState } from 'react';

// Types - should align with backend data structures
type OrderStatus =
  | 'Pending' // General initial state, might be same as "Awaiting merchant confirmation"
  | 'Awaiting merchant confirmation of shipping fee'
  | 'Awaiting payment'
  | 'Paid'
  | 'Shipped'
  | 'Completed' // Mock uses "Completed", requirements use "Delivered"
  | 'Canceled';

interface AdminOrder {
  id: string;
  customerName: string; // Or customer ID / email
  date: string;
  status: OrderStatus;
  total: number;
  shippingFee?: number; // Important for admin to update
  walletAddress?: string; // Seller's wallet for this order
}

// Sample Data (replace with API call)
const sampleAdminOrders: AdminOrder[] = [
  { id: '12345', customerName: 'Alice Johnson', date: '2024-01-15', status: 'Awaiting merchant confirmation of shipping fee', total: 150.00, walletAddress: 'sellerWalletAlice' },
  { id: '12346', customerName: 'Bob Williams', date: '2024-01-16', status: 'Shipped', total: 200.00, shippingFee: 15.00, walletAddress: 'sellerWalletBob' },
  { id: '12347', customerName: 'Charlie Davis', date: '2024-01-17', status: 'Completed', total: 100.00, shippingFee: 10.00, walletAddress: 'sellerWalletCharlie' },
  { id: '12348', customerName: 'Diana Evans', date: '2024-01-18', status: 'Awaiting payment', total: 300.00, shippingFee: 20.00, walletAddress: 'sellerWalletDiana' },
  { id: '12349', customerName: 'Ethan Clark', date: '2024-01-19', status: 'Paid', total: 250.00, shippingFee: 12.00, walletAddress: 'sellerWalletEthan' },
  { id: '12350', customerName: 'Fiona Green', date: '2024-01-20', status: 'Canceled', total: 50.00, walletAddress: 'sellerWalletFiona' },
];

// Placeholder icons from mock
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);
const CaretLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg>
);
const CaretRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>
);

const getStatusClass = (status: OrderStatus) => {
  // Simplified version for admin panel, can be expanded
  if (status === 'Awaiting merchant confirmation of shipping fee') return 'bg-yellow-100 text-yellow-700';
  if (status === 'Awaiting payment') return 'bg-orange-100 text-orange-700';
  if (status === 'Paid') return 'bg-blue-100 text-blue-700';
  if (status === 'Shipped') return 'bg-indigo-100 text-indigo-700';
  if (status === 'Completed') return 'bg-green-100 text-green-700';
  if (status === 'Canceled') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700'; // Default for 'Pending' or other
};


export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'All'>('All');
  // TODO: Add pagination state

  // TODO: Fetch orders from API and apply filters/search
  const filteredOrders = sampleAdminOrders.filter(order => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    const matchesSearch = order.id.includes(searchTerm) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.walletAddress && order.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const statusFilters: (OrderStatus | 'All')[] = ['All', 'Awaiting merchant confirmation of shipping fee', 'Awaiting payment', 'Paid', 'Shipped', 'Completed', 'Canceled', 'Pending'];


  return (
    <div className="w-full"> {/* Max-width is handled by layout.tsx */}
      <div className="flex flex-wrap justify-between gap-3 p-4 items-center">
        <div>
          <p className="text-[#1b0e0e] tracking-light text-[32px] font-bold leading-tight">Orders</p>
          <p className="text-[#994d51] text-sm font-normal leading-normal">Manage and track all customer orders</p>
        </div>
        {/* Add New Order button? Not in mock, but typical for admin */}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#994d51] flex border-none bg-[#f3e7e8] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <MagnifyingGlassIcon />
            </div>
            <input
              placeholder="Search orders by ID, customer, or wallet"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] focus:outline-0 focus:ring-0 border-none bg-[#f3e7e8] focus:border-none h-full placeholder:text-[#994d51] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Status Filters Tabs */}
      <div className="pb-3 px-4">
        <div className="flex border-b border-[#e7d0d1] gap-4 sm:gap-8 overflow-x-auto">
          {statusFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 text-sm font-bold leading-normal tracking-[0.015em] whitespace-nowrap px-2
                ${activeFilter === filter ? 'border-b-[#e92932] text-[#1b0e0e]' : 'border-b-transparent text-[#994d51] hover:text-[#1b0e0e]'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#e7d0d1] bg-[#fcf8f8]">
          <table className="flex-1 min-w-full">
            <thead className="bg-[#fcf8f8]">
              <tr>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden sm:table-cell">Order ID</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Customer</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Status</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden lg:table-cell">Wallet</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Total</th>
                {/* Actions column can be added if needed */}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-t-[#e7d0d1]">
                  <td className="h-[72px] px-4 py-2 text-[#1b0e0e] text-sm font-normal leading-normal hidden sm:table-cell">
                    {/* Link to a more detailed admin order view page */}
                    <Link href={`/admin/orders/${order.id}`} className="text-[#e92932] hover:underline">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-sm font-normal leading-normal">
                     <Link href={`/admin/orders/${order.id}`} className="text-[#e92932] hover:underline sm:hidden">
                      #{order.id}
                    </Link>
                    <span className="block sm:hidden text-xs text-gray-500">{order.date}</span>
                    {order.customerName}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-sm font-normal leading-normal hidden md:table-cell">
                    {order.date}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                    {/* In a real app, this might be a dropdown or modal to change status */}
                    <span
                      className={`flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-8 px-3 text-xs font-medium leading-normal w-full ${getStatusClass(order.status)}`}
                    >
                      <span className="truncate">{order.status}</span>
                    </span>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-xs font-normal leading-normal hidden lg:table-cell truncate" title={order.walletAddress}>
                    {order.walletAddress ? `${order.walletAddress.substring(0,10)}...` : 'N/A'}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-sm font-normal leading-normal">
                    ${order.total.toFixed(2)}
                     <span className="block sm:hidden text-xs text-gray-500 lg:hidden truncate" title={order.walletAddress}>
                        {order.walletAddress ? `Wallet: ${order.walletAddress.substring(0,6)}...` : ''}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-[#994d51]">No orders match your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (from mock) */}
      <div className="flex items-center justify-center p-4">
        <button className="flex size-10 items-center justify-center text-[#1b0e0e]" disabled> {/* TODO: Implement pagination logic */}
          <CaretLeftIcon />
        </button>
        <button className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-[#1b0e0e] rounded-full bg-[#f3e7e8]">1</button>
        {/* <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#1b0e0e] rounded-full">2</button> */}
        <button className="flex size-10 items-center justify-center text-[#1b0e0e]" disabled>
          <CaretRightIcon />
        </button>
      </div>
    </div>
  );
}

// TODO: Create a dynamic page /admin/orders/[id].tsx for detailed order view and management (shipping fee update, status change)
