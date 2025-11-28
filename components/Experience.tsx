"use client";

import Image from "next/image";

export default function Experience() {
  const experiences = [
    {
      organization: "Snowflake",
      position: "Software Engineering Intern",
      team: "Database Observability",
      date: "Sep 2025 - Present",
      description:
        "Worked on a predictive observability pipeline for anomaly detection and time-series forecasting. Built portions of a full-stack observability platform for real-time database monitoring.",
      image: "/images/companies/snowflake.png",
    },
    {
      organization: "Wells Fargo",
      position: "Software Engineering Intern",
      team: "Digital Technology and Innovation Team",
      date: "May 2025 – Aug 2025",
      description:
        "Worked on RAG-based pipelines for API generation, stub management systems, and data sanitization for LLM fine-tuning.",
      image: "/images/companies/wellsfargo.png",
    },
    {
      organization: "Jacobi Robotics",
      position: "Product Manager Intern",
      team: "User Functionality Team",
      date: "Sep 2024 – Present",
      description:
        "Working on a frontend GUI and UI/UX for robotic arm dispensing functionality, backend tooling to translate no-code instructions into executable scripts, and UX walkthroughs.",
      image: "/images/companies/jacobi.png",
    },
    {
      organization: "Nowadays AI",
      position: "Software Engineering Intern",
      team: "Development and Product Team",
      date: "Jun 2024 - Aug 2024",
      description:
        "Worked on a personalized ranking system, restaurant database curation, and group flights functionality.",
      image: "/images/companies/nowadays.png",
    },
    {
      organization: "Boeing",
      position: "Program Management Intern",
      team: "787 and Talent Development Team",
      date: "Jun 2023 - Aug 2023",
      description:
        "Worked on talent development program planning, material fabric analysis for the 787 Dreamliner Program, CST-100 Starliner testing, and web development for internal internship website.",
      image: "/images/companies/boeing.png",
    },
  ];

  return (
    <section id="experience" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-8">Experience</h2>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 relative">
                  <Image
                    src={exp.image}
                    alt={exp.organization}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {exp.organization}
                    </h3>
                    <p className="text-gray-600 italic">{exp.position}</p>
                    {exp.team && (
                      <p className="text-gray-500 text-sm">{exp.team}</p>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
