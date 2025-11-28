'use client';

import Image from "next/image";

export default function Projects() {
  const projects = [
    {
      title: "AI-SL",
      description: "Real-time ASL video generation platform (web app & Chrome extension) for language accessibility. Worked on ML pipeline for animation via vector search and real-time pose extraction.",
      technologies: ["Python", "React", "MediaPipe", "Supabase"],
      image: "/images/ai-sl.jpg",
      links: {
        github: "https://github.com/deenasun/ai-sl/tree/main",
      },
    },
    {
      title: "Posthuman",
      description: "Full-stack asset management system with Mistral models for OCR and financial analysis. Built agent automation with LangChain and Ethereum/EigenLayer validation.",
      technologies: ["TypeScript", "LangChain", "Flask"],
      image: "/images/posthuman.jpg",
      links: {
        github: "https://github.com/r-agni/posthuman",
      },
    },
    {
      title: "Secure File Sharing System",
      description: "End-to-end encrypted file sharing system with secure storage, access control, and revocation. Worked on user authentication, per-file encryption, and key-management logic.",
      technologies: [],
      image: "/images/secure-file-sharing.jpg",
      links: {},
    },
    {
      title: "BerkeleyTime",
      description: "Real-time enrollment system using WebSockets and UCB API with data caching. Developed fuzzy search functionality and ML course recommendation engine.",
      technologies: ["Docker", "TypeScript", "Python", "Redis"],
      image: "/images/berkeleytime.jpg",
      links: {},
    },
    {
      title: "BetterUp",
      description: "Automated content auditing system and scalable dashboard platform for visualizing coach activity and generating performance metrics.",
      technologies: ["React", "Next.js", "Python", "Pandas", "AWS EC2", "Vercel", "Firebase"],
      image: "/images/betterup.jpg",
      links: {},
    },
    {
      title: "Impression",
      description: "iPad app that predicts early onset dementia by analyzing drawing motions. Worked on machine learning algorithms to analyze touch sensor data.",
      technologies: ["Swift", "FastAPI", "Amazon Web Services", "Uvicorn"],
      image: "/images/impression.jpg",
      links: {
        github: "https://github.com/oliver-yangluo-chen/Impression",
      },
    },
    {
      title: "Clearway Energy",
      description: "Automated energy production data verification and scalable data processing platform. Developed ETL pipelines for customers.",
      technologies: ["Python", "SQL", "Pandas", "Power BI"],
      image: "/images/clearway.jpg",
      links: {},
    },
    {
      title: "NASA Techrise Challenge - ORBS",
      description: "Worked on CS portions of NASA Techrise Challenge winning project. Programmed M4 Metro Microcontroller using C++ to control LED lighting and cameras for monitoring biodegradable pods during suborbital flight.",
      technologies: ["C++", "Microcontroller Programming"],
      image: "/images/nasa-orbs.jpg",
      links: {},
    },
  ];

  return (
    <section id="projects" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Projects</h2>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 w-full md:w-32 h-24 relative bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
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
                <h3 className="text-base font-semibold mb-1">{project.title}</h3>
                <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
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
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Demo
                    </a>
                  )}
                  {project.links.paper && (
                    <a
                      href={project.links.paper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
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
