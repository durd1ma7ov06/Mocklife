import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PricingBlockProps {
  onSubscribeClick?: () => void;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({ onSubscribeClick }) => {
  const { t } = useLanguage();

  return (
    <section id="narx" className="py-16 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fde3dc] text-[#ef3b2d] font-bold text-xs uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>{t.pricing.badge}</span>
          </div>
          <h2 className="font-unbounded font-extrabold text-2xl sm:text-4xl text-[#10152b] tracking-tight mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-[#4a5068] text-sm sm:text-base font-medium">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#eadfc9] shadow-browser overflow-hidden p-6 sm:p-10 lg:p-12 relative">
          {/* Most popular badge */}
          <div className="absolute top-0 right-0 bg-[#ef3b2d] text-white font-unbounded font-bold text-[11px] sm:text-xs uppercase px-6 py-2 rounded-bl-2xl tracking-wider shadow-sm">
            {t.pricing.mostPopular}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Features Checklist */}
            <div className="lg:col-span-7">
              <span className="font-unbounded font-bold text-xs uppercase tracking-wider text-[#ef3b2d]">
                {t.pricing.packageTitle}
              </span>
              <h3 className="font-unbounded font-extrabold text-xl sm:text-2xl text-[#10152b] mt-2 mb-6">
                Ingliz tili to'liq to'plami
              </h3>

              <ul className="space-y-3.5">
                {t.pricing.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#12935a] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-[#2a3048] font-bold text-sm sm:text-base">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Action Box */}
            <div className="lg:col-span-5 bg-[#fdf6e9] rounded-[24px] p-6 sm:p-8 border border-[#eadfc9] text-center flex flex-col justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#7a7f95] mb-2">
                  {t.pricing.monthlyLabel}
                </p>
                <div className="flex items-baseline justify-center gap-1.5 mb-2">
                  <span className="font-unbounded font-black text-4xl sm:text-5xl text-[#10152b] tracking-tight">
                    {t.pricing.price}
                  </span>
                  <span className="font-unbounded font-bold text-base text-[#4a5068]">
                    {t.pricing.currency}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#7a7f95] mb-6">
                  {t.pricing.period}
                </p>
              </div>

              <div>
                <button
                  onClick={onSubscribeClick}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase py-4 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
                >
                  <span>{t.pricing.btnSubscribe}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-[#7a7f95] font-semibold mt-4">
                  <ShieldCheck className="w-4 h-4 text-[#12935a]" />
                  <span>{t.pricing.secureNote}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
