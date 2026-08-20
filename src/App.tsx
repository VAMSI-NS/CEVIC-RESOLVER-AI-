import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Lazy-load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage'));
const AIAnalysisPage = lazy(() => import('./pages/AIAnalysisPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const TrackComplaintPage = lazy(() => import('./pages/TrackComplaintPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const AuthorityLayout = lazy(() => import('./pages/authority/AuthorityLayout'));

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import DemoBanner from './components/DemoBanner';
import { mockNotifications } from './data/mockNotifications';

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050B14] text-[#F8FAFC]" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">Loading CivicResolve AI...</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050B14] text-[#F8FAFC] pt-16 px-4">
      <div className="glass-panel p-10 max-w-md w-full text-center space-y-4 border-white/[0.08]">
        <p className="text-6xl font-black gradient-text-cyan-violet font-display">404</p>
        <h1 className="text-xl font-bold text-white">Page Not Found</h1>
        <p className="text-xs text-slate-400">The page you requested could not be located in the system.</p>
        <a href="/" className="btn-primary text-xs inline-flex">Return Home</a>
      </div>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isAuthority = location.pathname.startsWith('/authority') || location.pathname.startsWith('/admin');
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F8FAFC] flex flex-col justify-between">
      <div>
        {/* Demo banner */}
        {!isAuthority && <DemoBanner />}

        {/* Floating Navbar */}
        {!isAuthority && <Navbar notifications={unread} />}

        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/analyze" element={<AIAnalysisPage />} />
              <Route path="/success/:id" element={<SuccessPage />} />
              <Route path="/track" element={<TrackComplaintPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/authority/*" element={<AuthorityLayout />} />
              <Route path="/admin/*" element={<AuthorityLayout />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Footer only on citizen facing pages */}
      {!isAuthority && <Footer />}

      {/* Floating AI Chat Assistant */}
      {!isAuthority && <AIChat />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;