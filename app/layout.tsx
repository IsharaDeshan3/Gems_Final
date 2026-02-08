import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Royal Gem & Jewellery Hub",
  description:
    "Sri Lanka's Premier Gemstone and Jewelry institute",
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Royal Gem & Jewellery Hub",
    description: "Sri Lanka's premier gemstone institute",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <ClientLayout>
          <div className="h-full flex flex-col">
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
              <Toaster position="bottom-left" richColors />
              {children}
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
