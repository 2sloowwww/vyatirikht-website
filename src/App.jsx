import Ambient from './components/Ambient.jsx';
import Nav from './components/Nav.jsx';
import SectionNav from './components/SectionNav.jsx';
import Hero from './components/Hero.jsx';
import TechWall from './components/TechWall.jsx';
import WebWork from './components/WebWork.jsx';
import BrandWall from './components/BrandWall.jsx';
import Services from './components/Services.jsx';
import Films from './components/Films.jsx';
import Journal from './components/Journal.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Ambient />
      <Nav />
      <SectionNav />
      <Hero />
      <main>
        <TechWall />
        <WebWork />
        <BrandWall />
        <Services />
        <Journal />
        <Films />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
