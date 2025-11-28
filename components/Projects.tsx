'use client';

import Image from "next/image";

export default function Projects() {
  const projects = [
    {
      title: "Secure File Sharing System",
      description: "Built an end-to-end encrypted file sharing system with secure storage, access control, and revocation across untrusted infrastructure. Worked on user authentication, per-file encryption, and key-management logic. Implemented fine-grained sharing and revocation semantics for hierarchical sharing.",
      technologies: [],
      image: "/images/project1.jpg",
      links: {},
    },
    {
      title: "BetterUp",
      description: "Engineered an automated content auditing system reducing auditing time by 95% (from 3+ weeks to 2-4 hours) across 5,000+ courses, and implemented a scalable dashboard platform using React and Next.js for visualizing coach activity and generating performance metrics.",
      technologies: ["React", "Next.js", "Python", "Pandas", "AWS EC2", "Vercel", "Firebase"],
      image: "/images/project2.jpg",
      links: {},
    },
    {
      title: "Clearway Energy",
      description: "Automated energy production data verification resulting in a 30% increase in processing efficiency, engineered a scalable data processing platform for 200k+ records, and developed ETL pipelines for 2000+ customers.",
      technologies: ["Python", "SQL", "Pandas", "Power BI"],
      image: "/images/project3.jpg",
      links: {},
    },
    {
      title: "BerkeleyTime",
      description: "Architected real-time enrollment system using WebSockets and UCB API, implementing data caching with 30k+ users, developed fuzzy search functionality with vector database integration and built ML course recommendation engine.",
      technologies: ["Docker", "TypeScript", "Python", "Redis"],
      image: "/images/project4.jpg",
      links: {},
    },
    {
      title: "Posthuman",
      description: "Engineered full-stack asset management system, fine-tuning Mistral models for OCR on financial analysis and custom chat, built agent automation with LangChain and implemented Ethereum/EigenLayer validation for secure asset management.",
      technologies: ["TypeScript", "LangChain", "Flask"],
      image: "/images/project5.jpg",
      links: {},
    },
    {
      title: "AI-SL",
      description: "Developed a real-time ASL video generation platform (web app & Chrome extension) to enhance language accessibility, implemented an ML pipeline for animation via vector search (Supabase) and real-time pose extraction (MediaPipe).",
      technologies: ["Python", "React", "MediaPipe", "Supabase"],
      image: "/images/project6.jpg",
      links: {},
    },
  ];

  return (
    <section id="projects" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Projects</h2>
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 w-full md:w-48 h-32 relative bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-gray-400 text-xs hidden">Image placeholder</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-700 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 underline text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 underline text-sm"
                    >
                      Demo
                    </a>
                  )}
                  {project.links.paper && (
                    <a
                      href={project.links.paper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 underline text-sm"
                    >
                      Paper
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
