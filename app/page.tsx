import About from "@/components/About";
import Coursework from "@/components/Coursework";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto">
        <About />
        <Coursework />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </main>
  );
}
