import type { Metadata, Viewport } from "next";
import { Outfit, Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nuestra Bucket List",
  description: "Nuestros planes y aventuras",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${quicksand.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
