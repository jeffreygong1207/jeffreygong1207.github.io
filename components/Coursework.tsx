export default function Coursework() {
  const coursework = [
    {
      semester: "Fall 2023",
      courses: [
        "COMPSCI 61A - The Structure and Interpretation of Computer Programs",
        "ECON 2 - Introduction to Economics",
        "EECS 16A - Designing Information Devices and Systems I",
        "UGBA 10 - Principles of Business",
        "UGBA 196 - Special Topics in Business Administration",
        "UGBA 198 - Investment Banking",
      ],
    },
    {
      semester: "Spring 2024",
      courses: [
        "COMLIT 60AC - Topics in the Literature of American Cultures",
        "COMPSCI 61B - Data Structures",
        "EECS 16B - Designing Information Devices and Systems II",
        "ELENG 198 - Hands on PCB Engineering",
        "UGBA 102A - Financial Accounting",
        "UGBA 105 - Leading People",
      ],
    },
    {
      semester: "Summer 2024",
      courses: ["COMPSCI 70 - Discrete Mathematics and Probability Theory"],
    },
    {
      semester: "Fall 2024",
      courses: [
        "COMPSCI 61C - Great Ideas of Computer Architecture (Machine Structures)",
        "COMPSCI 170 - Efficient Algorithms and Intractable Problems",
        "STAT 20 - Introduction to Probability and Statistics",
        "UGBA 101B - Macroeconomic Analysis for Business Decisions",
        "UGBA 107 - The Social, Political, and Ethical Environment of Business",
      ],
    },
    {
      semester: "Spring 2025",
      courses: [
        "COMPSCI 161 - Computer Security",
        "COMPSCI 189 - Introduction to Machine Learning",
        "COMPSCI 195 - Social Implications of Computer Technology",
        "COMPSCI 198 - System Administration (Linux)",
        "DATA C100 - Principles & Techniques of Data Science",
        "UGBA 101A - Microeconomic Analysis for Business Decisions",
      ],
    },
    {
      semester: "Fall 2025",
      courses: [
        "COMPSCI 164 - Programming Languages and Compilers",
        "COMPSCI 197 - Field Study",
        "ECON 162 - The Chinese Economy",
        "EECS 127 - Optimization Models in Engineering",
        "UGBA 196 - Special Topics in Business Administration",
      ],
    },
    {
      semester: "Spring 2026",
      courses: [
        "COMPSCI 162 - Operating Systems and System Programming",
        "COMPSCI 185 - Deep Reinforcement Learning, Decision Making, and Control",
        "PHYSICS 7B - Physics for Scientists and Engineers",
        "UGBA 100 - Business Communication",
        "UGBA 103 - Introduction to Finance",
      ],
    },
  ];

  return (
    <section id="coursework" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Coursework</h2>
        <div className="space-y-6">
          {coursework.map((semester, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2">
                {semester.semester}
              </h3>
              <div className="space-y-0.5 text-gray-700">
                {semester.courses.map((course, courseIndex) => (
                  <div key={courseIndex}>{course}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
