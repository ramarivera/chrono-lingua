import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "../../public/fonts/geist-sans-variable.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: "../../public/fonts/geist-mono-variable.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ChronoLingua",
  description:
    "Parse and format dates in natural language across multiple locales",
  icons: {
    icon: "/chronolingua.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
