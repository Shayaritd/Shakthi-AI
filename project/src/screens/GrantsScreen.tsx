import { useState } from 'react';
import { Search, Filter, CheckCircle, TrendingUp, Sparkles, Loader2, X, BarChart2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { ScholarshipCard } from '../components/ScholarshipCard';
import { SCHOLARSHIPS, LIVE_APPLICATIONS } from '../data/mockData';
import { getScholarshipExplanation } from '../services/gemini';
import { MOCK_USER } from '../data/mockData';
import type { Scholarship } from '../types';

type SubTab = 'recommended' | 'applied' | 'tracking';

export function GrantsScreen() {
  const [subTab, setSubTab] = useState<SubTab>('recommended');
  const [search, setSearch] = useState('');
  const [aiModal, setAiModal] = useState<{ text: string; loading: boolean; title: string } | null>(null);

  async function handleAiExplain(s: Scholarship) {
    setAiModal({ text: '', loading: true, title: s.title });
    const text = await getScholarshipExplanation({
      athleteName: MOCK_USER.name,
      sport: MOCK_USER.sport,
      scholarship: s.title,
      eligibility: s.eligibility,
    });
    setAiModal(prev => prev ? { ...prev, text, loading: false } : null);
  }

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
  }

  const statusColor: Record<string, string> = {
    'In Review': 'text-amber-700 bg-amber-100',
    'Shortlisted': 'text-[#1a7a6e] bg-[#e8f5f3]',
    'Submitted': 'text-gray-600 bg-gray-100',
  };

  const dotColor: Record<string, string> = {
    'In Review': 'bg-amber-400',
    'Shortlisted': 'bg-[#1a7a6e]',
    'Submitted': 'bg-gray-300',
  };

  return (
    <div className="overflow-y-auto pb-24">
      <TopBar rightAction={{ label: 'Report Issue', onClick: () => {}, danger: true }} />

      <div className="px-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-[#1a7a6e] leading-tight">Find Your Path<br />to Excellence</h1>
            <p className="text-sm text-gray-500 mt-1">Access exclusive grants and scholarships designed for India's future champions.</p>
          </div>
        </div>

        {/* KYC badge */}
        <div className="flex items-center gap-2 bg-[#e8f5f3] border border-[#c8e6e1] rounded-xl px-3 py-2 mb-4">
          <CheckCircle size={15} className="text-[#1a7a6e]" />
          <span className="text-xs font-semibold text-[#1a7a6e] uppercase tracking-wide">KYC Verified Profile</span>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by foundation or sport name"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white outline-none">
              <option>All States</option>
            </select>
            <select className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white outline-none">
              <option>All Sports</option>
            </select>
            <select className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white outline-none">
              <option>Income Level</option>
            </select>
            <button className="bg-[#1a7a6e] text-white px-3 py-2 rounded-xl flex items-center gap-1 flex-shrink-0">
              <Filter size={13} />
              <span className="text-xs font-medium">Search</span>
            </button>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {(['recommended', 'applied', 'tracking'] as SubTab[]).map(t => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-all ${
                subTab === t
                  ? 'text-[#1a7a6e] border-b-2 border-[#1a7a6e]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'tracking' ? 'Applic. Tracker' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Recommended tab */}
        {subTab === 'recommended' && (
          <div className="space-y-4 animate-fade-up">
            {SCHOLARSHIPS.filter(s =>
              !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase())
            ).map(s => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                onApply={id => console.log('apply', id)}
                onDetails={id => console.log('details', id)}
                onAiExplain={handleAiExplain}
              />
            ))}
          </div>
        )}

        {/* Applied tab */}
        {subTab === 'applied' && (
          <div className="animate-fade-up text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart2 size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">You haven't applied to any scholarships yet.</p>
            <button onClick={() => setSubTab('recommended')} className="mt-3 btn-primary px-6 py-2 rounded-xl text-sm font-medium">
              Browse Scholarships
            </button>
          </div>
        )}

        {/* Tracking tab */}
        {subTab === 'tracking' && (
          <div className="animate-fade-up space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-[#1a7a6e]" />
                <h3 className="font-semibold text-gray-900 text-sm">Live Tracking</h3>
              </div>
              <div className="space-y-4">
                {LIVE_APPLICATIONS.map(app => (
                  <div key={app.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor[app.status]}`} />
                      <span className="font-medium text-sm text-gray-900">{app.name}</span>
                      <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="ml-4 mb-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-bar"
                          style={{ width: `${app.progress}%`, backgroundColor: app.color }}
                        />
                      </div>
                    </div>
                    <p className="ml-4 text-xs text-gray-400">{app.stage}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                View History
              </button>
            </div>

            {/* Profile strength */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Profile Strength</h3>
              <p className="text-xs text-gray-500 mb-3">Complete your training logs to unlock higher grant tiers.</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-[#1a7a6e]">82%</span>
                <span className="text-xs text-gray-400">Almost there!</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-amber-400 rounded-full progress-bar" style={{ width: '82%' }} />
              </div>
              <button className="w-full btn-gold py-3 rounded-xl text-sm font-semibold">Update Progress</button>
            </div>
          </div>
        )}
      </div>

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
            <p className="text-xs bg-[#e8f5f3] text-[#1a7a6e] px-2 py-1 rounded-full inline-block mb-3 font-medium">
              {aiModal.title}
            </p>
            {aiModal.loading ? (
              <div className="flex items-center gap-3 py-6">
                <Loader2 size={18} className="animate-spin text-[#1a7a6e]" />
                <span className="text-sm text-gray-500">Analyzing with Gemini AI...</span>
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
