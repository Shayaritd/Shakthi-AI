import { useState } from 'react';
import { Edit3, Award, Star, TrendingUp, CheckCircle, Upload, Sparkles, Loader2, X, Settings, LogOut } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { MOCK_USER } from '../data/mockData';
import { getAthleteSummary } from '../services/gemini';

interface ProfileScreenProps {
  onLogout: () => void;
}

const BADGES = [
  { icon: '🏆', label: 'State Champ', color: 'bg-amber-50 border-amber-200' },
  { icon: '⚡', label: '30-Day Streak', color: 'bg-blue-50 border-blue-200' },
  { icon: '🎯', label: 'Profile Pro', color: 'bg-green-50 border-green-200' },
  { icon: '🛡️', label: 'Verified', color: 'bg-[#e8f5f3] border-[#c8e6e1]' },
  { icon: '📚', label: 'Scholar', color: 'bg-purple-50 border-purple-200' },
  { icon: '🌟', label: 'Top Athlete', color: 'bg-red-50 border-red-200' },
];

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [aiModal, setAiModal] = useState<{ open: boolean; loading: boolean; data: Record<string, unknown> | null }>({
    open: false, loading: false, data: null,
  });

  async function handleAiSummary() {
    setAiModal({ open: true, loading: true, data: null });
    const result = await getAthleteSummary({
      name: MOCK_USER.name,
      sport: MOCK_USER.sport,
      achievements: 'State-level gold medal 2023, District champion 2022',
      goals: 'Represent India at Asian Games by 2026',
      level: MOCK_USER.level,
    });
    setAiModal({ open: true, loading: false, data: result.data });
  }

  const data = aiModal.data as { summary?: string; strengths?: string[]; nextSteps?: string[] } | null;

  return (
    <div className="overflow-y-auto pb-24">
      <TopBar
        showNotif
        notifCount={0}
        rightAction={{ label: 'Settings', onClick: () => {} }}
      />

      <div className="px-4 pt-5 space-y-5">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="teal-gradient h-20 relative">
            <button className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full">
              <Edit3 size={14} className="text-white" />
            </button>
          </div>
          <div className="px-4 pb-4 -mt-8">
            <div className="flex items-end gap-3 mb-3">
              <div className="relative">
                <img
                  src={MOCK_USER.avatar}
                  alt={MOCK_USER.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                  style={{ border: '3px solid white' }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1a7a6e] rounded-full flex items-center justify-center">
                  <CheckCircle size={10} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="font-bold text-gray-900">{MOCK_USER.name}</h2>
                <p className="text-xs text-gray-500">{MOCK_USER.sport} · {MOCK_USER.state}</p>
              </div>
              <span className="text-xs font-medium bg-[#e8f5f3] text-[#1a7a6e] px-2 py-1 rounded-full">
                {MOCK_USER.level} Level
              </span>
            </div>

            {/* Profile completeness */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Profile Completeness</span>
                <span className="font-semibold text-[#1a7a6e]">{MOCK_USER.profileComplete}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a7a6e] rounded-full progress-bar" style={{ width: `${MOCK_USER.profileComplete}%` }} />
              </div>
            </div>

            {/* AI Summary button */}
            <button
              onClick={handleAiSummary}
              className="w-full bg-gradient-to-r from-[#1a7a6e] to-[#22a99a] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Sparkles size={14} /> Generate AI Profile Summary
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: 'Training Days', value: '24', color: 'text-[#1a7a6e]' },
            { icon: Star, label: 'Skill Points', value: '840', color: 'text-amber-500' },
            { icon: Award, label: 'Badges', value: '6', color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
              <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Earned Badges</h3>
          <div className="grid grid-cols-3 gap-2">
            {BADGES.map(b => (
              <div key={b.label} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border ${b.color}`}>
                <span className="text-xl">{b.icon}</span>
                <span className="text-[10px] font-medium text-gray-700 text-center">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Documents & Certificates</h3>
          <div className="space-y-2">
            {[
              { name: 'Aadhaar Card', verified: true },
              { name: 'State Medal Certificate 2023', verified: true },
              { name: 'District Championship Certificate', verified: true },
              { name: 'Latest Tournament Certificate', verified: false },
            ].map(d => (
              <div key={d.name} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d.verified ? 'bg-[#e8f5f3]' : 'bg-amber-50'}`}>
                  {d.verified ? (
                    <CheckCircle size={15} className="text-[#1a7a6e]" />
                  ) : (
                    <Upload size={15} className="text-amber-500" />
                  )}
                </div>
                <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  d.verified ? 'bg-[#e8f5f3] text-[#1a7a6e]' : 'bg-amber-100 text-amber-700'
                }`}>
                  {d.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings / Logout */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { icon: Settings, label: 'Account Settings' },
            { icon: LogOut, label: 'Log Out', action: onLogout, danger: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left ${
                item.danger ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Modal */}
      {aiModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setAiModal(p => ({ ...p, open: false }))}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-fade-up"
            style={{ maxHeight: '75vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#1a7a6e]" />
                <h3 className="font-semibold text-gray-900">AI Athlete Profile Summary</h3>
              </div>
              <button onClick={() => setAiModal(p => ({ ...p, open: false }))} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {aiModal.loading ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 size={28} className="animate-spin text-[#1a7a6e]" />
                <span className="text-sm text-gray-500">Generating your AI profile summary...</span>
              </div>
            ) : data ? (
              <div className="space-y-4">
                <div className="bg-[#e8f5f3] rounded-xl p-3">
                  <p className="text-sm text-gray-800 leading-relaxed">{data.summary}</p>
                </div>
                {data.strengths && (
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Your Strengths</h4>
                    <ul className="space-y-1">
                      {(data.strengths as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className="text-[#1a7a6e] mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.nextSteps && (
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Next Steps</h4>
                    <ol className="space-y-1">
                      {(data.nextSteps as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 bg-[#1a7a6e] text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
