import React, { createContext, useContext, useState } from 'react';
import { ExamMode } from '../types/index.js';

interface ExamContextType {
  mode: ExamMode;
  setMode: (mode: ExamMode) => void;
  toggleMode: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ExamMode>(() => {
    const saved = localStorage.getItem('ieltix_exam_mode') as ExamMode;
    return saved === 'MILLIY_BBM' ? 'MILLIY_BBM' : 'IELTS';
  });

  const handleSetMode = (newMode: ExamMode) => {
    setMode(newMode);
    localStorage.setItem('ieltix_exam_mode', newMode);
  };

  const toggleMode = () => {
    const next = mode === 'IELTS' ? 'MILLIY_BBM' : 'IELTS';
    handleSetMode(next);
  };

  return (
    <ExamContext.Provider value={{ mode, setMode: handleSetMode, toggleMode }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam must be used within ExamProvider');
  return ctx;
};
