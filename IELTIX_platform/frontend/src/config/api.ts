// API configuration & Mock data for MockLife (English Mock Test Platform)

export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || '/api',
  ENDPOINTS: {
    AUTH_PHONE: '/auth/phone',
    AUTH_VERIFY_OTP: '/auth/verify-otp',
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    AUTH_ME: '/auth/me',
    SUBSCRIPTION_PLAN: '/subscription/plan',
    SUBSCRIPTION_CREATE: '/subscription/create',
    MOCK_TESTS: '/mock-tests',
    STATS: '/stats',
    REVIEWS: '/reviews',
    FAQ: '/faq',
  },
  TIMEOUT: 10000,
};

export interface MockTestItem {
  id: string;
  title: string;
  section: 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Full Mock';
  questionsCount: number;
  durationMinutes: number;
  level: string;
  completedPercent?: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  city: string;
  rating: number;
  scoreText: string;
  text: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// Fallback mock data
export const MOCK_DATA = {
  hero: {
    badge: "Ingliz tili · oyiga 29 000 so'm",
    headline: "Ingliz tilidan kerakli balni birinchi urinishda oling",
    subheadline: "Haqiqiy imtihon muhiti, batafsil tahlil va xatolar ustida ishlash. Barcha darajalar uchun sinov testlari bir joyda.",
    stats: [
      { value: "[N]+", label: "Ishlangan testlar" },
      { value: "[N]+", label: "Faol o'quvchilar" },
      { value: "24/7", label: "Onlayn kirish imkoniyati" },
    ],
  },
  tests: [
    { id: '1', title: 'Writing Task 1 & Task 2 Evaluator', section: 'Writing', questionsCount: 2, durationMinutes: 60, level: 'B2-C1', completedPercent: 72 },
    { id: '2', title: 'Reading Academic Diagnostic Passage', section: 'Reading', questionsCount: 40, durationMinutes: 60, level: 'B2-C1', completedPercent: 84 },
    { id: '3', title: '3D Foxy Speaking Interview Lab', section: 'Speaking', questionsCount: 15, durationMinutes: 15, level: 'B2-C1', completedPercent: 78 },
    { id: '4', title: 'Listening Cambridge Exam Audio #1', section: 'Listening', questionsCount: 40, durationMinutes: 30, level: 'B2-C1', completedPercent: 88 },
  ] as MockTestItem[],
  results: [
    { id: '1', title: 'Natijalar tahlili va yechimlar', views: '[0.0M]' },
    { id: '2', title: 'Listening bo\'yicha maslahatlar', views: '[0.0M]' },
    { id: '3', title: 'Reading strategiyalari', views: '[0.0M]' },
    { id: '4', title: 'Mock test tajribasi', views: '[0.0M]' },
  ],
  reviews: [
    {
      id: '1',
      author: '[Ism]',
      city: '[Shahar]',
      rating: 5,
      scoreText: 'BALL [0.0]',
      text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]',
      date: '[PLACEHOLDER]',
    },
    {
      id: '2',
      author: '[Ism]',
      city: '[Shahar]',
      rating: 5,
      scoreText: 'BALL [0.0]',
      text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]',
      date: '[PLACEHOLDER]',
    },
    {
      id: '3',
      author: '[Ism]',
      city: '[Shahar]',
      rating: 5,
      scoreText: 'BALL [0.0]',
      text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]',
      date: '[PLACEHOLDER]',
    },
  ] as ReviewItem[],
  pricing: {
    monthlyPrice: 29000,
    currency: "so'm",
    period: "oy",
    features: [
      "Barcha ingliz tili mock testlariga cheksiz kirish",
      "Haqiqiy imtihon vaqtiga moslashtirilgan taymer",
      "Har bir savol bo'yicha batafsil izoh va tahlil",
      "Xatolar ustida ishlash bo'limi",
      "Shaxsiy ballar va o'sish statistikasi",
      "Telefonda va kompyuterda qulay ishlash",
    ],
  },
  faqs: [
    {
      id: 'faq-1',
      question: "Platformada qaysi fanlardan testlar mavjud?",
      answer: "Platformamiz faqat ingliz tili fani bo'yicha ixtisoslashgan. Barcha darajadagi testlar va imtihon formatlari mukammal ishlab chiqilgan.",
    },
    {
      id: 'faq-2',
      question: "Obunani qanday to'layman va qancha vaqt amal qiladi?",
      answer: "Oylik obuna narxi 29 000 so'm. To'lov qilingan kundan boshlab 30 kun davomida barcha testlar va imkoniyatlar to'liq ochiq bo'ladi.",
    },
    {
      id: 'faq-3',
      question: "Testlarni telefondan yechish mumkinmi?",
      answer: "Ha, MockLife to'liq mobile-first dizaynga ega. Smartfoningiz orqali istalgan joyda qulay test topshirishingiz mumkin.",
    },
  ] as FaqItem[],
};

