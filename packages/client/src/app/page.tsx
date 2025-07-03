import ProductCard from '@/components/ProductCard';
import { apiGet } from '@/lib/api';
import type { Product } from '@/types/product';
// Removed Link as it's not used directly here after changes

// Placeholder icons - ideally from a library like Heroicons or Lucid React
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);

const CaretDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
  </svg>
);

async function getProducts(): Promise<Product[]> {
  try {
    // Assuming the API returns an array of products directly or an object like { products: Product[] }
    // Adjust based on actual API response structure. For now, assuming Product[]
    const productData = await apiGet<Product[]>('/products');
    // If API returns { products: Product[] }, then:
    // const productData = await apiGet<{products: Product[]}>('/products');
    // return productData.products;
    return productData; // Adjust if the API wraps the array in an object
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return []; // Return empty array on error
  }
}

export default async function HomePage() {
  const products = await getProducts();
  // TODO: Add state and handlers for search and filters (will require client component or different strategy)
  // For now, search and filter buttons are just UI elements.

  return (
    <>
      {/* Search Bar */}
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#994d51] flex border-none bg-[#f3e7e8] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <MagnifyingGlassIcon />
            </div>
            <input
              placeholder="Search for items or shops"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] focus:outline-0 focus:ring-0 border-none bg-[#f3e7e8] focus:border-none h-full placeholder:text-[#994d51] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              // TODO: Implement search functionality
            />
          </div>
        </label>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 p-3 flex-wrap pr-4">
        {/* TODO: Implement filter functionality */}
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f3e7e8] pl-4 pr-2">
          <p className="text-[#1b0e0e] text-sm font-medium leading-normal">Price</p>
          <CaretDownIcon className="text-[#1b0e0e]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f3e7e8] pl-4 pr-2">
          <p className="text-[#1b0e0e] text-sm font-medium leading-normal">Category</p>
          <CaretDownIcon className="text-[#1b0e0e]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f3e7e8] pl-4 pr-2">
          <p className="text-[#1b0e0e] text-sm font-medium leading-normal">Newest</p>
          <CaretDownIcon className="text-[#1b0e0e]" />
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f3e7e8] pl-4 pr-2">
          <p className="text-[#1b0e0e] text-sm font-medium leading-normal">Popular</p>
          <CaretDownIcon className="text-[#1b0e0e]" />
        </button>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id} // Pass necessary props from the Product type
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              // walletAddress={product.walletAddress} // if needed by ProductCard
            />
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-[#994d51]">
          No products found. Check back later!
        </div>
      )}
    </>
  );
}
