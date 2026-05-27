import type { Metadata } from "next";
import NextAuthProvider from "../utils/providers/NextAuthProvider";
import ReactQueryProvider from "../utils/providers/ReactQueryProvider";
import { FormProvider } from "@/contexts/FormContext";
import { inconsolata } from "@/lib/fonts";
import "./globals.css";

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
