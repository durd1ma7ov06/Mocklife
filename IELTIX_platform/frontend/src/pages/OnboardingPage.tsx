import React from 'react';
import { PageTab } from '../components/Sidebar.js';
import { QuizPage } from './QuizPage.js';

interface OnboardingPageProps {
  onNavigate: (tab: PageTab) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  return <QuizPage onNavigate={onNavigate} />;
};
