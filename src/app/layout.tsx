import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "4K Ternos | Elegância que veste você",
    template: "%s | 4K Ternos",
  },
  description: "Catálogo de ternos e provador virtual da 4K Ternos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-neutral-900 text-neutral-100`}
      >
        {children}
      </body>
    </html>
  );
}
