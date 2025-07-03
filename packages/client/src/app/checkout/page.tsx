"use client"; // For form handling and potential state

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Sample cart items for review (in a real app, this would come from cart state)
const sampleOrderItems = [
  {
    id: 'prod1',
    name: 'Classic Cotton T-Shirt',
    quantity: 1,
    price: 120,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz1zfplm4Z1YR6QD_I455h8oNYUqSpxzmF1pyWXMpdFYGukO5Bv1xQBb8utxozV25I0wh0ySN-njcGyye8KVjwwVGkRGuuynk9Ha9numq1aPMrfvRqWIIO8Ed1g7ySwqDao4jfx4EJrzfyXc2vFrz0gTOgnjjSQi4YMIW2SPqEtLqOfbIMh42FNktDlabHcRzBEWHcpzmzQbog2a3RVOgMF2lk9uHQh4QmvCjHQ7UTFNQYoOb-hGR3Cz1LgWwAxPLYBmS2lPan53g',
  },
  {
    id: 'prod2',
    name: 'Comfortable Running Shoes',
    quantity: 1,
    price: 150,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh6S5COsOHwJpHU2gIyr00JcrRCJpe3WgVXLrOlXHlTMMtRfEarIs81QkTa_j0liPhaAX0MldGPIGlGWkhT2p03bZTFwDVmuB_KvImmfKEwnGGaX9dK2Ye9CUGiFMcKXu5U9NFzxsyzwJNy-w4fFv129HTVBKcusp0vwq1EJebkZHiCzJnSyBYnLb4-MEiRfSm3MgNhbaMYY9jd-3OIaUlkqfwlfJ89DLF02DU35Fj-W7pkJz8B1TSp13t2jyi57t_Y79w95Uo_yw',
  },
  // This item was in the checkout mock but not in the cart mock. Included for consistency with checkout mock.
  {
    id: 'prod3',
    name: 'Cozy Knit Sweater',
    quantity: 1,
    price: 75, // Price assumed, not in mock. Total in mock was $75, could be this single item.
              // Let's adjust sample data to make more sense with subtotal.
              // For now, using as is from checkout mock.
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMT8-8qDJxzjFfWxzR356gh_LdC79P7rD1wtj_fstSgg2hZIJzvFd5idSBBTMxomSilOJLH2eTqE5OiTduBtxhLuZiscPRYFQxFm0bhV7MkkkG82j5uwUjKCpml_KjSMpjwkjBml4-iF2z99c0raI3FywCf9DZ61mTgo-rKdwE5SNkzmTOGGV0nv5XP6pY114BLUzsHLIqHu2jQL1BHgOXlwKIvIg6KkHA7LuzRbl8GusCNrP3MpJHfT18bcLQsOX73XsMSAyTrSI',
  },
];


