import {
  UserProfile,
  VocabItem,
  SpeakingQuestion,
  SpeakingEvaluationResult,
  WritingEvaluationResult,
  ReadingTest,
  ExamReport,
  ExamMode,
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  async getUserProfile(): Promise<{ success: boolean; data: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/profile`);
    return res.json();
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; data: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async login(email: string, password?: string): Promise<{ success: boolean; data: UserProfile; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data: any): Promise<{ success: boolean; data: UserProfile; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async setExamMode(mode: ExamMode): Promise<{ success: boolean; data: UserProfile }> {
    const res = await fetch(`${API_BASE}/user/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  async getSpeakingQuestions(): Promise<{ success: boolean; data: SpeakingQuestion[] }> {
    const res = await fetch(`${API_BASE}/speaking/questions`);
    return res.json();
  },

  async evaluateSpeaking(transcript: string, part = 1): Promise<{ success: boolean; data: SpeakingEvaluationResult }> {
    const res = await fetch(`${API_BASE}/speaking/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, part }),
    });
    return res.json();
  },

  async evaluateWriting(submission: {
    taskType: 'TASK_1' | 'TASK_2';
    promptTitle: string;
    essayText: string;
    timeSpentMinutes: number;
  }): Promise<{ success: boolean; data: WritingEvaluationResult }> {
    const res = await fetch(`${API_BASE}/writing/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    return res.json();
  },

  async getReadingTest(): Promise<{ success: boolean; data: ReadingTest }> {
    const res = await fetch(`${API_BASE}/reading/test`);
    return res.json();
  },

  async submitReading(userAnswers: Record<number, string>): Promise<{
    success: boolean;
    data: {
      totalQuestions: number;
      correctCount: number;
      percentage: number;
      estimatedBand: number;
      details: Array<{ id: number; userAnswer: string; correctAnswer: string; isCorrect: boolean; explanation: string }>;
    };
  }> {
    const res = await fetch(`${API_BASE}/reading/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswers }),
    });
    return res.json();
  },

  async getVocabVault(): Promise<{ success: boolean; data: VocabItem[] }> {
    const res = await fetch(`${API_BASE}/vocab`);
    return res.json();
  },

  async saveVocabWord(item: Partial<VocabItem>): Promise<{ success: boolean; data: VocabItem }> {
    const res = await fetch(`${API_BASE}/vocab/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  async lookupWord(word: string): Promise<{ success: boolean; data: Partial<VocabItem> }> {
    const res = await fetch(`${API_BASE}/vocab/lookup/${encodeURIComponent(word)}`);
    return res.json();
  },

  async getScoreReport(id = 'latest'): Promise<{ success: boolean; data: ExamReport }> {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    return res.json();
  },

  async checkoutVip(planName: string, priceUZS: number, provider = 'Click'): Promise<any> {
    const res = await fetch(`${API_BASE}/checkout/vip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, priceUZS, provider }),
    });
    return res.json();
  },

  async chatLiveAiExaminer(params: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    topic?: string;
    part?: number;
    customApiUrl?: string;
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
  }): Promise<{
    success: boolean;
    data: {
      reply: string;
      estimatedBand: number;
      instantCorrection?: string;
      followUpQuestion?: string;
      rubricScores: {
        fluency: number;
        lexical: number;
        grammar: number;
        pronunciation: number;
      };
    };
  }> {
    const res = await fetch(`${API_BASE}/speaking/live-ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getAdminConfig(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/admin/config`);
    return res.json();
  },

  async updateAdminConfig(config: any): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async testAdminConfig(payload: {
    url?: string;
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
  }): Promise<{ success: boolean; message: string; latencyMs?: number; sampleResponse?: string }> {
    const res = await fetch(`${API_BASE}/admin/config/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getAdminContent(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/admin/content/all`);
    return res.json();
  },

  async deleteAdminContent(category: string, id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/admin/content/${category}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
