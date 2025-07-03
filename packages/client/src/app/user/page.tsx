"use client"; // For potential client-side fetching or interactions

import Link from 'next/link';
import Image from 'next/image'; // If needed for avatars, etc.

// Placeholder types - align with actual data structures from backend
interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Waiting for Payment' | 'Shipped' | 'Delivered' | 'Canceled' | 'Awaiting merchant confirmation of shipping fee' | 'Paid'; // Added from requirements
  total: number;
}

interface UserProfile {
  discordId: string;
  email: string;
  // Potentially other fields like name, avatar if available from Discord OAuth
}

// Sample Data (replace with actual data fetching)
const sampleUserProfile: UserProfile = {
  discordId: 'Sophia Clark#1234', // Mock data
  email: 'sophia.clark@example.com', // Mock data
};

const sampleOrders: Order[] = [
  { id: '12343', date: 'May 15, 2024', status: 'Processing', total: 120.00 },
  { id: '12344', date: 'May 15, 2024', status: 'Waiting for Payment', total: 120.00 },
  { id: '12345', date: 'May 15, 2024', status: 'Shipped', total: 120.00 },
  { id: '12346', date: 'May 10, 2024', status: 'Delivered', total: 85.00 },
  { id: '12347', date: 'May 5, 2024', status: 'Canceled', total: 50.00 },
  { id: '12348', date: 'July 28, 2024', status: 'Awaiting merchant confirmation of shipping fee', total: 75.00 },
  { id: '12349', date: 'July 29, 2024', status: 'Paid', total: 95.00 },
];

// Helper to get status button styles (can be more sophisticated)
const getStatusClass = (status: Order['status']) => {
  switch (status) {
    case 'Processing':
    case 'Awaiting merchant confirmation of shipping fee':
      return 'bg-[#f4f0f0] text-[#181111]'; // Neutral
    case 'Waiting for Payment':
      return 'bg-yellow-100 text-yellow-700'; // Yellowish
    case 'Paid':
    case 'Shipped':
      return 'bg-blue-100 text-blue-700'; // Bluish
    case 'Delivered':
      return 'bg-green-100 text-green-700'; // Greenish
    case 'Canceled':
      return 'bg-red-100 text-red-700'; // Reddish
    default:
      return 'bg-gray-100 text-gray-700';
  }
};


export default function UserPage() {
  // TODO: Fetch user profile and orders from API
  const user = sampleUserProfile;
  const orders = sampleOrders;

  return (
    <div className="w-full"> {/* Max-width is handled by layout.tsx */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#181111] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Account
        </p>
        {/* TODO: Add Logout button if user is logged in */}
      </div>

      {/* Personal Information */}
      <h3 className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Personal Information
      </h3>
      <div className="bg-white px-4">
        <div className="flex items-center min-h-[72px] py-3 border-b border-b-[#e5dcdc]">
          <div className="flex flex-col justify-center">
            <p className="text-[#181111] text-base font-medium leading-normal line-clamp-1">Discord ID</p>
            <p className="text-[#886364] text-sm font-normal leading-normal line-clamp-2">{user.discordId}</p>
          </div>
        </div>
        <div className="flex items-center min-h-[72px] py-3">
          <div className="flex flex-col justify-center">
            <p className="text-[#181111] text-base font-medium leading-normal line-clamp-1">Email Address</p>
            <p className="text-[#886364] text-sm font-normal leading-normal line-clamp-2">{user.email}</p>
          </div>
        </div>
        {/* TODO: Add section for managing shipping addresses if required by PRD/Reqs */}
      </div>


      {/* Order History */}
      <h3 id="orders" className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">
        Order History
      </h3>
      {orders.length === 0 ? (
        <div className="px-4 py-3 text-[#886364]">You have no past orders.</div>
      ) : (
        <div className="px-4 py-3 @container"> {/* @container for responsive table columns if needed */}
          <div className="flex overflow-hidden rounded-xl border border-[#e5dcdc] bg-white">
            <table className="flex-1 min-w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-[#181111] w-[25%] sm:w-[20%] text-sm font-medium leading-normal">Order</th>
                  <th className="px-4 py-3 text-left text-[#181111] w-[30%] sm:w-[30%] text-sm font-medium leading-normal">Date</th>
                  <th className="px-4 py-3 text-left text-[#181111] w-[25%] sm:w-[30%] text-sm font-medium leading-normal">Status</th>
                  <th className="px-4 py-3 text-left text-[#181111] w-[20%] sm:w-[20%] text-sm font-medium leading-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-t-[#e5dcdc]">
                    <td className="h-[72px] px-4 py-2 text-[#181111] text-sm font-normal leading-normal">
                      <Link href={`/user/orders/${order.id}`} className="text-[#e92932] hover:underline">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-[#886364] text-sm font-normal leading-normal">
                      {order.date}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                      <span
                        className={`flex min-w-[84px] max-w-full items-center justify-center overflow-hidden rounded-full h-8 px-3 text-xs sm:text-sm font-medium leading-normal w-auto ${getStatusClass(order.status)}`}
                      >
                        <span className="truncate">{order.status}</span>
                      </span>
                    </td>
                    <td className="h-[72px] px-4 py-2 text-[#886364] text-sm font-normal leading-normal">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
       {/* Pagination for orders if many - not in mock, but good for future */}
    </div>
  );
}
