import { Zap, Clock, ChevronRight } from 'lucide-react';
import type { Scholarship } from '../types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onApply?: (id: string) => void;
  onDetails?: (id: string) => void;
  onAiExplain?: (s: Scholarship) => void;
  showBadge?: boolean;
}

export function ScholarshipCard({
  scholarship,
  onApply,
  onDetails,
  onAiExplain,
  showBadge = true,
}: ScholarshipCardProps) {
  const badgeConfig = {
    open: { label: 'TOP MATCH', bg: 'bg-[#e8f5f3] text-[#1a7a6e]' },
    closing_soon: { label: 'CLOSING SOON', bg: 'bg-amber-100 text-amber-700' },
    closed: { label: 'CLOSED', bg: 'bg-gray-100 text-gray-500' },
  };
  const badge = badgeConfig[scholarship.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 card-hover">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {scholarship.logo && (
            <img
              src={scholarship.logo}
              alt={scholarship.provider}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            {showBadge && (
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${badge.bg}`}>
                {badge.label}
              </span>
            )}
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{scholarship.title}</h3>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 ml-2">
          <Zap size={13} className="text-amber-500" />
          <span className="text-sm font-bold text-[#1a7a6e]">{scholarship.matchScore}% Match</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
        <div>
          <span className="text-gray-400 uppercase tracking-wide text-[10px]">Amount</span>
          <p className="font-semibold text-gray-900 mt-0.5">{scholarship.amount}</p>
        </div>
        <div>
          <span className="text-gray-400 uppercase tracking-wide text-[10px]">Deadline</span>
          <p className="font-semibold text-gray-900 mt-0.5">{scholarship.deadline}</p>
        </div>
        <div>
          <span className="text-gray-400 uppercase tracking-wide text-[10px]">Sport</span>
          <p className="font-medium text-gray-700 mt-0.5">{scholarship.sport}</p>
        </div>
        <div>
          <span className="text-gray-400 uppercase tracking-wide text-[10px]">Eligibility</span>
          <p className="font-medium text-gray-700 mt-0.5">{scholarship.eligibility}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{scholarship.description}</p>

      <div className="flex items-center gap-2">
        {scholarship.applicants && (
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={10} /> {scholarship.applicants}+ applied
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => onDetails?.(scholarship.id)}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            Details <ChevronRight size={12} />
          </button>
          {onAiExplain && (
            <button
              onClick={() => onAiExplain(scholarship)}
              className="px-3 py-1.5 border border-[#1a7a6e] text-[#1a7a6e] text-xs font-medium rounded-lg hover:bg-[#e8f5f3] transition-colors"
            >
              AI Explain
            </button>
          )}
          {scholarship.status !== 'closed' && (
            <button
              onClick={() => onApply?.(scholarship.id)}
              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
