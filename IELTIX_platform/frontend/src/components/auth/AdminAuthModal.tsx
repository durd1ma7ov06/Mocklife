import React, { useState } from 'react';
import { ShieldCheck, Lock, X, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      // Valid PINs: 7788 or mocklife2026 or admin
      if (pin === '7788' || pin.toLowerCase() === 'mocklife2026' || pin.toLowerCase() === 'admin') {
        sessionStorage.setItem('mocklife_admin_auth', 'true');
        localStorage.setItem('mocklife_admin_auth', 'true');
        onSuccess();
        onClose();
      } else {
        setError("Noto'g'ri Admin PIN kodi. Qayta urinib ko'ring (Standart: 7788).");
      }
    }, 400);
  };

  const handleQuickUnlock = () => {
    sessionStorage.setItem('mocklife_admin_auth', 'true');
    localStorage.setItem('mocklife_admin_auth', 'true');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-nunito">
      <div className="bg-[#10152b] border-2 border-purple-500/40 rounded-[32px] max-w-md w-full p-6 sm:p-8 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Alohida Admin Boshqaruv</span>
          </div>

          <h3 className="font-unbounded font-black text-xl text-white mb-2">
            MockLife Admin Panel
          </h3>
          <p className="text-xs text-white/60 font-semibold mb-6">
            Ushbu panel faqat platforma ma'murlari uchun mo'ljallangan. Barcha foydalanuvchilar va 1 haftalik limit tahlilini ko'rish uchun PIN kodni kiriting.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin PIN Kodi (Standart: 7788)</span>
              </label>
              <input
                autoFocus
                type="password"
                placeholder="PIN kodni kiriting (7788)..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400 text-sm font-bold tracking-widest text-center"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Tekshirilmoqda...' : "Admin Panelga Kirish"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tezkor Admin Ochish (7788)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
