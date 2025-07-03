import Link from 'next/link';
import Image from 'next/image'; // Using next/image for optimization

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  // TODO: Add walletAddress if needed on the card, as per Product service schema
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, imageUrl }) => {
  return (
    <div className="flex flex-col gap-3 pb-3">
      <Link href={`/product/${id}`}>
        <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg relative">
          {/* Using next/image for optimized image loading */}
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </Link>
      <div>
        <p className="text-[#1b0e0e] text-base font-medium leading-normal">{name}</p>
        <p className="text-[#994d51] text-sm font-normal leading-normal">${price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
