import React from 'react';
import { Search, Moon, Sun, Globe } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  language: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  theme,
  onToggleLanguage,
  onToggleTheme,
  onOpenSearch,
  activeTabTitle,
}) => {
  const t = translations[language];

  // Format today's date in Persian or English
  const now = new Date();
  const dateFormatted = language === 'fa'
    ? new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
    : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);

  return (
    <header className="sticky top-0 z-30 bg-[#090909]/95 dark:bg-[#090909]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Brand & Date */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm shrink-0 shadow-sm shadow-amber-500/20">
          MP
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-zinc-100 truncate tracking-tight">
            {activeTabTitle || t.appName}
          </h1>
          <p className="text-xs text-zinc-400 truncate font-medium">
            {dateFormatted}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenSearch}
          aria-label="Search"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleLanguage}
          aria-label="Change Language"
          className="min-h-[44px] px-2.5 flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'fa' ? 'EN' : 'فا'}</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95"
        >
          {theme === 'amoled' || theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-300" />
          )}
        </button>
      </div>
    </header>
  );
};
