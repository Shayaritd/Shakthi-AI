import { useState } from 'react';
import {
  ChevronRight, Shield, Trophy, Users, Award, Star, CheckCircle,
  Zap, BookOpen, Heart, ArrowRight
} from 'lucide-react';
import { ShakthiLogo } from '../components/ShakthiLogo';

interface LandingScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const STATS = [
  { value: '5,000+', label: 'Verified Athletes' },
  { value: '12 States', label: 'Coverage' },
  { value: '100+', label: 'National Scholarships' },
  { value: '300+', label: 'Verified Mentors' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Safety Shield',
    desc: '24/7 background-checked support for communication and travel support.',
    color: 'bg-[#e8f5f3] text-[#1a7a6e]',
  },
  {
    icon: Trophy,
    title: 'Athlete Profiles',
    desc: 'Verified, discoverable profiles presented to the global scouting network.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Award,
    title: 'Scholarship Portal',
    desc: 'AI-matched grants and scholarships awarded this year across India.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: 'Mentorship',
    desc: 'Direct access to retired international athletes who understand your journey.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const VERIFIED = [
  { num: '1', title: 'E-KYC Verification', desc: 'Every coach, mentor, and parent undergoes multi-level Aadhaar and background checks.' },
  { num: '2', title: 'Secure Communication', desc: 'End-to-end monitored messaging system prevents unauthorized external contact.' },
  { num: '3', title: 'Direct Grant Transfer', desc: 'Scholarship funds are disbursed directly to athlete bank accounts — no middlemen.' },
];

export function LandingScreen({ onLogin, onRegister }: LandingScreenProps) {
  const [notifVisible, setNotifVisible] = useState(true);

  return (
    <div className="min-h-screen bg-white overflow-y-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <ShakthiLogo />
        <div className="flex items-center gap-2">
          <button
            onClick={onRegister}
            className="text-sm text-[#1a7a6e] font-medium hover:underline"
          >
            Report Issue
          </button>
          <button
            onClick={onLogin}
            className="btn-primary px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Login
          </button>
        </div>
      </header>

      {/* Notification banner */}
      {notifVisible && (
        <div className="bg-[#1a7a6e] text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-amber-300" />
            <span>New Opportunity: Government of India (SAI) Merit Scholarship is now open.</span>
          </div>
          <button onClick={() => setNotifVisible(false)} className="ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-72 flex flex-col justify-end p-6"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3776160/pexels-photo-3776160.jpeg?auto=compress&cs=tinysrgb&w=430)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10">
            <h1 className="font-poppins font-bold text-white text-2xl leading-tight mb-2">
              Empowering India's<br />Rural Girl Athletes
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Breaking systemic barriers through digitized safety, visibility, and direct pathways to national recognition.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onRegister}
                className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                Create Athlete Profile
              </button>
              <button className="border border-white/50 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-1">
                Find Scholarships <Award size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-6">
        <h2 className="font-poppins font-bold text-xl text-gray-900 mb-1">Our Mission</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          We provide a digitised platform to ensure every athlete from rural India is discovered, verified, and presented to the global scouting network.
        </p>
        <div className="bg-[#1a7a6e] rounded-2xl p-4 mb-5">
          <p className="text-white/80 text-xs mb-3">A Legacy of Strength</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-6">
        <h2 className="font-poppins font-bold text-lg text-gray-900 mb-3">What SHAKTHI Offers</h2>
        <div className="space-y-3">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl card-hover">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified & Protected */}
      <section className="mx-4 mb-6 bg-[#f7f7f5] rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={18} className="text-[#1a7a6e]" />
          <h2 className="font-semibold text-gray-900">Verified &amp; Protected</h2>
        </div>
        <div className="space-y-4">
          {VERIFIED.map(v => (
            <div key={v.num} className="flex gap-3">
              <span className="w-7 h-7 bg-[#1a7a6e] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {v.num}
              </span>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{v.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Safety logo card */}
        <div className="mt-4 bg-[#1a7a6e] rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">SHAKTHI Safety</p>
            <p className="text-white/70 text-xs">Our zero-tolerance policy ensures it's a safe place for every daughter of India.</p>
          </div>
        </div>
      </section>

      {/* Opportunity banner */}
      <section className="mx-4 mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Zap size={16} className="text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 text-sm">New Opportunity</h3>
            <p className="text-amber-700 text-xs mt-0.5">View Details</p>
          </div>
        </div>
        <button className="mt-2 text-sm font-medium text-amber-700 flex items-center gap-1 hover:gap-2 transition-all">
          View Details <ChevronRight size={14} />
        </button>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-6 bg-gradient-to-br from-[#1a7a6e] to-[#0e4840] rounded-2xl p-5 text-center">
        <h2 className="font-poppins font-bold text-white text-lg mb-1">Ready to start your champion's journey?</h2>
        <p className="text-white/70 text-xs mb-4">
          Whether you're a budding athlete, a professional coach, or a scholarship donor — SHAKTHI is your platform for change.
        </p>
        <button
          onClick={onRegister}
          className="w-full btn-gold py-3 rounded-xl text-sm font-semibold mb-2"
        >
          Sign Up as Athlete
        </button>
        <button
          onClick={onLogin}
          className="w-full border border-white/30 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Register as Mentor
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 pt-8 pb-6">
        <ShakthiLogo light />
        <p className="text-gray-400 text-xs mt-2 mb-5 leading-relaxed">
          Empowering the rural talent of India through technology and human-centered safety.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Platform</h4>
            {['Athlete Directory', 'Scholarship Portal', 'Mentorship Program', 'Safety Guidelines'].map(l => (
              <p key={l} className="text-gray-500 text-xs py-0.5">{l}</p>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Company</h4>
            {['Our Mission', 'Success Stories', 'Partners', 'Contact Support'].map(l => (
              <p key={l} className="text-gray-500 text-xs py-0.5">{l}</p>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4">
          <p className="text-[10px] text-gray-500 text-center mb-2">
            <span className="text-[#1a7a6e] font-medium">Safety First</span> — We prioritize the dignity and security of our athletes above all else.
          </p>
          <p className="text-[10px] text-gray-600 text-center">
            © 2024 SHAKTHI Sports Initiative. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
