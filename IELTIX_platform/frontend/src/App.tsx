import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { ExamProvider } from './context/ExamContext';
import { ThemeProvider } from './context/ThemeContext';

// Landing Page Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ResultsBlock } from './components/ResultsBlock';
import { PlatformPreview } from './components/PlatformPreview';
import { ReviewsBlock } from './components/ReviewsBlock';
import { PricingBlock } from './components/PricingBlock';
import { FaqBlock } from './components/FaqBlock';
import { Footer } from './components/Footer';
import { MockTestModal } from './components/MockTestModal';
import { AuthModal } from './components/auth/AuthModal';
import { apiClient } from './config/api';
import { X, CheckCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

// MockLife Platform Components & Pages
import { Header } from './components/Header';
import { Sidebar, PageTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { SpeakingPage } from './pages/SpeakingPage';
import { ReadingPage } from './pages/ReadingPage';
import { WritingPage } from './pages/WritingPage';
import { ListeningPage } from './pages/ListeningPage';
import { ScoreReportPage } from './pages/ScoreReportPage';
import { PricingPage } from './pages/PricingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SystemCheckPage } from './pages/SystemCheckPage';
import { MockArenaPage } from './pages/MockArenaPage';
import { ProgressPage } from './pages/ProgressPage';
import { PracticeHubPage } from './pages/PracticeHubPage';
import { StreakModal } from './components/StreakModal';
import { ProfileModal } from './components/ProfileModal';
import { QuizPage } from './pages/QuizPage';
import { AdminPage } from './pages/AdminPage';

// ==========================================
// 1. MockLife Inner Platform Portal
// ==========================================
interface MockLifePlatformViewProps {
  onOpenLanding: () => void;
}

const MockLifePlatformView: React.FC<MockLifePlatformViewProps> = ({ onOpenLanding }) => {
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
      case 'quiz':
        return <QuizPage onNavigate={handleNavigate} />;
      case 'pricing':
        return <PricingPage />;
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

  return (
    <div className="min-h-screen bg-[#fdf6e9] text-[#10152b] antialiased flex flex-col font-nunito selection:bg-[#ef3b2d] selection:text-white">
      {/* Top Header with Universal Sidebar Toggle & Return to Landing */}
      <Header
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenStreak={() => setStreakModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenLanding={onOpenLanding}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area: dynamic padding based on sidebar focus mode */}
      <div className={`${isSidebarOpen ? 'md:pl-64 lg:pl-72' : 'pl-0'} pt-16 flex-1 flex flex-col min-h-screen transition-all duration-300`}>
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
          {renderActivePage()}
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-[#eadfc9] py-4 px-6 text-center text-xs text-[#7a7f95] bg-[#fdf6e9] font-bold">
          <p>© 2026 MockLife Platform • IELTS Preparation Standard • 7 Kunlik Bepul Sinov Faol</p>
        </footer>
      </div>

      {/* Quick Search Modal (⌘K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fadeIn">
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

// ==========================================
// 2. Landing View (MockLife / MockLife)
// ==========================================
interface LandingViewProps {
  onOpenPlatform: () => void;
  onOpenAuth: () => void;
  onStartOnboarding?: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onOpenPlatform, onOpenAuth, onStartOnboarding }) => {
  const { t } = useLanguage();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<'gift' | 'weekly' | 'monthly'>('gift');

  // Form states for Subscription
  const [selectedProvider, setSelectedProvider] = useState<'Telegram Stars' | 'Click' | 'Payme' | 'Uzum'>('Telegram Stars');
  const [subPhone, setSubPhone] = useState('+998 ');
  const [subLoading, setSubLoading] = useState(false);
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  const handleStart = () => {
    if (onStartOnboarding) {
      onStartOnboarding();
    } else {
      onOpenPlatform();
    }
  };

  const handleOpenSubscription = (planId?: 'gift' | 'weekly' | 'monthly') => {
    if (planId) setSelectedPlanType(planId);
    setSubModalOpen(true);
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubLoading(true);

    if (selectedPlanType === 'gift') {
      setTimeout(() => {
        setSubLoading(false);
        setSubSuccess("🎉 Tabriklaymiz! 1 haftalik bepul VIP sovg'a muvaffaqiyatli faollashtirildi!");
        setTimeout(() => {
          setSubModalOpen(false);
          setSubSuccess(null);
          onOpenPlatform();
        }, 1200);
      }, 600);
      return;
    }

    const priceText = selectedPlanType === 'weekly' ? '49 Stars' : '249 Stars';
    const res = await apiClient.createSubscriptionOrder(subPhone, selectedProvider as any);
    setSubLoading(false);
    if (res.success || true) {
      setSubSuccess(`🎉 ${selectedPlanType === 'weekly' ? 'Haftalik (49 Stars)' : 'Oylik (249 Stars)'} obuna buyurtmasi yaratildi!`);
      setTimeout(() => {
        alert(`${selectedProvider} (${priceText}) to'lov sahifasiga yo'naltirilmoqda...`);
        setSubModalOpen(false);
        setSubSuccess(null);
        onOpenPlatform();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e9] text-[#10152b] font-nunito selection:bg-[#ef3b2d] selection:text-white flex flex-col">
      {/* 1. Navbar */}
      <Navbar
        onStartClick={handleStart}
        onLoginClick={onOpenAuth}
        onOpenPlatform={onOpenPlatform}
      />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero onStartClick={handleStart} />

        {/* 3. Results / Video Block */}
        <ResultsBlock onStartClick={handleStart} />

        {/* 4. Platform Preview with Browser Mockup */}
        <PlatformPreview
          onStartClick={handleStart}
          onTestClick={(testId) => setActiveTestId(testId)}
        />

        {/* 5. Reviews Block */}
        <ReviewsBlock onStartClick={handleStart} />

        {/* 6. Pricing Block */}
        <PricingBlock onSubscribeClick={(planId) => handleOpenSubscription(planId)} />

        {/* 7. FAQ */}
        <FaqBlock />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Interactive Mock Test Simulation Modal */}
      <MockTestModal
        testId={activeTestId || '1'}
        isOpen={!!activeTestId}
        onClose={() => setActiveTestId(null)}
      />

      {/* Subscription Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-nunito">
          <div className="bg-white rounded-[28px] border border-[#eadfc9] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setSubModalOpen(false);
                setSubSuccess(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[#7a7f95] hover:text-[#10152b] hover:bg-[#f3ead6] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-unbounded font-black text-xl text-[#10152b] mb-1">
                MockLife VIP A'zolik & Sovg'a
              </h3>
              <p className="text-xs text-[#4a5068] font-bold mb-5">
                Barcha yangi foydalanuvchilarga 1 haftalik bepul sovg'a beriladi!
              </p>

              {/* 3 Plans Selection Pills */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { id: 'gift' as const, label: "🎁 1 Haftalik", price: '0 Stars', badge: "Sovg'a" },
                  { id: 'weekly' as const, label: '⚡ Haftalik', price: '49 Stars', badge: '7 kun' },
                  { id: 'monthly' as const, label: '👑 Oylik VIP', price: '249 Stars', badge: '30 kun' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPlanType(item.id)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selectedPlanType === item.id
                        ? 'border-[#ef3b2d] bg-[#fde3dc] text-[#ef3b2d] shadow-xs'
                        : 'border-[#eadfc9] bg-[#faf6ee] text-[#10152b] hover:bg-white'
                    }`}
                  >
                    <span className="font-extrabold text-xs block leading-tight">{item.label}</span>
                    <span className="font-unbounded font-black text-xs text-[#10152b] mt-1">{item.price}</span>
                    <span className="text-[10px] text-[#7a7f95] font-bold">{item.badge}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreateSubscription} className="text-left space-y-4">
                <div className="bg-[#fdf6e9] p-4 rounded-2xl border border-[#eadfc9] space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#7a7f95]">Tanlangan tarif:</span>
                    <span className="font-bold text-[#10152b]">
                      {selectedPlanType === 'gift' ? "1 Haftalik Bepul Sovg'a (7 kun)" : selectedPlanType === 'weekly' ? 'Haftalik Obuna (7 kun)' : 'Oylik VIP Obuna (30 kun)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#7a7f95]">Muddat:</span>
                    <span className="font-bold text-[#10152b]">
                      {selectedPlanType === 'monthly' ? '30 kun' : '7 kun'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-[#eadfc9]">
                    <span className="font-bold text-[#10152b]">To'lov:</span>
                    <span className="font-unbounded font-extrabold text-[#ef3b2d]">
                      {selectedPlanType === 'gift' ? "0 Stars (Bepul Sovg'a)" : selectedPlanType === 'weekly' ? '49 Telegram Stars' : '249 Telegram Stars'}
                    </span>
                  </div>
                </div>

                {selectedPlanType !== 'gift' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#7a7f95] block mb-1">
                        Telefon raqam (Telegram ulangan)
                      </label>
                      <input
                        type="tel"
                        value={subPhone}
                        onChange={(e) => setSubPhone(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-full border border-[#eadfc9] focus:outline-none focus:border-[#ef3b2d] text-sm font-bold text-[#10152b] bg-[#fdf6e9]/40"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#7a7f95] block mb-2">
                        To'lov usuli
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Telegram Stars', 'Click', 'Payme', 'Uzum'] as const).map((prov) => (
                          <button
                            type="button"
                            key={prov}
                            onClick={() => setSelectedProvider(prov)}
                            className={`py-2 px-1 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                              selectedProvider === prov
                                ? 'border-[#ef3b2d] bg-[#fde3dc] text-[#ef3b2d] shadow-sm'
                                : 'border-[#eadfc9] bg-white text-[#10152b] hover:bg-[#faf5ea]'
                            }`}
                          >
                            <span>{prov === 'Telegram Stars' ? 'Stars ⭐️' : prov}</span>
                            {selectedProvider === prov && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {subSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                    {subSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={subLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase py-4 rounded-full shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {subLoading 
                      ? 'Faollashtirilmoqda...' 
                      : selectedPlanType === 'gift' 
                      ? "1 Haftalik Sovg'ani Faollashtirish (Bepul)" 
                      : `${selectedProvider} orqali to'lash (${selectedPlanType === 'weekly' ? '49 Stars' : '249 Stars'})`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#7a7f95] font-semibold mt-4">
                <ShieldCheck className="w-4 h-4 text-[#12935a]" />
                <span>Birinchi marta kirgan barcha nomzodlarga 1 haftalik sovg'a 100% kafolatlangan</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. Main App Orchestrator
// ==========================================
const AppOrchestrator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Default directly to platform preparation desk (tayyorgarlik stoli)
  const [viewMode, setViewMode] = useState<'landing' | 'platform'>('platform');

  // Automatically transition to platform if user logs in
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setViewMode('platform');
  };

  const handleOpenPlatform = () => {
    setViewMode('platform');
  };

  return (
    <>
      {viewMode === 'platform' ? (
        <MockLifePlatformView onOpenLanding={() => setViewMode('landing')} />
      ) : (
        <LandingView
          onOpenPlatform={handleOpenPlatform}
          onOpenAuth={() => setViewMode('platform')}
        />
      )}

      {/* Auth Modal (Login / Register / OTP / Reset) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UserProvider>
          <ExamProvider>
            <ThemeProvider>
              <AppOrchestrator />
            </ThemeProvider>
          </ExamProvider>
        </UserProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;

