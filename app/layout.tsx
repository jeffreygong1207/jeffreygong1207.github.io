import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jeffrey Gong",
    template: "%s",
  },
  description: "Personal website showcasing coursework, experience, projects, and contact information",
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    types: { "application/rss+xml": `${siteUrl}/feed.xml` },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script strategy="beforeInteractive">{`document.documentElement.classList.remove('dark');`}</Script>
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans leading-relaxed">
        {children}
      </body>
    </html>
  );
}
