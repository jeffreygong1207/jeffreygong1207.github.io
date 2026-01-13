import ProfilePicture from "./ProfilePicture";

export default function About() {
  return (
    <section id="about" className="py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 order-2 md:order-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              Jeffrey Gong
            </h1>
            <p className="text-lg mb-4 text-gray-900">
              I am a student at UC Berkeley studing EECS and Business in the{" "}
              <a
                href="https://met.berkeley.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Management Entrepreneurship and Technology Program (M.E.T.)
              </a>
              . My interests are in Distributed Systems, ML/AI and various
              fields within software engineering. Always interested in working
              on challenging problems within the field.
            </p>
            <p className="mb-4 text-gray-900">
              I'm currently working on ML evaluation and benchmarking at the{" "}
              <a
                href="https://sky.cs.berkeley.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Sky Computing Lab
              </a>
              .
            </p>
            <p className="mb-4 text-gray-900">
              Feel free to reach out -- I love meeting new people!
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="mailto:jeffreygong@berkeley.edu"
                className="text-blue-600 hover:text-blue-800"
              >
                Email
              </a>
              <a
                href="https://github.com/jeffreygong1207"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/jeffreygongla/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                LinkedIn
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
