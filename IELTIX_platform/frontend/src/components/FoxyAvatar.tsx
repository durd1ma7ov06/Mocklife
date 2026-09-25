import React from 'react';

interface FoxyAvatarProps {
  status: 'idle' | 'listening' | 'speaking' | 'evaluating';
  message?: string;
  isSpeakingAudio?: boolean;
}

export const FoxyAvatar: React.FC<FoxyAvatarProps> = ({
  status,
  message = "Hello! I am Foxy, your IELTS AI Examiner.",
  isSpeakingAudio = false,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-surface-container rounded-3xl border border-surface-container-high/50 shadow-2xl overflow-hidden">
      {/* Dynamic Ambient Glow Behind Foxy */}
      <div
        className={`absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          status === 'listening'
            ? 'bg-secondary/25'
            : status === 'speaking'
            ? 'bg-[#FF7A00]/30'
            : status === 'evaluating'
            ? 'bg-primary-container/30'
            : 'bg-[#FF7A00]/15'
        }`}
      />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Mascot Container & Pulse Ring */}
      <div className="relative z-10 flex items-center justify-center mb-4">
        {/* Animated concentric ripples when speaking/listening */}
        {(status === 'speaking' || status === 'listening') && (
          <>
            <span className="absolute w-44 h-44 rounded-full border border-[#FF7A00]/30 animate-ping" />
            <span className="absolute w-40 h-40 rounded-full border border-primary/20 animate-pulse" />
          </>
        )}

        <div className="relative w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-[#FF7A00] via-primary to-secondary shadow-[0_0_30px_rgba(255,122,0,0.4)]">
          <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-lowest flex items-center justify-center p-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdWCr9y92m0GyEeoq1EnQKx4SgaVSngNo_aR9jJCB4hLPtTUNlRHusMyFZPI64sYYoHm3KIDpJp0KBtEDcM7RFMtQcoumEZ5SaZDl0pvjSqaC8OJDkpVTmxCyB6KnWFDPc80AWnXWplSG4pC-jej6PIDbWNuS_trnnxWwYL6l9s2EeQcIfMmbydxzLe1VzOxqLvHJwOVZWNhdxDXHpeGWIML66GGiT-XyE2dkdHze2vzIid_PFRmiwvA"
              alt="3D Foxy Mascot"
              className={`w-full h-full object-contain transition-transform duration-300 ${
                status === 'speaking'
                  ? 'scale-105 animate-bounce'
                  : status === 'listening'
                  ? 'scale-105 ring-2 ring-secondary'
                  : 'hover:scale-105'
              }`}
            />
          </div>
        </div>

        {/* State Badge Pill */}
        <div className="absolute -bottom-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg flex items-center gap-1.5 border border-surface-container-highest bg-surface-container-lowest text-on-surface">
          {status === 'listening' && (
            <>
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="text-secondary font-bold">Listening to You...</span>
            </>
          )}
          {status === 'speaking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
              <span className="text-[#FF7A00] font-bold">Foxy is Speaking</span>
            </>
          )}
          {status === 'evaluating' && (
            <>
              <span className="w-2 h-2 rounded-full bg-primary animate-spin" />
              <span className="text-primary font-bold">Grading Response...</span>
            </>
          )}
          {status === 'idle' && (
            <>
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-on-surface-variant">AI Examiner Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Audio Reactive Soundwave Bars */}
      <div className="flex items-center gap-1.5 h-8 my-2">
        {[40, 75, 100, 60, 90, 45, 80, 50, 70, 95, 60, 30].map((height, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              isSpeakingAudio || status === 'listening' || status === 'speaking'
                ? 'bg-gradient-to-t from-[#FF7A00] to-secondary'
                : 'bg-surface-container-high'
            }`}
            style={{
              height:
                isSpeakingAudio || status === 'listening' || status === 'speaking'
                  ? `${Math.max(15, (height * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2)}%`
                  : '20%',
            }}
          />
        ))}
      </div>

      {/* Foxy Speech Dialogue Bubble */}
      <div className="relative mt-2 max-w-lg w-full bg-surface-container-low border border-surface-container-high/60 rounded-2xl p-4 shadow-md text-center">
        <div className="text-xs font-semibold text-[#FF7A00] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm">record_voice_over</span>
          Foxy Examiner
        </div>
        <p className="text-sm font-medium text-on-surface leading-relaxed">
          "{message}"
        </p>
      </div>
    </div>
  );
};
