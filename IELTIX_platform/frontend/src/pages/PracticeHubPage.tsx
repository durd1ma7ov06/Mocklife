import React from 'react';
import { useUser } from '../context/UserContext';
import { PageTab } from '../components/Sidebar';
import { 
  Mic, 
  FileEdit, 
  BookOpen, 
  Headphones, 
  Flame, 
  ArrowRight, 
  Check, 
  Award,
  Sparkles,
  Layers
} from 'lucide-react';

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
      icon: Mic,
      color: 'text-[#ff7a00]',
      iconBg: 'bg-[#fff3e6] border border-[#ffd5a8]',
      currentBand: user.stats?.speakingBand || 7.0,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 78,
      desc: "3D Foxy bilan jonli ovozli suhbat, real-vaqtdagi audio to'lqin, talaffuz va IELTS 4 ta mezon bo'yicha tezkor baholash.",
      features: ['Web Speech API Jonli Ovoz', 'British RP Talaffuz', 'Fluency & Lexical Feedback'],
      btnText: 'Speaking Mashqini Boshlash',
      btnColor: 'bg-[#ff7a00] hover:bg-[#e56d00] text-white',
    },
    {
      id: 'writing' as PageTab,
      title: 'Writing Skills & AI Evaluator',
      subtitle: 'Task 1 grafik & Task 2 insho simulyatori',
      icon: FileEdit,
      color: 'text-[#ef3b2d]',
      iconBg: 'bg-[#fde3dc] border border-[#fbd0c4]',
      currentBand: user.stats?.writingBand || 6.5,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 72,
      desc: "Split-screen imtihon ko'rinishi, jonli so'z sanagich (150/250 so'z indikatori) va CEFR mezonlari bo'yicha AI tahlil.",
      features: ["Jonli So'z Sanagich", '40 daqiqalik Taymer', 'Task Achievement & Cohesion'],
      btnText: 'Writing Mashqini Boshlash',
      btnColor: 'bg-[#ef3b2d] hover:bg-[#d62f22] text-white',
    },
    {
      id: 'reading' as PageTab,
      title: 'Reading Lab & Smart Vocab',
      subtitle: 'Akademik matnlar & Smart Vocab Vault',
      icon: BookOpen,
      color: 'text-[#10b981]',
      iconBg: 'bg-[#ecfdf5] border border-[#a7f3d0]',
      currentBand: user.stats?.readingBand || 7.0,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 84,
      desc: "MockLife ilmiy matnlari, 13 ta savol va matndan xohlagan so'zni belgilab darhol tarjima & C1 darajasi bilan saqlash.",
      features: ['Split-screen Matn & Savol', 'Vocab Vault Saqlash', 'Tezkor Ball Hisoblash'],
      btnText: 'Reading Mashqini Boshlash',
      btnColor: 'bg-[#10b981] hover:bg-[#059669] text-white',
    },
    {
      id: 'listening' as PageTab,
      title: 'Listening Exam Module',
      subtitle: 'Section 1-4 MockLife audio pleyer',
      icon: Headphones,
      color: 'text-[#0284c7]',
      iconBg: 'bg-[#e0f2fe] border border-[#bae6fd]',
      currentBand: user.stats?.listeningBand || 7.5,
      targetBand: user.targetBand || '7.5 Academic',
      progress: 88,
      desc: "Haqiqiy IELTS audio treklari, Section 1–4 savolnomasi, skrub taymer va avtomatik xatolar tahlili.",
      features: ['Audio Tezlik Nazorati', 'Jonli Savol Varaqasi', 'Section 1–4 Audio'],
      btnText: 'Listening Mashqini Boshlash',
      btnColor: 'bg-[#0284c7] hover:bg-[#0369a1] text-white',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-6xl mx-auto font-nunito animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-[28px] border border-[#eadfc9] shadow-[0_4px_25px_rgba(80,60,20,0.05)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef3b2d] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ef3b2d]">
              Daily Practice Labs • Kunlik Mashg'ulotlar
            </span>
          </div>
          <h1 className="font-unbounded font-black text-2xl sm:text-3xl text-[#10152b] tracking-tight">
            Amaliyot Laboratoriyalari (Practice Hub)
          </h1>
          <p className="text-xs sm:text-sm text-[#4a5068] font-bold mt-1.5 max-w-2xl leading-relaxed">
            IELTS ko'nikmalarini har kuni 15–20 daqiqadan charxlab boring. 
            Xohlagan laboratoriyani tanlab, mustaqil mashg'ulotni boshlang.
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-3 bg-[#fdf6e9] px-4 py-3 rounded-2xl border border-[#eadfc9] shadow-xs shrink-0">
          <Flame className="w-6 h-6 text-[#ff7a00] fill-[#ff7a00] animate-bounce" />
          <div>
            <div className="text-xs font-black text-[#10152b]">
              {user.stats?.studyStreakDays || 9} Kunlik Streak
            </div>
            <div className="text-[11px] text-[#7a7f95] font-bold">
              Bugungi 1 ta mashqni bajaring
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 ta Ko'nikma Kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {practiceModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className="p-6 sm:p-7 rounded-[26px] bg-white border border-[#eadfc9] hover:border-[#10152b] hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${module.iconBg} ${module.color} shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="font-unbounded font-black text-lg text-[#10152b] group-hover:text-[#ef3b2d] transition-colors">
                        {module.title}
                      </h2>
                      <span className="text-xs text-[#7a7f95] font-bold block">
                        {module.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-unbounded font-black text-2xl text-[#10152b]">
                      {module.currentBand}
                    </div>
                    <span className="text-[10px] text-[#ef3b2d] font-extrabold block">
                      Maqsad: {module.targetBand}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#4a5068] font-bold leading-relaxed mb-4">
                  {module.desc}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {module.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fdf6e9] text-[#2a3048] border border-[#eadfc9]"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#7a7f95]">
                    <span>Tayyorgarlik darajasi</span>
                    <span className="text-[#10152b] font-black">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-[#fdf6e9] h-2 rounded-full overflow-hidden border border-[#eadfc9]">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#ef3b2d]"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigate(module.id)}
                className={`w-full py-3.5 rounded-full ${module.btnColor} text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
              >
                <span>{module.btnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Mock Arena Callout */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#10152b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ef3b2d] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-unbounded font-black text-base sm:text-lg text-white">
              To'liq 2h 45m Rasmiy Imtihon kerakmi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-bold mt-0.5">
              Listening, Reading, Writing va Speaking bitta uzluksiz sessiyada. Rasmiy Cambridge standartida sinovdan o'ting.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('mock-arena')}
          className="shrink-0 px-7 py-3.5 rounded-full bg-[#ef3b2d] hover:bg-[#d62f22] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>Mock Arenaga o'tish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
export default PracticeHubPage;

