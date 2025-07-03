import Image from 'next/image';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import type { Product } from '@/types/product'; // Assuming Product type is suitable, or create a ProductDetail type
import { notFound } from 'next/navigation'; // For handling not found products

// Placeholder icons (can be replaced with an icon library)
const StarIcon = (props: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={props.filled ? "currentColor" : "none"} viewBox="0 0 256 256" stroke={props.filled ? "none" : "currentColor"} strokeWidth={props.filled ? 0 : 16} {...props}>
    <path d="M239.2,97.4A16.4,16.4,0,0,0,224.6,86l-59.4-8.6L138.5,23a16.5,16.5,0,0,0-30.2,0L81.6,77.4,22.2,86a16.4,16.4,0,0,0-9.6,27.9l43,41.9L45.2,215a16.5,16.5,0,0,0,24,17.3L128,203.4l53.8,28.9a16.5,16.5,0,0,0,24-17.3l-10.4-59.2,43-41.9A16.4,16.4,0,0,0,239.2,97.4Z"></path>
  </svg>
);
const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M232,96a24,24,0,0,0-21.72-24H168V48a24,24,0,0,0-24-24H80A24,24,0,0,0,56,48v64H32a8,8,0,0,0,0,16H56v88a8,8,0,0,0,16,0V128h88a24,24,0,0,0,21.72-24H200a8,8,0,0,0,0-16h-4.28A23.93,23.93,0,0,0,200,96Zm-40,8a8,8,0,0,1-8,8H72V48a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8v72h32A8,8,0,0,1,192,104Z"></path></svg>
);
const ThumbsDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M232,152a8,8,0,0,1-16,0V64H160a24,24,0,0,0-24,24v24a8,8,0,0,1-16,0V88A24,24,0,0,0,96,64H32a8,8,0,0,1,0-16H96a24,24,0,0,0,24-24V16a8,8,0,0,1,16,0V37.72A24,24,0,0,0,160,24h48a24,24,0,0,1,24,24ZM72,128H184a8,8,0,0,0,0-16H72a8,8,0,0,0-8,8,8,8,0,0,0,8,8Z" transform="rotate(180, 128, 128)"></path></svg>
);

// Define a more detailed product type if necessary, including reviews etc.
// For now, using existing Product and adding mock review data.
interface Review {
  id: string;
  user: string;
  avatarUrl: string;
  date: string;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
}
interface RatingDistribution {
  stars: number;
  percentage: number;
}
interface ProductDetail extends Product {
  images?: string[]; // Product mock has multiple images
  size?: string; // Example from mock
  color?: string; // Example from mock
  // Review data might come from a separate API or be embedded
  // For now, adding as optional fields for the mock structure
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  ratingDistribution?: RatingDistribution[];
}


