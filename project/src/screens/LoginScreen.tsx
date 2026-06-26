import { useState } from 'react';
import { Mail, ArrowRight, Shield, ChevronLeft, Loader2 } from 'lucide-react';
import { ShakthiLogo } from '../components/ShakthiLogo';
import type { Role } from '../types';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
  onBack: () => void;
}

const ROLES: { id: Role; label: string; emoji: string }[] = [
  { id: 'ATHLETE', label: 'Athlete', emoji: '🏃' },
  { id: 'MENTOR', label: 'Mentor', emoji: '👥' },
  { id: 'GUARDIAN', label: 'Parent', emoji: '👨‍👩‍👧' },
  { id: 'COACH', label: 'Coach', emoji: '🎯' },
  { id: 'SPONSOR', label: 'Sponsor', emoji: '🤝' },
  { id: 'ADMIN', label: 'Admin', emoji: '⚙️' },
];

export function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('ATHLETE');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  async function handleGetOtp() {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('otp');
  }

  async function handleVerifyOtp() {
    if (otp.join('').length < 4) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onLogin(selectedRole);
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) {
      (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <ShakthiLogo />
        <button className="text-sm text-red-600 font-medium flex items-center gap-1">
          <Shield size={13} /> Report Issue
        </button>
      </header>

      <div className="px-4 pt-8 pb-24">
        <h1 className="font-poppins font-bold text-2xl text-[#1a7a6e] mb-1">Welcome Back</h1>
        <p className="text-gray-500 text-sm mb-7">Select your role to continue your journey.</p>

        {/* Role grid */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                selectedRole === r.id
                  ? 'border-[#1a7a6e] bg-[#e8f5f3] shadow-sm scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={`font-semibold text-sm ${selectedRole === r.id ? 'text-[#1a7a6e]' : 'text-gray-700'}`}>
                {r.label}
              </span>
            </button>
          ))}
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          {step === 'phone' ? (
            <>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-4 focus-within:border-[#1a7a6e]">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 font-medium text-sm border-r border-gray-200">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter your mobile number"
                  className="flex-1 px-3 py-3 text-sm outline-none"
                />
              </div>
              <button
                onClick={handleGetOtp}
                disabled={phone.length < 10 || loading}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Get OTP <ArrowRight size={16} /></>}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button className="w-full border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mb-3">
                <Mail size={16} className="text-gray-500" /> Login with Email
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button className="border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <p className="text-sm text-gray-600">Enter the 4-digit OTP sent to</p>
                <p className="font-semibold text-gray-900">+91 {phone}</p>
                <button onClick={() => setStep('phone')} className="text-xs text-[#1a7a6e] mt-1 hover:underline">
                  Change number
                </button>
              </div>
              <div className="flex gap-3 justify-center mb-5">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    maxLength={1}
                    className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#1a7a6e] outline-none transition-colors"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otp.join('').length < 4 || loading}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
              </button>
            </>
          )}
        </div>

        {/* Safety badge */}
        <div className="bg-[#e8f5f3] border border-[#c8e6e1] rounded-xl p-3 flex items-start gap-2">
          <Shield size={14} className="text-[#1a7a6e] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#1a7a6e] leading-relaxed">
            Your data is encrypted and protected by{' '}
            <strong>SHAKTHI Safety Protocols</strong>. We prioritize your privacy above all else.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <button onClick={() => onLogin('ATHLETE')} className="text-[#1a7a6e] font-semibold hover:underline">
            Sign up as an Athlete
          </button>
        </p>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 SHAKTHI Sports Initiative. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
