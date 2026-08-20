import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, User, Sparkles, ArrowRight,
  AlertCircle, Loader2
} from 'lucide-react';
import { adminLoginApi } from '../../services/complaintService';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminLoginApi({ username: username.trim(), password: password.trim() });
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
        else if (onSuccess) onSuccess();
        else navigate('/admin/complaints');
      } else {
        setError(res.message || 'Invalid admin credentials. Use admin / admin123');
      }
    } catch {
      setError('Authentication request failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-[#F8FAFC] flex items-center justify-center p-4 smart-city-grid relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="glass-panel p-8 sm:p-10 space-y-6 border-white/[0.12] shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center mx-auto shadow-glow-cyan">
              <Shield className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-2xl font-black text-white font-display tracking-tight mt-3">
              Civic Operations Center
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Municipal Authority & Host Portal
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Officer Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="glass-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="glass-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Access Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="bg-[#0B1625]/80 border border-white/[0.08] rounded-xl p-3 text-center text-xs text-slate-400 font-mono">
            <span>Default Access: </span>
            <span className="text-cyan-300 font-bold">admin</span>
            <span> / </span>
            <span className="text-cyan-300 font-bold">admin123</span>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              ← Back to Citizen Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;