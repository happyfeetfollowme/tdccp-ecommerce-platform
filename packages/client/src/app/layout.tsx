import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // Import the Header component

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "700", "800"], // Weights from mock-ui
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700", "900"], // Weights from mock-ui
});

export const metadata: Metadata = {
  title: "Crafty E-commerce", // Updated title
  description: "Your one-stop shop for unique crafts.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${notoSans.variable} antialiased bg-[#fcf8f8] group/design-root text-[#1b0e0e]`}
        style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }} // Set default font family
      >
        <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden">
          <Header />
          <main className="layout-container flex h-full grow flex-col">
            {/* Removed px-40 and other styling from mock-ui index.html body as it should be page-specific */}
            <div className="flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
                {children}
              </div>
            </div>
          </main>
          {/* Footer can be added here if a global footer is decided upon */}
        </div>
      </body>
    </html>
  );
}
