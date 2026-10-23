import React from 'react';
import { Play, ArrowRight, Video } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ResultsBlockProps {
  onStartClick?: () => void;
}

export const ResultsBlock: React.FC<ResultsBlockProps> = ({ onStartClick }) => {
  const { t } = useLanguage();

  return (
    <section id="natijalar" className="py-16 md:py-24 bg-white/40 border-y border-[#eadfc9]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-bold text-xs uppercase tracking-widest mb-3">
            <Video className="w-3.5 h-3.5" />
            <span>{t.results.badge}</span>
          </div>
          <h2 className="font-unbounded font-extrabold text-2xl sm:text-4xl text-[#10152b] tracking-tight mb-4">
            {t.results.title}
          </h2>
          <p className="text-[#4a5068] text-sm sm:text-base font-medium">
            {t.results.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {t.results.items.map((title, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-[24px] border border-[#eadfc9] overflow-hidden shadow-card-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              {/* Media placeholder container */}
              <div className="relative aspect-[9/14] bg-gradient-to-b from-[#f3ead6] to-[#eadfc9] flex items-center justify-center p-4">
                {/* View Badge */}
                <div className="absolute top-4 left-4 bg-[#10152b]/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                  <span>▶</span>
                  <span>[0.0M]</span>
                </div>

                {/* Center Play Button Placeholder */}
                <div className="w-16 h-16 rounded-full bg-[#ef3b2d] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#d62f22] transition-transform duration-300 cursor-pointer">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 inset-x-4">
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-[#eadfc9]/70 text-center shadow-sm">
                    <p className="font-unbounded font-bold text-xs text-[#10152b] line-clamp-1">
                      {title}
                    </p>
                    <p className="text-[11px] font-bold text-[#7a7f95] mt-0.5">
                      {t.results.placeholderLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a
            href="#narx"
            onClick={onStartClick}
            className="inline-flex items-center gap-3 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            <span>{t.results.btnStart}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
