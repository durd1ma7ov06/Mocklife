import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  error?: string | null;
  isValid?: boolean;
  disabled?: boolean;
  showStrengthMeter?: boolean;
  strengthLabels?: {
    weak: string;
    medium: string;
    strong: string;
  };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '••••••••',
  error,
  isValid,
  disabled = false,
  showStrengthMeter = false,
  strengthLabels = { weak: 'Zaif', medium: 'O\'rtacha', strong: 'Kuchli' },
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Calculate password strength
  const getStrength = (pass: string): { score: number; text: string; color: string } => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score: 1, text: strengthLabels.weak, color: 'bg-amber-500' };
    if (score === 2) return { score: 2, text: strengthLabels.medium, color: 'bg-blue-500' };
    if (score >= 3) return { score: 3, text: strengthLabels.strong, color: 'bg-emerald-500' };
    return { score: 1, text: strengthLabels.weak, color: 'bg-amber-500' };
  };

  const strength = getStrength(value);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-[#4a5068] uppercase tracking-wider">
          {label}
        </label>
        {showStrengthMeter && value.length > 0 && (
          <span className="text-[11px] font-extrabold text-[#7a7f95]">
            {strength.text}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-[#7a7f95]">
          <Lock className="w-5 h-5" />
        </div>

        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-20 py-3.5 rounded-full border text-sm font-bold text-[#10152b] transition-all outline-none bg-[#fdf6e9]/40 ${
            error
              ? 'border-[#ef3b2d] bg-red-50/40 ring-2 ring-[#ef3b2d]/15'
              : isValid
              ? 'border-[#12935a] bg-emerald-50/20 focus:ring-2 focus:ring-[#12935a]/15'
              : 'border-[#eadfc9] focus:border-[#ef3b2d] focus:bg-white focus:ring-2 focus:ring-[#ef3b2d]/15'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />

        <div className="absolute right-4 flex items-center gap-2">
          {error && <AlertCircle className="w-5 h-5 text-[#ef3b2d]" />}
          {!error && isValid && <Check className="w-5 h-5 text-[#12935a]" />}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="text-[#7a7f95] hover:text-[#10152b] transition p-1 rounded-full focus:outline-none"
            aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="flex gap-1.5 mt-2 px-3">
          {[1, 2, 3].map((lvl) => (
            <div
              key={lvl}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                lvl <= strength.score ? strength.color : 'bg-[#eadfc9]'
              }`}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-bold text-[#ef3b2d] flex items-center gap-1 pl-3 animate-fadeIn">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
