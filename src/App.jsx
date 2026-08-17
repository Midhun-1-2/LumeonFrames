import { Routes, Route, useLocation } from "react-router-dom";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import LensLoader from "@/components/LensLoader";
import PageTransition from "@/components/PageTransition";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

function App() {
  const location = useLocation();

  return (
    <div className="grain-overlay flex min-h-screen flex-col bg-forest">
      {/* Above the router, so it plays once per page load rather than on
          every route change. */}
      <LensLoader />
      <ScrollToTop />
      <Masthead />
      <PageTransition key={location.pathname}>
        <main>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}

export default App;
