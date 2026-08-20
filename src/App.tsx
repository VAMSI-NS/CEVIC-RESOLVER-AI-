import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import DemoBanner from './components/DemoBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

// Lazy-loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage'));
const AIAnalysisPage = lazy(() => import('./pages/AIAnalysisPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const TrackComplaintPage = lazy(() => import('./pages/TrackComplaintPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));

// Authority Pages
const AdminLoginPage = lazy(() => import('./pages/authority/AdminLoginPage'));
const AuthorityLayout = lazy(() => import('./pages/authority/AuthorityLayout'));
const OverviewPage = lazy(() => import('./pages/authority/OverviewPage'));
const ComplaintsPage = lazy(() => import('./pages/authority/ComplaintsPage'));
const AnalyticsPage = lazy(() => import('./pages/authority/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/authority/SettingsPage'));

// Fallback Loader
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 animate-pulse">
      <Sparkles className="w-5 h-5" />
    </div>
    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
      <span>Loading CivicResolve AI...</span>
    </div>
  </div>
);

// Protected Route Component for Authority Portal
const ProtectedAuthorityRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// 404 Not Found
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-6 space-y-4">
    <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-mono text-2xl font-black">
      404
    </div>
    <h2 className="text-xl font-bold text-slate-900 font-display">Page Not Found</h2>
    <p className="text-xs text-slate-500 max-w-sm">
      The requested civic service route does not exist or has been relocated.
    </p>
    <a href="/" className="btn-primary text-xs">
      Return to Home
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-500 selection:text-white">
        {/* Global Banner */}
        <DemoBanner />

        {/* Floating Top Navbar */}
        <Navbar />

        {/* Main Routes */}
        <div className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Citizen Portal */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/analyze" element={<AIAnalysisPage />} />
              <Route path="/success/:id" element={<SuccessPage />} />
              <Route path="/track" element={<TrackComplaintPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* Authority Portal */}
              <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedAuthorityRoute>
                    <AuthorityLayout />
                  </ProtectedAuthorityRoute>
                }
              >
                <Route path="overview" element={<OverviewPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin/overview" replace />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>

        {/* Global Footer on Citizen Routes */}
        <Footer />

        {/* Global AI Chatbot Floating Assistant */}
        <AIChat />
      </div>
    </AuthProvider>
  );
};

export default App;