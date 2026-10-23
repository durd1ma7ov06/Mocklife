import React from 'react';
import { useExam } from '../context/ExamContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  Search, 
  Flame, 
  Home, 
  LogOut, 
  ShieldCheck, 
  Crown,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenStreak?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenStreak, 
  onToggleSidebar,
  isSidebarOpen = true,
  onOpenLanding,
}) => {
  const { mode } = useExam();
  const { user, setProfileModalOpen, logout } = useUser();
  const { user: authUser } = useAuth();

  const displayName = authUser?.name || user?.name || 'Nomzod';
  const targetBand = user?.targetBand || '7.5 Academic';
  const streakDays = user?.stats?.studyStreakDays || 9;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fdf6e9]/95 backdrop-blur-md border-b border-[#eadfc9] shadow-sm transition-all">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left Side: Sidebar Toggle + Brand Logo + Bosh sahifa Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full bg-white hover:bg-[#f3ead6] text-[#10152b] border border-[#eadfc9] transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
            title={isSidebarOpen ? "Sidebarni yashirish (Ctrl+B)" : "Sidebarni ochish (Ctrl+B)"}
          >
            <Menu className="w-4 h-4 text-[#10152b]" />
          </button>

          {/* Clean MockLife Brand Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] inline-block animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10152b] inline-block" />
            </div>
            <div className="flex flex-col">
              <span className="font-unbounded font-black text-base sm:text-lg tracking-tight text-[#10152b] leading-tight">
                Mock<span className="text-[#ef3b2d]">Life</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#ef3b2d] font-extrabold -mt-0.5 hidden sm:block">
                AI EXAM ENGINE
              </span>
            </div>
          </div>

          {/* Quick Return to Landing Page Button */}
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f3ead6] text-xs font-extrabold text-[#10152b] border border-[#eadfc9] transition-all cursor-pointer shadow-xs active:scale-95 ml-1"
              title="Bosh sahifa (Landing) ga qaytish"
            >
              <Home className="w-3.5 h-3.5 text-[#ef3b2d]" />
              <span className="hidden md:inline">Bosh sahifa</span>
            </button>
          )}
        </div>

        {/* Center: Quick Search Bar */}
        <div
          onClick={onOpenSearch}
          className="hidden md:flex items-center justify-between gap-2 bg-white hover:bg-[#faf5ea] px-4 py-1.5 rounded-full text-[#7a7f95] hover:text-[#10152b] transition-all cursor-pointer w-52 lg:w-64 border border-[#eadfc9] shadow-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#7a7f95]" />
            <span className="text-xs font-bold truncate">Qidirish, modullar...</span>
          </div>
          <kbd className="bg-[#fdf6e9] border border-[#eadfc9] px-1.5 py-0.5 rounded text-[10px] font-bold text-[#10152b]">⌘K</kbd>
        </div>

        {/* Right Side: 7 Kunlik Sinov + Streak + Candidate Profile + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 7 Kunlik Bepul Sinov Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold tracking-tight">
              7 kunlik bepul sinov
            </span>
          </div>

          {/* Streak & Intizom Badge */}
          <button
            onClick={onOpenStreak}
            title="Kunlik Intizom & Streak Taqvimi"
            className="flex items-center gap-1.5 bg-[#fef3e7] hover:bg-[#fee7d0] text-[#ff7a00] border border-[#ffd5a8] px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Flame className="w-4 h-4 fill-[#ff7a00] animate-pulse" />
            <span className="text-xs font-black">{streakDays} kun</span>
          </button>

          {/* Candidate Profile Button */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            title="Profil sozlamalari"
            className="flex items-center gap-2 bg-white hover:bg-[#f3ead6] border border-[#eadfc9] pl-1.5 pr-3 py-1 rounded-full transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-7 h-7 rounded-full bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-black text-xs shrink-0 border border-[#fbd0c4]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-extrabold text-[#10152b] leading-tight truncate max-w-[100px]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#ef3b2d] font-bold leading-tight">
                {targetBand}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7a7f95] group-hover:text-[#10152b]" />
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            title="Tizimdan chiqish"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-rose-50 text-[#7a7f95] hover:text-[#ef3b2d] transition-all border border-[#eadfc9] hover:border-rose-200 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </header>
  );
};
export default Header;
