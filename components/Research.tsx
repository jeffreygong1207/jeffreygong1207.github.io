export default function Research() {
  const research = [
    {
      title: "Research Project Title",
      description: "Brief description of your research work, findings, and contributions.",
      collaborators: "Collaborator names if applicable",
      links: {
        paper: "https://arxiv.org/abs/xxxx.xxxxx",
        code: "https://github.com/yourusername/research-project",
      },
    },
  ];

  return (
    <section id="research" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Research</h2>
        <div className="space-y-6">
          {research.map((project, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
              {project.collaborators && (
                <p className="text-gray-600 text-sm mb-2">{project.collaborators}</p>
              )}
              <p className="text-gray-700 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-4">
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
                {project.links.code && (
                  <a
                    href={project.links.code}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 underline text-sm"
                  >
                    Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

