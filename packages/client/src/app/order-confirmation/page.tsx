"use client"; // May use client features like router query params

import Link from 'next/link';
import Image from 'next/image';
// import { useSearchParams } from 'next/navigation'; // To get order ID if passed in URL

// Sample data for display - in a real app, this would come from API or state
const sampleOrder = {
  id: '123456789', // Example from mock
  date: 'July 26, 2024', // Example from mock
  total: 125.00, // Example from mock
  paymentMethod: 'Solana Pay', // As per requirements
  shippingInfo: {
    name: 'Sophia Carter', // Example from mock
    address: '123 Elm Street', // Example from mock
    city: 'Anytown', // Example from mock
    state: 'CA', // Example from mock
    zipCode: '91234', // Example from mock
  },
  items: [ // Example items from mock
    {
      id: 'item1',
      name: 'Classic Cotton T-Shirt',
      attributes: 'Size M', // e.g. Size, Color
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ3qxiy8AfcUZF-NvPflB3L4VU0OV4gYXqacupk7Sto3zSwjZ0e91dlAlrEe0yhIQU3rF3TY_bUT4GgUs-WaEVrBOKrcO7IjbW7-0ZNzi-HaLH269gKbdiNIDm5auMUjzWoRb5CVVqmlLGcfhrzdyvFBu3n3zQd66j2jinlAfVhTFqJTDgmPLKi42uahZbUSnXj3MewRQdASd72L7dgrm04yzgnKjNNaS-CQJgYjDmUm9K59Q4_ecB_JB7WTiaXzXZDGwufn8HdQg',
    },
    {
      id: 'item2',
      name: 'Comfortable Running Shoes',
      attributes: 'Size 8',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB59AvcdgMY-zI0bZX546qfsOlBkfDZ3rxcxvNn649Dm7u6wE29wi4Y_hXNjv41JM0bR6av__jvXgPMlbgEobxHlxSr-_wmosSRm9-V4Vs7Fd5uqy5tyJ58pRTcqyCcdAXeNvc1GtbfWT7qYOYmItUU33eP3B2eS_f2C2QinyXWzQpmVBuKwiPVyN9nDxUOa3F1iKNG07_jorb8m92p6vzU3QT_PQO44i--KMXexGnKlNZk2yViThfKlIjkURf536Ifm7_XyOMhsVc',
    },
  ]
};

export default function OrderConfirmationPage() {
  // const searchParams = useSearchParams();
  // const orderIdFromUrl = searchParams.get('orderId');
  // TODO: Fetch order details based on orderIdFromUrl or from state after order placement

  const order = sampleOrder; // Using sample data for now

  return (
    <div className="w-full max-w-[512px] py-5"> {/* Adjusted width from mock */}
      <h2 className="text-[#1b0e0e] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
        Order Confirmed!
      </h2>
      {/*
        The mock-up text is "Your order #123456789 has been placed and is being processed. You will receive an email confirmation shortly."
        This implies the order is placed *before* payment is fully completed and confirmed by merchant.
        The system design:
        1. User submits order -> status "Awaiting merchant confirmation"
        2. Merchant updates shipping fee -> status "Awaiting payment"
        3. User pays via Solana Pay -> status "Paid"
        This confirmation page likely appears after step 1 or step 3.
        Let's assume it's after step 1 for now, as per the PRD checkout flow ("Order Review & Confirmation: ... Upon confirmation, one or more orders are placed... and their status is set to "Processing".)
        And then the payment notification happens.
        The mock "order-confirmation.html" seems more like an "Order Placed" summary.
      */}
      <p className="text-[#1b0e0e] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
        Your order <span className="font-semibold">#{order.id}</span> has been placed.
        <br />
        It is now <span className="font-semibold">Awaiting Merchant Confirmation</span> for shipping fees.
        <br />
        You will be notified when it's ready for payment.
      </p>

      {/* Order Summary Table from mock */}
      <h3 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Order Summary</h3>
      <div className="p-4 grid grid-cols-[auto_1fr] gap-x-6 text-sm"> {/* Adjusted grid for key-value */}
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Order Date</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.date}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Order Total (excluding shipping)</p>
          <p className="text-[#1b0e0e] font-normal text-right">${order.total.toFixed(2)}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Payment Method</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Shipping Information Table from mock */}
      <h3 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Shipping Information</h3>
      <div className="p-4 grid grid-cols-[auto_1fr] gap-x-6 text-sm">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Name</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.shippingInfo.name}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Address</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.shippingInfo.address}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">City</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.shippingInfo.city}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">State</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.shippingInfo.state}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#e7d0d1] border-b border-b-[#e7d0d1] py-3">
          <p className="text-[#994d51] font-normal">Zip Code</p>
          <p className="text-[#1b0e0e] font-normal text-right">{order.shippingInfo.zipCode}</p>
        </div>
      </div>

      {/* Items Purchased - from mock */}
      <h3 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Items Ordered</h3>
      <div className="px-4 py-1">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-[#fcf8f8] min-h-[72px] py-2">
            <div className="relative size-14">
              <Image
                src={item.imageUrl}
                alt={item.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0e0e] text-base font-medium leading-normal line-clamp-1">{item.name}</p>
              <p className="text-[#994d51] text-sm font-normal leading-normal line-clamp-2">{item.attributes}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button - from mock */}
      <div className="flex px-4 py-3 mt-4">
        <Link
          href="/user#orders" // Link to user's order history section
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#e92932] text-[#fcf8f8] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors"
        >
          <span className="truncate">View Order History</span>
        </Link>
      </div>
    </div>
  );
}
