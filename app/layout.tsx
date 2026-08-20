import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
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
  // Previously noindex site-wide. A blog nobody can find is not a blog, so
  // indexing is on here and the pages that must stay out -- /admin, /login,
  // unlisted posts -- set robots themselves.
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
        <Navigation />
        <main className="min-h-screen pt-8 pb-16">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

