export default function Experience() {
  const experiences = [
    {
      organization: "Snowflake",
      position: "Software Engineering Intern",
      date: "Fall 2025",
    },
    {
      organization: "Wells Fargo",
      position: "Software Engineering Intern",
      date: "Summer 2025",
    },
    {
      organization: "Jacobi Robotics",
      position: "Product Manager Intern",
      date: "Fall 2024",
    },
    {
      organization: "Nowadays AI",
      position: "Software Engineering Intern",
      date: "Summer 2024",
    },
    {
      organization: "Boeing",
      position: "Program Management Intern",
      date: "Summer 2023",
    },
  ];

  return (
    <section
      id="experience"
      className="py-12 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
          Experience
        </h2>
        <div className="space-y-2">
          {experiences.map((exp, index) => (
            <p key={index} className="text-gray-900">
              {exp.organization} - {exp.position}, {exp.date}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
