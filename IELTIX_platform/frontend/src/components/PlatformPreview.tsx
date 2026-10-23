import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Lock,
  RotateCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { MOCK_DATA } from '../config/api';

interface PlatformPreviewProps {
  onStartClick?: () => void;
  onTestClick?: (testId: string) => void;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({ onStartClick, onTestClick }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const icons = [BookOpen, Calendar, FileText, TrendingUp, Compass, Clock];

  return (
    <section id="platforma" className="py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.platform.badge}</span>
          </div>
          <h2 className="font-unbounded font-extrabold text-2xl sm:text-4xl text-[#10152b] tracking-tight mb-4">
            {t.platform.title}
          </h2>
          <p className="text-[#4a5068] text-sm sm:text-base font-medium">
            {t.platform.subtitle}
          </p>
        </div>

        {/* Tab-pills Row (Scrollable horizontally on mobile) */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar px-2">
          {t.platform.tabs.map((tabName, idx) => {
            const Icon = icons[idx] || BookOpen;
            const isActive = activeTab === idx;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(idx)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#ef3b2d] text-white shadow-md shadow-[#ef3b2d]/20 scale-105'
                    : 'bg-white text-[#10152b] hover:bg-[#f3ead6] border border-[#eadfc9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7a7f95]'}`} />
                <span>{tabName}</span>
              </button>
            );
          })}
        </div>

        {/* Browser Mockup Window */}
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-[#eadfc9] shadow-browser overflow-hidden mb-12">
          {/* Browser Chrome Header */}
          <div className="bg-[#f9f5ec] px-4 sm:px-6 py-3 border-b border-[#eadfc9] flex items-center justify-between gap-4">
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/10 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10 inline-block"></span>
            </div>

            {/* Address Bar Pill */}
            <div className="flex-1 max-w-md mx-auto bg-white rounded-full px-4 py-1.5 border border-[#eadfc9] flex items-center justify-center gap-2 text-xs text-[#7a7f95] font-mono shadow-inner">
              <Lock className="w-3 h-3 text-[#12935a]" />
              <span className="text-[#10152b] font-medium">https://mocklife.uz/platform</span>
              <RotateCw className="w-3 h-3 ml-auto text-[#7a7f95]" />
            </div>

            <div className="w-14 hidden sm:block"></div>
          </div>

          {/* Browser Platform Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3 bg-[#faf6ee] border-b lg:border-b-0 lg:border-r border-[#eadfc9] p-4 sm:p-5 flex flex-col justify-between">
              <div>
                {/* User Card */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#eadfc9] mb-6 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-unbounded font-bold text-sm flex items-center justify-center">
                    [U]
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-[#10152b] truncate">{t.platform.userLabel}</p>
                    <p className="text-xs text-[#7a7f95] font-medium truncate">{t.platform.levelLabel}</p>
                  </div>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex flex-col gap-1.5">
                  {t.platform.tabs.map((tabName, i) => (
                    <button
                      key={tabName}
                      onClick={() => setActiveTab(i)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition ${
                        activeTab === i
                          ? 'bg-[#ef3b2d] text-white shadow-sm'
                          : 'text-[#2a3048] hover:bg-white'
                      }`}
                    >
                      <span>{tabName}</span>
                      {activeTab === i && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Sidebar bottom indicator */}
              <div className="pt-4 border-t border-[#eadfc9] mt-6 hidden lg:block">
                <div className="flex items-center justify-between text-xs text-[#7a7f95] font-medium">
                  <span>{t.platform.activeSub}</span>
                  <span className="font-bold text-[#12935a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    29 000 so'm / oy
                  </span>
                </div>
              </div>
            </aside>

            {/* Main Area */}
            <main className="lg:col-span-9 p-4 sm:p-6 lg:p-8 bg-white flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#eadfc9]">
                  <div>
                    <h3 className="font-unbounded font-bold text-lg sm:text-xl text-[#10152b]">
                      {t.platform.tabs[activeTab] || 'Mock testlar'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7a7f95] mt-0.5">
                      Faqat ingliz tili bo'yicha to'liq formatdagi sinov testlari
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#fdf6e9] border border-[#eadfc9] px-3 py-1.5 rounded-full text-xs font-bold text-[#10152b]">
                    <Clock className="w-3.5 h-3.5 text-[#ef3b2d]" />
                    <span>{t.platform.timerLabel}</span>
                  </div>
                </div>

                {/* Banner / Current Progress */}
                <div className="bg-gradient-to-r from-[#fdf6e9] to-[#fef2f0] rounded-2xl p-5 border border-[#eadfc9] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ef3b2d] bg-[#fde3dc] px-2.5 py-1 rounded-full">
                      {t.platform.recommended}
                    </span>
                    <h4 className="font-unbounded font-bold text-base text-[#10152b] mt-2">
                      {t.platform.bannerTitle}
                    </h4>
                    <p className="text-xs text-[#4a5068] mt-1">
                      {t.platform.bannerDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onTestClick?.('1')}
                      className="bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-full shadow transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      <span>{t.platform.bannerBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Test Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {MOCK_DATA.tests.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => onTestClick?.(test.id)}
                      className="p-4 rounded-2xl border border-[#eadfc9] hover:border-[#ef3b2d]/50 bg-white hover:bg-[#fdf6e9]/40 transition shadow-card-soft flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#faf5ea] text-[#10152b] border border-[#eadfc9]">
                            {test.section}
                          </span>
                          <span className="text-xs font-bold text-[#ef3b2d]">
                            {test.level}
                          </span>
                        </div>
                        <h5 className="font-unbounded font-bold text-sm text-[#10152b] mb-1 group-hover:text-[#ef3b2d] transition">
                          {test.title}
                        </h5>
                        <div className="flex items-center gap-3 text-xs text-[#7a7f95] font-medium mb-3">
                          <span>{test.questionsCount} ta savol</span>
                          <span>•</span>
                          <span>{test.durationMinutes} daqiqa</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2 border-t border-[#eadfc9]/50 flex items-center justify-between">
                        <div className="w-2/3 bg-[#eadfc9] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#ef3b2d] h-full rounded-full transition-all duration-500"
                            style={{ width: `${test.completedPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#10152b]">
                          {test.completedPercent ? `${test.completedPercent}%` : 'Yangi'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Streak / Bottom Bar */}
              <div className="pt-4 border-t border-[#eadfc9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7a7f95]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#12935a]" />
                  <span>{t.platform.streak}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {['D', 'S', 'CH', 'P', 'J', 'SH', 'Y'].map((day, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                        i < 5 ? 'bg-[#ef3b2d] text-white' : 'bg-[#f3ead6] text-[#7a7f95]'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a
            href="#narx"
            onClick={onStartClick}
            className="inline-flex items-center gap-3 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            <span>{t.platform.btnStart}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
