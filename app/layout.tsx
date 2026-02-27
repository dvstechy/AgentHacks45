import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentHacks IMS | Modern Inventory Management",
  description: "Next-generation inventory operations by Team AgentHacks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