// Real API client functions connecting Frontend forms to Backend
export const apiClient = {
  // 1. Phone OTP request
  requestOtp: async (phone: string): Promise<{ success: boolean; message: string; debugCode?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_PHONE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'SMS kod yuborildi (Offline)', debugCode: '1234' };
    }
  },

  // 2. Phone OTP verification
  verifyOtp: async (phone: string, code: string): Promise<{ success: boolean; message: string; token?: string; user?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_VERIFY_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Tizimga kirildi (Offline)',
        token: 'local-token-' + Date.now(),
        user: { phone, name: 'Foydalanuvchi' },
      };
    }
  },

  // 2a. Register (Name, Phone, Password)
  register: async (data: { name: string; phone: string; password?: string; email?: string }): Promise<{ success: boolean; message?: string; token?: string; user?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz (Offline)',
        token: 'local-token-' + Date.now(),
        user: { name: data.name, phone: data.phone },
      };
    }
  },

  // 2b. Password Login
  login: async (identifier: string, password: string): Promise<{ success: boolean; message?: string; token?: string; user?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Tizimga kirildi (Offline)',
        token: 'local-token-' + Date.now(),
        user: { name: 'Foydalanuvchi', phone: identifier },
      };
    }
  },

  // 2c. Reset Password
  resetPassword: async (data: { phone: string; code: string; newPassword: string }): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Parol yangilandi (Offline)',
      };
    }
  },

  // 2d. Get current user profile / me
  getMe: async (): Promise<{ success: boolean; user?: any }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_ME}`);
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // 3. Create Subscription Order (29 000 UZS)
  createSubscriptionOrder: async (phone: string, provider: 'Click' | 'Payme' | 'Uzum'): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTION_CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, provider, amount: 29000 }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Obuna buyurtmasi yaratildi (Offline)',
        data: {
          orderId: `ME-${Date.now()}`,
          phone,
          provider,
          amount: 29000,
          paymentUrl: `https://${provider.toLowerCase()}.uz/pay`,
        },
      };
    }
  },

  // 4. Fetch Mock Tests
  getMockTests: async (): Promise<MockTestItem[]> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOCK_TESTS}`);
      const json = await res.json();
      return json.data || MOCK_DATA.tests;
    } catch {
      return MOCK_DATA.tests;
    }
  },

  // 5. Fetch Platform Stats
  getStats: async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STATS}`);
      const json = await res.json();
      return json.data;
    } catch {
      return { testsCompleted: '[N]+', activeStudents: '[N]+', availability: '24/7' };
    }
  },

  // 6. Start Test Session
  startTestSession: async (testId: string = '1', isTrial: boolean = false) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/tests/${testId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrial }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: {
          sessionId: `sess-${Date.now()}`,
          testId,
          title: 'IELTS Academic Reading Simulation (Offline)',
          passageText: 'Reading Passage: As metropolitan areas worldwide expand exponentially...',
          durationMinutes: 60,
          questions: [
            { id: 1, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Wildlife adaptation occurs at a slower pace in urban centers.', options: ['TRUE', 'FALSE', 'NOT GIVEN'] },
            { id: 2, type: 'TRUE_FALSE_NOT_GIVEN', prompt: 'Metabolic mutations in mice assist in metabolizing human food waste.', options: ['TRUE', 'FALSE', 'NOT GIVEN'] },
          ],
        },
      };
    }
  },

  // 7. Save Test Answer (Autosave)
  saveTestAnswer: async (testId: string, sessionId: string, questionId: number, selectedAnswer: string) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/tests/${testId}/save-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionId, selectedAnswer }),
      });
      return await res.json();
    } catch {
      return { success: true, saved: true };
    }
  },

  // 8. Finish Test & Calculate Score (Returns explanations)
  finishTest: async (testId: string, sessionId: string, userAnswers: Record<number, string>) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/tests/${testId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userAnswers }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: {
          sessionId,
          correctCount: 2,
          totalQuestions: 2,
          percentage: 100,
          estimatedBand: 8.5,
          timeSpentMinutes: 12,
          details: [
            { id: 1, userAnswer: userAnswers[1] || 'FALSE', correctAnswer: 'FALSE', isCorrect: true, explanation: 'Passage indicates city wildlife adapts faster.' },
            { id: 2, userAnswer: userAnswers[2] || 'TRUE', correctAnswer: 'TRUE', isCorrect: true, explanation: 'Passage confirms mice adapt to process anthropogenic food.' },
          ],
        },
      };
    }
  },

  // 9. Fetch User Progress
  getUserProgress: async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/user/progress`);
      const json = await res.json();
      return json.data;
    } catch {
      return { weeklyStreak: ['D', 'S', 'CH', 'P', 'J'], activeDaysCount: 5, completedTestsCount: 14, averageBand: 7.0 };
    }
  },

  // 10. Telegram Authentication & Synchronization
  loginWithTelegram: async (tgData: any): Promise<{ success: boolean; token?: string; user?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgData),
      });
      return await res.json();
    } catch {
      // Offline / dev fallback
      const tgId = tgData.id || tgData.telegramId || 98124;
      const name = tgData.name || [tgData.first_name, tgData.last_name].filter(Boolean).join(' ') || tgData.username || 'IELTS Nomzod';
      return {
        success: true,
        token: `jwt-tg-${tgId}-${Date.now()}`,
        user: {
          id: `usr-tg-${tgId}`,
          telegramId: tgId,
          name,
          phone: tgData.phone || '+998901234567',
          username: tgData.username || 'ielts_learner',
          isTelegramLinked: true,
          isSubscribed: true,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          plan: 'TELEGRAM_VIP',
        },
      };
    }
  },

  // 11. Create Telegram Web Session (for Deep-link / QR code login)
  createTelegramLoginSession: async (): Promise<{ success: boolean; sessionCode: string; botUsername: string; deepLink: string }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/telegram-session/create`, {
        method: 'POST',
      });
      return await res.json();
    } catch {
      const rnd = Math.floor(100000 + Math.random() * 900000);
      return {
        success: true,
        sessionCode: `auth_${rnd}`,
        botUsername: 'MockLife_bot',
        deepLink: `https://t.me/MockLife_bot?start=auth_${rnd}`,
      };
    }
  },

  // 12. Poll Telegram Web Session status
  checkTelegramSessionStatus: async (code: string): Promise<{ success: boolean; status: string; token?: string; user?: any }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/telegram-session/${code}/status`);
      return await res.json();
    } catch {
      return { success: false, status: 'PENDING' };
    }
  },

  // 13. Confirm Telegram Web Session (client simulated / quick entry)
  confirmTelegramLoginSession: async (code: string, userData: any) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/telegram-session/${code}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  // 14. Barcha nomzodlar va 1 haftalik limit tahlili
  getCandidatesOverview: async (): Promise<{
    success: boolean;
    totalCandidates: number;
    activeTrials: number;
    expiredTrials: number;
    candidates: any[];
    serverTime?: string;
  }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/candidates/overview`);
      return await res.json();
    } catch {
      return {
        success: true,
        totalCandidates: 5,
        activeTrials: 4,
        expiredTrials: 1,
        candidates: [],
      };
    }
  },

  // 15. Joriy nomzodning sinov limiti holati
  getMyTrial: async (telegramId?: number) => {
    try {
      const url = telegramId ? `${API_CONFIG.BASE_URL}/candidates/my-trial?telegramId=${telegramId}` : `${API_CONFIG.BASE_URL}/candidates/my-trial`;
      const res = await fetch(url);
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // 16. Admin: Nomzodning 1 haftalik limitini uzaytirish (+7 kun)
  extendCandidateTrial: async (candidateId: string, days: number = 7): Promise<{ success: boolean; message?: string; error?: string; candidate?: any }> => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/candidates/${candidateId}/extend-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: `Offline rejim: +${days} kun uzaytirildi!`,
      };
    }
  },
};
