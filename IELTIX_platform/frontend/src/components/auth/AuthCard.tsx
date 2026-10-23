import React from 'react';
import { ShieldCheck, ArrowLeft, X } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  activeTab?: 'login' | 'register';
  onTabChange?: (tab: 'login' | 'register') => void;
  showTabs?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  title: string;
  subtitle: string;
  loginTabLabel?: string;
  registerTabLabel?: string;
  secureNote?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  activeTab = 'login',
  onTabChange,
  showTabs = true,
  showBack = false,
  onBack,
  onClose,
  title,
  subtitle,
  loginTabLabel = 'Kirish',
  registerTabLabel = "Ro'yxatdan o'tish",
  secureNote = "Shaxsiy ma'lumotlaringiz 256-bit shifrlash bilan himoyalangan",
}) => {
  return (
    <div className="bg-white rounded-[28px] border border-[#eadfc9] p-6 sm:p-8 shadow-2xl relative w-full flex flex-col justify-between">
      {/* Top action row: Back or Close */}
      <div className="flex items-center justify-between mb-4">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a5068] hover:text-[#ef3b2d] p-1.5 rounded-full hover:bg-[#fdf6e9] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </button>
        ) : (
          <div />
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7a7f95] hover:text-[#10152b] hover:bg-[#f3ead6] transition ml-auto"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs (Login vs Register) */}
      {showTabs && onTabChange && (
        <div className="bg-[#fdf6e9] p-1 rounded-full border border-[#eadfc9] flex items-center mb-6">
          <button
            type="button"
            onClick={() => onTabChange('login')}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-white text-[#ef3b2d] shadow-sm'
                : 'text-[#4a5068] hover:text-[#10152b]'
            }`}
          >
            {loginTabLabel}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('register')}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-white text-[#ef3b2d] shadow-sm'
                : 'text-[#4a5068] hover:text-[#10152b]'
            }`}
          >
            {registerTabLabel}
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="text-left mb-6">
        <h2 className="font-unbounded font-extrabold text-xl sm:text-2xl text-[#10152b] tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#4a5068] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Main card body */}
      <div className="flex-1">{children}</div>

      {/* Security badge at bottom */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#7a7f95] font-semibold mt-6 pt-4 border-t border-[#eadfc9]/60">
        <ShieldCheck className="w-4 h-4 text-[#12935a] shrink-0" />
        <span className="text-[11px] text-center">{secureNote}</span>
      </div>
    </div>
  );
};
