import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  GraduationCap, 
  FileBarChart, 
  Settings 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export type TabType = 'dashboard' | 'schedule' | 'tasks' | 'learning' | 'reports' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
}) => {
  const t = translations[language];

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'schedule', label: t.schedule, icon: Calendar },
    { id: 'tasks', label: t.tasks, icon: CheckSquare },
    { id: 'learning', label: t.learning, icon: GraduationCap },
    { id: 'reports', label: t.reports, icon: FileBarChart },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090909]/95 dark:bg-[#090909]/95 backdrop-blur-md border-t border-zinc-800/80 safe-area-pb transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 font-normal'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px] text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
