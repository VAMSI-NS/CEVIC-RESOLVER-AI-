import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Lazy-load pages for better initial load performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage'));
const AIAnalysisPage = lazy(() => import('./pages/AIAnalysisPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const TrackComplaintPage = lazy(() => import('./pages/TrackComplaintPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const AuthorityLayout = lazy(() => import('./pages/authority/AuthorityLayout'));

// Components — loaded eagerly (small, always visible)
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import DemoBanner from './components/DemoBanner';
import { mockNotifications } from './data/mockNotifications';

// ============================================================
// Full-page loading spinner shown during lazy imports
// ============================================================
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ============================================================
// 404 Not Found page
// ============================================================
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <div className="text-center px-4">
        <p className="text-6xl font-extrabold text-indigo-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary inline-flex">Go to Home</a>
      </div>
    </div>
  );
}

// ============================================================
// App shell — conditionally renders Navbar, DemoBanner, AIChat
// ============================================================

function AppShell() {
  const location = useLocation();
  const isAuthority = location.pathname.startsWith('/authority');
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Demo mode banner shown on citizen pages only */}
      {!isAuthority && <DemoBanner />}

      {/* Navbar only on citizen-facing pages */}
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
            {/* Friendly 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Floating AI Chat — only on citizen-facing pages */}
      {!isAuthority && <AIChat />}
    </>
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
