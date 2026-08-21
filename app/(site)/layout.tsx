import Navigation from "@/components/Navigation";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </>
  );
}
