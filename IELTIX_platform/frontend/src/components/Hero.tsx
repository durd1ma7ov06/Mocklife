import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroProps {
  onStartClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      {/* Background glow spots */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#fde3dc]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fde3dc] border border-[#ef3b2d]/20 text-[#ef3b2d] font-bold text-xs sm:text-sm tracking-wide mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#ef3b2d]" />
          <span>{t.hero.badge}</span>
        </div>

        {/* 9.0 Golden Laurel Wreath Badge (from image copy 34) */}
        <div className="relative inline-flex items-center justify-center my-2 mb-6 group">
          {/* Left Laurel Branch */}
          <svg
            className="w-16 h-24 sm:w-24 sm:h-36 text-amber-500 fill-current opacity-90 -rotate-12 transition transform group-hover:scale-105"
            viewBox="0 0 100 160"
          >
            <path d="M 85,150 C 70,130 40,90 45,30 C 47,15 55,5 60,0 C 50,15 40,40 38,70 C 35,110 60,140 85,150 Z" />
            <path d="M 52,25 C 40,20 20,25 15,35 C 25,38 40,32 50,30 Z" />
            <path d="M 46,45 C 32,42 12,50 8,62 C 20,62 35,54 44,50 Z" />
            <path d="M 42,70 C 26,70 8,82 6,96 C 18,94 32,82 40,76 Z" />
            <path d="M 43,95 C 30,98 12,112 12,126 C 24,122 36,108 42,102 Z" />
            <path d="M 48,120 C 38,124 22,138 25,150 C 36,144 45,130 49,126 Z" />
          </svg>

          {/* Center 9.0 Score */}
          <div className="flex flex-col items-center px-2 sm:px-6">
            <span className="font-unbounded font-black text-6xl sm:text-8xl text-[#10152b] tracking-tighter leading-none select-none drop-shadow-sm">
              {t.hero.score}
            </span>
            <span className="font-bold text-[11px] sm:text-xs uppercase tracking-widest text-amber-700/80 mt-2 bg-amber-50/80 px-3 py-0.5 rounded-full border border-amber-200">
              {t.hero.scoreSubtitle}
            </span>
          </div>

          {/* Right Laurel Branch (Mirrored) */}
          <svg
            className="w-16 h-24 sm:w-24 sm:h-36 text-amber-500 fill-current opacity-90 rotate-12 scale-x-[-1] transition transform group-hover:scale-105"
            viewBox="0 0 100 160"
          >
            <path d="M 85,150 C 70,130 40,90 45,30 C 47,15 55,5 60,0 C 50,15 40,40 38,70 C 35,110 60,140 85,150 Z" />
            <path d="M 52,25 C 40,20 20,25 15,35 C 25,38 40,32 50,30 Z" />
            <path d="M 46,45 C 32,42 12,50 8,62 C 20,62 35,54 44,50 Z" />
            <path d="M 42,70 C 26,70 8,82 6,96 C 18,94 32,82 40,76 Z" />
            <path d="M 43,95 C 30,98 12,112 12,126 C 24,122 36,108 42,102 Z" />
            <path d="M 48,120 C 38,124 22,138 25,150 C 36,144 45,130 49,126 Z" />
          </svg>
        </div>

        {/* Big Headline */}
        <h1 className="font-unbounded font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#10152b] tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
          {t.hero.headlineStart}
          <span className="text-[#ef3b2d] inline-block">{t.hero.headlineHighlight}</span>
          {t.hero.headlineEnd}
        </h1>

        {/* Subtitle description */}
        <p className="text-[#4a5068] text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
          {t.hero.subheadline}
        </p>

        {/* Two Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            type="button"
            onClick={onStartClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            <span>{t.hero.btnStart}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="#platforma"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f3ead6] text-[#10152b] border-2 border-[#10152b] font-extrabold text-sm sm:text-base tracking-wider uppercase px-8 py-3.5 rounded-full shadow-sm hover:shadow transition"
          >
            <span>{t.hero.btnPlatform}</span>
          </a>
        </div>

        {/* Stat counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#eadfc9]/80 max-w-3xl mx-auto">
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/60 border border-[#eadfc9]/50 shadow-sm">
            <span className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
              [N]+
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#7a7f95] mt-1">
              {t.hero.stats.tests}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/60 border border-[#eadfc9]/50 shadow-sm">
            <span className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
              [N]+
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#7a7f95] mt-1">
              {t.hero.stats.students}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/60 border border-[#eadfc9]/50 shadow-sm">
            <span className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
              24/7
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#7a7f95] mt-1">
              {t.hero.stats.access}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
