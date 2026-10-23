import React, { useRef, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: string | null;
  disabled?: boolean;
  onResend?: () => void;
  resendCountdown?: number;
  labels: {
    resendCode: string;
    resendIn: string;
    demoNote?: string;
  };
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 4,
  error,
  disabled = false,
  onResend,
  resendCountdown = 0,
  labels,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array
  const digits = Array(length)
    .fill('')
    .map((_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty box on mount
    const firstEmpty = digits.findIndex((d) => !d);
    const indexToFocus = firstEmpty === -1 ? 0 : firstEmpty;
    inputRefs.current[indexToFocus]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('').slice(0, length);
    onChange(combined);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 4 digit input boxes */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center font-unbounded text-2xl font-black rounded-2xl border transition-all outline-none shadow-sm ${
              error
                ? 'border-[#ef3b2d] bg-red-50/50 text-[#ef3b2d] ring-2 ring-[#ef3b2d]/20 animate-shake'
                : digit
                ? 'border-[#ef3b2d] bg-white text-[#10152b] ring-2 ring-[#ef3b2d]/10'
                : 'border-[#eadfc9] bg-[#fdf6e9]/60 text-[#10152b] focus:border-[#ef3b2d] focus:bg-white focus:ring-2 focus:ring-[#ef3b2d]/15'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs font-bold text-[#ef3b2d] text-center animate-fadeIn">
          {error}
        </p>
      )}

      {/* Resend OTP timer */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {resendCountdown > 0 ? (
          <span className="text-xs font-bold text-[#7a7f95]">
            {labels.resendIn} <span className="text-[#ef3b2d] font-extrabold">{resendCountdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ef3b2d] hover:text-[#d62f22] hover:underline transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{labels.resendCode}</span>
          </button>
        )}

        {/* Demo banner helper */}
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-[#fde3dc]/70 rounded-full text-[11px] font-extrabold text-[#ef3b2d] border border-[#ef3b2d]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{labels.demoNote || 'Demo test kodi: 1234'}</span>
        </div>
      </div>
    </div>
  );
};
