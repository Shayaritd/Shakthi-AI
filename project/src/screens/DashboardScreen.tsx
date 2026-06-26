import { useState } from 'react';
import { ChevronRight, Shield, Sparkles, Loader2, X } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { MentorCard } from '../components/MentorCard';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { MOCK_USER, STATS, UPCOMING_TRIALS, MENTORS, SCHOLARSHIPS } from '../data/mockData';
import { getScholarshipExplanation } from '../services/gemini';
import type { Scholarship } from '../types';

interface DashboardScreenProps {
  onAiChat: () => void;
}

export function DashboardScreen({ onAiChat }: DashboardScreenProps) {
  const [aiModal, setAiModal] = useState<{ text: string; loading: boolean } | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [notifCount] = useState(2);

  async function handleScholarshipAi(s: Scholarship) {
    setAiModal({ text: '', loading: true });
    setSelectedScholarship(s);
    const text = await getScholarshipExplanation({
      athleteName: MOCK_USER.name,
      sport: MOCK_USER.sport,
      scholarship: s.title,
      eligibility: s.eligibility,
    });
    setAiModal({ text, loading: false });
  }

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1 text-sm" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
  }

  return (
    <div className="overflow-y-auto pb-24">
      <TopBar
        showNotif
        notifCount={notifCount}
        rightAction={{ label: 'Report Issue', onClick: () => {}, danger: true }}
      />

      <div className="px-4 pt-5 space-y-5">
        {/* Welcome */}
        <div>
          <h2 className="font-poppins font-bold text-lg text-[#1a7a6e]">Welcome back, {MOCK_USER.name}!</h2>
          <p className="text-sm text-gray-500">Your journey to the podium continues today.</p>
        </div>

        {/* Profile Integrity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Profile Integrity</span>
            <span className="text-sm font-bold text-[#1a7a6e]">{MOCK_USER.profileComplete}% Complete</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#1a7a6e] rounded-full progress-bar"
              style={{ width: `${MOCK_USER.profileComplete}%` }}
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-800">2 New Scholarship Matches</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Action Required */}
        <div className="bg-[#1a7a6e] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Action Required</span>
          </div>
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            Upload your latest Kabaddi tournament certificate to unlock Elite status.
          </p>
          <button className="w-full btn-gold py-3 rounded-xl text-sm font-semibold">
            Upload Certificate
          </button>
        </div>

        {/* Upcoming Trials */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">📅</span>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Upcoming Trials</h3>
          </div>
          <div className="space-y-3">
            {UPCOMING_TRIALS.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 card-hover">
                <div className="w-11 h-11 bg-[#e8f5f3] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-[#1a7a6e] uppercase">{t.date.month}</span>
                  <span className="text-base font-bold text-[#1a7a6e] leading-none">{t.date.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.venue}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Mentors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">👥</span>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Recommended Mentors</h3>
          </div>
          <div className="space-y-2">
            {MENTORS.slice(0, 2).map(m => (
              <MentorCard key={m.id} mentor={m} compact />
            ))}
          </div>
        </div>

        {/* Eligible Scholarships */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">🎓</span>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Eligible Scholarships</h3>
          </div>
          <div className="space-y-3">
            {SCHOLARSHIPS.slice(2).map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'closing_soon' ? 'bg-amber-100 text-amber-700' : 'bg-[#e8f5f3] text-[#1a7a6e]'
                  }`}>
                    {s.status === 'closing_soon' ? 'CLOSING SOON' : 'TOP MATCH'}
                  </span>
                  <span className="font-bold text-[#1a7a6e] text-sm">{s.amount}</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mt-1">{s.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">{s.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScholarshipAi(s)}
                    className="text-xs font-semibold text-[#1a7a6e] flex items-center gap-1 hover:underline"
                  >
                    {s.status === 'closing_soon' ? 'View Details' : 'Apply Now'} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Hub */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">🛡️</span>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Safety Hub</h3>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">24/7 Support Line</h4>
                <p className="text-xs text-gray-500 mt-0.5">Encrypted reporting and immediate assistance for athletes.</p>
              </div>
            </div>
            <button className="w-full border-2 border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#1a7a6e] hover:text-[#1a7a6e] transition-colors">
              Go to Safety Center
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onAiChat}
        className="fab fixed bottom-20 right-4 w-12 h-12 bg-[#1a7a6e] rounded-full flex items-center justify-center z-30"
      >
        <Sparkles size={20} className="text-white" />
      </button>

      {/* AI Modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setAiModal(null)}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-fade-up"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#1a7a6e]" />
                <h3 className="font-semibold text-gray-900">AI Scholarship Analysis</h3>
              </div>
              <button onClick={() => setAiModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            {selectedScholarship && (
              <p className="text-xs font-medium text-[#1a7a6e] bg-[#e8f5f3] px-2 py-1 rounded-full inline-block mb-3">
                {selectedScholarship.title}
              </p>
            )}
            {aiModal.loading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 size={18} className="animate-spin text-[#1a7a6e]" />
                <span className="text-sm text-gray-500">Analyzing with AI...</span>
              </div>
            ) : (
              <div className="text-gray-700 leading-relaxed">{formatText(aiModal.text)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
