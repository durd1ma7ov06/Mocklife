import React from 'react';
import { useExam } from '../context/ExamContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useUser } from '../context/UserContext.js';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenStreak?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenStreak, 
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  const { mode, setMode } = useExam();
  const { theme, toggleTheme } = useTheme();
  const { user, setProfileModalOpen } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-high/40 shadow-[0_1px_8px_rgba(0,0,0,0.3)] transition-colors duration-200">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-space-base">
        
        {/* Brand & Global Switcher */}
        <div className="flex items-center gap-2 sm:gap-space-sm">
          {/* Universal Sidebar Toggle / Focus Mode Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all border border-surface-container-high/50 cursor-pointer active:scale-95 flex items-center justify-center"
            title={isSidebarOpen ? "Sidebarni yashirish / Fokus rejimi (Ctrl+B)" : "Sidebarni ochish (Ctrl+B)"}
          >
            <span className="material-symbols-outlined text-xl">
              {isSidebarOpen ? "menu_open" : "menu"}
            </span>
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none group">
            <img
              alt="IELTIX 3D Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover shadow-[0_0_20px_rgba(0,229,255,0.4)] ring-1 ring-cyan-500/40 group-hover:scale-105 transition-transform duration-300"
              src="/ieltix-logo.png"
            />
            <div className="flex flex-col">
              <span className="font-headline text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center">
                IELTI<span className="text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0,229,255,0.7)]">X</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-cyan-400/80 font-bold -mt-1">
                AI EXAM ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Search, Theme, Balance, VIP & Profile */}
        <div className="flex items-center gap-space-base">
          {/* Quick Search Bar */}
          <div
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-xl text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer w-56 lg:w-64 justify-between border border-surface-container-high/40"
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-sm">search</span>
              <span className="font-body-sm text-xs">Search modules, tips...</span>
            </div>
            <kbd className="bg-surface-container-highest px-1.5 py-0.5 rounded font-code text-[10px] text-on-surface-variant">⌘K</kbd>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all border border-surface-container-high/40"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Streak & Intizom Badge */}
          <button
            onClick={onOpenStreak}
            title="Kunlik Intizom & Streak Taqvimi"
            className="flex items-center gap-1.5 bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 hover:border-[#FF7A00]/60 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-base animate-pulse group-hover:scale-110 transition-transform">
              local_fire_department
            </span>
            <span className="font-label-md text-xs font-bold">
              {user.stats.studyStreakDays || 9} Kun
            </span>
            <span className="text-[10px] uppercase font-extrabold bg-[#FF7A00] text-black px-1.5 py-0.5 rounded-full ml-0.5 tracking-tight shadow-sm">
              Streak
            </span>
          </button>

          {/* MAX VIP Badge */}
          <div className="hidden sm:flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container-high shadow-[0_0_12px_rgba(128,131,255,0.25)] border border-primary/20">
            <span className="text-xs">👑</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold bg-gradient-to-r from-primary via-primary-fixed-dim to-tertiary bg-clip-text text-transparent">
              {user.vipTier.replace('_', ' ')}
            </span>
          </div>

          {/* Candidate Profile Button */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            title="Profil sozlamalari"
            className="flex items-center gap-space-sm pl-space-xs p-1.5 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary shadow-sm"
                src={user.avatarUrl}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-label-md text-xs font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">
                {user.name}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant leading-tight">
                {user.targetBand}
              </span>
            </div>
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-on-surface hidden sm:block">
              expand_more
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
