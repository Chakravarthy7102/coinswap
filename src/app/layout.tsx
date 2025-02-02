"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/nav";
import WalletContextProvider from "@/context/wallet-context";
import { Button } from "@/components/ui/button";

import { Rabbit } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMetamaskInstalled = typeof window !== "undefined" && !window.ethereum;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {isMetamaskInstalled ? (
          <main className="h-screen items-center flex justify-center text-center">
            <div className="flex h-fit flex-col gap-5 row-start-2 items-center justify-center border max-w-5xl mx-4 py-16 px-6 md:px-32 rounded-md">
              <Rabbit className="text-primary size-10" />
              <p>Please install Metamask on your browser to use this app.</p>
              <Link
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
              >
                <Button>Install Metamask</Button>
              </Link>
            </div>
          </main>
        ) : (
          <WalletContextProvider>
            <Navbar />
            {children}
          </WalletContextProvider>
        )}
      </body>
    </html>
  );
}
