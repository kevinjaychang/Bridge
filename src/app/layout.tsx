import type { Metadata } from "next";
import "@/styles/globals.css";
import TopHeader from "@/components/navigation/TopHeader";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

export const metadata: Metadata = {
  title: "Bridge Protocol",
  description: "A new way to govern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Sticky Header */}
          <TopHeader />

          {/* Main Content */}
          <main className="flex-grow pb-24 sm:pb-0">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}
