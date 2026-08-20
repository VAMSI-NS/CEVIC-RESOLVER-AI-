import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Shield, ArrowRight, Zap, CheckCircle2,
  MapPin, Clock, PlusCircle, Search, Layers, Cpu, Activity,
  Sliders, Users, Building2, ChevronRight
} from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Citizen Report Intake',
      desc: 'Citizens report issues in natural language, attach photos, and pin precise GPS coordinates through our responsive portal.',
      icon: <PlusCircle className="w-6 h-6 text-blue-600" />,
      features: ['Natural language text parser', 'GPS auto-detection & reverse geocoding', 'Photo evidence attachment', 'Anonymous reporting option'],
    },
    {
      num: '02',
      title: 'AI Neural Classification',
      desc: 'Our AI model analyzes the problem description, determines the urgency priority, and identifies the exact municipal jurisdiction.',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      features: ['Ontology keyword mapping', 'Severity & public safety hazard detection', 'Estimated SLA response time calculation', 'Automated ticket ID generation (CR-2026-XXXXXX)'],
    },
    {
      num: '03',
      title: 'Zonal Authority Dispatch',
      desc: 'The complaint is synced directly into the central cloud PostgreSQL database and assigned to the municipal zone engineering team.',
      icon: <Shield className="w-6 h-6 text-violet-600" />,
      features: ['Cloud PostgreSQL persistence', 'Departmental load-balancing', 'Operations Center console for officers', 'Multi-device status coordination'],
    },
    {
      num: '04',
      title: 'Live Resolution & Citizen Feedback',
      desc: 'Field engineers execute repairs, update status (UNDER REVIEW → IN PROGRESS → RESOLVED), and citizens track updates live.',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      features: ['Real-time 5-stage progress timeline', 'Instant citizen ticket tracker', 'Resolution verification checks', 'Civic analytics and recurring issue detection'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pt-32 pb-24 smart-city-light-grid relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>AI PIPELINE ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
            How CivicResolve AI <span className="gradient-text-blue-cyan">Works</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From citizen submission to municipal verification — explore the intelligent automated workflow that drives fast urban resolution.
          </p>
        </div>

        {/* 4 Detailed Pipeline Steps */}
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-10 bg-white border-slate-200 shadow-premium grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Number & Icon */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-black text-slate-300">
                    {step.num}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {step.title}
                </h2>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Right Column: Key Capabilities List */}
              <div className="lg:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Key Technical Capabilities
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="glass-panel p-8 sm:p-12 text-center space-y-6 bg-white border-slate-200 shadow-premium">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Ready to Try the AI Workflow?
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Report a pothole, street light failure, or sanitation issue and see AI routing in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="btn-primary"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Issue Now</span>
            </Link>
            <Link
              to="/track"
              className="btn-secondary"
            >
              <Search className="w-4 h-4" />
              <span>Track a Complaint</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorksPage;