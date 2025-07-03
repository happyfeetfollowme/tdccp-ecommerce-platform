"use client"; // For potential client-side data fetching and interactions

import Link from 'next/link';
import Image from 'next/image';
// import { useParams } from 'next/navigation'; // Or get from props

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
  // attributes like size, color
}

interface OrderDetails {
  id: string;
  date: string;
  status: 'Processing' | 'Waiting for Payment' | 'Paid' | 'Shipped' | 'Delivered' | 'Canceled' | 'Awaiting merchant confirmation of shipping fee';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number; // Can be 0 if pending or not yet set
  total: number;
  shippingAddress: { // Assuming this data is available for an order
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string; // e.g., "Solana Pay"
  trackingNumber?: string; // If shipped
  walletAddress?: string; // Wallet address associated with this order, from Order Service schema
}

// Sample Data (replace with actual data fetching based on ID)
const getSampleOrderDetails = (id: string): OrderDetails | null => {
  if (id === '12343') {
    return {
      id: '12343',
      date: 'May 15, 2024',
      status: 'Processing',
      items: [
        { id: 'itemA', name: 'Handmade Ceramic Vase', quantity: 1, price: 35.00, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9kFVphDWhPv_5_ItDuY19HW0s-R91z0vmaJ0lOAnQ8Fxt3HIU1edXQayMexAhXwLssTfuVOlpKDVh9YFIwr8dm-y-fQ3xrniQl_OWniyzufSvKPO4dF9si6-4k3Y4wc5mPCE_smp0o87Argp9PMeH7Z4OqV3waxgUR8ibbUTxNvXOu9CXAT7MaipsvfYKyRZGvq2_hTyD5EFzbR38YjIli5R1yI2mZbPIBVp9dyQMz3XNYCMDpH5RV0-ZcFQvpw6H0Bg1TJV_1M' },
        { id: 'itemB', name: 'Organic Cotton Scarf', quantity: 2, price: 25.00, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDht2uaunwTgFODrw5eWlvIrpc_MLNhs2n-s12E0WUhLaVmosnYYFRodIhOwSU-cc4WIfOZJG3z_lf2Ae0e2KIv-quTt22IzpuvbifwUz4gGPx57zBJNSLjNeKLgptTO2qUfW_FCIkCPxMZ0Q52gsRVR4wVRT9-AGyR9kkRTNcCL7rLkUh64ksa7mPlwPVxNF7Mm2ogd9h6RqzMNIV0WZ2xyyIEzvmRnYDfZpVsVqrQbzeuyzW5xamu46KxZKPhRG_28VIm-KttCyY' },
      ],
      subtotal: 85.00,
      shippingFee: 0.00, // Still processing, not set
      total: 85.00,
      shippingAddress: { name: 'Sophia Clark', addressLine1: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA' },
      paymentMethod: 'Pending',
      walletAddress: 'SellerWalletAddressForOrder12343',
    };
  }
  if (id === '12344') {
     return {
      id: '12344',
      date: 'May 15, 2024',
      status: 'Waiting for Payment',
      items: [ { id: 'itemC', name: 'Vintage Leather Journal', quantity: 1, price: 45.00, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy-0UdzFyQy5p9W3W_vaIgpMrWslKJM0yrR0FKya1T11J3nXg_fn7IxrHGFSetnHOeUwF0W8rs3RPi2-a4BtjPejX0iPNisb5hn30MTnSMba79c5vuvc8l6F_gPSakpjafMLE7nlFrwsh5HqRQCt_ex-hw_HrTi_1LxDC9nShre_F9fk5MUccuPbZga9ur6Ml0beNHuT5OljHu78PKgkkbRu_a8SaONLX_EESQmNNbMIMSNxmJjRm-3nCvZh9P9KCWf_psOsuw2V8' } ],
      subtotal: 45.00,
      shippingFee: 10.00, // Merchant has set this
      total: 55.00,
      shippingAddress: { name: 'Sophia Clark', addressLine1: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA' },
      paymentMethod: 'Solana Pay (Pending)',
      walletAddress: 'SellerWalletAddressForOrder12344',
    };
  }
   if (id === '12349') { // Example for a "Paid" order
    return {
      id: '12349',
      date: 'July 29, 2024',
      status: 'Paid',
      items: [ { id: 'itemD', name: 'Abstract Art Print', quantity: 1, price: 20.00, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHFSZVNyHhqdDkQftl55FQ3KRfYCSA50XUdIQwotg7-89w6JtypDX9YDSCtXmZ7X9OyoN03sjLlqCSpKqPCD5osw1OroJdI_xqDafdV2_zwMdSNvlWTx8Lm1HMiJ8M6hHaEL5X_KxrN4zCOczDws_IGHxzSSatqccklO0Qe3fRZNmp23zGhNGzzlP_DPWkJKOnrTwANNb1i7MrY2InM20pGp6lI4NR2DTlEglisxEttu-ec5UqPBn307qeFJrW0nkwu4JOF1_i6v8' } ],
      subtotal: 20.00,
      shippingFee: 5.00,
      total: 25.00,
      shippingAddress: { name: 'Sophia Clark', addressLine1: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA' },
      paymentMethod: 'Solana Pay',
      walletAddress: 'SellerWalletAddressForOrder12349',
      trackingNumber: 'Not yet shipped'
    };
  }
  return null; // Order not found
};

// Helper to get status display styles (similar to UserPage)
const getStatusClass = (status: OrderDetails['status']) => {
  // ... (same as in UserPage, or move to a shared utility)
    switch (status) {
    case 'Processing':
    case 'Awaiting merchant confirmation of shipping fee':
      return 'bg-gray-200 text-gray-800';
    case 'Waiting for Payment':
      return 'bg-yellow-200 text-yellow-800';
    case 'Paid':
      return 'bg-blue-200 text-blue-800';
    case 'Shipped':
      return 'bg-indigo-200 text-indigo-800';
    case 'Delivered':
      return 'bg-green-200 text-green-800';
    case 'Canceled':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};


interface OrderDetailsPageProps {
  params: { id: string };
}

export default function UserOrderDetailsPage({ params }: OrderDetailsPageProps) {
  // const { id } = useParams(); // Alternative for client components
  const order = getSampleOrderDetails(params.id);

  if (!order) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-[#1b0e0e]">Order Not Found</h1>
        <p className="text-[#994d51] mt-2">We couldn't find details for this order.</p>
        <Link href="/user" className="mt-4 inline-block bg-[#e92932] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Back to Order History
        </Link>
      </div>
    );
  }

  const canCancelOrder = order.status === 'Processing' || order.status === 'Awaiting merchant confirmation of shipping fee' || order.status === 'Waiting for Payment';
  const canPayOrder = order.status === 'Waiting for Payment';

  const handleCancelOrder = () => {
    // TODO: Implement API call to cancel order
    alert(`Order ${order.id} cancel request sent.`);
  };

  const handlePayOrder = () => {
    // TODO: Implement Solana Pay redirection/logic via backend
    alert(`Proceeding to pay for order ${order.id} via Solana Pay.`);
    // This would likely involve calling an endpoint that generates a Solana Pay transaction URL
    // and then redirecting the user or showing a QR code.
  };

  return (
    <div className="py-5 px-2 sm:px-0"> {/* Ensure padding for smaller screens if needed */}
      <div className="mb-6">
        <Link href="/user#orders" className="text-[#e92932] hover:underline text-sm">
          &larr; Back to Order History
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1b0e0e]">Order #{order.id}</h1>
            <p className="text-sm text-[#886364]">Date: {order.date}</p>
          </div>
          <div className={`mt-2 sm:mt-0 text-sm font-semibold px-3 py-1 rounded-full ${getStatusClass(order.status)}`}>
            Status: {order.status}
          </div>
        </div>

        {order.walletAddress && (
           <div className="mb-6 p-3 bg-gray-50 rounded-md">
                <h3 className="text-md font-semibold text-[#1b0e0e] mb-1">Seller Wallet</h3>
                <p className="text-xs text-gray-600 break-all">{order.walletAddress}</p>
            </div>
        )}

        {/* Items */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#1b0e0e] mb-3">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4 p-3 border border-gray-200 rounded-md">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden shrink-0">
                  <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-md sm:text-lg font-medium text-[#1b0e0e]">{item.name}</h3>
                  <p className="text-sm text-[#886364]">Quantity: {item.quantity}</p>
                  <p className="text-sm text-[#886364]">Price: ${item.price.toFixed(2)} each</p>
                </div>
                <p className="text-md sm:text-lg font-semibold text-[#1b0e0e] shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold text-[#1b0e0e] mb-3">Order Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#886364]">Subtotal:</span>
              <span className="text-[#1b0e0e] font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#886364]">Shipping Fee:</span>
              <span className="text-[#1b0e0e] font-medium">
                {order.status === 'Processing' || order.status === 'Awaiting merchant confirmation of shipping fee' ? 'Pending Confirmation' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 mt-2">
              <span className="text-[#1b0e0e]">Total:</span>
              <span className="text-[#1b0e0e]">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-xl font-semibold text-[#1b0e0e] mb-3">Shipping Address</h2>
            <address className="text-sm text-[#886364] not-italic">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.addressLine1}<br />
              {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-xl font-semibold text-[#1b0e0e] mb-3">Payment Information</h2>
            <p className="text-sm text-[#886364]">Method: {order.paymentMethod}</p>
            {order.status === 'Paid' || order.status === 'Shipped' || order.status === 'Delivered' ? (
              <p className="text-sm text-green-600 font-semibold">Payment Successful</p>
            ) : order.status === 'Waiting for Payment' ? (
               <p className="text-sm text-yellow-600 font-semibold">Awaiting Payment</p>
            ) : null}
          </div>
        </div>

        {order.trackingNumber && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h2 className="text-xl font-semibold text-[#1b0e0e] mb-2">Tracking Information</h2>
                <p className="text-sm text-[#886364]">Tracking Number:
                    <span className="font-medium text-[#1b0e0e] ml-1">{order.trackingNumber}</span>
                    {/* TODO: Link to logistics provider if possible */}
                </p>
            </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {canPayOrder && (
            <button
              onClick={handlePayOrder}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-center font-semibold"
            >
              Pay Now with Solana Pay
            </button>
          )}
          {canCancelOrder && (
            <button
              onClick={handleCancelOrder}
              className={`flex-1 ${canPayOrder ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : 'bg-[#e92932] hover:bg-red-700 text-white'} px-6 py-3 rounded-lg transition-colors text-center font-semibold`}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
