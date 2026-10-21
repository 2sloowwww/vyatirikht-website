import Nav from './components/Nav.jsx';
import Hud from './components/Hud.jsx';
import Hero from './components/Hero.jsx';
import Brands from './components/Brands.jsx';
import Shoot from './components/Shoot.jsx';
import Edit from './components/Edit.jsx';
import Build from './components/Build.jsx';
import Grow from './components/Grow.jsx';
import How from './components/How.jsx';
import Journal from './components/Journal.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Cursor from './components/Cursor.jsx';
import { useSmoothScroll, useHashLanding } from './lib/smooth.js';

export default function App() {
  useSmoothScroll();
  useHashLanding();
  return (
    <>
      <a className="skip-link" href="#shoot">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <Brands />
        <Shoot />
        <Edit />
        <Build />
        <Grow />
        <How />
        <Journal />
        <Contact />
      </main>
      <Footer />
      <Hud />
      <Cursor />
    </>
  );
}
