import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, Award, Star } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isOpen, onClose }) => {
  const { lang, setLang } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl my-auto bg-transparent relative flex flex-col items-center">
        {/* Top Controls: Language switcher outside modal */}
        <div className="w-full flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/40 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] animate-pulse" />
              <span className="font-unbounded font-black text-xs text-[#10152b]">
                Mock<span className="text-[#ef3b2d]">Life</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur p-1 rounded-full border border-white/60 shadow-sm">
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase transition-all ${
                  lang === l
                    ? 'bg-[#ef3b2d] text-white shadow-sm'
                    : 'text-[#4a5068] hover:text-[#10152b]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Dual-column container on Desktop, single column on Mobile */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Feature & Trust Column (Desktop only, 5 cols) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#faf4e7] rounded-[28px] border border-[#eadfc9] p-8 flex-col justify-between shadow-xl relative overflow-hidden">
            {/* Background decorative watermark */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#ef3b2d]/5 pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#fde3dc] text-[#ef3b2d] text-xs font-black px-3 py-1 rounded-full mb-6 border border-[#ef3b2d]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>29 000 so'm / oy</span>
              </div>

              <h3 className="font-unbounded font-extrabold text-2xl text-[#10152b] leading-tight mb-4">
                Ingliz tilidan <span className="text-[#ef3b2d]">9.0 balgacha</span> tayyorlaning
              </h3>

              <p className="text-xs text-[#4a5068] leading-relaxed mb-6 font-semibold">
                Haqiqiy imtihon formati, xatolar ustida ishlash va har bir savolga chuqur tahlil bitta platformada.
              </p>

              {/* Feature list */}
              <div className="space-y-3.5">
                {[
                  "To'liq Listening, Reading, Writing sinovlari",
                  "Haqiqiy imtihon vaqtiga mos taymer",
                  "Savollarning batafsil izohlari va tahlili",
                  "Shaxsiy ballar va o'sish statistikasi",
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#12935a] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-[#10152b] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof / Student score card */}
            <div className="mt-8 bg-white/90 backdrop-blur rounded-2xl border border-[#eadfc9] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#ef3b2d]" />
                  <span className="font-unbounded font-extrabold text-xs text-[#10152b]">Band 8.5</span>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#4a5068] italic font-medium leading-relaxed">
                "MockLife testlari orqali birinchi urinishda o'zim xohlagan balga erishdim!"
              </p>
            </div>
          </div>

          {/* Right Column: Active Form (7 cols on Desktop, 12 on mobile) */}
          <div className="w-full lg:col-span-7 flex">{children}</div>
        </div>
      </div>
    </div>
  );
};
