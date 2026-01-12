export default function CampusOrganizations() {
  const organizations = [
    {
      name: "HKN (EECS Honor Society)",
      role: "Member",
      link: "https://hkn.eecs.berkeley.edu/",
    },
    {
      name: "CSM (Computer Science Mentors)",
      role: "Mentor",
      link: "https://csmentors.studentorg.berkeley.edu/#/",
    },
    {
      name: "Venture Strategy Solutions",
      role: "Project Manager",
      link: "https://www.berkeleyvss.com/",
    },
    {
      name: "BerkeleyTime",
      role: "Developer",
      link: "https://beta.berkeleytime.com/",
    },
    {
      name: "Open Innovation Squad",
      role: "Member",
      link: "https://haas.berkeley.edu/open-innovation/",
    },
  ];

  return (
    <section
      id="campus-organizations"
      className="py-12 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
          Campus Organizations
        </h2>
        <div className="space-y-2">
          {organizations.map((org, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-baseline"
            >
              {org.link ? (
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {org.name}
                </a>
              ) : (
                <span className="font-medium text-gray-900">{org.name}</span>
              )}
              {org.role && (
                <span className="text-gray-900 md:ml-2">{org.role}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
