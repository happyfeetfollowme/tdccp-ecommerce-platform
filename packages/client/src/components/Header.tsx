import Link from 'next/link';
import Image from 'next/image';

// Placeholder for ShoppingCart icon (Heroicons or similar)
const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

// Placeholder for User icon
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// Placeholder for Site Logo icon
const SiteLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
  </svg>
);

const Header = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f3e7e8] px-10 py-3 bg-[#fcf8f8]">
      <Link href="/" className="flex items-center gap-4 text-[#1b0e0e]">
        <div className="size-4">
          <SiteLogoIcon className="h-full w-full" />
        </div>
        <h2 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em]">
          Crafty
        </h2>
      </Link>
      <div className="flex flex-1 justify-end gap-2">
        <Link
          href="/cart"
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#f3e7e8] text-[#1b0e0e] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
        >
          <ShoppingCartIcon className="text-[#1b0e0e] h-5 w-5" />
        </Link>
        <Link
          href="/user"
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCzFDd_wC2OW50ClqQyqlwFL-veLbdFgteS5u_dFarV-XpfOPWOpIy9MaxxT_cCfsFw0HULDusEReLNJ7CYCtjeDI1CeuJRNxouznYu0k8CKdDTpjuml2PxU2crsz7kV0pAkd8-TnYsN_jsaVEDLbP2qJ1GGUgzbFqOBSu96FqKZsSoRkVMxdNZBHxRxxwaE-LGxJHOMxni7hfk9VE-otKUO1_lI-etocCrM2GzLMkN8qW9eQJQcg0WCvVGlQxjiAmhePe-l6Xb58")'
            // TODO: Replace with actual user avatar or a UserIcon if not logged in / no avatar
          }}
        >
           {/* Fallback if image fails or for users without avatar - currently covered by bg image */}
           {/* <UserIcon className="text-[#1b0e0e] h-6 w-6" /> */}
        </Link>
      </div>
    </header>
  );
};

export default Header;
