import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Sparkles, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Key,
  CheckCircle2
} from 'lucide-react';

interface WebLockPageProps {
  onAdminUnlock?: () => void;
}

export const WebLockPage: React.FC<WebLockPageProps> = ({ onAdminUnlock }) => {
  const [adminKey, setAdminKey] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminError, setAdminError] = useState(false);

  // Check URL query param ?admin=mocklife to auto-unlock for developer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'mocklife' || params.get('preview') === 'true') {
      if (onAdminUnlock) onAdminUnlock();
    }
  }, [onAdminUnlock]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim().toLowerCase() === 'mocklife2026' || adminKey.trim().toLowerCase() === 'admin') {
      if (onAdminUnlock) onAdminUnlock();
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    }
  };

  const activeFeatures = [
    {
      icon: <Mic className="w-5 h-5 text-[#ef3b2d]" />,
      title: '3D Foxy Speaking AI',
      desc: 'Jonli ovozli IELTS Examiner suhbatlari (Part 1, 2, 3)',
    },
    {
      icon: <PenTool className="w-5 h-5 text-[#ff7a00]" />,
      title: 'Writing Studio',
      desc: 'Insho tahlili va 4 ta mezon bo\'yicha tezkor AI baholash',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      title: 'Reading Lab',
      desc: 'Haqiqiy imtihon matnlari, T/F/NG va aqlli lug\'at',
    },
    {
      icon: <Headphones className="w-5 h-5 text-sky-400" />,
      title: 'Listening Audio',
      desc: 'Section 1–4 audio darslari va avtomatik ball hisobi',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0f1d] text-white flex flex-col justify-between font-nunito relative overflow-hidden selection:bg-[#ef3b2d] selection:text-white">
      {/* Ambient glowing background shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ef3b2d]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#ef3b2d] flex items-center justify-center shadow-lg shadow-[#ef3b2d]/30 font-unbounded font-black text-xl text-white">
            M
          </div>
          <span className="font-unbounded font-black text-xl tracking-tight text-white">
            Mock<span className="text-[#ef3b2d]">Life</span>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Veb Ilova Sozlanmoqda</span>
        </div>
      </header>

      {/* Main Lock Card */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        {/* Animated Lock Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#ef3b2d] to-amber-500 p-0.5 shadow-2xl shadow-[#ef3b2d]/30 animate-pulse">
            <div className="w-full h-full bg-[#10152b] rounded-[22px] flex items-center justify-center">
              <Lock className="w-12 h-12 text-[#ef3b2d]" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 text-[#10152b] flex items-center justify-center font-bold shadow-lg">
            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Lock Badges */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef3b2d]/15 border border-[#ef3b2d]/30 text-[#ef3b2d] text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Web Platforma Hali Ishga Tushmadi</span>
        </div>

        {/* Main Headings */}
        <h1 className="font-unbounded font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-3xl mb-4">
          Veb-sayt va Web App <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef3b2d] via-amber-400 to-[#ef3b2d]">Hozirda Qulflangan</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 font-semibold max-w-2xl leading-relaxed mb-8">
          Hurmatli IELTS nomzodi! MockLife veb-platformasi (katta ekrandagi Computer-Delivered Mock Arena, Reading/Listening laboratoriyasi va Writing Studio) hozirda dasturchilarimiz tomonidan yakuniy sozlash va sinovdan o'tkazish jarayonida.
          <br className="hidden sm:block" />
          <strong className="text-white block mt-2">Veb platformamiz juda tez kunda rasman to'liq ishga tushiriladi!</strong>
        </p>

        {/* Telegram Direct CTA Card */}
        <div className="w-full max-w-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-10 text-left relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Telegram Bot 100% Faol & Bepul</span>
              </div>
              <h2 className="font-unbounded font-black text-lg sm:text-xl text-white">
                Barcha Mashqlar Telegramda Ochiq!
              </h2>
            </div>

            <a
              href="https://t.me/Mocklife_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ef3b2d]/30 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
            >
              <span>🤖 Telegram Botga O'tish</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
            {activeFeatures.map((feat, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-unbounded font-black text-xs text-white">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium leading-snug mt-0.5">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1 haftalik bepul VIP sovg'a botda faol
            </span>
            <a
              href="https://t.me/Mocklife_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ef3b2d] hover:underline flex items-center gap-1 font-black"
            >
              <span>@Mocklife_bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Admin Unlock Toggle */}
        <div className="text-center">
          {!showAdminInput ? (
            <button
              onClick={() => setShowAdminInput(true)}
              className="text-xs text-gray-500 hover:text-gray-400 transition flex items-center gap-1.5 mx-auto font-medium cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Admin / Dasturchi kirish</span>
            </button>
          ) : (
            <form onSubmit={handleAdminSubmit} className="flex items-center gap-2 justify-center max-w-xs mx-auto animate-fadeIn">
              <input
                type="password"
                placeholder="Parolni kiriting..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#ef3b2d]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-bold text-xs transition cursor-pointer"
              >
                Kirish
              </button>
            </form>
          )}
          {adminError && (
            <p className="text-[11px] text-[#ef3b2d] font-bold mt-2">
              Noto'g'ri parol! (Faqat ma'muriyat uchun)
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 border-t border-white/10 text-center text-xs text-gray-500 font-bold">
        <p>© 2026 MockLife Platform • Barcha huquqlar himoyalangan • Rasmiy Bot: @Mocklife_bot</p>
      </footer>
    </div>
  );
};

export default WebLockPage;
