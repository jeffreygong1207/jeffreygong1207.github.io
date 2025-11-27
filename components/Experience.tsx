export default function Experience() {
  const experiences = [
    {
      position: "Software Engineer Intern",
      organization: "Tech Company",
      location: "San Francisco, CA",
      date: "Summer 2024",
      description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver features on time.",
    },
    {
      position: "Research Assistant",
      organization: "University Research Lab",
      location: "University Name",
      date: "2023 - 2024",
      description: "Conducted research on machine learning applications. Published findings in top-tier conferences.",
    },
    {
      position: "Teaching Assistant",
      organization: "Computer Science Department",
      location: "University Name",
      date: "Fall 2023",
      description: "Assisted in teaching Introduction to Computer Science. Graded assignments and held office hours.",
    },
  ];

  return (
    <section id="experience" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Experience</h2>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index}>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{exp.position}</h3>
                  <p className="text-gray-700">
                    {exp.organization} {exp.location && `• ${exp.location}`}
                  </p>
                </div>
                <p className="text-gray-600 text-sm md:ml-4">{exp.date}</p>
              </div>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
