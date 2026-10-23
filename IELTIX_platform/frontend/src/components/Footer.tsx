import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#10152b] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Logo & Description */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef3b2d] inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
              </div>
              <span className="font-unbounded font-extrabold text-2xl tracking-tight text-white">
                Mock<span className="text-[#ef3b2d]">Life</span>
              </span>
            </div>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-sm mb-6">
              {t.footer.desc}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-[#28c840]"></span>
              <span>{t.footer.botNotice}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="font-unbounded font-bold text-xs uppercase tracking-wider text-white/50 mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3 text-sm font-semibold">
              <li>
                <a href="#platforma" className="text-white/80 hover:text-[#ef3b2d] transition">
                  {t.nav.platform}
                </a>
              </li>
              <li>
                <a href="#natijalar" className="text-white/80 hover:text-[#ef3b2d] transition">
                  {t.nav.results}
                </a>
              </li>
              <li>
                <a href="#sharhlar" className="text-white/80 hover:text-[#ef3b2d] transition">
                  {t.nav.reviews}
                </a>
              </li>
              <li>
                <a href="#narx" className="text-white/80 hover:text-[#ef3b2d] transition">
                  {t.nav.pricing} (29 000 so'm)
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/80 hover:text-[#ef3b2d] transition">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Fan & Yo'nalish */}
          <div className="md:col-span-3 lg:col-span-4">
            <h4 className="font-unbounded font-bold text-xs uppercase tracking-wider text-white/50 mb-4">
              {t.footer.focusTitle}
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2">
              <p className="font-bold text-white text-sm">{t.footer.focusTitle}</p>
              <p className="text-white/60">
                {t.footer.focusDesc}
              </p>
              <div className="pt-2 text-white/40 text-[11px]">
                {t.footer.priceNote}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-medium">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <span>{t.footer.terms}</span>
            <span>{t.footer.privacy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
