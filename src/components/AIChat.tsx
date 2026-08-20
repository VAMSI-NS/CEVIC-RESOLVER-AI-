import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, User, Send, X, Loader2, Sparkles, AlertCircle,
  CheckCircle2, Clock, MapPin, PlusCircle, Search, HelpCircle,
  FileText, ExternalLink, ArrowRight, ShieldCheck, ChevronRight
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
      content: "👋 Hello! I'm your **CivicResolve AI Assistant 🤖**.\n\nI can help you report local civic issues, track existing complaints from our PostgreSQL database, or answer any municipal resolution questions.\n\nHow can I help you today?",
      timestamp: new Date().toISOString(),
      quickOptions: [
        { label: '📝 Report an Issue', text: 'I want to report an issue' },
        { label: '🔎 Track Complaint', text: 'How do I track my complaint?' },
        { label: '💡 Civic Help', text: 'What can I report?' },
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

  /** Process incoming user text */
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
          const statusColors: Record<string, string> = {
            REGISTERED: 'bg-amber-100 text-amber-800 border-amber-300',
            UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
            ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-300',
            IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            RESOLVED: 'bg-green-100 text-green-800 border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-300',
          };

          const assistantMsg: ExtendedChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ **Complaint ${ticketId} Found in PostgreSQL!**\n\nComplaint **${ticketId}** is currently **${foundComplaint.status.replace('_', ' ')}**.\n\n• 📌 **Title:** ${foundComplaint.title}\n• 🏷️ **Category:** ${foundComplaint.category}\n• ⚡ **Priority:** ${foundComplaint.priority}\n• 📍 **Location:** ${foundComplaint.location}\n• 🏢 **Authority:** ${foundComplaint.department || 'Municipal Authority'}`,
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
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the service. Please try again or use the main menu options.',
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

  /** Render simple markdown formatting */
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          // Bold matches
          const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code key={pIdx} className="bg-indigo-50 text-indigo-700 font-mono text-xs px-1.5 py-0.5 rounded border border-indigo-200">
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
      {/* Floating Bottom-Right Launcher Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open CivicResolve AI Assistant"
        className={`fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 ${
          open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-700 animate-pulse" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-tight">CivicResolve AI</p>
          <p className="text-[10px] text-indigo-200 font-medium">Assistant 🤖</p>
        </div>
      </button>

      {/* Modern Chat Window */}
      {open && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          style={{ height: '580px', maxHeight: '88vh' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 px-4 py-3.5 flex items-center justify-between border-b border-indigo-800/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm tracking-wide">CivicResolve AI Assistant</h3>
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-300 text-[11px] font-medium">PostgreSQL Connected</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Bar */}
          <div className="bg-slate-50 border-b border-gray-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSend('I want to report an issue')}
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => handleSend('How do I track my complaint?')}
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>Track Ticket</span>
            </button>
            <button
              onClick={() => handleSend('What can I report?')}
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Civic Help</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] space-y-2.5`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                      msg.role === 'assistant'
                        ? 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {renderMarkdown(msg.content)}
                  </div>

                  {/* Complaint Card if retrieved from PostgreSQL */}
                  {msg.complaintData && (
                    <div className="bg-white border border-indigo-100 rounded-2xl p-3 shadow-sm space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="font-mono text-xs font-bold text-indigo-700">{msg.complaintData.ticket_id || msg.complaintData.id}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                          {msg.complaintData.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 space-y-1">
                        <p className="font-medium text-gray-800 line-clamp-1">📌 {msg.complaintData.title}</p>
                        <p className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <span className="truncate">{msg.complaintData.location}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate(`/track?id=${msg.complaintData?.ticket_id || msg.complaintData?.id}`);
                          setOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition-all shadow-sm"
                      >
                        <span>View Live Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Direct Action Button: Report Issue CTA */}
                  {msg.suggestComplaint && !msg.complaintData && (
                    <button
                      onClick={() => {
                        navigate('/report', {
                          state: { initialDescription: msg.userPromptText || '' },
                        });
                        setOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-98"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Report This Issue Now</span>
                    </button>
                  )}

                  {/* Quick Option Pills */}
                  {msg.quickOptions && msg.quickOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {msg.quickOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(opt.text)}
                          className="text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-3 h-3 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-100 p-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask civic question or enter Ticket ID (e.g. CR-2026-000001)..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
                aria-label="Send Message"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;