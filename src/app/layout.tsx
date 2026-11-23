import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Lakshmi Agency | Your Needs... Our Priority...",
  description: "Premier E-Commerce Review & Deal Mediation Platform",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-lotus-500 selection:text-white">
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#520D38",
                color: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #D4AF37",
                fontSize: "13px",
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
