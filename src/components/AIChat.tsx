import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, User, Send, X, Loader2, Sparkles, AlertCircle,
  CheckCircle2, Clock, MapPin, PlusCircle, Search, HelpCircle,
  FileText, ExternalLink, ArrowRight, ShieldCheck, ChevronRight,
  MessageSquare, Cpu, CornerDownLeft
} from 'lucide-react';
import { getChatResponse, ChatBotResponse } from '../services/aiService';
import { fetchComplaintByIdApi } from '../services/complaintService';
import type { Complaint } from '../types';

interface ExtendedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestComplaint?: boolean;
  suggestTracking?: boolean;
  complaintData?: Complaint | null;
  quickOptions?: Array<{ label: string; text: string }>;
  suggestedCategory?: string;
  suggestedPriority?: string;
  userPromptText?: string;
}

const AIChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! 👋\n\n**How can I help you today?**\n\nI'm CivicResolve AI. I can help you report civic issues, track complaints and understand civic services.",
      timestamp: new Date().toISOString(),
      quickOptions: [
        { label: '📝 Report a civic issue', text: 'I want to report an issue' },
        { label: '🔎 Track my complaint', text: 'How do I track my complaint?' },
        { label: '🛣️ How do I report a pothole?', text: 'How do I report a pothole?' },
        { label: '📊 Check complaint status', text: 'What does Under Review mean?' },
        { label: '💡 What issues can I report?', text: 'What can I report?' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    const text = rawText.trim();
    if (!text || loading) return;

    const userMsg: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Check if user typed or requested a Ticket ID (e.g. CR-2026-000001 or CR-2026-004821)
      const ticketMatch = text.match(/CR-\d{4}-\d{6}/i) || text.match(/CR-\d{4}-\d+/i);

      if (ticketMatch) {
        const ticketId = ticketMatch[0].toUpperCase();
        const foundComplaint = await fetchComplaintByIdApi(ticketId);

        if (foundComplaint) {
          const assistantMsg: ExtendedChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ **Complaint ${ticketId} Found in PostgreSQL!**\n\nComplaint **${ticketId}** is currently **${foundComplaint.status.replace('_', ' ')}**.\n\n• 📌 **Title:** ${foundComplaint.title}\n• 🏷️ **Category:** ${foundComplaint.category}\n• ⚡ **Priority:** ${foundComplaint.priority}\n• 📍 **Location:** ${foundComplaint.location}\n• 🏢 **Authority:** ${foundComplaint.department || 'Municipal Operations'}`,
            timestamp: new Date().toISOString(),
            complaintData: foundComplaint,
            suggestTracking: true,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const assistantMsg: ExtendedChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ **Ticket Not Found in Database**\n\nI couldn't find a record for **${ticketId}** in PostgreSQL.\n\nPlease verify your 6-digit ticket ID or check the full tracking page.`,
            timestamp: new Date().toISOString(),
            quickOptions: [
              { label: '🔎 Open Tracking Page', text: 'Track Complaint' },
              { label: '📝 Report New Issue', text: 'I want to report an issue' },
            ],
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } else {
        // 2. Normal AI Analysis & Civic FAQ Handling
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        const response: ChatBotResponse = await getChatResponse(text, history);

        const assistantMsg: ExtendedChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          suggestComplaint: response.suggestComplaint,
          suggestTracking: response.suggestTracking,
          quickOptions: response.quickOptions,
          suggestedCategory: response.suggestedCategory,
          suggestedPriority: response.suggestedPriority,
          userPromptText: text,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the database. Please try again.',
          timestamp: new Date().toISOString(),
          quickOptions: [
            { label: '📝 Report Issue', text: 'I want to report an issue' },
            { label: '🔎 Track Ticket', text: 'How do I track my complaint?' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code key={pIdx} className="bg-blue-50 text-blue-700 font-mono text-xs px-1.5 py-0.5 rounded border border-blue-200">
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button: White Circular with Gradient Icon */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open CivicResolve AI Assistant"
        className={`fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-white text-slate-900 px-5 py-3.5 rounded-full shadow-float hover:shadow-premium-hover hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-200/80 cursor-pointer ${
          open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-extrabold leading-tight font-display text-slate-900">CivicResolve AI</p>
          <p className="text-[10px] text-blue-600 font-medium">Assistant 🤖</p>
        </div>
      </button>

      {/* Large Centered Glassmorphism Light Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Main Light Glass Chat Panel */}
          <div
            className="w-full max-w-2xl bg-white/95 border border-slate-200/80 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative text-slate-900"
            style={{ height: '620px', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="bg-slate-50/90 px-6 py-4 flex items-center justify-between border-b border-slate-200/80 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-extrabold text-base tracking-tight font-display">CivicResolve AI Assistant</h3>
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-700 text-xs font-medium">Cloud Database Connected</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Pills Top Bar */}
            <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSend('I want to report an issue')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Report Issue</span>
              </button>
              <button
                onClick={() => handleSend('How do I track my complaint?')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200 hover:border-cyan-300 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5 text-cyan-600" />
                <span>Track Ticket</span>
              </button>
              <button
                onClick={() => handleSend('What can I report?')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 hover:border-violet-300 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5 text-violet-600" />
                <span>Civic Help</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#F8FAFC] to-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Body */}
                  <div className="max-w-[85%] space-y-3">
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'assistant'
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-sm'
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-tr-sm shadow-md shadow-blue-500/20'
                      }`}
                    >
                      {renderMarkdown(msg.content)}
                    </div>

                    {/* Real PostgreSQL Complaint Card */}
                    {msg.complaintData && (
                      <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-md space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{msg.complaintData.ticket_id || msg.complaintData.id}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            {msg.complaintData.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-900 line-clamp-1">📌 {msg.complaintData.title}</p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate">{msg.complaintData.location}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigate(`/track?id=${msg.complaintData?.ticket_id || msg.complaintData?.id}`);
                            setOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <span>View Live Timeline</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Direct CTA: Report Issue */}
                    {msg.suggestComplaint && !msg.complaintData && (
                      <button
                        onClick={() => {
                          navigate('/report', {
                            state: { initialDescription: msg.userPromptText || '' },
                          });
                          setOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Report This Issue Now</span>
                      </button>
                    )}

                    {/* Suggestion Chips */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.quickOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(opt.text)}
                            className="text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>{opt.label}</span>
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200/80 p-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-2xl px-4 py-2 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything or enter Ticket ID (e.g. CR-2026-000001)..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1.5"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm cursor-pointer"
                  aria-label="Send Message"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;