import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Sidebar, PageTab } from './components/Sidebar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { SpeakingPage } from './pages/SpeakingPage.js';
import { ReadingPage } from './pages/ReadingPage.js';
import { WritingPage } from './pages/WritingPage.js';
import { ListeningPage } from './pages/ListeningPage.js';
import { ScoreReportPage } from './pages/ScoreReportPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { SystemCheckPage } from './pages/SystemCheckPage.js';
import { MockArenaPage } from './pages/MockArenaPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { PracticeHubPage } from './pages/PracticeHubPage.js';
import { StreakModal } from './components/StreakModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { AuthPage } from './pages/AuthPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { QuizPage } from './pages/QuizPage.js';
import { useUser } from './context/UserContext.js';

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Keyboard shortcut ⌘K or Ctrl+K for search, ⌘B or Ctrl+B for Sidebar Focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: PageTab) => {
    setActiveTab(tab);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'progress':
        return <ProgressPage onNavigate={handleNavigate} onOpenStreak={() => setStreakModalOpen(true)} />;
      case 'mock-arena':
        return <MockArenaPage onNavigate={handleNavigate} />;
      case 'practice-hub':
        return <PracticeHubPage onNavigate={handleNavigate} />;
      case 'speaking':
        return <SpeakingPage />;
      case 'reading':
        return <ReadingPage />;
      case 'writing':
        return <WritingPage />;
      case 'listening':
        return <ListeningPage />;
      case 'report':
        return <ScoreReportPage onNavigate={handleNavigate} />;
      case 'pricing':
        return <PricingPage />;
      case 'quiz':
        return <QuizPage onNavigate={handleNavigate} />;
      case 'onboarding':
        return <OnboardingPage onNavigate={handleNavigate} />;
      case 'system-check':
        return <SystemCheckPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  // If user is not authenticated, render dedicated AuthPage
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Header with Universal Sidebar Toggle */}
      <Header
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenStreak={() => setStreakModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area: dynamic padding based on sidebar focus mode */}
      <div className={`${isSidebarOpen ? 'md:pl-64' : 'pl-0'} pt-16 flex-1 flex flex-col min-h-screen transition-all duration-300`}>
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
          {renderActivePage()}
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-surface-container-high/30 py-4 px-6 text-center text-xs text-on-surface-variant bg-surface-container-lowest/50">
          <p>© 2026 IELTIX Platform • IELTS Diagnostic Standard • Developed at Senior Fullstack Quality</p>
        </footer>
      </div>

      {/* Quick Search Modal (⌘K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-container-high">
              <span className="material-symbols-outlined text-primary text-xl">search</span>
              <input
                autoFocus
                type="text"
                placeholder="Search modules, IELTS tests, Vocab Vault..."
                className="w-full bg-transparent text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant/50"
              />
              <kbd className="bg-surface-container-high px-2 py-1 rounded text-[10px] text-on-surface-variant">ESC</kbd>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-on-surface-variant uppercase font-bold text-[10px]">Quick Jump</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '3D Foxy Speaking Arena', tab: 'speaking' },
                  { label: 'Academic Reading Lab', tab: 'reading' },
                  { label: 'Writing Skills Arena', tab: 'writing' },
                  { label: 'Listening Audio Player', tab: 'listening' },
                  { label: 'QR Verified Score Certificate', tab: 'report' },
                  { label: 'VIP Pro Membership', tab: 'pricing' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleNavigate(item.tab as PageTab);
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-left text-on-surface font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSearchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak & Intizom Milestones Modal */}
      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        onNavigatePractice={() => {
          setStreakModalOpen(false);
          setActiveTab('speaking');
        }}
      />

      {/* Candidate Profile & Settings Modal */}
      <ProfileModal onNavigate={handleNavigate} />
    </div>
  );
};
