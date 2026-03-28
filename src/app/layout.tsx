import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import AppFrame from "@/components/layout/AppFrame";

export const metadata: Metadata = {
  title: "Bridge Protocol",
  description: "A new way to govern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
