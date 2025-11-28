'use client';

export default function Navigation() {
  const navItems = [
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Coursework", href: "#coursework" },
    { name: "Organizations", href: "#campus-organizations" },
    { name: "Projects", href: "#projects" },
    { name: "Teaching", href: "#teaching" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="flex flex-wrap gap-4 md:gap-6 py-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-700 hover:text-gray-900 text-sm md:text-base transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

