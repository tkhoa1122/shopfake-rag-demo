import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { Toaster } from "sonner"; // I'll use sonner as it's in package.json

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShoppeFake Storefront",
  description: "Your modern shopping experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
          <Toaster position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
