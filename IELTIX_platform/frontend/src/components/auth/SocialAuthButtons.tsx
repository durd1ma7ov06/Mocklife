import React from 'react';

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  onTelegramClick?: () => void;
  dividerText: string;
  googleLabel: string;
  telegramLabel: string;
  disabled?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  onTelegramClick,
  dividerText,
  googleLabel,
  telegramLabel,
  disabled = false,
}) => {
  return (
    <div className="w-full mt-6">
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-[#eadfc9] w-full" />
        <span className="bg-white px-3 text-[11px] font-extrabold text-[#7a7f95] uppercase tracking-wider whitespace-nowrap absolute">
          {dividerText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google Auth Button */}
        <button
          type="button"
          onClick={onGoogleClick}
          disabled={disabled}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#eadfc9] bg-white hover:bg-[#faf5ea] hover:border-[#d7caa8] text-xs font-extrabold text-[#10152b] transition-all shadow-sm active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="truncate">{googleLabel}</span>
        </button>

        {/* Telegram Auth Button */}
        <button
          type="button"
          onClick={onTelegramClick}
          disabled={disabled}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#eadfc9] bg-white hover:bg-[#faf5ea] hover:border-[#d7caa8] text-xs font-extrabold text-[#10152b] transition-all shadow-sm active:scale-98 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#229ED9">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.07.51l-2.98-2.2-1.44 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.58-4.46c.54-.2 1.01.12.83.92z" />
          </svg>
          <span className="truncate">{telegramLabel}</span>
        </button>
      </div>
    </div>
  );
};
