export default function Contact() {
  return (
    <section id="contact" className="py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">Contact</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Feel free to reach out if you'd like to collaborate or have any questions.
          </p>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href="mailto:jeffreygong@berkeley.edu"
                className="text-gray-700 hover:text-gray-900 underline"
              >
                jeffreygong@berkeley.edu
              </a>
            </p>
            <p>
              <span className="font-semibold">GitHub:</span>{" "}
              <a
                href="https://github.com/jeffreygong1207"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 underline"
              >
                github.com/jeffreygong1207
              </a>
            </p>
            <p>
              <span className="font-semibold">LinkedIn:</span>{" "}
              <a
                href="https://www.linkedin.com/in/jeffreygongla/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 underline"
              >
                linkedin.com/in/jeffreygongla
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
