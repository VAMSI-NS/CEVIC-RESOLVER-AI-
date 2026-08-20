import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, MapPin, Brain, Shield,
  BarChart3, AlertCircle, Zap, Globe, Users
} from 'lucide-react';

// ============================================================
// Landing Page — Hero + Stats + How It Works
// ============================================================

const stats = [
  { value: '1,284', label: 'Issues Reported' },
  { value: '947', label: 'Issues Resolved' },
  { value: '73', label: 'Active Complaints' },
  { value: '92%', label: 'Routing Accuracy' },
];

const workflowSteps = [
  { icon: '📝', label: 'Citizen Report', desc: 'Text + Image + Location' },
  { icon: '🤖', label: 'AI Analysis', desc: 'LLM + Vision Model' },
  { icon: '🎯', label: 'Priority Detection', desc: 'High / Medium / Low' },
  { icon: '🏢', label: 'Authority Routing', desc: 'Right Department' },
  { icon: '📊', label: 'Resolution Tracking', desc: 'Real-time Updates' },
];

const categories = [
  { icon: '🛣️', label: 'Roads', color: 'bg-red-50 border-red-100' },
  { icon: '🗑️', label: 'Garbage', color: 'bg-orange-50 border-orange-100' },
  { icon: '🌊', label: 'Drainage', color: 'bg-blue-50 border-blue-100' },
  { icon: '💧', label: 'Water Supply', color: 'bg-cyan-50 border-cyan-100' },
  { icon: '💡', label: 'Streetlights', color: 'bg-yellow-50 border-yellow-100' },
  { icon: '🏗️', label: 'Infrastructure', color: 'bg-purple-50 border-purple-100' },
];

const features = [
  {
    icon: <Brain className="w-5 h-5 text-indigo-600" />,
    title: 'AI-Powered Understanding',
    desc: 'Natural language processing identifies the exact problem from your description.',
  },
  {
    icon: <Zap className="w-5 h-5 text-indigo-600" />,
    title: 'Instant Routing',
    desc: 'Complaints are automatically routed to the correct department in seconds.',
  },
  {
    icon: <Globe className="w-5 h-5 text-indigo-600" />,
    title: 'Real-Time Tracking',
    desc: 'Track the status of your complaint from submission to resolution.',
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-indigo-600" />,
    title: 'Smart Escalation',
    desc: 'Unresolved complaints are automatically escalated to senior authorities.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
    title: 'Civic Analytics',
    desc: 'AI detects recurring problems and recommends preventive actions.',
  },
  {
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    title: 'Authority Dashboard',
    desc: 'Municipal teams get a powerful dashboard to manage and resolve issues.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              AI-Powered Civic Platform
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Turn Civic Problems{' '}
              <span className="gradient-text">Into Action.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Report potholes, garbage, drainage, streetlight and public infrastructure problems.{' '}
              <strong className="text-gray-800">CivicResolve AI</strong> understands your complaint,
              finds the right authority and helps you track the resolution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/report" className="btn-primary justify-center text-base py-4 px-8">
                Report a Problem
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/track" className="btn-secondary justify-center text-base py-4 px-8">
                <MapPin className="w-5 h-5" />
                Track Complaint
              </Link>
            </div>

            {/* Demo badge */}
            <p className="text-xs text-gray-400 mt-6">
              🎯 Demo values shown — simulated AI for hackathon MVP
            </p>
          </div>

          {/* AI Workflow visual */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
              {workflowSteps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow w-32 flex-shrink-0">
                    <span className="text-3xl">{step.icon}</span>
                    <p className="text-xs font-bold text-gray-800 text-center leading-tight">{step.label}</p>
                    <p className="text-[10px] text-gray-400 text-center">{step.desc}</p>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <div className="hidden md:flex flex-col items-center">
                      <div className="w-8 h-0.5 bg-indigo-200 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-indigo-400 border-y-2 border-y-transparent" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Issue Categories ──────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Report Any Civic Problem
            </h2>
            <p className="text-gray-500 mt-3 text-lg">
              Our AI handles all types of civic complaints
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to="/report"
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 ${cat.color} hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <p className="text-sm font-semibold text-gray-700">{cat.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Intelligent Civic Technology
            </h2>
            <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
              CivicResolve AI combines advanced AI with smart city infrastructure
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Report a Problem. Let AI Find the Right Solution.
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of citizens making their city better. Report your civic issue and let AI handle the rest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report"
                  className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  Report a Problem
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/authority"
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Authority Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-bold">CivicResolve AI</span>
              <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">Hackathon MVP</span>
            </div>
            <p className="text-sm text-center">
              Built for Smart City Hackathon 2026 · AI-powered civic engagement platform
            </p>
            <div className="flex gap-4 text-sm">
              <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link to="/report" className="hover:text-white transition-colors">Report Issue</Link>
              <Link to="/authority" className="hover:text-white transition-colors">Authority</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
