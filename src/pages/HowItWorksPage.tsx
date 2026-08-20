import React from 'react';
import {
  Brain, Zap, Shield, BarChart3, ArrowDown, Code2,
  Globe, CheckCircle, Layers, GitBranch
} from 'lucide-react';

// ============================================================
// How It Works Page — AI Architecture Explanation
// ============================================================

const pipeline = [
  {
    step: 'USER',
    icon: '👤',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    label: 'Citizens Report',
    desc: 'Citizens submit text descriptions, photos, and location data about civic issues they encounter.',
  },
  {
    step: 'INPUT',
    icon: '📥',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    label: 'Multimodal Input',
    desc: 'System accepts Text + Image + Location simultaneously for comprehensive issue understanding.',
  },
  {
    step: 'AI',
    icon: '🧠',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    label: 'AI Understanding',
    desc: 'LLM + Vision Model analyzes the complaint, extracting key information and context.',
  },
  {
    step: 'CLASS',
    icon: '🏷️',
    color: 'bg-yellow-50 border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-700',
    label: 'Classification',
    desc: 'Issues classified into: Roads, Garbage, Water, Drainage, Streetlight, or Infrastructure.',
  },
  {
    step: 'PRIORITY',
    icon: '⚡',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    label: 'Priority Engine',
    desc: 'AI determines urgency: LOW, MEDIUM, or HIGH based on safety risk and impact.',
  },
  {
    step: 'ROUTE',
    icon: '🏢',
    color: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    label: 'Authority Router',
    desc: 'Complaint automatically routed to the correct Municipal Department and zone team.',
  },
  {
    step: 'TICKET',
    icon: '🎫',
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    label: 'Ticket Engine',
    desc: 'Unique Complaint ID generated. Status tracking enabled with real-time timeline.',
  },
  {
    step: 'ESCALATE',
    icon: '🚨',
    color: 'bg-pink-50 border-pink-200',
    iconBg: 'bg-pink-100',
    iconText: 'text-pink-600',
    label: 'Escalation Agent',
    desc: 'Unresolved complaints are automatically escalated with reminders to senior authorities.',
  },
  {
    step: 'ANALYTICS',
    icon: '📊',
    color: 'bg-teal-50 border-teal-200',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    label: 'Analytics Agent',
    desc: 'AI detects recurring civic issues and generates actionable recommendations for prevention.',
  },
];

const futureIntegrations = [
  { name: 'Google ADK', icon: '🌐', desc: 'Agent Development Kit for orchestrating AI agents' },
  { name: 'LangGraph', icon: '🔗', desc: 'Multi-agent graph for complex complaint workflows' },
  { name: 'LangChain', icon: '⛓️', desc: 'LLM chains for nuanced complaint understanding' },
  { name: 'Vision Models', icon: '👁️', desc: 'Gemini Vision / GPT-4V for image analysis' },
  { name: 'GIS / Maps APIs', icon: '🗺️', desc: 'Real-time geospatial complaint mapping' },
  { name: 'Municipal DBs', icon: '🏛️', desc: 'Direct integration with civic databases' },
  { name: 'Notification APIs', icon: '🔔', desc: 'SMS, Email, Push notifications for citizens' },
  { name: 'IoT Sensors', icon: '📡', desc: 'Smart city sensor data for proactive detection' },
];

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold px-4 py-2 rounded-full mb-5">
            <Brain className="w-4 h-4" />
            AI Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            How CivicResolve AI Works
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A multi-agent AI system that transforms citizen reports into resolved civic actions
            through intelligent classification, routing, and escalation.
          </p>
        </div>

        {/* AI Pipeline */}
        <div className="space-y-3 mb-16">
          {pipeline.map((step, i) => (
            <div key={step.step}>
              <div className={`flex gap-5 items-start p-5 rounded-2xl border-2 ${step.color} hover:shadow-md transition-shadow`}>
                {/* Step number */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl ${step.iconBg} ${step.iconText} flex items-center justify-center text-2xl`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold ${step.iconText} mt-1 opacity-60`}>{step.step}</span>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{step.label}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{step.desc}</p>
                </div>

                <div className="flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step.iconBg} ${step.iconText}`}>
                    Step {i + 1}
                  </span>
                </div>
              </div>

              {/* Arrow connector */}
              {i < pipeline.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Tech Stack (MVP)</h2>
              <p className="text-sm text-gray-500">Production-ready architecture with mock AI services</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Frontend', tech: 'React 18 + TypeScript + Vite', color: 'bg-blue-50 text-blue-700' },
              { label: 'Styling', tech: 'Tailwind CSS + Custom Animations', color: 'bg-cyan-50 text-cyan-700' },
              { label: 'AI (Mock)', tech: 'Simulated LLM + Vision Model', color: 'bg-purple-50 text-purple-700' },
              { label: 'Storage', tech: 'LocalStorage (Demo Persistence)', color: 'bg-green-50 text-green-700' },
              { label: 'Routing', tech: 'React Router v6', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Icons', tech: 'Lucide React', color: 'bg-orange-50 text-orange-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${item.color}`}>{item.label}</div>
                <span className="text-sm text-gray-700">{item.tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Integrations */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Production Integrations</h2>
              <p className="text-sm text-indigo-300">Ready for real API connections</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {futureIntegrations.map((item) => (
              <div key={item.name} className="flex items-start gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{item.name}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-indigo-200">
                All mock service functions are structured for direct API replacement — no refactoring required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
