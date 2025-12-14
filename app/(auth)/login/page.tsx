'use client';
import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const BravoLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 15 H65 C80 15, 85 25, 85 35 C85 45, 75 50, 65 50 H25 V15 Z" fill="#F58220" />
    <path d="M25 45 H65 C85 45, 90 55, 90 65 C90 75, 80 80, 70 80 H25 V45 Z" fill="#1E3A8A" />
    <path d="M25 75 H60 C75 75, 80 80, 80 85 C80 90, 70 95, 60 95 H25 V75 Z" fill="#00A859" />
  </svg>
);

export default function LoginPage({ onLogin }: LoginProps = { onLogin: () => {} }) {
  const [view, setView] = useState<'LOGIN' | 'FORGOT' | 'NEW_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return { minLength, hasUpper, hasLower, hasSpecial, isValid: minLength && hasUpper && hasLower && hasSpecial };
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email && password) {
        onLogin({ id: '1', email, name: 'Usuário' });
      } else {
        setError('Email ou senha inválidos.');
      }
      setLoading(false);
    }, 800);
  };

  const passCheck = validatePassword(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 border-t-4 border-orange-500 transition-all duration-500">
        <div className="p-8 pb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-xl shadow-md border border-slate-100">
              <BravoLogo className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">FormFlow</h1>
          <p className="text-slate-500 font-medium text-xs tracking-wide uppercase">Crie Formulários Sem Código</p>
        </div>

        <div className="px-8 pb-8 pt-2">
          {view === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center border border-red-100"><AlertCircle size={16} className="mr-2"/>{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="seu.email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Senha</label>
                  <button type="button" onClick={() => {setError(''); setSuccessMsg(''); setView('FORGOT')}} className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required 
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform active:scale-95"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <><>Entrar</> <ArrowRight size={18} className="ml-2"/></> }
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400">FormFlow © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
