import React, { useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { useExam } from '../context/ExamContext.js';
import { PageTab } from '../components/Sidebar.js';

interface ScoreReportPageProps {
  onNavigate?: (tab: PageTab) => void;
}

interface MockResultItem {
  id: string;
  examTitle: string;
  testDate: string;
  centerNumber: string;
  candidateNumber: string;
  overallBand: number;
  cefrLevel: string;
  listening: { band: number; raw: number; max: number; partBreakdown: number[] };
  reading: { band: number; raw: number; max: number; passageBreakdown: number[] };
  writing: { band: number; task1: number; task2: number; criteria: { ta: number; cc: number; lr: number; gra: number } };
  speaking: { band: number; fluency: number; lexical: number; grammar: number; pronunciation: number };
  examinerNotes: string;
  qrHash: string;
}

export const ScoreReportPage: React.FC<ScoreReportPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { mode } = useExam();

  const testResults: MockResultItem[] = [
    {
      id: 'res-cam-19-1',
      examTitle: 'Cambridge 19 Academic • Full Mock Simulation 1',
      testDate: '07 Sentabr, 2025',
      centerNumber: 'UZ008 • Tashkent IELTIX Test Center',
      candidateNumber: '004921',
      overallBand: user.stats?.overallBand || 7.5,
      cefrLevel: 'C1 (Advanced User)',
      listening: {
        band: user.stats?.listeningBand || 8.0,
        raw: 35,
        max: 40,
        partBreakdown: [10, 9, 8, 8],
      },
      reading: {
        band: user.stats?.readingBand || 7.5,
        raw: 34,
        max: 40,
        passageBreakdown: [13, 11, 10],
      },
      writing: {
        band: user.stats?.writingBand || 7.0,
        task1: 7.0,
        task2: 7.0,
        criteria: { ta: 7.0, cc: 7.5, lr: 7.0, gra: 7.0 },
      },
      speaking: {
        band: user.stats?.speakingBand || 7.5,
        fluency: 8.0,
        lexical: 7.5,
        grammar: 7.0,
        pronunciation: 7.5,
      },
      examinerNotes:
        "Nomzod yuqori darajadagi akademik ingliz tili malakasini namoyish etdi. Listening va Speaking bo'yicha mustahkam C1 darajasi qayd etildi. Writing Task 2'da paragraf bog'liqligi va murakkab sintaktik tuzilmalarni yanada boyitish orqali Band 8.0 ga chiqish tavsiya etiladi.",
      qrHash: 'SHA256: 8f9b3e1a029c7d84b25e610a39f992a',
    },
    {
      id: 'res-cam-18-2',
      examTitle: 'Cambridge 18 Academic • Full Mock Simulation 2',
      testDate: '28 Avgust, 2025',
      centerNumber: 'UZ008 • Tashkent IELTIX Test Center',
      candidateNumber: '004921',
      overallBand: 7.0,
      cefrLevel: 'C1 (Good User)',
      listening: {
        band: 7.5,
        raw: 33,
        max: 40,
        partBreakdown: [9, 9, 8, 7],
      },
      reading: {
        band: 7.0,
        raw: 32,
        max: 40,
        passageBreakdown: [12, 11, 9],
      },
      writing: {
        band: 6.5,
        task1: 6.5,
        task2: 6.5,
        criteria: { ta: 6.5, cc: 7.0, lr: 6.5, gra: 6.5 },
      },
      speaking: {
        band: 7.0,
        fluency: 7.5,
        lexical: 7.0,
        grammar: 6.5,
        pronunciation: 7.0,
      },
      examinerNotes:
        "Yaxshi o'zlashtirilgan. Reading Passage 3'dagi ilmiy matn savollarida xatolar kuzatildi. Writing bo'yicha so'z boyligi va akademik iboralarni kengaytirish maqsadga muvofiq.",
      qrHash: 'SHA256: 3a2c5e7b199d814f05b630e128c771b',
    },
  ];

  const [selectedResultId, setSelectedResultId] = useState<string>(testResults[0].id);
  const [activeTab, setActiveTab] = useState<'trf' | 'diagnostics' | 'mistakes'>('trf');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const currentResult = testResults.find((r) => r.id === selectedResultId) || testResults[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-5xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* 1. Header Toolbar (Screen only, hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low p-5 rounded-2xl border border-surface-container-high/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">verified</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Rasmiy Test Report Form (TRF)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-on-surface mt-1">
            Imtihon Natijalari & Sertifikat
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Xalqaro IELTS va Milliy BBM mezonlariga 100% mos to'liq ball hisoboti
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedResultId}
            onChange={(e) => setSelectedResultId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {testResults.map((r) => (
              <option key={r.id} value={r.id}>
                {r.examTitle.split('•')[0]} ({r.testDate})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base text-primary">print</span>
            <span>Chop Etish (A4 PDF)</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('mock-arena')}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-base">play_arrow</span>
              <span>Yangi Mock Test</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs (TRF Sertifikat / Diagnostika / Xatolar tahlili) */}
      <div className="print:hidden flex items-center gap-2 border-b border-surface-container-high/40 pb-2">
        <button
          onClick={() => setActiveTab('trf')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'trf'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">badge</span>
          <span>Rasmiy TRF Sertifikat</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">analytics</span>
          <span>Ko'nikmalar Diagnostikasi</span>
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mistakes'
              ? 'bg-primary-container text-on-primary-container shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">rule</span>
          <span>Savollar & Xatolar Tahlili</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL TRF CERTIFICATE (PRINTABLE) */}
      {activeTab === 'trf' && (
        <div className="bg-surface-container-lowest border-2 border-surface-container-high/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* TRF Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-surface-container-high gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black tracking-tight text-primary">IELTIX</span>
                <span className="px-2.5 py-0.5 rounded bg-primary-container/30 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">
                  {mode === 'IELTS' ? 'IELTS ACADEMIC' : 'MILLIY BBM'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-on-surface tracking-tight uppercase">
                Test Report Form (TRF) • Rasmiy Natija
              </h2>
              <p className="text-xs text-on-surface-variant">
                Computer-delivered English Language Assessment Standard
              </p>
            </div>

            {/* Candidate Photo & Security Stamp */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-xl bg-surface-container-high border-2 border-surface-container-highest flex flex-col items-center justify-center p-2 text-center shadow-inner relative overflow-hidden">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">account_circle</span>
                <span className="text-[9px] font-bold text-on-surface mt-1 truncate max-w-full">
                  {user.name.split(' ')[0]}
                </span>
                <span className="absolute bottom-0 inset-x-0 bg-primary/20 text-primary text-[8px] font-bold py-0.5">
                  VERIFIED
                </span>
              </div>

              {/* Official QR Code Stamp */}
              <div
                onClick={() => setShowQrModal(true)}
                className="w-24 h-24 rounded-xl bg-white p-1.5 border-2 border-dashed border-primary/50 flex flex-col items-center justify-between shadow-xs cursor-pointer hover:border-primary transition-all group"
                title="Kriptografik QR kodni tekshirish uchun bosing"
              >
                {/* Simulated QR Pattern */}
                <div className="w-16 h-16 bg-neutral-900 rounded p-1 grid grid-cols-5 gap-0.5">
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
                <span className="text-[8px] font-mono text-neutral-700 font-bold tracking-tighter group-hover:text-primary">
                  VERIFY QR ↗
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Profile Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/40 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Nomzod Ismi</span>
              <strong className="text-on-surface text-sm">{user.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Nomzod Raqami</span>
              <strong className="text-on-surface font-mono">{currentResult.candidateNumber}</strong>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Imtihon Sanasi</span>
              <strong className="text-on-surface">{currentResult.testDate}</strong>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Test Markazi</span>
              <strong className="text-on-surface truncate block" title={currentResult.centerNumber}>
                {currentResult.centerNumber.split('•')[0]}
              </strong>
            </div>
          </div>

          {/* Core Band Scores Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Imtihon Ballari (Official Band Scores)
              </h3>
              <span className="text-xs text-secondary font-bold">
                CEFR: {currentResult.cefrLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Listening */}
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-tertiary uppercase">Listening</span>
                <span className="text-3xl font-black text-on-surface my-1">
                  {currentResult.listening.band.toFixed(1)}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {currentResult.listening.raw} / {currentResult.listening.max}
                </span>
              </div>

              {/* Reading */}
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-secondary uppercase">Reading</span>
                <span className="text-3xl font-black text-on-surface my-1">
                  {currentResult.reading.band.toFixed(1)}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {currentResult.reading.raw} / {currentResult.reading.max}
                </span>
              </div>

              {/* Writing */}
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-primary uppercase">Writing</span>
                <span className="text-3xl font-black text-on-surface my-1">
                  {currentResult.writing.band.toFixed(1)}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  T1: {currentResult.writing.task1} • T2: {currentResult.writing.task2}
                </span>
              </div>

              {/* Speaking */}
              <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-[#FF7A00] uppercase">Speaking</span>
                <span className="text-3xl font-black text-on-surface my-1">
                  {currentResult.speaking.band.toFixed(1)}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  3D Foxy Audio
                </span>
              </div>

              {/* Overall Band - Highlighted */}
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-surface-container border-2 border-primary/50 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-xs font-black text-primary uppercase tracking-wider">Overall Band</span>
                <span className="text-4xl font-black text-on-surface my-0.5">
                  {currentResult.overallBand.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase">
                  {currentResult.cefrLevel.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Examiner's Diagnostic Remarks */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-base">psychology</span>
              <span>IELTIX Katta Imtihon Komissiyasi Xulosasi (Examiner Remarks)</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed italic">
              "{currentResult.examinerNotes}"
            </p>
          </div>

          {/* Validation & Security Footer */}
          <div className="pt-6 border-t-2 border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">verified_user</span>
              <span className="font-mono text-[11px]">
                Xavfsizlik Hoshiyasi: {currentResult.qrHash}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-on-surface">
              <span>British Council & IDP Qoidalariga Mos</span>
              <span>•</span>
              <span>Toshkent, O'zbekiston</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DETAILED SKILL DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          
          {/* Listening Breakdown */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">headphones</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Listening Bo'limi Tahlili</h3>
                  <p className="text-xs text-on-surface-variant">
                    Band {currentResult.listening.band} • 40 savoldan {currentResult.listening.raw} tasi to'g'ri
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-tertiary">{currentResult.listening.band}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Part 1: Kundalik Dialog', 'Part 2: Monolog & Xarita', 'Part 3: Akademik Suhbat', 'Part 4: Ilmiy Ma\'ruza'].map((title, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high text-xs">
                  <span className="text-[11px] text-on-surface-variant block font-medium">{title}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-base text-on-surface font-black">
                      {currentResult.listening.partBreakdown[i]} / 10
                    </strong>
                    <span className="text-[11px] text-tertiary font-bold">
                      {currentResult.listening.partBreakdown[i] * 10}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reading Breakdown */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Reading Bo'limi Tahlili</h3>
                  <p className="text-xs text-on-surface-variant">
                    Band {currentResult.reading.band} • 40 savoldan {currentResult.reading.raw} tasi to'g'ri
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-secondary">{currentResult.reading.band}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Passage 1: Umumiy Ilmiy Matn', score: currentResult.reading.passageBreakdown[0], max: 13 },
                { title: 'Passage 2: Texnologiya & Jamiyat', score: currentResult.reading.passageBreakdown[1], max: 13 },
                { title: 'Passage 3: Falsafiy / Tadqiqot', score: currentResult.reading.passageBreakdown[2], max: 14 },
              ].map((p, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high text-xs">
                  <span className="text-[11px] text-on-surface-variant block font-medium">{p.title}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-base text-on-surface font-black">
                      {p.score} / {p.max}
                    </strong>
                    <span className="text-[11px] text-secondary font-bold">
                      {Math.round((p.score / p.max) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Breakdown */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Writing Bo'limi Mezonlari</h3>
                  <p className="text-xs text-on-surface-variant">
                    Task 1: {currentResult.writing.task1} • Task 2: {currentResult.writing.task2}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-primary">{currentResult.writing.band}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Task Achievement', val: currentResult.writing.criteria.ta },
                { label: 'Coherence & Cohesion', val: currentResult.writing.criteria.cc },
                { label: 'Lexical Resource', val: currentResult.writing.criteria.lr },
                { label: 'Grammar & Accuracy', val: currentResult.writing.criteria.gra },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container border border-surface-container-high text-center">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">{c.label}</span>
                  <span className="text-2xl font-black text-primary block mt-1">{c.val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Speaking Breakdown */}
          <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">3D Foxy Speaking Arena Mezonlari</h3>
                  <p className="text-xs text-on-surface-variant">
                    AI real-vaqt ovoz va talaffuz tahlili
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-[#FF7A00]">{currentResult.speaking.band}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Fluency & Coherence', val: currentResult.speaking.fluency },
                { label: 'Lexical Resource', val: currentResult.speaking.lexical },
                { label: 'Grammatical Range', val: currentResult.speaking.grammar },
                { label: 'Pronunciation', val: currentResult.speaking.pronunciation },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container border border-surface-container-high text-center">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">{s.label}</span>
                  <span className="text-2xl font-black text-[#FF7A00] block mt-1">{s.val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MISTAKES & QUESTION REVIEW */}
      {activeTab === 'mistakes' && (
        <div className="bg-surface-container-low border border-surface-container-high/50 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
            <div>
              <h3 className="text-base font-bold text-on-surface">Imtihondagi Xatolar Tahlili</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Qaysi savollarda adashdingiz va to'g'ri javoblar izohi
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs">
              6 ta asosiy xato aniqlandi
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                section: 'Listening Part 3',
                qNum: 24,
                userAns: 'solar batteries',
                correctAns: 'solar panels',
                reason: "Audio trekda so'zlovchi 'batteries' so'zini chalg'ituvchi sifatida aytib, keyin 'panels' variantini tasdiqladi.",
              },
              {
                section: 'Reading Passage 2',
                qNum: 17,
                userAns: 'TRUE',
                correctAns: 'NOT GIVEN',
                reason: "Matnda muallif bu faktni to'g'ridan-to'g'ri tasdiqlamagan yoki inkor qilmagan. Shuning uchun NOT GIVEN bo'lishi lozim edi.",
              },
              {
                section: 'Writing Task 2',
                qNum: 'Grammar',
                userAns: 'In nowadays people tends to...',
                correctAns: 'Nowadays, people tend to...',
                reason: "Subject-verb agreement xatosi: 'people' ko'plik shakli bo'lgani sababli 'tend' fe'li ishlatilishi shart.",
              },
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">{m.section} • Savol #{m.qNum}</span>
                  <span className="text-[10px] uppercase font-bold text-error bg-error-container/30 px-2 py-0.5 rounded">
                    Xato javob
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                    <span className="text-on-surface-variant block text-[10px]">Sizning javobingiz:</span>
                    <strong className="text-error line-through">{m.userAns}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                    <span className="text-on-surface-variant block text-[10px]">To'g'ri javob:</span>
                    <strong className="text-secondary">{m.correctAns}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed bg-surface-container-low p-2 rounded-lg">
                  💡 <strong>Izoh:</strong> {m.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Modal for QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                <h3 className="font-black text-lg text-on-surface">Kriptografik Sertifikat</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto border-2 border-dashed border-primary shadow-inner flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-neutral-900 rounded p-1.5 grid grid-cols-6 gap-0.5">
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant">
                Ushbu sertifikat va natijalar IELTIX Blockchain/Kriptografik bazasida tasdiqlangan.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high font-mono text-[11px] text-on-surface break-all">
              {currentResult.qrHash}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
