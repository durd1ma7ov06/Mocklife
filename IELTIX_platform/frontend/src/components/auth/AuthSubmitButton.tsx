import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'submit' | 'button';
  icon?: React.ReactNode;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  label,
  loading = false,
  disabled = false,
  onClick,
  type = 'submit',
  icon,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-sm tracking-wider uppercase py-4 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Kutilmoqda...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          {icon || <ArrowRight className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};
