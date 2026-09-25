import React from 'react';
import { useUser } from '../context/UserContext.js';
import { PageTab } from '../components/Sidebar.js';

interface PracticeHubPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const PracticeHubPage: React.FC<PracticeHubPageProps> = ({ onNavigate }) => {
  const { user } = useUser();

  const practiceModules = [
    {
      id: 'speaking' as PageTab,
      title: '3D Foxy Speaking Lab',
      subtitle: 'Part 1, 2, 3 interaktiv ovozli suhbat',
      icon: 'smart_toy',
      color: 'text-[#FF7A00]',
      bgGlow: 'hover:border-[#FF7A00]/60',
      badgeBg: 'bg-[#FF7A00]/15 text-[#FF7A00]',
      currentBand: user.stats.speakingBand,
      targetBand: user.targetBand,
      progress: 78,
      desc: 'Foxy bilan jonli ovozli suhbat, real-vaqtdagi audio to\'lqin, talaffuz va IELTS 4 ta mezon bo\'yicha tezkor baholash.',
      features: ['Web Speech API Jonli Ovoz', 'British RP Talaffuz', 'Fluency & Lexical Feedback'],
      btnText: 'Speaking Mashqini Boshlash',
      btnColor: 'bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white',
    },
    {
      id: 'writing' as PageTab,
      title: 'Writing Skills & AI Evaluator',
      subtitle: 'Task 1 grafik & Task 2 insho simulyatori',
      icon: 'edit_note',
      color: 'text-primary',
      bgGlow: 'hover:border-primary/60',
      badgeBg: 'bg-primary/15 text-primary',
      currentBand: user.stats.writingBand,
      targetBand: user.targetBand,
      progress: 72,
      desc: 'Split-screen imtihon ko\'rinishi, jonli so\'z sanagich (150/250 so\'z indikatori) va CEFR mezonlari bo\'yicha AI tahlil.',
      features: ['Jonli So\'z Sanagich', '40 daqiqalik Taymer', 'Task Achievement & Cohesion'],
      btnText: 'Writing Mashqini Boshlash',
      btnColor: 'bg-primary-container hover:bg-primary-container/80 text-on-primary-container',
    },
    {
      id: 'reading' as PageTab,
      title: 'Reading Lab & Smart Vocab',
      subtitle: 'Akademik matnlar & Smart Vocab Vault',
      icon: 'menu_book',
      color: 'text-secondary',
      bgGlow: 'hover:border-secondary/60',
      badgeBg: 'bg-secondary/15 text-secondary',
      currentBand: user.stats.readingBand,
      targetBand: user.targetBand,
      progress: 84,
      desc: 'IELTIX ilmiy matnlari, 13 ta savol va matndan xohlagan so\'zni belgilab darhol tarjima & C1 darajasi bilan saqlash.',
      features: ['Split-screen Matn & Savol', 'Vocab Vault Saqlash', 'Tezkor Ball Hisoblash'],
      btnText: 'Reading Mashqini Boshlash',
      btnColor: 'bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container',
    },
    {
      id: 'listening' as PageTab,
      title: 'Listening Exam Module',
      subtitle: 'Section 1-4 IELTIX audio pleyer',
      icon: 'headphones',
      color: 'text-tertiary',
      bgGlow: 'hover:border-tertiary/60',
      badgeBg: 'bg-tertiary/15 text-tertiary',
      currentBand: user.stats.listeningBand,
      targetBand: user.targetBand,
      progress: 88,
      desc: 'Haqiqiy IELTS audio treklari, Section 1–4 savolnomasi, skrub taymer va avtomatik xatolar tahlili.',
      features: ['Audio Tezlik Nazorati', 'Jonli Savol Varaqasi', 'Section 1–4 Audio'],
      btnText: 'Listening Mashqini Boshlash',
      btnColor: 'bg-tertiary-container hover:bg-tertiary-container/80 text-on-tertiary-container',
    },
  ];

  return (
    <div className="flex flex-col gap-space-lg pb-16 max-w-6xl mx-auto animate-fadeIn">
      {/* 1. Sarlavha & Motivatsiya Banneri */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-surface-container-high/40 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Daily Practice Labs • Kunlik Mashg'ulotlar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface">
            Amaliyot Laboratoriyalari (Practice Hub)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed">
            IELTS va Milliy BBM ko'nikmalarini har kuni 15–20 daqiqadan charxlab boring. 
            Xohlagan laboratoriyani tanlab, mustaqil mashg'ulotni boshlang.
          </p>
        </div>

        {/* Tezkor Streak & Intizom Eslatmasi */}
        <div className="relative z-10 flex items-center gap-3 bg-surface-container-lowest/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-surface-container-high/50 shadow-inner">
          <span className="text-2xl animate-bounce">🔥</span>
          <div>
            <div className="text-xs font-bold text-on-surface">
              {user.stats.studyStreakDays} Kunlik Streak
            </div>
            <div className="text-[11px] text-on-surface-variant">
              Bugungi 1 ta mashqni bajaring
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 ta Ko'nikma Laboratoriyalari Kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {practiceModules.map((module) => (
          <div
            key={module.id}
            className={`p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-surface-container-high/50 ${module.bgGlow} transition-all duration-300 flex flex-col justify-between shadow-sm group hover:shadow-md`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center ${module.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                      {module.title}
                    </h2>
                    <span className="text-xs text-on-surface-variant block">
                      {module.subtitle}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-on-surface">
                    {module.currentBand}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-semibold">
                    Maqsad: {module.targetBand}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                {module.desc}
              </p>

              {/* Key Features Chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {module.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant border border-surface-container-high/30"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="space-y-1 mb-5">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Tayyorgarlik darajasi</span>
                  <span className="font-bold text-on-surface">{module.progress}%</span>
                </div>
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onNavigate(module.id)}
              className={`w-full py-3 rounded-2xl ${module.btnColor} text-xs font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer`}
            >
              <span>{module.btnText}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>

      {/* 3. Pastki To'liq Imtihon Baneri (Mock Arena eslatmasi) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-container/20 via-surface-container to-surface-container border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-md">
            🎯
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">
              To'liq 2h 45m Rasmiy Imtihon kerakmi?
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Barcha 4 ta bo'limni bir vaqtda topshirish uchun Mock Test Arenaga o'ting.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('mock-arena')}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all whitespace-nowrap active:scale-95 shadow-md flex items-center gap-1.5"
        >
          <span>Mock Test Arena</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>
      </div>
    </div>
  );
};
