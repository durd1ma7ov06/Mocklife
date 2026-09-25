import React from 'react';
import { useUser } from '../context/UserContext.js';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePractice?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, onNavigatePractice }) => {
  const { user } = useUser();
  if (!isOpen) return null;

  const currentStreak = user.stats.studyStreakDays || 9;

  const daysOfWeek = [
    { name: 'Du', active: true },
    { name: 'Se', active: true },
    { name: 'Chor', active: true },
    { name: 'Pay', active: true },
    { name: 'Jum', active: true },
    { name: 'Shan', active: true },
    { name: 'Yak', active: true },
  ];

  const milestones = [
    {
      days: 3,
      title: '3 Kunlik Streak (Boshlang\'ich Odat)',
      desc: 'Doimiy o\'qish ritmini shakllantirish',
      completed: currentStreak >= 3,
      badge: '🥉 Bronza',
    },
    {
      days: 7,
      title: '7 Kunlik Streak (1 Hafta)',
      desc: 'Haftalik to\'liq uzluksizlik',
      completed: currentStreak >= 7,
      badge: '🥈 Kumush',
    },
    {
      days: 14,
      title: '14 Kunlik Streak (2 Hafta)',
      desc: 'Oltin intizom va so\'z boyligi o\'sishi',
      completed: currentStreak >= 14,
      progress: Math.min(100, Math.round((currentStreak / 14) * 100)),
      badge: '🥇 Oltin',
    },
    {
      days: 30,
      title: '30 Kunlik Streak (1 Oy)',
      desc: 'IELTS 9.0 Master darajasidagi intizom',
      completed: currentStreak >= 30,
      progress: Math.min(100, Math.round((currentStreak / 30) * 100)),
      badge: '💎 Olmos',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Orqa fon uchun nafis olov nuri */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#FF7A00]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center text-2xl shadow-inner border border-[#FF7A00]/30 animate-pulse">
              🔥
            </div>
            <div>
              <h3 className="font-black text-xl text-on-surface">
                {currentStreak} Kunlik Uzluksiz Streak!
              </h3>
              <p className="text-xs text-on-surface-variant">
                O'qish intizomingiz a'lo darajada davom etmoqda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Haftalik kunlar kalendari */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40 relative z-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block text-center sm:text-left">
            Oxirgi 7 kunlik mashg'ulotlar faolligi:
          </span>
          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-on-surface-variant font-medium">{d.name}</span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-sm transition-all ${
                    d.active
                      ? 'bg-gradient-to-tr from-[#FF7A00] to-primary text-white scale-105'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {d.active ? '🔥' : '•'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Bosqichlari (Milestones) */}
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">
            Intizom Bosqichlari & Yutuqlar:
          </span>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-secondary-container/15 border-secondary/40'
                    : 'bg-surface-container-low border-surface-container-high/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{m.badge}</span>
                    <h4 className="text-xs font-bold text-on-surface">{m.title}</h4>
                  </div>
                  {m.completed ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-on-secondary font-bold">
                      ✓ Bajarildi
                    </span>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant font-semibold">
                      {currentStreak}/{m.days} kun
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-on-surface-variant mt-1">{m.desc}</p>

                {!m.completed && m.progress !== undefined && (
                  <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF7A00] to-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Foxy Maslahati */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-high/50 flex items-center gap-3 relative z-10">
          <span className="text-2xl">🦊</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong>Foxy:</strong> "Har kuni kamida 15 daqiqa mashq qilsangiz, bilimni 3 barobar tezroq xotirada saqlaysiz. Olovni o'chirmang!"
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="pt-2 relative z-10">
          <button
            onClick={() => {
              onClose();
              if (onNavigatePractice) onNavigatePractice();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-primary text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔥 Bugungi Streakni Davom Ettirish</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
};
