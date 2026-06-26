import { Home, Users, Award, Shield, User } from 'lucide-react';
import type { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'mentors', label: 'Mentors', Icon: Users },
  { id: 'grants', label: 'Grants', Icon: Award },
  { id: 'safety', label: 'Safety', Icon: Shield },
  { id: 'profile', label: 'Profile', Icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50 shadow-lg">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all duration-200 ${
                active ? 'text-[#1a7a6e]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                <Icon size={22} className={active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1a7a6e] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
