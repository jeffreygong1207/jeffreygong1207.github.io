import About from "@/components/About";
import Experience from "@/components/Experience";
import Teaching from "@/components/Teaching";
import Research from "@/components/Research";
import Coursework from "@/components/Coursework";
import CampusOrganizations from "@/components/CampusOrganizations";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto">
        <About />
        <Experience />
        <Coursework />
        <CampusOrganizations />
        <Projects />
        <Teaching />
        <Research />
        <Contact />
      </div>
    </main>
  );
}
