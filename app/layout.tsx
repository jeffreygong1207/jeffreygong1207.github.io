import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Jeffrey Gong",
  description: "Personal website showcasing coursework, experience, projects, and contact information",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: false,
    follow: false,
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

