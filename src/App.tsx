import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Education } from './components/Education';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { ProjectDetail } from './components/ProjectDetail';
import { CryptoPayment } from './components/CryptoPayment';
import { Contact } from './components/Contact';
import { VCardSection } from './components/VCardSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { FloatingStats } from './components/FloatingStats';
import { TerminalDrawer } from './components/TerminalDrawer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Education />
      <Skills />
      <CryptoPayment />
      <Contact />
      <VCardSection />
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden w-full relative">
      <style>{`
        @keyframes float-sync {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-sync {
          animation: float-sync 4s ease-in-out infinite;
        }
      `}</style>
      <ScrollToTop />
      <ScrollProgressBar />
      <FloatingStats />
      <TerminalDrawer />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
