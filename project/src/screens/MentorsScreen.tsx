import { useState } from 'react';
import { Search, Filter, Sparkles, Loader2, X } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { MentorCard } from '../components/MentorCard';
import { MENTORS, SPORTS } from '../data/mockData';
import { getMentorMatchExplanation } from '../services/gemini';
import type { Mentor } from '../types';
import { MOCK_USER } from '../data/mockData';

export function MentorsScreen() {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [aiModal, setAiModal] = useState<{ text: string; loading: boolean; mentor: Mentor | null }>({
    text: '', loading: false, mentor: null,
  });

  const filtered = MENTORS.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSport = !sportFilter || m.sport === sportFilter || m.sport === 'Multi-sport';
    return matchSearch && matchSport;
  });

  async function handleAiExplain(mentor: Mentor) {
    setAiModal({ text: '', loading: true, mentor });
    const text = await getMentorMatchExplanation({
      athleteName: MOCK_USER.name,
      sport: MOCK_USER.sport,
      mentorName: mentor.name,
      mentorSpecialty: mentor.specialty,
    });
    setAiModal(prev => ({ ...prev, text, loading: false }));
  }

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
  }

  return (
    <div className="overflow-y-auto pb-24">
      <TopBar rightAction={{ label: 'Report Issue', onClick: () => {}, danger: true }} />

      <div className="px-4 pt-5">
        <h1 className="font-poppins font-bold text-2xl text-[#1a7a6e] mb-1">Find Your Mentor</h1>
        <p className="text-sm text-gray-500 mb-5">Connect with verified coaches and sports experts.</p>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none"
          />
        </div>

        {/* Sport filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {['', 'Kabaddi', 'Wrestling', 'Athletics', 'Boxing', 'Multi-sport'].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setSportFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                sportFilter === s
                  ? 'bg-[#1a7a6e] border-[#1a7a6e] text-white'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
              }`}
            >
              {s || 'All Sports'}
            </button>
          ))}
        </div>

        {/* AI recommendation banner */}
        <div className="bg-gradient-to-r from-[#1a7a6e] to-[#22a99a] rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">AI Mentor Matching</p>
            <p className="text-white/70 text-xs">Tap "AI Match" on any mentor to understand the fit.</p>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No mentors found. Try a different search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(m => (
              <MentorCard
                key={m.id}
                mentor={m}
                onConnect={id => console.log('connect', id)}
                onAiExplain={handleAiExplain}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Modal */}
      {aiModal.mentor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setAiModal(p => ({ ...p, mentor: null }))}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-fade-up"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#1a7a6e]" />
                <h3 className="font-semibold text-gray-900">AI Mentor Match Analysis</h3>
              </div>
              <button onClick={() => setAiModal(p => ({ ...p, mentor: null }))} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <img src={aiModal.mentor.avatar} alt={aiModal.mentor.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">{aiModal.mentor.name}</p>
                <p className="text-xs text-gray-500">{aiModal.mentor.specialty}</p>
              </div>
              {aiModal.mentor.matchScore && (
                <span className="ml-auto text-sm font-bold text-[#1a7a6e] bg-[#e8f5f3] px-2 py-1 rounded-full">
                  {aiModal.mentor.matchScore}% Match
                </span>
              )}
            </div>
            {aiModal.loading ? (
              <div className="flex items-center gap-3 py-6">
                <Loader2 size={18} className="animate-spin text-[#1a7a6e]" />
                <span className="text-sm text-gray-500">Analyzing match with AI...</span>
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
