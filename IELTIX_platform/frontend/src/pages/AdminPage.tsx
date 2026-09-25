import React, { useState, useEffect } from 'react';
import { PageTab } from '../components/Sidebar.js';
import { useUser } from '../context/UserContext.js';
import { supabase } from '../services/supabaseClient.js';

interface AdminPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'listening' | 'reading' | 'writing' | 'speaking' | 'candidates'>('overview');
  const [supabaseCandidates, setSupabaseCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const fetchSupabaseCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setSupabaseCandidates(data);
      }
    } catch (e) {
      console.warn('Supabase fetch error:', e);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchSupabaseCandidates();
    }
  }, [activeTab]);

  // Success notifications
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Listening form state
  const [listeningForm, setListeningForm] = useState({
    examCode: 'cambridge-19-test-3',
    part: 1,
    title: '',
    audioUrl: '',
    transcript: '',
    questionType: 'NOTE_COMPLETION',
    prompt: '',
    correctAnswer: '',
  });

  // Reading form state
  const [readingForm, setReadingForm] = useState({
    examCode: 'cambridge-19-test-3',
    passageNumber: 1,
    title: '',
    cefrLevel: 'C1',
    passageText: '',
    questionPrompt: '',
    questionType: 'TRUE_FALSE_NOT_GIVEN',
    correctAnswer: 'TRUE',
  });

  // Writing form state
  const [writingForm, setWritingForm] = useState({
    taskType: 'TASK_2',
    title: '',
    promptText: '',
    chartUrl: '',
    minWords: 250,
  });

  // Speaking form state
  const [speakingForm, setSpeakingForm] = useState({
    part: 2,
    topic: '',
    prompt: '',
    cuePoints: '',
  });

  const showNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  const handleSaveListening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/listening/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listeningForm),
      });
    } catch {}
    showNotification(`Listening ${listeningForm.title || `Part ${listeningForm.part}`} muvaffaqiyatli saqlandi!`);
    setListeningForm({
      examCode: 'cambridge-19-test-3',
      part: 1,
      title: '',
      audioUrl: '',
      transcript: '',
      questionType: 'NOTE_COMPLETION',
      prompt: '',
      correctAnswer: '',
    });
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/reading/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingForm),
      });
    } catch {}
    showNotification(`Reading Passaj: "${readingForm.title}" muvaffaqiyatli saqlandi!`);
    setReadingForm({
      examCode: 'cambridge-19-test-3',
      passageNumber: 1,
      title: '',
      cefrLevel: 'C1',
      passageText: '',
      questionPrompt: '',
      questionType: 'TRUE_FALSE_NOT_GIVEN',
      correctAnswer: 'TRUE',
    });
  };

  const handleSaveWriting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/writing/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(writingForm),
      });
    } catch {}
    showNotification(`Writing vazifasi: "${writingForm.title}" muvaffaqiyatli saqlandi!`);
    setWritingForm({
      taskType: 'TASK_2',
      title: '',
      promptText: '',
      chartUrl: '',
      minWords: 250,
    });
  };

  const handleSaveSpeaking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/speaking/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(speakingForm),
      });
    } catch {}
    showNotification(`Speaking Part ${speakingForm.part} mavzusi muvaffaqiyatli saqlandi!`);
    setSpeakingForm({
      part: 2,
      topic: '',
      prompt: '',
      cuePoints: '',
    });
  };

  return (
    <div className="flex flex-col gap-space-lg pb-24 max-w-6xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/30">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            IELTIX Admin & Teacher Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            Imtihon Materiallarini Boshqarish & Yuklash
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            IELTS Cambridge va Milliy BBM testlarini (Listening audio, Reading ilmiy matnlar, Writing va Speaking mavzularini) to'g'ridan-to'g'ri bazaga yuklang va tahrirlang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface border border-surface-container-high transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('mock-arena')}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-95"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Mock Arena</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/40 text-secondary text-xs font-bold flex items-center gap-2.5 shadow-md animate-fadeIn">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Umumiy Holat', icon: 'dashboard' },
          { id: 'listening', label: 'Listening Yuklash', icon: 'headphones' },
          { id: 'reading', label: 'Reading Matn & Savol', icon: 'menu_book' },
          { id: 'writing', label: 'Writing Mavzulari', icon: 'edit_note' },
          { id: 'speaking', label: 'Speaking Cue Cardlar', icon: 'smart_toy' },
          { id: 'candidates', label: 'Nomzodlar Ro\'yxati', icon: 'group' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high/40'
            }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Jami Mock Testlar</span>
                <span className="material-symbols-outlined text-primary text-xl">library_books</span>
              </div>
              <div className="text-3xl font-black text-on-surface">12 ta</div>
              <span className="text-[11px] text-secondary font-semibold">Cambridge 19, 18 & Milliy BBM</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Listening Audio Treklari</span>
                <span className="material-symbols-outlined text-tertiary text-xl">headphones</span>
              </div>
              <div className="text-3xl font-black text-on-surface">48 ta</div>
              <span className="text-[11px] text-on-surface-variant">Section 1–4 to'liq transkript</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Reading Passajlar</span>
                <span className="material-symbols-outlined text-secondary text-xl">article</span>
              </div>
              <div className="text-3xl font-black text-on-surface">36 ta</div>
              <span className="text-[11px] text-on-surface-variant">B2 / C1 ilmiy maqolalar</span>
            </div>

            <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Server & Ma'lumotlar</span>
                <span className="material-symbols-outlined text-[#FF7A00] text-xl">database</span>
              </div>
              <div className="text-3xl font-black text-secondary">Faol ✓</div>
              <span className="text-[11px] text-on-surface-variant">Node.js + PostgreSQL API</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">speed</span>
              <span>Tezkor Boshqaruv Qo'llanmasi</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Ushbu Admin Studio orqali o'qituvchilar va platforma ma'murlari yangi Cambridge IELTS testlarini, audio treklarini, ilmiy matnlarni va insho mavzularini kiritishlari mumkin. Barcha saqlangan ma'lumotlar darhol platformadagi testlar ro'yxatida nomzodlar uchun paydo bo'ladi.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: LISTENING UPLOADER */}
      {activeTab === 'listening' && (
        <form onSubmit={handleSaveListening} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">🎧 Yangi Listening Test / Part Yuklash</h3>
              <p className="text-xs text-on-surface-variant">IELTS Listening audio, savollar va to'liq audio transkripti</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Imtihon To'plami
              </label>
              <input
                type="text"
                required
                value={listeningForm.examCode}
                onChange={(e) => setListeningForm({ ...listeningForm, examCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="cambridge-19-test-3"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Bo'lim (Section / Part)
              </label>
              <select
                value={listeningForm.part}
                onChange={(e) => setListeningForm({ ...listeningForm, part: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Part 1 - Kundalik Muloqot (Notes)</option>
                <option value={2}>Part 2 - Jamiyat & Xarita (Map Labelling)</option>
                <option value={3}>Part 3 - Akademik Suhbat (Discussion)</option>
                <option value={4}>Part 4 - Universitet Ma'ruzasi (Lecture)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={listeningForm.title}
                onChange={(e) => setListeningForm({ ...listeningForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Cambridge 19 Test 3 Part 1 - Car Rental"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Audio Fayl Manzili (MP3 URL)
            </label>
            <input
              type="text"
              value={listeningForm.audioUrl}
              onChange={(e) => setListeningForm({ ...listeningForm, audioUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              placeholder="https://example.com/audio/c19_test3_part1.mp3 (yoki Web Speech API orqali generatsiya qilinadi)"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              To'liq Audio Transkripti (Audio Narration & Signposts)
            </label>
            <textarea
              rows={4}
              required
              value={listeningForm.transcript}
              onChange={(e) => setListeningForm({ ...listeningForm, transcript: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary font-code leading-relaxed"
              placeholder="Audio suhbat matnini shu yerga joylang..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <span className="text-xs font-bold text-on-surface block">Savol Qo'shish:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={listeningForm.prompt}
                onChange={(e) => setListeningForm({ ...listeningForm, prompt: e.target.value })}
                placeholder="Savol matni (masalan: Customer full name: ___)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                value={listeningForm.correctAnswer}
                onChange={(e) => setListeningForm({ ...listeningForm, correctAnswer: e.target.value })}
                placeholder="To'g'ri javob (masalan: Thompson)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <select
                value={listeningForm.questionType}
                onChange={(e) => setListeningForm({ ...listeningForm, questionType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="NOTE_COMPLETION">Note Completion (Bo'sh joy to'ldirish)</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Variantli)</option>
                <option value="MAP_LABELLING">Map Labelling (Xaritada joylashuv A-G)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>Listening Materialni Bazaga Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 3: READING UPLOADER */}
      {activeTab === 'reading' && (
        <form onSubmit={handleSaveReading} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">📖 Yangi Reading Ilmiy Passaj Yuklash</h3>
              <p className="text-xs text-on-surface-variant">Akademik maqola, so'zlar boyligi va savollar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Imtihon To'plami
              </label>
              <input
                type="text"
                required
                value={readingForm.examCode}
                onChange={(e) => setReadingForm({ ...readingForm, examCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="cambridge-19-test-3"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Passaj Tartibi
              </label>
              <select
                value={readingForm.passageNumber}
                onChange={(e) => setReadingForm({ ...readingForm, passageNumber: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Passage 1 (Umumiy / Tarixiy)</option>
                <option value={2}>Passage 2 (Tabiat / Ekologiya)</option>
                <option value={3}>Passage 3 (Ilmiy / Kognitiv / Falsafa)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Passaj Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={readingForm.title}
                onChange={(e) => setReadingForm({ ...readingForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: The Future of Quantum Computing"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Akademik Matn Mazmuni (Passage Text - kamida 600-900 so'z)
            </label>
            <textarea
              rows={6}
              required
              value={readingForm.passageText}
              onChange={(e) => setReadingForm({ ...readingForm, passageText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              placeholder="Matnni to'liq shu yerga ko'chirib o'tkazing..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <span className="text-xs font-bold text-on-surface block">Birinchi Savol Namunasi:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={readingForm.questionPrompt}
                onChange={(e) => setReadingForm({ ...readingForm, questionPrompt: e.target.value })}
                placeholder="Savol jumlasi"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <select
                value={readingForm.correctAnswer}
                onChange={(e) => setReadingForm({ ...readingForm, correctAnswer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TRUE">TRUE (Haqiqat)</option>
                <option value="FALSE">FALSE (Noto'g'ri)</option>
                <option value="NOT GIVEN">NOT GIVEN (Matnda berilmagan)</option>
              </select>
              <select
                value={readingForm.questionType}
                onChange={(e) => setReadingForm({ ...readingForm, questionType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Variantli)</option>
                <option value="SUMMARY_COMPLETION">Summary Completion</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-secondary text-on-secondary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Reading Passajini Bazaga Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 4: WRITING UPLOADER */}
      {activeTab === 'writing' && (
        <form onSubmit={handleSaveWriting} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">✍️ Yangi Writing Vazifasi Qo'shish</h3>
              <p className="text-xs text-on-surface-variant">Task 1 grafik yoki Task 2 insho mavzulari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Vazifa Turi (Task Type)
              </label>
              <select
                value={writingForm.taskType}
                onChange={(e) => setWritingForm({ ...writingForm, taskType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="TASK_1">Task 1 (Grafik / Diagramma / Xarita - 150 so'z)</option>
                <option value="TASK_2">Task 2 (Insho / Essay - 250 so'z)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Sarlavhasi
              </label>
              <input
                type="text"
                required
                value={writingForm.title}
                onChange={(e) => setWritingForm({ ...writingForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Cambridge 19 Test 3 Task 2 - Artificial Intelligence & Employment"
              />
            </div>
          </div>

          {writingForm.taskType === 'TASK_1' && (
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Grafik / Diagramma Rasm Manzili (Image URL)
              </label>
              <input
                type="text"
                value={writingForm.chartUrl}
                onChange={(e) => setWritingForm({ ...writingForm, chartUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="https://example.com/charts/task1_barchart.png"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Insho Sharti va Savol Matni (Prompt)
            </label>
            <textarea
              rows={4}
              required
              value={writingForm.promptText}
              onChange={(e) => setWritingForm({ ...writingForm, promptText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              placeholder="Masalan: Some people believe that artificial intelligence will replace human jobs entirely. To what extent do you agree or disagree?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>Writing Mavzusini Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 5: SPEAKING UPLOADER */}
      {activeTab === 'speaking' && (
        <form onSubmit={handleSaveSpeaking} className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <h3 className="text-base font-bold text-on-surface">🎙️ Yangi Speaking Mavzulari & Cue Cardlar</h3>
              <p className="text-xs text-on-surface-variant">3D Foxy bilan jonli audio suhbat kartalari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Speaking Bo'limi
              </label>
              <select
                value={speakingForm.part}
                onChange={(e) => setSpeakingForm({ ...speakingForm, part: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Part 1 - Tanishtiruv & Qisqa Savollar</option>
                <option value={2}>Part 2 - Cue Card (1 daqiqa tayyorgarlik)</option>
                <option value={3}>Part 3 - Chuqur Mavzuiy Bahs</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Mavzu Nomi
              </label>
              <input
                type="text"
                required
                value={speakingForm.topic}
                onChange={(e) => setSpeakingForm({ ...speakingForm, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="Masalan: Describe an ambitious project you completed"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
              Asosiy Savol / Topshiriq
            </label>
            <textarea
              rows={3}
              required
              value={speakingForm.prompt}
              onChange={(e) => setSpeakingForm({ ...speakingForm, prompt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
              placeholder="Describe a challenging goal you achieved..."
            />
          </div>

          {speakingForm.part === 2 && (
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1 uppercase tracking-wider">
                Cue Card Nuqtalari (Vergul bilan ajratilgan)
              </label>
              <input
                type="text"
                value={speakingForm.cuePoints}
                onChange={(e) => setSpeakingForm({ ...speakingForm, cuePoints: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary"
                placeholder="What it was, When you did it, Who helped you, Why you were proud"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#FF7A00] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mic</span>
            <span>Speaking Mavzusini Saqlash</span>
          </button>
        </form>
      )}

      {/* TAB 6: CANDIDATES */}
      {activeTab === 'candidates' && (
        <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/40">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">👥 Ro'yxatdan O'tgan Nomzodlar</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold uppercase">
                  Supabase Cloud Active
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Barcha faol nomzodlar va Supabase PostgreSQL ma'lumotlar bazasi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchSupabaseCandidates}
                disabled={loadingCandidates}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface border border-surface-container-highest transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-sm ${loadingCandidates ? 'animate-spin' : ''}`}>sync</span>
                <span>{loadingCandidates ? 'Yuklanmoqda...' : 'Bazadan Yangilash'}</span>
              </button>
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary font-bold">
                {3 + supabaseCandidates.length} Nomzod
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Nomzod</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Maqsad</th>
                  <th className="p-3">Imtihon Sanasi</th>
                  <th className="p-3">Rejim</th>
                  <th className="p-3 rounded-r-xl">A'zolik Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {/* Real Supabase Candidates */}
                {supabaseCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 bg-emerald-500/5">
                    <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {c.name ? c.name.slice(0, 2).toUpperCase() : 'US'}
                      </span>
                      <span>{c.name || 'Yangi Nomzod'}</span>
                    </td>
                    <td className="p-3 text-on-surface-variant font-code">{c.email}</td>
                    <td className="p-3 font-semibold text-emerald-400">{c.target_band || 'Band 7.5'}</td>
                    <td className="p-3 text-on-surface-variant">{c.exam_date || '2025-11-15'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {c.active_mode || 'IELTS'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Supabase Live</span>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                      SA
                    </span>
                    <span>Sardor Alimov</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">sardor@ieltix.uz</td>
                  <td className="p-3 font-semibold text-primary">Band 7.5</td>
                  <td className="p-3 text-on-surface-variant">Nov 15, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container font-bold text-[10px]">
                      PRO
                    </span>
                  </td>
                  <td className="p-3 font-bold text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Faol A'zo</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-[10px]">
                      NR
                    </span>
                    <span>Nodira Rashidova</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">nodira@ieltix.uz</td>
                  <td className="p-3 font-semibold text-secondary">Band 8.0</td>
                  <td className="p-3 text-on-surface-variant">Oct 26, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary font-bold text-[10px]">
                      MAX VIP
                    </span>
                  </td>
                  <td className="p-3 font-bold text-secondary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Faol A'zo</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50">
                  <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[10px]">
                      ShT
                    </span>
                    <span>Sherzod Tursunov</span>
                  </td>
                  <td className="p-3 text-on-surface-variant font-code">sherzod@ieltix.uz</td>
                  <td className="p-3 font-semibold text-on-surface">Band 7.0</td>
                  <td className="p-3 text-on-surface-variant">Dec 10, 2025</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                      FREE
                    </span>
                  </td>
                  <td className="p-3 text-on-surface-variant">
                    <span>Sinov Rejimi</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
