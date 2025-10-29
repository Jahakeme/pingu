import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Inconsolata } from "next/font/google";
import NextAuthProvider from "../utils/providers/NextAuthProvider";
import ReactQueryProvider from "../utils/providers/ReactQueryProvider";
import { FormProvider } from "@/contexts/FormContext";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Pingu",
  description: "A simple chatroom application built with Next.js by Jucal using websockets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inconsolata.variable} antialiased`}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <FormProvider>
              <main>{children}</main>
            </FormProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
