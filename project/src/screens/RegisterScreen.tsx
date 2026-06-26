import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shield, Check, Loader2, Upload } from 'lucide-react';
import { ShakthiLogo } from '../components/ShakthiLogo';
import { STATES, SPORTS } from '../data/mockData';

interface RegisterScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = ['PERSONAL INFO', 'SPORTS DETAILS', 'ACHIEVEMENTS', 'GUARDIAN'];

export function RegisterScreen({ onComplete, onBack }: RegisterScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    state: '',
    district: '',
    language: '',
    sport: '',
    level: '',
    yearsPlaying: '',
    achievements: '',
    goals: '',
    guardianName: '',
    guardianPhone: '',
    relationship: '',
  });

  function update(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleNext() {
    if (step < 4) {
      setStep((step + 1) as Step);
    } else {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      setLoading(false);
      onComplete();
    }
  }

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={step === 1 ? onBack : () => setStep((step - 1) as Step)} className="p-1.5 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <ShakthiLogo />
        <button className="text-sm text-red-600 font-medium flex items-center gap-1">
          <Shield size={13} /> Report Issue
        </button>
      </header>

      <div className="overflow-y-auto pb-32">
        <div className="px-4 pt-6 pb-2">
          <h1 className="font-poppins font-bold text-2xl text-[#1a7a6e] mb-0.5">Begin Your Journey</h1>
          <p className="text-gray-500 text-sm mb-5">Step {step}: {
            ['Share your personal details with us.', 'Tell us about your sports background.', 'Highlight your achievements and goals.', 'Add a guardian for your safety.'][step - 1]
          }</p>

          {/* Step tabs */}
          <div className="flex gap-1 mb-6 relative">
            <div className="absolute bottom-0 left-0 h-0.5 bg-gray-200 w-full rounded" />
            <div className="absolute bottom-0 left-0 h-0.5 bg-[#1a7a6e] rounded transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            {STEPS.map((s, i) => (
              <div key={s} className={`flex-1 pb-2 text-center text-[9px] font-semibold tracking-wide transition-colors ${step >= i + 1 ? 'text-[#1a7a6e]' : 'text-gray-400'}`}>
                {s}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 animate-fade-up">
              <Field label="FULL NAME">
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="AGE">
                <input
                  type="number"
                  value={form.age}
                  onChange={e => update('age', e.target.value)}
                  placeholder="Years"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="STATE">
                <select
                  value={form.state}
                  onChange={e => update('state', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-white appearance-none"
                >
                  <option value="">Select State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="DISTRICT">
                <select
                  value={form.district}
                  onChange={e => update('district', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-white appearance-none"
                >
                  <option value="">Select District</option>
                  <option>Hisar</option>
                  <option>Rohtak</option>
                  <option>Gurugram</option>
                  <option>Panipat</option>
                </select>
              </Field>
              <Field label="PREFERRED LANGUAGE">
                <div className="flex gap-2 flex-wrap">
                  {['Hindi', 'English', 'Regional'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => update('language', lang)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        form.language === lang
                          ? 'bg-[#1a7a6e] border-[#1a7a6e] text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 2: Sports Details */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 animate-fade-up">
              <Field label="PRIMARY SPORT">
                <select
                  value={form.sport}
                  onChange={e => update('sport', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-white"
                >
                  <option value="">Select Sport</option>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="COMPETITION LEVEL">
                <div className="flex flex-wrap gap-2">
                  {['District', 'State', 'National', 'International'].map(l => (
                    <button
                      key={l}
                      onClick={() => update('level', l)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        form.level === l
                          ? 'bg-[#1a7a6e] border-[#1a7a6e] text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="YEARS PLAYING">
                <input
                  type="number"
                  value={form.yearsPlaying}
                  onChange={e => update('yearsPlaying', e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </Field>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a7a6e] transition-colors">
                <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload ID Proof</p>
                <p className="text-xs text-gray-400 mt-1">Aadhaar, Birth Certificate or School ID</p>
              </div>
            </div>
          )}

          {/* Step 3: Achievements */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 animate-fade-up">
              <Field label="ACHIEVEMENTS & MEDALS">
                <textarea
                  value={form.achievements}
                  onChange={e => update('achievements', e.target.value)}
                  placeholder="e.g. State Gold 2023, District champion 2022..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                />
              </Field>
              <Field label="YOUR GOALS">
                <textarea
                  value={form.goals}
                  onChange={e => update('goals', e.target.value)}
                  placeholder="e.g. Represent India at Asian Games by 2026..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                />
              </Field>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1a7a6e] transition-colors">
                <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Upload Certificates / Sports Reel</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, MP4 up to 50MB</p>
              </div>
            </div>
          )}

          {/* Step 4: Guardian */}
          {step === 4 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4 animate-fade-up">
              <p className="text-sm text-gray-500 -mt-1">Adding a guardian ensures safe communication and emergency contact.</p>
              <Field label="GUARDIAN'S FULL NAME">
                <input
                  type="text"
                  value={form.guardianName}
                  onChange={e => update('guardianName', e.target.value)}
                  placeholder="Enter guardian's name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label="GUARDIAN'S MOBILE NUMBER">
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
                  <input
                    type="tel"
                    value={form.guardianPhone}
                    onChange={e => update('guardianPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Mobile number"
                    className="flex-1 px-3 py-3 text-sm outline-none"
                  />
                </div>
              </Field>
              <Field label="RELATIONSHIP">
                <div className="flex flex-wrap gap-2">
                  {['Mother', 'Father', 'Sibling', 'Guardian'].map(r => (
                    <button
                      key={r}
                      onClick={() => update('relationship', r)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        form.relationship === r
                          ? 'bg-[#1a7a6e] border-[#1a7a6e] text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="bg-[#e8f5f3] rounded-xl p-3 flex items-start gap-2">
                <Shield size={14} className="text-[#1a7a6e] mt-0.5" />
                <p className="text-xs text-[#1a7a6e]">
                  Guardian will receive safety alerts and can monitor your account activity.
                </p>
              </div>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full btn-primary mt-5 py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : step < 4 ? (
              <>Next: {STEPS[step]} <ChevronRight size={16} /></>
            ) : (
              <>Complete Registration <Check size={16} /></>
            )}
          </button>

          {/* Verification notice */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <Shield size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Verification Notice</p>
              <p className="text-xs text-amber-700 mt-0.5">
                To ensure the safety and security of all athletes, you will be required to upload valid ID proof (Aadhar, Birth Certificate)
              </p>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div
          className="mx-4 mt-5 rounded-2xl overflow-hidden h-40 relative"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a7a6e]/90 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white font-poppins font-bold text-lg">You belong here.</p>
            <p className="text-white/80 text-xs mt-0.5">Every champion starts with a single step. We're here to support your dreams.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
