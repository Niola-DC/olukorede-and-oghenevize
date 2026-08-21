import Hero from "./components/Hero";
import CountdownSection from "./components/CountdownSection";
import OurStory from "./components/OurStory";
import Program from "./components/Program";
import GamesSection from "./components/GamesSection";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <CountdownSection />
      <OurStory />
      <Gallery />
      <GamesSection />
      <Program />
      <Footer />
    </div>
  );
}
