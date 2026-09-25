import React, { useState } from 'react';
import { useUser } from '../context/UserContext.js';
import { useExam } from '../context/ExamContext.js';
import { PageTab } from './Sidebar.js';

interface ProfileModalProps {
  onNavigate?: (tab: PageTab) => void;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Nodira' },
  { id: '2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', label: 'Sardor' },
  { id: '3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Sherzod' },
  { id: '4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Kamola' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ onNavigate }) => {
  const {
    user,
    profileModalOpen,
    setProfileModalOpen,
    updateProfile,
    logout,
  } = useUser();

  const { mode, setMode } = useExam();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editTargetBand, setEditTargetBand] = useState(user.targetBand);
  const [editExamDate, setEditExamDate] = useState(user.examDate);
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profileModalOpen) return null;

  const handleSaveProfile = async () => {
    // Calculate days left
    let calculatedDays = user.daysLeft;
    try {
      const parsedDate = new Date(editExamDate);
      if (!isNaN(parsedDate.getTime())) {
        const diff = Math.ceil((parsedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        calculatedDays = Math.max(1, diff);
      }
    } catch {}

    await updateProfile({
      name: editName.trim() || user.name,
      targetBand: editTargetBand,
      examDate: editExamDate,
      daysLeft: calculatedDays,
      avatarUrl: editAvatarUrl,
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col relative max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-6 pb-4 bg-surface-container-low border-b border-surface-container-high/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
            <div>
              <h2 className="text-lg font-black text-on-surface">Nomzod Profili</h2>
              <p className="text-[11px] text-on-surface-variant">
                Shaxsiy ma'lumotlar, maqsadli ball va faol a'zolik holati
              </p>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-all"
            title="Yopish"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Feedback */}
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-secondary-container/40 border border-secondary/40 text-secondary text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Profilingiz muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* 1. Candidate Identity Card */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={isEditing ? editAvatarUrl : user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40 shadow-md"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute inset-0 bg-black/60 rounded-full text-white text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span>Tanlash</span>
                  </button>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
              </div>

              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-base font-bold text-on-surface bg-surface-container px-3 py-1.5 rounded-xl border border-primary focus:outline-none"
                    placeholder="Ismingizni kiriting"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-on-surface">{user.name}</h3>
                    <span className="material-symbols-outlined text-base text-secondary" title="Tasdiqlangan nomzod">
                      verified
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-on-surface-variant">{user.role}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-code bg-surface-container-high text-on-surface-variant font-bold">
                    ID: {user.id}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                  setEditName(user.name);
                  setEditTargetBand(user.targetBand);
                  setEditExamDate(user.examDate);
                  setEditAvatarUrl(user.avatarUrl);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-secondary text-on-secondary hover:opacity-90'
                  : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isEditing ? 'done' : 'edit'}
              </span>
              <span>{isEditing ? 'Saqlash' : 'Tahrirlash'}</span>
            </button>
          </div>

          {/* Avatar Preset Picker (If opened) */}
          {showAvatarPicker && (
            <div className="p-4 rounded-2xl bg-surface-container border border-primary/30 space-y-2 animate-fadeIn">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Avatar Tanlang:
              </span>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setEditAvatarUrl(av.url);
                      setShowAvatarPicker(false);
                    }}
                    className={`p-2 rounded-2xl bg-surface-container-lowest border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      editAvatarUrl === av.url ? 'border-primary ring-2 ring-primary/40' : 'border-surface-container-high hover:border-primary/50'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-[10px] font-bold text-on-surface">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Exam Target & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Target Band */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                <span className="material-symbols-outlined text-base">military_tech</span>
                <span>Maqsadli Ball</span>
              </div>
              {isEditing ? (
                <select
                  value={editTargetBand}
                  onChange={(e) => setEditTargetBand(e.target.value)}
                  className="w-full text-xs font-bold text-on-surface bg-surface-container px-2 py-1.5 rounded-xl border border-primary"
                >
                  <option value="6.5 Academic">Band 6.5</option>
                  <option value="7.0 Academic">Band 7.0</option>
                  <option value="7.5 Academic">Band 7.5</option>
                  <option value="8.0 Academic">Band 8.0</option>
                  <option value="8.5 Academic">Band 8.5</option>
                </select>
              ) : (
                <strong className="text-base text-on-surface block font-black">{user.targetBand}</strong>
              )}
              <span className="text-[10px] text-on-surface-variant block">Maqsad qilingan natija</span>
            </div>

            {/* Exam Date */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-secondary font-bold">
                <span className="material-symbols-outlined text-base">event</span>
                <span>Imtihon Sanasi</span>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="w-full text-xs font-bold text-on-surface bg-surface-container px-2 py-1 rounded-xl border border-secondary"
                />
              ) : (
                <strong className="text-base text-on-surface block font-black">{user.examDate}</strong>
              )}
              <span className="text-[10px] text-secondary font-bold block">
                {user.daysLeft} kun qoldi
              </span>
            </div>

            {/* Active Mode */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-bold">
                <span className="material-symbols-outlined text-base text-[#FF7A00]">school</span>
                <span>Tanlangan Format</span>
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setMode('IELTS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mode === 'IELTS'
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  IELTS
                </button>
                <button
                  type="button"
                  onClick={() => setMode('MILLIY_BBM')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mode === 'MILLIY_BBM'
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Milliy BBM
                </button>
              </div>
              <span className="text-[10px] text-on-surface-variant block">Standart formati</span>
            </div>

          </div>

          {/* 3. VIP A'zolik & Ta'rif Holati (Toza, ortiqcha hamyonsiz) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border border-primary/30 space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">diamond</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Faol Ta'rif:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary text-white text-[10px] font-black uppercase">
                      {user.vipTier.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-on-surface mt-0.5">
                    {user.vipTier === 'MAX_VIP' ? 'MAX Plan (VIP Mastery)' : user.vipTier === 'PRO' ? 'VIP Candidate Pro' : 'Free Diagnostic'}
                  </h4>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    onNavigate('pricing');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Tariflarni Ko'rish</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Imkoniyatlar ro'yxati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-surface-container-high/50 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Barcha Cambridge 19 test paketlari ochiq</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>3D Foxy AI Speaking jonli suhbat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>AI Writing Evaluator (Task 1 & 2)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Rasmiy TRF & Kriptografik QR Sertifikat</span>
              </div>
            </div>
          </div>

          {/* 4. Diagnostic Stats Breakdown */}
          <div className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                Ko'nikmalar Diagnostikasi (Skill Breakdown)
              </span>
              <span className="text-[11px] text-on-surface-variant">
                O'rtacha: <strong className="text-primary">{user.stats.overallBand} Band</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Listening', band: user.stats.listeningBand, icon: 'headphones', color: 'text-tertiary' },
                { label: 'Reading', band: user.stats.readingBand, icon: 'menu_book', color: 'text-secondary' },
                { label: 'Writing', band: user.stats.writingBand, icon: 'edit_note', color: 'text-primary' },
                { label: 'Speaking', band: user.stats.speakingBand, icon: 'smart_toy', color: 'text-[#FF7A00]' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl bg-surface-container border border-surface-container-high/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`material-symbols-outlined text-base ${s.color}`}>{s.icon}</span>
                    <span className="text-[11px] font-semibold text-on-surface">{s.label}</span>
                  </div>
                  <span className="text-xl font-black text-on-surface block">{s.band}</span>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(s.band / 9) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Account Actions (Chiqish) */}
          <div className="pt-2 flex items-center justify-between border-t border-surface-container-high/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-on-surface-variant">
                Tizim: <strong className="text-on-surface">IELTIX 2026</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Hisobdan Chiqish</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
