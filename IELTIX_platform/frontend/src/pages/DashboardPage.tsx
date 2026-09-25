import React from 'react';
import { useExam } from '../context/ExamContext.js';
import { useUser } from '../context/UserContext.js';
import { PageTab } from '../components/Sidebar.js';

interface DashboardPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { mode } = useExam();
  const { user } = useUser();

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      
      {/* 1. Yuqori Holat & AI Examiner Boshqaruv Bloki */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-slate-800/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/ai-examiner.png"
                alt="AI Examiner"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700/70"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#111726]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Salom, {user.name.split(' ')[0]}!
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI Mentor Tayyor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Imtihongacha <strong className="text-slate-200 font-semibold">{user.daysLeft} kun</strong> qoldi ({user.examDate}) • Maqsadli ballingiz: <strong className="text-blue-400 font-semibold">{user.targetBand}</strong>
              </p>
            </div>
          </div>

          {/* Tanlangan Imtihon Holati */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                {mode === 'IELTS' ? 'IELTS Academic' : 'Milliy BBM CEFR'}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded ml-1">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GoPrep AI Diagnostic Quiz Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 p-6 sm:p-7 border border-amber-400/30 shadow-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30">
                  GoPrep AI Quiz • 2 Daqiqa
                </span>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Bepul Diagnostika
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-on-surface mt-1">
                Qaysi IELTS Band olishingiz mumkinligini va 4 haftalik shaxsiy yo'l xaritasini bilib oling!
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                GoPrep AI algoritmi zaif tomonlaringizni aniqlab, maqsadli ballga yetish strategiyangizni ishlab chiqadi.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('quiz')}
            className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-[#e56d00] hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>AI Testni Boshlash</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 2. Kundalik Mashqlar Bo'limi (Practice Labs — 4 ta Ko'nikma) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            Kundalik Mashg'ulotlar (Practice Labs)
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Har kuni o'zingizga qulay bo'limni tanlab, 10–15 daqiqa alohida ko'nikmalar ustida ishlang:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Speaking Practice */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 hover:border-[#FF7A00]/50 hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-on-surface">{user.stats.speakingBand}</span>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Hozirgi Band</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-on-surface group-hover:text-[#FF7A00] transition-colors">
                Speaking Lab
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                3D Foxy bilan jonli ovozli suhbat, talaffuz va IELTS Part 1–3 mashqlari.
              </p>

              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#FF7A00] h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('speaking')}
              className="mt-5 w-full py-2.5 rounded-xl bg-surface-container hover:bg-[#FF7A00] hover:text-white text-xs font-bold text-on-surface border border-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Speaking Mashqi</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Writing Practice */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 hover:border-primary/50 hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-on-surface">{user.stats.writingBand}</span>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Hozirgi Band</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                Writing Lab
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Task 1 va Task 2 insholarini yozish, jonli so'z sanagich va tezkor AI baholash.
              </p>

              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('writing')}
              className="mt-5 w-full py-2.5 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-xs font-bold text-on-surface border border-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Writing Mashqi</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Reading Practice */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 hover:border-secondary/50 hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary-container/30 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">menu_book</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-on-surface">{user.stats.readingBand}</span>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Hozirgi Band</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
                Reading Lab
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Ilmiy matnlarni tahlil qilish, so'zlarni belgilab Vocab Vault'ga saqlash.
              </p>

              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('reading')}
              className="mt-5 w-full py-2.5 rounded-xl bg-surface-container hover:bg-secondary hover:text-on-secondary text-xs font-bold text-on-surface border border-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Reading Mashqi</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Listening Practice */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 hover:border-tertiary/50 hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">headphones</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-on-surface">{user.stats.listeningBand}</span>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Hozirgi Band</span>
                </div>
              </div>

              <h3 className="font-bold text-base text-on-surface group-hover:text-tertiary transition-colors">
                Listening Lab
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                IELTS audiosini eshitish, Section 1–4 savollarini bajarish va tekshirish.
              </p>

              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '83%' }} />
              </div>
            </div>

            <button
              onClick={() => onNavigate('listening')}
              className="mt-5 w-full py-2.5 rounded-xl bg-surface-container hover:bg-tertiary hover:text-on-tertiary text-xs font-bold text-on-surface border border-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Listening Mashqi</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        </div>
      </section>

      {/* 3. Rasmiy Mock Test Arenasiga Taklif Kartasi (Alohida va Aniq Ajratilgan) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container p-6 sm:p-8 border border-primary/30 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container/40 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/30">
                🏛️ Rasmiy Imtihon Simulyatori
              </span>
              <span className="text-xs font-code text-on-surface-variant">2 soat 45 daqiqa</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              To'liq Computer-Delivered Mock Test topshirmoqchimisiz?
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Haqiqiy imtihon muhitida barcha 4 ta bo'limni (Listening, Reading, Writing, Speaking) uzluksiz topshirish, AI proctoring va QR-kodli rasmiy sertifikat olish uchun maxsus arenaga o'ting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('system-check')}
              className="px-4 py-3.5 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs uppercase tracking-wider border border-surface-container-high/80 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-secondary">tune</span>
              <span>Uskunalar Tekshiruvi</span>
            </button>

            <button
              onClick={() => onNavigate('mock-arena')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-tertiary text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Mock Test Arenaga O'tish</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
