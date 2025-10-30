import type { Metadata } from "next";
import "./globals.css";
// Importing Provider in RTK
import  { Providers } from "@/redux/provider";
import { Toaster } from "react-hot-toast";
// Fonts
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
  display: "swap",
});

export const metadata: Metadata = {
  title: "Styles Dispatch EG System",
  description: "Professional Load Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <body
        className={`${roboto.className} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" reverseOrder={false} />

        </Providers>
      </body>
    </html>
  );
}
