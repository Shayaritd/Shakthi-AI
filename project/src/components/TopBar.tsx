import { Bell, ChevronRight, Shield } from 'lucide-react';
import { ShakthiLogo } from './ShakthiLogo';

interface TopBarProps {
  showNotif?: boolean;
  notifCount?: number;
  rightAction?: { label: string; onClick: () => void; danger?: boolean };
  onNotifClick?: () => void;
}

export function TopBar({ showNotif = false, notifCount = 0, rightAction, onNotifClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <ShakthiLogo size="md" />
      <div className="flex items-center gap-2">
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              rightAction.danger
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-[#1a7a6e] bg-[#e8f5f3] hover:bg-[#d0ede9]'
            }`}
          >
            {rightAction.danger && <Shield size={14} />}
            {rightAction.label}
            <ChevronRight size={14} />
          </button>
        )}
        {showNotif && (
          <button
            onClick={onNotifClick}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={22} className="text-gray-600" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