async function getProductDetails(id: string): Promise<ProductDetail | null> {
  try {
    const product = await apiGet<ProductDetail>(`/products/${id}`);
    // Mock additional details not present in basic Product type for now
    // In a real scenario, the backend would provide all necessary details
    const mockDetails = {
      images: product.imageUrl ? [product.imageUrl, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsIt3BX1EgW4qP-5TIOWFFKhGF3-Wme8JPBfM4i-ihu26vRmjwjlZYhY-38tIgQge521BToPiVs5jJNXpnYUOxzA81-tlkMpHAevxzLda7s4zWaRUAgyrDBGUspf6OdDCftThNxF795o6OqWmw6m36iAM3m3F4VYteWE82N9l0idk3aawhHmwqSIT4suC3nIpjDaabrhO9JRcgZaq7EeeouYY4sWVy4ck46nqwqUPjrIA2xO2_YMs0LbF2uiJLtMR-DEs6bBcW5jA'] : [],
      size: "32",
      color: "Blue",
      rating: 4.5,
      reviewsCount: 125,
      reviews: [
        { id: 'r1', user: "Ethan Carter", avatarUrl: "https://i.pravatar.cc/40?u=ethan", date: "2023-08-15", rating: 5, text: "These jeans fit perfectly...", likes: 25, dislikes: 2 },
        { id: 'r2', user: "Liam Harper", avatarUrl: "https://i.pravatar.cc/40?u=liam", date: "2023-07-22", rating: 4, text: "Great jeans for the price...", likes: 18, dislikes: 3 },
      ],
      ratingDistribution: [
        { stars: 5, percentage: 40 }, { stars: 4, percentage: 30 }, { stars: 3, percentage: 15 }, { stars: 2, percentage: 10 }, { stars: 1, percentage: 5 },
      ]
    };
    return { ...product, ...mockDetails };
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null; // Return null or throw specific error
  }
}

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const product = await getProductDetails(params.id);

  if (!product) {
    notFound(); // Use Next.js notFound utility
  }

  // Fallback for images if not provided by API in the expected way
  const displayImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];


  return (
    <div className="bg-[#fbf9f9] text-[#191011]"> {/* Styles from product-details.html body */}
      {/* Breadcrumbs - from mock */}
      <div className="flex flex-wrap gap-2 p-4">
        <Link className="text-[#8b5b5d] text-base font-medium leading-normal" href="/">Home</Link>
        <span className="text-[#8b5b5d] text-base font-medium leading-normal">/</span>
        {/* TODO: Make category dynamic if available */}
        <span className="text-[#191011] text-base font-medium leading-normal">Product</span>
      </div>

      {/* Product Images */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {displayImages.map((imgSrc, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl relative">
              <Image
                src={imgSrc || '/placeholder-image.png'} // Fallback image
                alt={`${product.name} - Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Product Info */}
      <h1 className="text-[#191011] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
        {product.name}
      </h1>
      <p className="text-[#191011] text-base font-normal leading-normal pb-3 pt-1 px-4">
        {product.description}
      </p>
      {product.size && <p className="text-[#8b5b5d] text-sm font-normal leading-normal pb-3 pt-1 px-4">Size: {product.size}</p>}
      {product.color && <p className="text-[#8b5b5d] text-sm font-normal leading-normal pb-3 pt-1 px-4">Color: {product.color}</p>}
      <p className="text-[#191011] text-lg font-semibold leading-normal pb-3 pt-1 px-4">Price: ${product.price.toFixed(2)}</p>
      <p className="text-[#8b5b5d] text-sm font-normal leading-normal pb-3 pt-1 px-4">Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</p>
      <p className="text-[#8b5b5d] text-xs font-normal leading-normal pb-3 pt-1 px-4">Seller Wallet: {product.walletAddress}</p>


      {/* Add to Cart Button - Functionality to be added (client component needed) */}
      <div className="flex px-4 py-3 justify-start">
        {/* This button will need to be a client component or trigger a server action */}
        <button
          // onClick={handleAddToCart} // Needs to be client component
          disabled={product.stock === 0}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e8b4b7] text-[#191011] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-pink-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span className="truncate">{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>

      {/* Customer Reviews Section - Assuming product.reviews is populated */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="px-4 py-3">
          <h2 className="text-[#191011] text-xl font-bold leading-tight tracking-[-0.015em] py-5">Customer Reviews</h2>
          <div className="flex flex-col gap-8">
            {/* Overall Rating */}
            {product.rating && product.reviewsCount && product.ratingDistribution && (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-4xl font-bold text-[#191011]">{product.rating.toFixed(1)}</p>
                  <div className="flex text-[#191011]">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < Math.floor(product.rating!)} className={i < Math.floor(product.rating!) ? "text-[#191011]" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-sm text-[#8b5b5d]">{product.reviewsCount} reviews</p>
                </div>
                {/* Rating Distribution */}
                <div className="flex-1 flex flex-col gap-1">
                  {product.ratingDistribution.map(dist => (
                    <div key={dist.stars} className="flex items-center gap-2 text-sm">
                      <span>{dist.stars}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-[#e8b4b7] h-2 rounded-full" style={{ width: `${dist.percentage}%` }}></div>
                      </div>
                      <span className="text-[#8b5b5d]">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Reviews */}
            <div className="border-t border-gray-200 pt-8 flex flex-col gap-8">
              {product.reviews.map(review => (
                <div key={review.id} className="flex gap-4">
                  <Image className="h-10 w-10 rounded-full" src={review.avatarUrl} alt={review.user} width={40} height={40} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#191011]">{review.user}</p>
                      <p className="text-sm text-[#8b5b5d]">{review.date}</p>
                    </div>
                    <div className="flex text-[#191011] my-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < review.rating} className={i < review.rating ? "text-[#191011]" : "text-gray-300"}/>
                      ))}
                    </div>
                    <p className="text-[#191011] mt-2">{review.text}</p>
                    {/* Like/Dislike functionality would require client component and state */}
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#8b5b5d]">
                      <button className="flex items-center gap-1"><ThumbsUpIcon /> <span>{review.likes}</span></button>
                      <button className="flex items-center gap-1"><ThumbsDownIcon /> <span>{review.dislikes}</span></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
