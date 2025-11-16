import type { Metadata } from "next";
import localFont from "next/font/local";
import { metadata as brandMetadata } from "@/lib/brand";
import "./globals.css";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
// import "@milkdown/kit/prose/view/style/prosemirror.css";
import "./milkdown-override.css";
import { Providers } from "@/components/providers";

const inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  weight: "100 900",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = brandMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
