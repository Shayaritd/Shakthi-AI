import { useState } from 'react';
import { Shield, Phone, Flag, BookOpen, Heart, AlertTriangle, ChevronRight, Sparkles, Loader2, X, Lock, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { getSafetyGuidance } from '../services/gemini';

const RESOURCES = [
  {
    id: '1',
    icon: Phone,
    title: '24/7 Safety Helpline',
    desc: 'Encrypted, immediate assistance. Toll-free: 1800-XXX-SHAKTHI',
    color: 'bg-red-50 text-red-600',
    urgent: true,
  },
  {
    id: '2',
    icon: Flag,
    title: 'Report Misconduct',
    desc: 'Anonymous, secure reporting of unsafe behavior, harassment, or abuse.',
    color: 'bg-amber-50 text-amber-600',
    urgent: false,
  },
  {
    id: '3',
    icon: BookOpen,
    title: 'Know Your Rights',
    desc: 'POCSO Act, athlete rights, and legal resources in simple language.',
    color: 'bg-blue-50 text-blue-600',
    urgent: false,
  },
  {
    id: '4',
    icon: Heart,
    title: 'Counseling Support',
    desc: 'Connect with trained counselors confidentially — no judgment.',
    color: 'bg-[#e8f5f3] text-[#1a7a6e]',
    urgent: false,
  },
];

const SAFE_PRACTICES = [
  'Never share your home address with coaches you just met',
  'All official payments come directly to your account — not through middlemen',
  'Every adult on SHAKTHI is background-verified',
  'You can block or report any user at any time',
  'Trials and matches must be in official, registered venues',
];

export function SafetyScreen() {
  const [reportModal, setReportModal] = useState(false);
  const [aiModal, setAiModal] = useState<{ open: boolean; question: string; answer: string; loading: boolean }>({
    open: false, question: '', answer: '', loading: false,
  });
  const [reportForm, setReportForm] = useState({ type: '', description: '', anonymous: true });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  async function handleAiHelp() {
    if (!aiModal.question.trim()) return;
    setAiModal(p => ({ ...p, loading: true, answer: '' }));
    const answer = await getSafetyGuidance(aiModal.question);
    setAiModal(p => ({ ...p, answer, loading: false }));
  }

  function formatText(text: string) {
    return text.split('\n').map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />;
    });
  }

  async function handleSubmitReport() {
    await new Promise(r => setTimeout(r, 1000));
    setReportSubmitted(true);
  }

  return (
    <div className="overflow-y-auto pb-24">
      <TopBar rightAction={{ label: 'Emergency', onClick: () => {}, danger: true }} />

      <div className="px-4 pt-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="font-poppins font-bold text-2xl text-[#1a7a6e] leading-tight">Your Safety,<br />Our Priority</h1>
          <p className="text-sm text-gray-500 mt-1">SHAKTHI has zero tolerance for misconduct. Every report is taken seriously.</p>
        </div>

        {/* Emergency banner */}
        <div className="bg-red-600 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Immediate Danger?</p>
            <p className="text-white/80 text-xs">Call 112 (Police) or 1098 (Child Helpline)</p>
          </div>
          <a href="tel:112" className="bg-white text-red-600 text-xs font-bold px-3 py-2 rounded-xl">
            CALL NOW
          </a>
        </div>

        {/* Safety resources */}
        <h2 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">Support Resources</h2>
        <div className="space-y-3 mb-6">
          {RESOURCES.map(r => (
            <button
              key={r.id}
              onClick={() => r.id === '2' && setReportModal(true)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 text-left card-hover"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                <r.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* AI Safety Assistant */}
        <div className="bg-gradient-to-br from-[#1a7a6e] to-[#0e4840] rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-white" />
            <h3 className="text-white font-semibold text-sm">AI Safety Assistant</h3>
          </div>
          <p className="text-white/70 text-xs mb-3">
            Ask about safety concerns privately. AI provides supportive guidance — not legal advice.
          </p>
          <div className="bg-white/10 rounded-xl p-2 flex gap-2">
            <input
              type="text"
              value={aiModal.question}
              onChange={e => setAiModal(p => ({ ...p, question: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && !aiModal.loading && setAiModal(p => ({ ...p, open: true }))}
              placeholder="Type your concern..."
              className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
            />
            <button
              onClick={() => { setAiModal(p => ({ ...p, open: true })); handleAiHelp(); }}
              disabled={!aiModal.question.trim() || aiModal.loading}
              className="bg-white text-[#1a7a6e] px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {aiModal.loading ? <Loader2 size={12} className="animate-spin" /> : 'Ask AI'}
            </button>
          </div>
        </div>

        {/* Safe practices */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={15} className="text-[#1a7a6e]" />
            <h3 className="font-semibold text-gray-900 text-sm">Safe Practices</h3>
          </div>
          <ul className="space-y-2">
            {SAFE_PRACTICES.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle size={13} className="text-[#1a7a6e] mt-0.5 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* The Safety Promise */}
        <div className="bg-[#e8f5f3] rounded-2xl p-4 border border-[#c8e6e1]">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={15} className="text-[#1a7a6e]" />
            <h3 className="font-semibold text-[#1a7a6e] text-sm">THE SAFETY PROMISE</h3>
          </div>
          <p className="text-xs text-[#1a7a6e]/80 leading-relaxed">
            We prioritize the dignity and security of our athletes — places all above.
          </p>
        </div>
      </div>

      {/* AI Answer Modal */}
      {aiModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setAiModal(p => ({ ...p, open: false }))}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-fade-up"
            style={{ maxHeight: '75vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#1a7a6e]" />
                <h3 className="font-semibold text-gray-900">Safety Guidance</h3>
              </div>
              <button onClick={() => setAiModal(p => ({ ...p, open: false }))} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-4 flex items-start gap-2">
              <AlertTriangle size={13} className="text-amber-600 mt-0.5" />
              <p className="text-[10px] text-amber-700">AI guidance only. Not legal advice. For emergencies, call 112.</p>
            </div>
            {aiModal.question && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium">Your question:</p>
                <p className="text-sm text-gray-800 mt-1">{aiModal.question}</p>
              </div>
            )}
            {aiModal.loading ? (
              <div className="flex items-center gap-3 py-6">
                <Loader2 size={18} className="animate-spin text-[#1a7a6e]" />
                <span className="text-sm text-gray-500">SHAKTHI AI is thinking...</span>
              </div>
            ) : (
              <div className="text-gray-700 leading-relaxed">{formatText(aiModal.answer)}</div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => { setReportModal(false); setReportSubmitted(false); }}>
          <div
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 pb-8 animate-fade-up"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {reportSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#e8f5f3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[#1a7a6e]" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-500 mb-4">Your report has been encrypted and sent to our Safety Officers. We'll act within 24 hours.</p>
                <button onClick={() => { setReportModal(false); setReportSubmitted(false); }} className="btn-primary px-8 py-3 rounded-xl text-sm font-medium">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Report an Issue</h3>
                  <button onClick={() => setReportModal(false)}>
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="bg-[#e8f5f3] rounded-xl p-3 mb-4 flex items-start gap-2">
                  <Lock size={13} className="text-[#1a7a6e] mt-0.5" />
                  <p className="text-xs text-[#1a7a6e]">This report is encrypted and confidential. Your identity is protected.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Type of Issue</label>
                    <select
                      value={reportForm.type}
                      onChange={e => setReportForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none"
                    >
                      <option value="">Select type</option>
                      <option>Physical misconduct</option>
                      <option>Verbal abuse / harassment</option>
                      <option>Financial fraud / scam</option>
                      <option>Unsafe environment</option>
                      <option>Unauthorized contact</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
                    <textarea
                      value={reportForm.description}
                      onChange={e => setReportForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe what happened (as much or as little as you're comfortable sharing)..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setReportForm(p => ({ ...p, anonymous: !p.anonymous }))}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        reportForm.anonymous ? 'bg-[#1a7a6e] border-[#1a7a6e]' : 'border-gray-300'
                      }`}
                    >
                      {reportForm.anonymous && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">Submit anonymously</span>
                  </label>
                  <button
                    onClick={handleSubmitReport}
                    className="w-full bg-red-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
