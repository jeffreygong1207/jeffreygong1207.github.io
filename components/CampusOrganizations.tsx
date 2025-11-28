export default function CampusOrganizations() {
  const organizations = [
    {
      name: "HKN (EECS Honor Society)",
      role: "Member",
    },
    {
      name: "CSM (Computer Science Mentors)",
      role: "Mentor",
    },
    {
      name: "Venture Strategy Solutions",
      role: "Project Manager",
    },
    {
      name: "BerkeleyTime",
      role: "Developer",
    },
    {
      name: "CS 70 Course Staff",
      role: "Course Staff",
    },
  ];

  return (
    <section
      id="campus-organizations"
      className="py-12 border-t border-gray-200"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">
          Campus Organizations
        </h2>
        <div className="space-y-2">
          {organizations.map((org, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-baseline"
            >
              <span className="font-medium text-gray-900">{org.name}</span>
              {org.role && (
                <span className="text-gray-600 md:ml-2">{org.role}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
