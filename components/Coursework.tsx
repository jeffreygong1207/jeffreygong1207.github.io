export default function Coursework() {
  const coursework = [
    {
      category: "Computer Science",
      courses: [
        "Introduction to Algorithms",
        "Data Structures",
        "Database Systems",
        "Operating Systems",
        "Computer Networks",
      ],
    },
    {
      category: "Mathematics",
      courses: [
        "Linear Algebra",
        "Calculus",
        "Probability and Statistics",
        "Discrete Mathematics",
      ],
    },
    {
      category: "Machine Learning",
      courses: [
        "Introduction to Machine Learning",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
      ],
    },
  ];

  return (
    <section id="coursework" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Coursework</h2>
        <div className="space-y-6">
          {coursework.map((category, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2">{category.category}</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {category.courses.map((course, courseIndex) => (
                  <li key={courseIndex}>{course}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
