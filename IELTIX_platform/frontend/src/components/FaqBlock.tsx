import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const FaqBlock: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-white/40 border-t border-[#eadfc9]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-bold text-xs uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faq.badge}</span>
          </div>
          <h2 className="font-unbounded font-extrabold text-2xl sm:text-4xl text-[#10152b] tracking-tight mb-4">
            {t.faq.title}
          </h2>
          <p className="text-[#4a5068] text-sm sm:text-base font-medium">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {t.faq.items.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-[22px] border border-[#eadfc9] overflow-hidden shadow-card-soft transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf5ea]/50 transition"
                >
                  <span className="font-unbounded font-bold text-sm sm:text-base text-[#10152b]">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                    isOpen ? 'bg-[#ef3b2d] text-white rotate-180' : 'bg-[#f3ead6] text-[#10152b]'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#4a5068] text-sm sm:text-base leading-relaxed border-t border-[#eadfc9]/40 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
