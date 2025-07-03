export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  preservedStock: number;
  walletAddress: string;
  // Add category, brand, custom attributes if they become available from API
}

// Interface for API response if it's a list of products (e.g., with pagination)
export interface ProductListResponse {
  products: Product[];
  totalProducts: number;
  // Add other pagination fields like currentPage, totalPages if applicable
}
