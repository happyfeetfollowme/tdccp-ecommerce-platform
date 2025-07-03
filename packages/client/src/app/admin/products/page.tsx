"use client"; // For state, interactions, and potential client-side data fetching

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Types - should align with backend Product model
type ProductStatus = 'Active' | 'Inactive' | 'Draft'; // Example statuses

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number; // From Product Service schema
  preservedStock?: number; // From Product Service schema
  status: ProductStatus; // Example, might not be in schema, could be derived or admin-only
  walletAddress: string; // From Product Service schema
}

// Sample Data (replace with API call)
const sampleAdminProducts: AdminProduct[] = [
  { id: 'prod1', name: 'Organic Apples', price: 2.99, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2e3OBImNtbE83P0Xw8bLmtLHRfJ7zZXzqsu6FPTlV_T40EZzLwuBqNyfpFn-x_E-T4tkOVcwfAvga1-j2LdLXcRo-3mQs8YpxFct1mJw8emyCdE7XKK9Yn1pLa3hN-SKBVSuC6vjDrh98DHSzf0nkZLVcNEUbXWv9DLzAEthr0Q2lb8CoaTRntL1f-CUS5EuVWYJ31sWnICkhHBl72vJfDpQdRO5sk_Zn4DN4j84vC1tz_SbHkXe3U9lrj5E48tyUBMlLB1siHoU', stock: 100, status: 'Active', walletAddress: 'appleSellerWallet' },
  { id: 'prod2', name: 'Whole Wheat Bread', price: 3.49, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGUi-9xdhzqHaSRHvE5_5HYpRIWftpxMWn3VWJEDT2z1S6ztdNDkkPd1_ZFpp6ago8fx2QuDFtlyUY-uiklymBTwtj-gJ6SonkfL9EhC6rfqS7FnN8rgbQ8vLRdV4IT5ju8MSA4C6eYhC6tHGMDgaphQZXGJ55hemK-SmRLfBU758JnAhUD_RE3MAh75iGFGvzojILnNGrJoE6dhCxCBjMjGnRWV2ORQ0Tex_YW6clxLqOrrcTAZ4mfi4lgBJ5zgz1KDUy9dS99vc', stock: 50, status: 'Active', walletAddress: 'breadSellerWallet' },
  { id: 'prod3', name: 'Free-Range Eggs', price: 4.99, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXky4glYbt9xEannsHqotHCJIHJTe61SDGG0ls6jZl1YM26Bny5e44Ob_BhQ9MLTHPV-vN_dOyc2P1bQkcxomiltUYMMFi3Tzp2NbM78tx-rf-qvHS144pvbuLel8QPt2XXLg7s9phR-YFWDtu-rinnHA0g3hSotDBa8Pn4KetyCycgV_c2oye0pRFOpG5Dr8LcNW8RXVPq9_JjQHs0_-a5GhVO4sw8NryStnAeSX4lBjIu9C9-huAUuIWel__hZ0j04mbQJi8nrc', stock: 75, status: 'Inactive', walletAddress: 'eggSellerWallet' },
  { id: 'prod4', name: 'Almond Milk', price: 3.99, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjsUvNTcaG8n9ch5hvS-y519LBJl6gJrqJ4MXhXBOAFHoA2JEuPiqDQEN740wUyoVOPLbw74Cd7eKHsH-giwwNkC-d7U08mFUWHEjCFqmW_OpVuIa6s_6y6-eTTuBfN1o1E6XY1FGrc1OE1_HedR8SzvhunJ5UkYbGcYx_LyWbHa4x1mS8yiqAN4N0onC-vBqtvVHbtZLSYjSzXAjqbsWzun5_Q3RTfDcoLKFYnKN4zUnONLBUGro3w1gAsW6C25zkFZ6-abc1Y5Y', stock: 0, status: 'Draft', walletAddress: 'milkSellerWallet' },
];

// Placeholder icons from mock
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);

const getStatusClass = (status: ProductStatus) => {
  if (status === 'Active') return 'bg-green-100 text-green-700';
  if (status === 'Inactive') return 'bg-red-100 text-red-700';
  if (status === 'Draft') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: Add state for managing products (e.g., for add/edit modals)

  // TODO: Fetch products from API
  const filteredProducts = sampleAdminProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    // TODO: Navigate to an add product page or open a modal
    alert('Navigate to Add Product page/modal');
  };

  const handleEditProduct = (id: string) => {
    // TODO: Navigate to an edit product page or open a modal with product data
    alert(`Edit product ${id}`);
  };

  const handleDeleteProduct = (id: string) => {
    // TODO: API call to delete product, then refresh list
    if (confirm(`Are you sure you want to delete product ${id}?`)) {
      alert(`Product ${id} deleted (mock).`);
      // Filter out from sampleAdminProducts or re-fetch
    }
  };


  return (
    <div className="w-full"> {/* Max-width is handled by layout.tsx */}
      <div className="flex flex-wrap justify-between gap-3 p-4 items-center">
        <p className="text-[#1b0e0e] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Products
        </p>
        <button
          onClick={handleAddProduct}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e92932] text-[#fcf8f8] text-sm font-medium leading-normal hover:bg-red-700 transition-colors"
        >
          <span className="truncate">Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#994d51] flex border-none bg-[#f3e7e8] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <MagnifyingGlassIcon />
            </div>
            <input
              placeholder="Search products by name, ID, or wallet"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] focus:outline-0 focus:ring-0 border-none bg-[#f3e7e8] focus:border-none h-full placeholder:text-[#994d51] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Products Table */}
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#e7d0d1] bg-[#fcf8f8]">
          <table className="flex-1 min-w-full">
            <thead className="bg-[#fcf8f8]">
              <tr>
                <th className="px-4 py-3 text-left text-[#1b0e0e] w-14 text-sm font-medium leading-normal hidden sm:table-cell">Image</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Name</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal hidden lg:table-cell">Wallet</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Status</th>
                <th className="px-4 py-3 text-left text-[#1b0e0e] text-sm font-medium leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-t-[#e7d0d1]">
                  <td className="h-[72px] px-4 py-2 w-14 text-sm font-normal leading-normal hidden sm:table-cell">
                    <div className="relative w-10 h-10">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                      />
                    </div>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#1b0e0e] text-sm font-normal leading-normal">
                    <span className="font-medium">{product.name}</span>
                    <div className="block md:hidden text-xs text-gray-500">
                        ${product.price.toFixed(2)} - Stock: {product.stock}
                        {product.preservedStock ? ` (Pres: ${product.preservedStock})` : ''}
                    </div>
                     <div className="block lg:hidden text-xs text-gray-500 truncate" title={product.walletAddress}>
                        Wallet: {product.walletAddress}
                    </div>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-sm font-normal leading-normal hidden md:table-cell">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-sm font-normal leading-normal hidden md:table-cell">
                    {product.stock}
                    {product.preservedStock ? <span className="text-xs"> (Pres: {product.preservedStock})</span> : ''}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-[#994d51] text-xs font-normal leading-normal hidden lg:table-cell truncate" title={product.walletAddress}>
                    {product.walletAddress}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                    <span
                      className={`flex min-w-[70px] max-w-full sm:max-w-xs items-center justify-center overflow-hidden rounded-lg h-7 px-2 text-xs font-medium leading-normal ${getStatusClass(product.status)}`}
                    >
                      <span className="truncate">{product.status}</span>
                    </span>
                  </td>
                  <td className="h-[72px] px-4 py-2 text-sm font-bold leading-normal tracking-[0.015em] whitespace-nowrap">
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="text-[#e92932] hover:underline mr-2 text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-500 hover:text-red-700 hover:underline text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
               {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-[#994d51]">No products match your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* TODO: Pagination for products */}
    </div>
  );
}

// TODO: Create /admin/products/new page and /admin/products/edit/[id] page or use modals.
