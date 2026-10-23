import React, { useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Mic, 
  FileEdit, 
  BookOpen, 
  Headphones, 
  Crown, 
  Settings2, 
  X,
  Zap,
  ChevronRight,
  Compass,
  Layers
} from 'lucide-react';

export type PageTab = 
  | 'dashboard' 
  | 'quiz'
  | 'progress'
  | 'mock-arena'
  | 'practice-hub'
  | 'speaking' 
  | 'writing' 
  | 'reading' 
  | 'listening' 
  | 'report' 
  | 'pricing' 
  | 'onboarding'
  | 'system-check'
  | 'admin';

interface SidebarProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen = true, 
  onClose 
}) => {
  // Practice tabs group
  const isPracticeActive = ['practice-hub', 'speaking', 'writing', 'reading', 'listening'].includes(activeTab);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const coreNavItems = [
    { 
      id: 'dashboard', 
      label: "O'quv Rejasi (Plan)", 
      icon: Target, 
      color: 'text-[#ef3b2d]', 
      activeBg: 'bg-[#10152b] text-white',
      badge: 'Bugun',
      badgeClass: 'bg-[#ef3b2d] text-white',
    },
    { 
      id: 'progress', 
      label: 'Mening Natijalarim', 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      badge: '82%',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    { 
      id: 'mock-arena', 
      label: 'Mock Exam Arena', 
      icon: Award, 
      color: 'text-[#ef3b2d]', 
      badge: 'Full Test',
      badgeClass: 'bg-[#fde3dc] text-[#ef3b2d]',
    },
  ];

  const practiceLabs = [
    { 
      id: 'speaking', 
      label: '3D Foxy Speaking', 
      icon: Mic, 
      color: 'text-[#ff7a00]',
      dotBg: 'bg-[#ff7a00]',
      desc: 'AI Ovozli Examiner' 
    },
    { 
      id: 'writing', 
      label: 'AI Writing Evaluator', 
      icon: FileEdit, 
      color: 'text-[#ef3b2d]', 
      dotBg: 'bg-[#ef3b2d]',
      desc: 'Task 1 & Task 2' 
    },
    { 
      id: 'reading', 
      label: 'Reading & Vocab Lab', 
      icon: BookOpen, 
      color: 'text-[#10b981]', 
      dotBg: 'bg-[#10b981]',
      desc: 'TFNG & Smart Lug\'at' 
    },
    { 
      id: 'listening', 
      label: 'Listening Audio Lab', 
      icon: Headphones, 
      color: 'text-[#0284c7]', 
      dotBg: 'bg-[#0284c7]',
      desc: 'Section 1–4 Audio' 
    },
  ];

  const bottomNavItems = [
    { 
      id: 'admin', 
      label: 'Admin & AI Studio', 
      icon: Settings2, 
      color: 'text-purple-600', 
      badge: 'Admin',
      badgeClass: 'bg-purple-100 text-purple-800 font-bold',
    },
    { 
      id: 'pricing', 
      label: 'VIP Sinov & Tariflar', 
      icon: Crown, 
      color: 'text-amber-500', 
      badge: 'PRO',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    { 
      id: 'system-check', 
      label: 'Tizim Tekshiruvi', 
      icon: Layers, 
      color: 'text-slate-600', 
      badge: 'Check',
      badgeClass: 'bg-gray-100 text-gray-700',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Modern Fixed Sidebar with NO layout overlap */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 lg:w-72 bg-white z-30 flex flex-col justify-between border-r border-[#eadfc9]/80 shadow-[2px_0_20px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5 px-3.5 pt-4 pb-2 overflow-y-auto custom-scrollbar">
          
          {/* Top Mobile Close Bar */}
          <div className="flex md:hidden items-center justify-between pb-2 border-b border-[#eadfc9]">
            <span className="text-xs font-black uppercase tracking-wider text-[#10152b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef3b2d] animate-pulse" />
              MockLife Menyu
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#10152b] hover:bg-[#fdf6e9] transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Section 1: ASOSIY O'QUV DASTURI */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7a7f95]">
                Asosiy Dastur
              </span>
              <span className="text-[10px] font-extrabold text-[#ef3b2d] bg-[#fde3dc] px-2 py-0.5 rounded-full">
                IELTS 2026
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              {coreNavItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as PageTab);
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-left group cursor-pointer ${
                      isActive
                        ? 'bg-[#10152b] text-white shadow-sm font-extrabold'
                        : 'text-[#2a3048] hover:bg-[#fdf6e9] hover:text-[#10152b] font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-white/10 text-white' : 'bg-[#fdf6e9] ' + item.color
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeClass
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: TAYYORGARLIK LABORATORIYALARI (4 SKILLS) */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7a7f95]">
                Tayyorgarlik Modullari
              </span>
              <button
                onClick={() => {
                  setActiveTab('practice-hub');
                  if (window.innerWidth < 768 && onClose) onClose();
                }}
                className="text-[10px] font-extrabold text-[#7a7f95] hover:text-[#ef3b2d] flex items-center gap-0.5 transition"
              >
                <span>Barchasi</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {practiceLabs.map((lab) => {
                const isActive = activeTab === lab.id;
                const Icon = lab.icon;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setActiveTab(lab.id as PageTab);
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-left group cursor-pointer ${
                      isActive
                        ? 'bg-[#10152b] text-white shadow-sm font-extrabold'
                        : 'text-[#2a3048] hover:bg-[#fdf6e9] hover:text-[#10152b] font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-white/10 text-white' : 'bg-[#fdf6e9] ' + lab.color
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold tracking-tight leading-tight">
                          {lab.label}
                        </span>
                        <span className={`text-[10px] font-bold leading-tight ${
                          isActive ? 'text-white/70' : 'text-[#7a7f95]'
                        }`}>
                          {lab.desc}
                        </span>
                      </div>
                    </div>

                    <span className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? 'bg-white scale-125' : lab.dotBg + ' opacity-60 group-hover:opacity-100'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 3: SOZLAMALAR & TARIFLAR */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7a7f95]">
                Qo'shimcha & Sozlamalar
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              {bottomNavItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as PageTab);
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-left group cursor-pointer ${
                      isActive
                        ? 'bg-[#10152b] text-white shadow-sm font-extrabold'
                        : 'text-[#2a3048] hover:bg-[#fdf6e9] hover:text-[#10152b] font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-white/10 text-white' : 'bg-[#fdf6e9] ' + item.color
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeClass
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Footer: MockLife AI Engine Status Card */}
        <div className="p-3 border-t border-[#eadfc9]/70 bg-gradient-to-b from-white to-[#fdf6e9]/40">
          <div className="bg-[#fdf6e9] rounded-2xl p-3 border border-[#eadfc9] flex items-center justify-between shadow-xs hover:border-[#ef3b2d]/40 transition">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#10152b] leading-tight">
                  MockLife AI Core
                </span>
                <span className="text-[10px] text-emerald-700 font-extrabold leading-tight">
                  Examiner Engine v4.5 • Faol
                </span>
              </div>
            </div>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
