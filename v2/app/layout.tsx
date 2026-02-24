import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calcutta Edge - March Madness Calcutta Auction Strategy Tool",
  description:
    "Fair value calculations, bid recommendations, and round-by-round profit projections powered by devigged sportsbook odds. The only dedicated Calcutta auction strategy tool. $29.99 one-time.",
  keywords: [
    "calcutta auction calculator",
    "march madness calcutta strategy",
    "calcutta auction tool",
    "march madness pool",
    "calcutta bidding strategy",
    "calcutta auction odds",
  ],
  openGraph: {
    title: "Calcutta Edge - Know What Every Team Is Actually Worth",
    description:
      "Devigged sportsbook odds, fair value calculations, bid recommendations, and profit projections for your Calcutta auction.",
    url: "https://calcuttaedge.com",
    siteName: "Calcutta Edge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calcutta Edge - March Madness Calcutta Strategy",
    description:
      "Fair value calculations and profit projections powered by devigged sportsbook odds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark landing-theme">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
