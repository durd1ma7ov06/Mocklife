import React, { useState, useEffect } from 'react';

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

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = false, onClose }) => {
  const isPracticeActive = ['practice-hub', 'speaking', 'writing', 'reading', 'listening'].includes(activeTab);
  const [practiceExpanded, setPracticeExpanded] = useState<boolean>(true);

  // Auto-expand accordion if user is on any practice tab
  useEffect(() => {
    if (isPracticeActive) {
      setPracticeExpanded(true);
    }
  }, [activeTab]);

  const topNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: 'Home' },
    { id: 'quiz', label: 'GoPrep AI Quiz', icon: 'psychology', color: 'text-amber-500', badge: 'Diagnostika' },
    { id: 'progress', label: 'My Progress', icon: 'trending_up', color: 'text-secondary', badge: '82%' },
    { id: 'mock-arena', label: 'Mock Test Arena', icon: 'verified', color: 'text-primary', badge: 'Exam' },
  ];

  const practiceSubItems = [
    { id: 'speaking', label: '3D AI Speaking Arena', icon: 'record_voice_over', color: 'text-cyan-400' },
    { id: 'writing', label: 'AI Writing Evaluator', icon: 'edit_note', color: 'text-primary' },
    { id: 'reading', label: 'Reading & Vocab', icon: 'menu_book', color: 'text-secondary' },
    { id: 'listening', label: 'Listening Module', icon: 'headphones', color: 'text-tertiary' },
  ];

  const bottomNavItems = [
    { id: 'report', label: 'Score Report & QR', icon: 'verified', color: 'text-primary', badge: 'TRF', badgeClass: 'bg-primary/20 text-primary' },
    { id: 'pricing', label: 'Pricing & VIP', icon: 'diamond', color: 'text-tertiary', badge: 'PRO' },
    { id: 'system-check', label: 'System Check', icon: 'tune', badge: 'Check' },
    { id: 'admin', label: 'Admin Studio', icon: 'admin_panel_settings', color: 'text-primary', badge: 'New', badgeClass: 'bg-primary/20 text-primary' },
  ];

  return (
    <>
      {/* Mobile Backdrop (only on small phone screens < 768px, no blur) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/40 md:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest z-30 flex flex-col justify-between py-space-base shadow-[1px_0_12px_rgba(0,0,0,0.25)] border-r border-surface-container-high/30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-space-xs px-space-sm overflow-y-auto">
          {/* Top Header inside Sidebar with Close / Collapse button */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 rounded-xl bg-surface-container-low/60 border border-surface-container-high/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Navigatsiya
            </span>
            <button
              onClick={onClose}
              title="Sidebarni yashirish / Fokus rejimi"
              className="flex items-center gap-0.5 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface px-2 py-0.5 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span>Yopish</span>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {/* 1. Top Core Navigation (Dashboard, Progress, Mock Arena) */}
            {topNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as PageTab);
                    if (window.innerWidth < 768 && onClose) {
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-space-md py-space-sm rounded-xl transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                        item.color || (isActive ? 'text-on-primary-container' : '')
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-lg text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-on-primary-container/20 text-on-primary-container'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 2. Unified Practice Labs (Collapsible Accordion Module) */}
            <div className="flex flex-col my-0.5">
              <div
                className={`flex items-center justify-between px-space-md py-space-sm rounded-xl transition-all group cursor-pointer ${
                  activeTab === 'practice-hub'
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                    : isPracticeActive
                    ? 'bg-surface-container-low text-on-surface font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div
                  onClick={() => {
                    setActiveTab('practice-hub');
                    setPracticeExpanded(true);
                  }}
                  className="flex items-center gap-space-sm flex-1"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary transition-transform group-hover:scale-110">
                    model_training
                  </span>
                  <span className="font-label-lg text-sm">Practice Labs</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant">
                    4 Labs
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPracticeExpanded(prev => !prev);
                    }}
                    className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant transition-colors flex items-center justify-center"
                    title={practiceExpanded ? "Yig'ish" : "Ochish"}
                  >
                    <span className="material-symbols-outlined text-base">
                      {practiceExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Accordion Sub-items (Speaking, Writing, Reading, Listening) */}
              {practiceExpanded && (
                <div className="flex flex-col gap-1 pl-3.5 mt-1 border-l-2 border-surface-container-high/60 ml-5 py-1 animate-fadeIn">
                  {practiceSubItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(sub.id as PageTab);
                          if (window.innerWidth < 768 && onClose) {
                            onClose();
                          }
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all group/sub cursor-pointer ${
                          isSubActive
                            ? 'bg-primary-container/30 text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-base ${sub.color} group-hover/sub:scale-110 transition-transform`}>
                            {sub.icon}
                          </span>
                          <span>{sub.label}</span>
                        </div>
                        {isSubActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Bottom Items (Report, Pricing, System Check) */}
            {bottomNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as PageTab);
                    if (window.innerWidth < 768) {
                      if (onClose) onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-space-md py-space-sm rounded-xl transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                        item.color || (isActive ? 'text-on-primary-container' : '')
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-lg text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-on-primary-container/20 text-on-primary-container'
                          : (item as any).badgeClass || 'bg-surface-container-highest text-on-surface-variant'
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

        {/* Footer System Status & Mascot indicator */}
        <div className="px-space-sm flex flex-col gap-space-2xs pt-2 border-t border-surface-container-high/40">
          <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-secondary flex items-center gap-1.5 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                AI Engine Online
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                v3.4 GPT-4o Whisper
              </span>
            </div>
            <span className="material-symbols-outlined text-secondary text-lg">bolt</span>
          </div>
        </div>
      </aside>
    </>
  );
};
