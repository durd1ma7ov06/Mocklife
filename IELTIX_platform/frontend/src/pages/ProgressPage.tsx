import React, { useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { PageTab } from '../components/Sidebar.js';

interface ProgressPageProps {
  onNavigate: (tab: PageTab) => void;
  onOpenStreak?: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate, onOpenStreak }) => {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState<'all' | '30days' | '7days'>('30days');

  // Test history progression data
  const scoreHistory = [
    { testName: 'Test 1 (Diagnostic)', date: '12 Avg', overall: 6.0, listening: 6.5, reading: 6.0, writing: 5.5, speaking: 6.0 },
    { testName: 'Test 4 (Cam 17)', date: '20 Avg', overall: 6.5, listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5 },
    { testName: 'Test 8 (Cam 18)', date: '28 Avg', overall: 6.5, listening: 7.0, reading: 6.5, writing: 6.0, speaking: 7.0 },
    { testName: 'Test 11 (Cam 19 T1)', date: '02 Sen', overall: 7.0, listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 },
    { testName: 'Test 14 (Cam 19 T3)', date: '07 Sen', overall: 7.5, listening: 8.0, reading: 7.5, writing: 6.5, speaking: 7.5 },
  ];

  return (
    <div className="flex flex-col gap-space-lg pb-16 max-w-6xl mx-auto">
      
      {/* 1. Yuqori Sarlavha & Filtr */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container-high/40 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Personal Analytics & Progress
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface mt-1">
            Mening Natijalarim & Rivojlanish
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Barcha o'tgan testlar dinamikasi, ko'nikmalar tahlili va imtihonga tayyorgarlik darajangiz.
          </p>
        </div>

        {/* Vaqt oralig'i filtri */}
        <div className="flex items-center bg-surface-container-lowest p-1 rounded-xl border border-surface-container-high/40 shadow-inner">
          {[
            { id: '7days', label: '7 Kun' },
            { id: '30days', label: '30 Kun' },
            { id: 'all', label: 'Barchasi' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t.id
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Asosiy 4 ta Ko'rsatkich (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Exam Readiness */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Tayyorgarlik</span>
            <span className="material-symbols-outlined text-secondary text-lg">verified</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-on-surface">82%</div>
            <p className="text-xs text-on-surface-variant mt-1">
              Band {user.targetBand} maqsadiga yetish ehtimoli
            </p>
          </div>
          <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* Current vs Target */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">O'sish Dinamikasi</span>
            <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-on-surface flex items-baseline gap-2">
              <span>{user.stats.overallBand}</span>
              <span className="text-xs font-bold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-md">
                +1.0 O'sish
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Boshlang'ich: 6.0 → Hozirgi: {user.stats.overallBand}
            </p>
          </div>
          <span className="text-[11px] text-primary font-semibold">Maqsad: {user.targetBand}</span>
        </div>

        {/* Completed Tests */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary">Topshirilgan</span>
            <span className="material-symbols-outlined text-tertiary text-lg">assignment_turned_in</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-on-surface">{user.stats.testsCompleted} ta</div>
            <p className="text-xs text-on-surface-variant mt-1">
              To'liq va qisman simulyatsiya testlari
            </p>
          </div>
          <span className="text-[11px] text-tertiary font-semibold">Oxirgi test: Bugun</span>
        </div>

        {/* Study Streak (Clickable to open Streak Modal) */}
        <div 
          onClick={onOpenStreak}
          className="p-5 rounded-2xl bg-surface-container hover:bg-surface-container-high/90 border border-[#FF7A00]/30 hover:border-[#FF7A00] shadow-sm flex flex-col justify-between cursor-pointer transition-all group active:scale-[0.99]"
          title="Batafsil Intizom va Milestones ko'rish uchun bosing"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A00]">Intizom (Streak)</span>
            <span className="material-symbols-outlined text-[#FF7A00] text-lg group-hover:scale-125 transition-transform animate-pulse">
              local_fire_department
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-on-surface flex items-center gap-1.5">
              <span>{user.stats.studyStreakDays} kun</span>
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Uzluksiz kunlik mashg'ulotlar davomiyligi
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/30 text-[11px] font-semibold text-[#FF7A00]">
            <span>Milestones & Taqvim</span>
            <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>

      </div>

      {/* 3. Vizual O'sish Grafigi (Band Score Trend Chart) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">show_chart</span>
              Imtihon Ballari O'sish Traektoriyasi
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              12-Avgustdan bugungacha bo'lgan testlar dinamikasi
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-on-surface">Overall Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-on-surface">Maqsad (7.5)</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Trend Chart */}
        <div className="w-full h-56 relative flex items-end justify-between px-2 sm:px-6 pt-8 pb-4 border-b border-surface-container-high/40 bg-surface-container-lowest/40 rounded-2xl">
          {/* Target Line Reference at Band 7.5 (75% height) */}
          <div className="absolute top-[25%] left-0 right-0 border-b-2 border-dashed border-secondary/40 flex justify-end pr-2">
            <span className="text-[10px] text-secondary font-bold -translate-y-4">Target Band: 7.5</span>
          </div>

          {scoreHistory.map((item, index) => {
            const heightPercent = ((item.overall - 5.0) / 4.0) * 100;

            return (
              <div key={index} className="flex flex-col items-center gap-2 z-10 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-surface-container-highest text-on-surface text-[10px] font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                  {item.testName}: Band {item.overall}
                </div>

                <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  {item.overall}
                </span>

                <div
                  className="w-8 sm:w-12 bg-gradient-to-t from-primary-container to-primary rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 shadow"
                  style={{ height: `${Math.max(20, heightPercent * 1.5)}px` }}
                />

                <span className="text-[11px] text-on-surface-variant font-medium mt-1">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Ko'nikmalar Chuqur Diagnostikasi (Kuchli va Zaif Tomonlar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Kuchli va Zaif Bo'limlar */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-md space-y-4">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">rule</span>
            Savol Turlari Bo'yicha Aniqlik Foizi
          </h3>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-semibold">Reading: True/False/Not Given</span>
                <span className="text-secondary font-bold">92% to'g'ri (A'lo)</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-semibold">Listening: Section 1 & 2 (Form Completion)</span>
                <span className="text-tertiary font-bold">88% to'g'ri (Kuchli)</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-semibold">Speaking: Fluency & Intonation</span>
                <span className="text-[#FF7A00] font-bold">75% (Yaxshi)</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-[#FF7A00] h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-semibold">Writing: Task 2 Lexical Resource & Collocations</span>
                <span className="text-error font-bold">60% (⚠️ Zaif tomon)</span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                <div className="bg-error h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Foxy AI Mentor Tavsiyasi */}
        <div className="p-6 rounded-3xl bg-surface-container border border-primary/40 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl p-1 bg-gradient-to-tr from-[#FF7A00] to-primary shadow flex-shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdWCr9y92m0GyEeoq1EnQKx4SgaVSngNo_aR9jJCB4hLPtTUNlRHusMyFZPI64sYYoHm3KIDpJp0KBtEDcM7RFMtQcoumEZ5SaZDl0pvjSqaC8OJDkpVTmxCyB6KnWFDPc80AWnXWplSG4pC-jej6PIDbWNuS_trnnxWwYL6l9s2EeQcIfMmbydxzLe1VzOxqLvHJwOVZWNhdxDXHpeGWIML66GGiT-XyE2dkdHze2vzIid_PFRmiwvA"
                  alt="Foxy Mentor"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A00]">
                  Foxy AI Shaxsiy Tavsiyasi
                </span>
                <h4 className="text-base font-bold text-on-surface">
                  {user.name.split(' ')[0]}, {user.targetBand} ballga chiqish strategiyasi
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40 text-xs text-on-surface-variant space-y-2 leading-relaxed">
              <p>
                🎯 <strong>Eng katta o'sish nuqtasi:</strong> Sizning Listening va Reading ballaringiz allaqachon <strong className="text-on-surface">7.5–8.0</strong> darajasida mustahkam.
              </p>
              <p>
                ✍️ Writing bo'limidagi insholarda <strong className="text-primary font-bold">C1/C2 akademik kollokatsiyalarni</strong> qo'llashni oshirsangiz, umumiy ballingiz 7.0 dan 7.5 ga ko'tariladi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('writing')}
              className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              <span>Writing Mashqiga O'tish</span>
            </button>

            <button
              onClick={() => onNavigate('speaking')}
              className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs border border-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm text-[#FF7A00]">smart_toy</span>
              <span>Speaking</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
