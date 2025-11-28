export default function Teaching() {
  const teaching = [
    "CSM for CS 70, Fall 2024",
    "CSM for CS 61B, Spring 2025",
  ];

  return (
    <section id="teaching" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Teaching</h2>
        <div className="space-y-2">
          {teaching.map((item, index) => (
            <p key={index} className="text-gray-700">{item}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

