import ProfilePicture from "./ProfilePicture";

export default function About() {
  return (
    <section id="about" className="py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 order-2 md:order-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Your Name</h1>
            <p className="text-lg mb-4">
              I am a [position/status] at [Institution]. My research/work focuses on [research interests or work focus].
            </p>
            <p className="mb-4">
              Previously, I [previous experience or education]. I am interested in [interests].
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="mailto:your.email@example.com"
                className="text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500"
              >
                Email
              </a>
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500"
              >
                LinkedIn
              </a>
              <a
                href="/resume.pdf"
                className="text-gray-700 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-500"
              >
                Resume
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <ProfilePicture />
          </div>
        </div>
      </div>
    </section>
  );
}