export default function CheckoutPage() {
  // TODO: Form state and validation for shipping info
  // TODO: Get cart items from global state

  const subtotal = sampleOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 0; // "Pending" in mock, to be calculated by merchant
  const total = subtotal + shippingFee;

  const handlePlaceOrder = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement order placement logic
    // 1. Collect form data
    // 2. Send data to backend /api/orders
    // 3. On success, redirect to order confirmation or payment page
    // For now, link to order-confirmation
    console.log("Placing order...");
    // Router push to /order-confirmation, but it's a Link in the mock
  };


  return (
    <div className="w-full max-w-[512px] py-5"> {/* Adjusted width from mock */}
      {/* Breadcrumbs */}
      <div className="flex flex-wrap gap-2 p-4">
        <Link className="text-[#994d51] text-base font-medium leading-normal" href="/cart">Cart</Link>
        <span className="text-[#994d51] text-base font-medium leading-normal">/</span>
        <span className="text-[#1b0e0e] text-base font-medium leading-normal">Checkout</span>
      </div>

      <form onSubmit={handlePlaceOrder}>
        {/* Shipping Information */}
        <h1 className="text-[#1b0e0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Shipping Information
        </h1>
        {/* Simplified form fields from mock */}
        <div className="flex max-w-[480px] flex-col gap-4 px-4 py-3">
          <label className="flex flex-col">
            <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Email</span>
            <input type="email" required className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] focus:outline-0 focus:ring-1 focus:ring-[#e92932] border border-[#e7d0d1] bg-white focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal" />
          </label>
          <div className="flex flex-col sm:flex-row gap-4"> {/* Responsive flex */}
            <label className="flex flex-col flex-1">
              <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">First Name</span>
              <input type="text" required className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
            </label>
            <label className="flex flex-col flex-1">
              <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Last Name</span>
              <input type="text" required className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
            </label>
          </div>
          <label className="flex flex-col">
            <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Address</span>
            <input type="text" required className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
          </label>
          <label className="flex flex-col">
            <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Apt, suite, etc. (optional)</span>
            <input type="text" className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
          </label>
          <label className="flex flex-col">
            <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">City</span>
            <input type="text" required className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
          </label>
          <div className="flex flex-col sm:flex-row gap-4"> {/* Responsive flex */}
            <label className="flex flex-col flex-1">
              <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">State</span>
              {/* Consider a select dropdown for states */}
              <input type="text" required className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
            </label>
            <label className="flex flex-col flex-1">
              <span className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Zip Code</span>
              <input type="text" required pattern="[0-9]{5}(-[0-9]{4})?" className="form-input w-full rounded-lg text-[#1b0e0e] h-14 p-[15px] border border-[#e7d0d1] bg-white focus:ring-1 focus:ring-[#e92932]" />
            </label>
          </div>
        </div>

        {/* Review Order */}
        <h1 className="text-[#1b0e0e] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
          Review Order
        </h1>
        <div className="px-4 py-1">
          {sampleOrderItems.map(item => (
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
              <div className="flex flex-col justify-center flex-grow">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal line-clamp-1">{item.name}</p>
                <p className="text-[#994d51] text-sm font-normal leading-normal line-clamp-2">Quantity: {item.quantity}</p>
              </div>
              <div className="shrink-0">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="px-4 py-3 mt-2">
            <div className="flex items-center justify-between gap-4 bg-[#fcf8f8] min-h-14 py-1">
              <p className="text-[#1b0e0e] text-base font-normal leading-normal flex-1 truncate">Subtotal</p>
              <div className="shrink-0"><p className="text-[#1b0e0e] text-base font-normal leading-normal">${subtotal.toFixed(2)}</p></div>
            </div>
            <div className="flex items-center justify-between gap-4 bg-[#fcf8f8] min-h-14 py-1">
              <p className="text-[#1b0e0e] text-base font-normal leading-normal flex-1 truncate">Shipping</p>
              <div className="shrink-0"><p className="text-[#1b0e0e] text-base font-normal leading-normal">Pending</p></div>
            </div>
            <div className="flex items-center justify-between gap-4 bg-[#fcf8f8] min-h-14 py-1 border-t border-[#e7d0d1] mt-2 pt-2">
              <p className="text-[#1b0e0e] text-lg font-bold leading-normal flex-1 truncate">Total</p>
              <div className="shrink-0"><p className="text-[#1b0e0e] text-lg font-bold leading-normal">${total.toFixed(2)}</p></div>
            </div>
        </div>

        {/* Place Order Button */}
        <div className="flex px-4 py-3">
            {/*
              The mock-up uses an <a> tag for navigation. For a form, a submit button is more appropriate.
              If direct navigation without form submission is intended, then Link is fine.
              Assuming form submission that then navigates.
            */}
          <button
            type="submit"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#e92932] text-[#fcf8f8] text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors"
          >
            <span className="truncate">Place Order</span>
          </button>
        </div>
         <p className="text-[#994d51] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
            After placing the order, you'll wait for merchant to confirm shipping. Then you can pay via Solana Pay.
         </p>
      </form>
    </div>
  );
}
