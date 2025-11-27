'use client';

import Image from "next/image";

export default function Projects() {
  const projects = [
    {
      title: "Project Title 1",
      description: "A brief description of the project, what it does, and the technologies used. This project demonstrates skills in web development and user interface design.",
      technologies: ["React", "TypeScript", "Node.js"],
      image: "/images/project1.jpg",
      links: {
        github: "https://github.com/yourusername/project1",
        demo: "https://project1-demo.com",
      },
    },
    {
      title: "Project Title 2",
      description: "Another project description highlighting key features and accomplishments. This project showcases expertise in machine learning and data analysis.",
      technologies: ["Python", "TensorFlow", "Pandas"],
      image: "/images/project2.jpg",
      links: {
        github: "https://github.com/yourusername/project2",
        paper: "https://arxiv.org/abs/xxxx.xxxxx",
      },
    },
    {
      title: "Project Title 3",
      description: "A third project that demonstrates different skills and technologies. This could be a mobile app, a research project, or a web application.",
      technologies: ["Next.js", "PostgreSQL", "Docker"],
      image: "/images/project3.jpg",
      links: {
        github: "https://github.com/yourusername/project3",
        demo: "https://project3-demo.com",
      },
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
