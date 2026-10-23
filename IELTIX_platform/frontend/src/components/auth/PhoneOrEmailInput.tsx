import React from 'react';
import { Phone, Mail, Check, AlertCircle } from 'lucide-react';

interface PhoneOrEmailInputProps {
  value: string;
  onChange: (val: string) => void;
  mode?: 'phone' | 'email' | 'both';
  label: string;
  placeholder?: string;
  error?: string | null;
  isValid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const PhoneOrEmailInput: React.FC<PhoneOrEmailInputProps> = ({
  value,
  onChange,
  mode = 'phone',
  label,
  placeholder,
  error,
  isValid,
  disabled = false,
  autoFocus = false,
}) => {
  const handlePhoneFormat = (raw: string) => {
    // If phone mode, format as +998 XX XXX XX XX
    if (mode === 'phone') {
      let cleaned = raw.replace(/[^\d+]/g, '');
      if (!cleaned.startsWith('+998')) {
        if (cleaned.startsWith('998')) {
          cleaned = '+' + cleaned;
        } else if (cleaned.startsWith('+')) {
          cleaned = '+998 ' + cleaned.slice(1).replace(/^998/, '');
        } else {
          cleaned = '+998 ' + cleaned;
        }
      }
      
      const digits = cleaned.replace(/\D/g, '').slice(3); // after 998
      let formatted = '+998';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      return formatted;
    }
    return raw;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (mode === 'phone') {
      onChange(handlePhoneFormat(raw));
    } else {
      onChange(raw);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-[#4a5068] mb-1.5 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-[#7a7f95]">
          {mode === 'email' ? (
            <Mail className="w-5 h-5" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
        </div>

        <input
          type={mode === 'email' ? 'email' : 'tel'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder || (mode === 'email' ? 'example@mail.com' : '+998 90 123 45 67')}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-11 py-3.5 rounded-full border text-sm font-bold text-[#10152b] transition-all outline-none bg-[#fdf6e9]/40 ${
            error
              ? 'border-[#ef3b2d] bg-red-50/40 ring-2 ring-[#ef3b2d]/15'
              : isValid
              ? 'border-[#12935a] bg-emerald-50/20 focus:ring-2 focus:ring-[#12935a]/15'
              : 'border-[#eadfc9] focus:border-[#ef3b2d] focus:bg-white focus:ring-2 focus:ring-[#ef3b2d]/15'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />

        <div className="absolute right-4 flex items-center">
          {error && <AlertCircle className="w-5 h-5 text-[#ef3b2d]" />}
          {!error && isValid && <Check className="w-5 h-5 text-[#12935a]" />}
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-bold text-[#ef3b2d] flex items-center gap-1 pl-3 animate-fadeIn">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
