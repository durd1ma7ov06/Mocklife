import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight, Globe, Check, LogOut, Users } from 'lucide-react';
import { useLanguage, Language } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onStartClick?: () => void;
  onLoginClick?: () => void;
  onOpenPlatform?: () => void;
  onOpenCandidates?: () => void;
  candidatesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onStartClick, 
  onLoginClick, 
  onOpenPlatform,
  onOpenCandidates,
  candidatesCount = 5,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [topBannerDismissed, setTopBannerDismissed] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  ];

  const currentLangLabel = lang === 'en' ? 'EN' : lang === 'ru' ? 'RU' : 'O\'Z';

  const navLinks = [
    { label: t.nav.platform, href: '#platforma' },
    { label: t.nav.reviews, href: '#sharhlar' },
    { label: t.nav.pricing, href: '#narx' },
    { label: t.nav.faq, href: '#faq' },
  ];

  return (
    <>
      {/* Top Banner Alert (inspired by image copy 34) */}
      {!topBannerDismissed && (
        <div className="bg-[#fde3dc] border-b border-[#ef3b2d]/20 px-4 py-2 text-center text-xs font-bold text-[#10152b] flex items-center justify-center gap-3 relative transition-all">
          <span>{t.topBanner.text}</span>
          <button
            onClick={() => {
              // Toggle to next language
              const nextLang: Language = lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz';
              setLang(nextLang);
            }}
            className="text-[#ef3b2d] hover:underline underline-offset-2 flex items-center gap-1"
          >
            <span>{t.topBanner.action} →</span>
          </button>
          <button
            onClick={() => setTopBannerDismissed(true)}
            className="absolute right-4 text-[#7a7f95] hover:text-[#10152b] text-sm p-0.5"
            aria-label="Yopish"
          >
            ✕
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-[#fdf6e9]/95 backdrop-blur-md border-b border-[#eadfc9]/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ef3b2d] inline-block animate-pulse"></span>
              <span className="w-3 h-3 rounded-full bg-[#10152b] inline-block"></span>
            </div>
            <span className="font-unbounded font-extrabold text-2xl tracking-tight text-[#10152b]">
              Mock<span className="text-[#ef3b2d]">Life</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#2a3048] hover:text-[#ef3b2d] font-bold text-sm tracking-wide transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls: Language Selector + Login + START Pill */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Dropdown Selector (image copy 34 style) */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#10152b] bg-white hover:bg-[#f3ead6] px-3.5 py-2 rounded-full border border-[#eadfc9] shadow-sm transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#7a7f95]" />
                <span>{currentLangLabel}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-[#eadfc9] shadow-xl p-1.5 z-50 animate-fadeIn">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                        lang === item.code
                          ? 'bg-[#fdf6e9] text-[#ef3b2d]'
                          : 'text-[#10152b] hover:bg-[#faf5ea]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                      {lang === item.code && (
                        <Check className="w-3.5 h-3.5 text-[#ef3b2d] stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>



            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#eadfc9] shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-black text-xs shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-extrabold text-[#10152b] max-w-[110px] truncate">
                    {user?.name || 'Foydalanuvchi'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {user?.trialDaysRemaining !== undefined ? `${user.trialDaysRemaining} kun qoldi` : '7 kunlik sinov'}
                  </span>
                  <button
                    onClick={logout}
                    title={t.nav.logout}
                    className="text-[#7a7f95] hover:text-[#ef3b2d] p-1 rounded-full hover:bg-[#fdf6e9] transition cursor-pointer"
                    aria-label={t.nav.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onOpenPlatform || onStartClick}
                  className="inline-flex items-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3 rounded-full shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer"
                >
                  <span>Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="text-[#10152b] hover:text-[#ef3b2d] font-bold text-sm px-2 py-2 transition cursor-pointer"
                >
                  {t.nav.login}
                </button>

                <button
                  onClick={onStartClick || onOpenPlatform || onLoginClick}
                  className="inline-flex items-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3 rounded-full shadow-sm hover:shadow transition transform active:scale-95 cursor-pointer"
                >
                  <span>Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold text-[#10152b] bg-white px-2.5 py-1.5 rounded-full border border-[#eadfc9]"
              >
                <Globe className="w-3.5 h-3.5 text-[#7a7f95]" />
                <span>{currentLangLabel}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl border border-[#eadfc9] shadow-xl p-1.5 z-50">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                        lang === item.code
                          ? 'bg-[#fdf6e9] text-[#ef3b2d]'
                          : 'text-[#10152b] hover:bg-[#faf5ea]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                      {lang === item.code && (
                        <Check className="w-3.5 h-3.5 text-[#ef3b2d]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#10152b] rounded-lg hover:bg-[#f3ead6] transition"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#fdf6e9] border-b border-[#eadfc9] px-6 py-5 shadow-lg animate-fadeIn">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#10152b] font-bold text-base py-2 hover:text-[#ef3b2d] transition"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-[#eadfc9] my-2" />
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#eadfc9] shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#fde3dc] text-[#ef3b2d] flex items-center justify-center font-black text-sm shrink-0">
                          {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-extrabold text-[#10152b]">{user?.name || 'Foydalanuvchi'}</div>
                          <div className="text-[11px] text-[#12935a] font-bold">7 kunlik bepul sinov faol</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ef3b2d] bg-[#fde3dc] px-3 py-1.5 rounded-full hover:bg-[#ef3b2d] hover:text-white transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenPlatform?.();
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase py-3.5 rounded-full shadow-md"
                    >
                      <span>Boshlash</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLoginClick?.();
                      }}
                      className="w-full text-center py-2.5 font-bold text-[#10152b] border border-[#10152b] rounded-full hover:bg-[#10152b] hover:text-white transition cursor-pointer"
                    >
                      {t.nav.login}
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onStartClick) onStartClick();
                        else if (onOpenPlatform) onOpenPlatform();
                        else onLoginClick?.();
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase py-3.5 rounded-full shadow-md"
                    >
                      <span>Boshlash</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
