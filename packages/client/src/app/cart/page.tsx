"use client"; // Required for components with user interaction like useState

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react'; // For managing cart item quantities

// Placeholder Item
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  // Attributes like size, color if applicable
}

// Sample Cart Data (replace with actual cart state management later)
const initialCartItems: CartItem[] = [
  {
    id: 'prod1',
    name: 'Classic Cotton T-Shirt',
    price: 120,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8MwIGwZmpAdu5NAX4OZEs5GWW9g_8rbvefFo29MPbXa1S8e655AfOpXjo6ZeiEulpGeIEIkeW2ROJCQm-oG9de6wumx2OyrthLoUpb2nYJ7inrMA9qWwTIpy8PeIEicfDDPjJTFhXFTOhQxM-RWzsTjDRQD7_dgBapvJghrz5NSNA6_sfDD_eDWtZ68VdnoxUD-mlx1yppS1I1kybFGta2aJs8XnFuI3NYClFOQnlX9lanBM3D9zDmIhwqQSWLjxuOXkb3h5PoMI',
  },
  {
    id: 'prod2',
    name: 'Comfortable Running Shoes',
    price: 150,
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY59Ow9Pygp-C3BL5VDYImjWle5KCLYITfcrHm07kKzcvUjLtkM947OpNmvuvTy0iHXzknnZFJ3L6Bo9l3FNYvttGHxIp9N611R6iVuPnwbhXRAq4wyROzc-mzRSsRMUL-DJqYax7eDF8o-2q3kEoe44mPUTH0bNp6DRZ8Gsa5_fpoQmvqNfOxZ1OVRNqDGUlNleu9L4lazlbyWfFU3mR7jZfOIWbh29TEHNH_9j8UioR33eiGgAgzxGrn6jT62dhdetiOb4wrnrg',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  // TODO: Implement actual cart state logic (Context, Zustand, Redux)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Or remove item if quantity is 0
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Shipping is marked as "Pending" in mock, will be calculated later
  const estimatedTotal = subtotal; // Add shipping later

  return (
    <div className="w-full max-w-[512px] py-5"> {/* Adjusted width from mock */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#1b0e0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
          My Bag ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-[#1b0e0e] text-lg">Your cart is empty.</p>
          <Link href="/" className="text-[#e92932] hover:underline font-medium">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 bg-[#fcf8f8] px-4 py-3 justify-between items-center">
              <div className="flex items-start gap-4">
                <div className="relative size-[70px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[#1b0e0e] text-base font-medium leading-normal">{item.name}</p>
                  <p className="text-[#994d51] text-sm font-normal leading-normal">${item.price.toFixed(2)}</p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 self-start"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-2 text-[#1b0e0e]">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#f3e7e8] cursor-pointer disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    className="text-base font-medium leading-normal w-8 p-0 text-center bg-transparent focus:outline-0 focus:ring-0 focus:border-none border-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#f3e7e8] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Discount Code - from mock */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mt-4">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                placeholder="Discount code"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
              />
            </label>
            {/* TODO: Add Apply button for discount code */}
          </div>

          {/* Summary - from mock */}
          <h3 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Summary</h3>
          <div className="p-4">
            <div className="flex justify-between gap-x-6 py-2">
              <p className="text-[#994d51] text-sm font-normal leading-normal">Subtotal</p>
              <p className="text-[#1b0e0e] text-sm font-normal leading-normal text-right">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between gap-x-6 py-2">
              <p className="text-[#994d51] text-sm font-normal leading-normal">Shipping</p>
              <p className="text-[#1b0e0e] text-sm font-normal leading-normal text-right">Pending</p>
            </div>
            <div className="flex justify-between gap-x-6 py-2 border-t border-[#e7d0d1] mt-2 pt-2">
              <p className="text-[#1b0e0e] text-base font-medium leading-normal">Estimated Total</p>
              <p className="text-[#1b0e0e] text-base font-bold leading-normal text-right">${estimatedTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Checkout Button - from mock */}
          <div className="flex px-4 py-3">
            <Link
              href="/checkout"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#e92932] text-[#fcf8f8] text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors"
            >
              <span className="truncate">Checkout</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
