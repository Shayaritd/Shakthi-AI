import { CheckCircle, Star, MapPin } from 'lucide-react';
import type { Mentor } from '../types';

interface MentorCardProps {
  mentor: Mentor;
  compact?: boolean;
  onConnect?: (id: string) => void;
  onAiExplain?: (mentor: Mentor) => void;
}

export function MentorCard({ mentor, compact = false, onConnect, onAiExplain }: MentorCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 card-hover">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 text-sm">{mentor.name}</span>
            {mentor.verified && <CheckCircle size={13} className="text-[#1a7a6e] flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500">{mentor.specialty}</p>
        </div>
        {mentor.matchScore && (
          <div className="flex-shrink-0">
            <span className="text-xs font-bold text-[#1a7a6e] bg-[#e8f5f3] px-2 py-1 rounded-full">
              {mentor.matchScore}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 card-hover">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
            {mentor.verified && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-[#1a7a6e] bg-[#e8f5f3] px-1.5 py-0.5 rounded-full">
                <CheckCircle size={10} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{mentor.specialty}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star size={11} fill="currentColor" /> {mentor.rating}
              <span className="text-gray-400 ml-0.5">({mentor.reviews})</span>
            </span>
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin size={11} /> {mentor.state}
            </span>
          </div>
        </div>
        {mentor.matchScore && (
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-bold text-[#1a7a6e]">{mentor.matchScore}%</div>
            <div className="text-[10px] text-gray-400">Match</div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{mentor.bio}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onConnect?.(mentor.id)}
          className="flex-1 btn-primary py-2 rounded-xl text-sm font-medium"
        >
          Connect
        </button>
        {onAiExplain && (
          <button
            onClick={() => onAiExplain(mentor)}
            className="px-3 py-2 border border-[#1a7a6e] text-[#1a7a6e] text-sm font-medium rounded-xl hover:bg-[#e8f5f3] transition-colors"
          >
            AI Match
          </button>
        )}
      </div>
    </div>
  );
}
