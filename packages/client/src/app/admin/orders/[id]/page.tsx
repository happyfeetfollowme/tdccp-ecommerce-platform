"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // For redirecting after update

// Assuming AdminOrder and OrderStatus types are similar to the list page
// For simplicity, reusing parts of UserOrderDetailsPage structure but adapted for Admin
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

type OrderStatus =
  | 'Pending'
  | 'Awaiting merchant confirmation of shipping fee'
  | 'Awaiting payment'
  | 'Paid'
  | 'Shipped'
  | 'Completed'
  | 'Canceled';

interface AdminOrderDetail {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: { // Assuming we have some customer info
    id: string;
    name: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  transactionId?: string; // e.g. Solana transaction signature
  trackingNumber?: string;
  notes?: string; // Admin notes
  walletAddress?: string; // Seller's wallet for this order
}

// All possible statuses for the dropdown
const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Awaiting merchant confirmation of shipping fee',
  'Awaiting payment',
  'Paid',
  'Shipped',
  'Completed',
  'Canceled',
];


// Sample Data Fetching (replace with actual API call)
const fetchAdminOrderDetails = async (id: string): Promise<AdminOrderDetail | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Find from sample list or a dedicated sample detail
  const sampleOrdersList: AdminOrderDetail[] = [ // Expanded from previous AdminOrder type
    {
      id: '12345', date: '2024-01-15', status: 'Awaiting merchant confirmation of shipping fee',
      items: [{id: 'p1', name: 'Handmade Mug', quantity: 2, price: 25, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHFSZVNyHhqdDkQftl55FQ3KRfYCSA50XUdIQwotg7-89w6JtypDX9YDSCtXmZ7X9OyoN03sjLlqCSpKqPCD5osw1OroJdI_xqDafdV2_zwMdSNvlWTx8Lm1HMiJ8M6hHaEL5X_KxrN4zCOczDws_IGHxzSSatqccklO0Qe3fRZNmp23zGhNGzzlP_DPWkJKOnrTwANNb1i7MrY2InM20pGp6lI4NR2DTlEglisxEttu-ec5UqPBn307qeFJrW0nkwu4JOF1_i6v8'}],
      subtotal: 50.00, shippingFee: 0.00, total: 50.00,
      customer: {id: 'cust1', name: 'Alice Johnson', email: 'alice@example.com'},
      shippingAddress: {name: 'Alice Johnson', addressLine1: '123 Wonderland Ave', city: 'Teaville', state: 'CA', zipCode: '90210', country: 'USA'},
      paymentMethod: 'N/A', walletAddress: 'sellerWalletAlice'
    },
    {
      id: '12348', date: '2024-01-18', status: 'Awaiting payment',
      items: [{id: 'p2', name: 'Large Painting', quantity: 1, price: 280, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9kFVphDWhPv_5_ItDuY19HW0s-R91z0vmaJ0lOAnQ8Fxt3HIU1edXQayMexAhXwLssTfuVOlpKDVh9YFIwr8dm-y-fQ3xrniQl_OWniyzufSvKPO4dF9si6-4k3Y4wc5mPCE_smp0o87Argp9PMeH7Z4OqV3waxgUR8ibbUTxNvXOu9CXAT7MaipsvfYKyRZGvq2_hTyD5EFzbR38YjIli5R1yI2mZbPIBVp9dyQMz3XNYCMDpH5RV0-ZcFQvpw6H0Bg1TJV_1M'}],
      subtotal: 280.00, shippingFee: 20.00, total: 300.00,
      customer: {id: 'cust2', name: 'Diana Evans', email: 'diana@example.com'},
      shippingAddress: {name: 'Diana Evans', addressLine1: '456 Olympus Rd', city: 'Godstown', state: 'NY', zipCode: '10001', country: 'USA'},
      paymentMethod: 'Solana Pay (Pending)', walletAddress: 'sellerWalletDiana'
    },
     {
      id: '12346', date: '2024-01-16', status: 'Shipped',
      items: [{id: 'p3', name: 'Sculpture', quantity: 1, price: 185, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy-0UdzFyQy5p9W3W_vaIgpMrWslKJM0yrR0FKya1T11J3nXg_fn7IxrHGFSetnHOeUwF0W8rs3RPi2-a4BtjPejX0iPNisb5hn30MTnSMba79c5vuvc8l6F_gPSakpjafMLE7nlFrwsh5HqRQCt_ex-hw_HrTi_1LxDC9nShre_F9fk5MUccuPbZga9ur6Ml0beNHuT5OljHu78PKgkkbRu_a8SaONLX_EESQmNNbMIMSNxmJjRm-3nCvZh9P9KCWf_psOsuw2V8'}],
      subtotal: 185.00, shippingFee: 15.00, total: 200.00,
      customer: {id: 'cust3', name: 'Bob Williams', email: 'bob@example.com'},
      shippingAddress: {name: 'Bob Williams', addressLine1: '789 Builder Ln', city: 'Constructville', state: 'TX', zipCode: '75001', country: 'USA'},
      paymentMethod: 'Solana Pay', transactionId: 'sol_tx_123abc', trackingNumber: 'XYZ123456789', walletAddress: 'sellerWalletBob'
    },
  ];
  return sampleOrdersList.find(o => o.id === id) || null;
};

interface AdminOrderDetailsPageProps {
  params: { id: string };
}

export default function AdminOrderDetailsViewPage({ params }: AdminOrderDetailsPageProps) {
  // const router = useRouter();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shippingFeeInput, setShippingFeeInput] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      fetchAdminOrderDetails(params.id as string)
        .then(data => {
          if (data) {
            setOrder(data);
            setShippingFeeInput(data.shippingFee.toFixed(2));
            setSelectedStatus(data.status);
            setTrackingNumberInput(data.trackingNumber || '');
          } else {
            setError('Order not found.');
          }
        })
        .catch(err => {
          console.error("Failed to fetch order:", err);
          setError('Failed to load order details.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  const handleUpdateShippingFee = async () => {
    if (!order) return;
    const newShippingFee = parseFloat(shippingFeeInput);
    if (isNaN(newShippingFee) || newShippingFee < 0) {
      alert('Invalid shipping fee amount.');
      return;
    }
    // TODO: API call to update shipping fee
    // PATCH /api/admin/orders/:id/shipping-fee { shippingFee: newShippingFee }
    // On success, update local order state and potentially status to 'Awaiting payment'
    console.log(`Updating shipping fee for order ${order.id} to ${newShippingFee}`);
    alert(`Shipping fee updated to $${newShippingFee.toFixed(2)}. Order status should ideally change to 'Awaiting payment'.`);
    setOrder(prev => prev ? {...prev, shippingFee: newShippingFee, total: prev.subtotal + newShippingFee, status: 'Awaiting payment'} : null);
    setSelectedStatus('Awaiting payment');
  };

  const handleUpdateOrderStatus = async () => {
    if (!order || !selectedStatus) return;
    // TODO: API call to update order status
    // PUT /api/admin/orders/:id/status { status: selectedStatus, trackingNumber: trackingNumberInput (if status is Shipped) }
    console.log(`Updating status for order ${order.id} to ${selectedStatus}`);
    let message = `Order status updated to ${selectedStatus}.`;
    if (selectedStatus === 'Shipped' && trackingNumberInput) {
        message += ` Tracking: ${trackingNumberInput}`;
    }
    alert(message);
    setOrder(prev => prev ? {...prev, status: selectedStatus, trackingNumber: selectedStatus === 'Shipped' ? trackingNumberInput : prev.trackingNumber } : null);
  };


  if (isLoading) return <div className="p-6 text-center">Loading order details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-6 text-center">Order data unavailable.</div>;

  const isShippingFeeEditable = order.status === 'Awaiting merchant confirmation of shipping fee' || order.status === 'Pending';

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/orders" className="text-[#e92932] hover:underline text-sm">
          &larr; Back to All Orders
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#1b0e0e]">Order #{order.id}</h1>
              <p className="text-sm text-gray-500">Date: {order.date}</p>
              <p className="text-sm text-gray-500">Customer: {order.customer.name} ({order.customer.email})</p>
            </div>
            <span className={`mt-2 sm:mt-0 text-sm font-semibold px-3 py-1.5 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.status}
            </span>
          </div>
           {order.walletAddress && (
            <div className="mt-3">
                <p className="text-xs text-gray-500">Seller Wallet: <span className="text-gray-700 font-mono">{order.walletAddress}</span></p>
            </div>
            )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Items & Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Items */}
            <div>
              <h2 className="text-xl font-semibold text-[#1b0e0e] mb-3">Items</h2>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-md bg-gray-50">
                    <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded" />
                    <div className="flex-grow">
                      <p className="font-medium text-[#1b0e0e]">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} &bull; Price: ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-[#1b0e0e]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Totals</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Current Shipping:</span><span>${order.shippingFee.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-md pt-1 border-t mt-1"><span >Total:</span><span>${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: Shipping, Payment, Actions */}
          <div className="space-y-6">
            {/* Shipping Fee Update */}
            {isShippingFeeEditable && (
              <div className="p-4 border rounded-md bg-yellow-50">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Confirm Shipping Fee</h3>
                <p className="text-xs text-yellow-700 mb-2">This order is awaiting shipping fee confirmation.</p>
                <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">Enter Shipping Fee ($):</label>
                <input
                  type="number"
                  id="shippingFee"
                  name="shippingFee"
                  value={shippingFeeInput}
                  onChange={(e) => setShippingFeeInput(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={handleUpdateShippingFee}
                  className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Confirm & Update Shipping
                </button>
              </div>
            )}

            {/* Status Update */}
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">Update Order Status</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Select status</option>
                {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {selectedStatus === 'Shipped' && (
                <div className="mt-3">
                    <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">Tracking Number:</label>
                    <input
                        type="text"
                        id="trackingNumber"
                        value={trackingNumberInput}
                        onChange={(e) => setTrackingNumberInput(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter tracking number"
                    />
                </div>
              )}
              <button
                onClick={handleUpdateOrderStatus}
                disabled={!selectedStatus || selectedStatus === order.status}
                className="mt-3 w-full bg-[#e92932] hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-300"
              >
                Update Status
              </button>
            </div>

            {/* Shipping & Payment Details Display */}
            <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                <address className="text-xs text-gray-600 not-italic">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 || ''}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </address>
            </div>
            <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-1">Payment</h3>
                <p className="text-xs text-gray-600">Method: {order.paymentMethod}</p>
                {order.transactionId && <p className="text-xs text-gray-600">TxID: <span className="font-mono text-xs">{order.transactionId}</span></p>}
            </div>
            {order.trackingNumber && order.status === 'Shipped' && (
                 <div className="p-4 border rounded-md bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-800 mb-1">Tracking</h3>
                    <p className="text-sm text-blue-700">Number: {order.trackingNumber}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
