import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from './lib/api';

// Import components (which have been ported)
import Navbar from './components/Navbar';
import GlobalLoader from './components/GlobalLoader';
import Hero from './sections/Hero';
import StatsDark from './sections/StatsDark';
import EventsSection from './sections/EventCards';
import SponsorsSection from './sections/SponsorsSection';

import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Join from './pages/Join';
import Portal from './pages/Portal';
import Projects from './pages/Projects';
import Team from './pages/Team';

function Home() {
  return (
    <main className="bg-slate-50 dark:bg-[#04060f] transition-colors duration-300">
      <Hero />
      <StatsDark />
      <SponsorsSection />
      <EventsSection />
    </main>
  );
}

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const location = useLocation();

  // Listen to route changes
  useEffect(() => {
    // Only trigger route loading if backend is already ready
    if (isBackendReady) {
      setIsRouteLoading(true);
      const timer = setTimeout(() => {
        setIsRouteLoading(false);
      }, 500); // 500ms smooth glass loading transition
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isBackendReady]);

  // Initial connection check
  useEffect(() => {
    let mounted = true;

    const connectToBackend = async () => {
      const startTime = Date.now();
      try {
        await api.get('/api/data').catch(() => {});
      } catch (err) {
        console.warn('Backend connection attempt finished with error, but continuing...');
      } finally {
        if (mounted) {
          const elapsed = Date.now() - startTime;
          const minDelay = 2500; // slightly reduced for better UX now that it runs on routing
          const remainingTime = Math.max(0, minDelay - elapsed);
          
          setTimeout(() => {
            setIsBackendReady(true);
          }, remainingTime);
        }
      }
    };

    connectToBackend();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <GlobalLoader isLoading={!isBackendReady || isRouteLoading} />
      <div className="min-h-screen bg-slate-50 dark:bg-[#050816] text-slate-900 dark:text-white transition-colors duration-300">
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/join" element={<Join />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/team" element={<Team />} />
            <Route path="*" element={<div className="p-20 text-center">404 - Not Found</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
