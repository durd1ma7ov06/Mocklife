import { Router, Request, Response, NextFunction } from 'express';
import { initialUserProfile, sampleReadingTest, sampleReport } from '../data/mockData.js';
import { aiExaminerService } from '../services/aiExaminerService.js';
import { writingEvaluatorService } from '../services/writingEvaluatorService.js';
import { vocabService } from '../services/vocabService.js';
import { onboardingService } from '../services/onboardingService.js';
import { ExamMode, WritingSubmission } from '../types/index.js';

const router = Router();

// Current User State & Subscription Tracking
let currentUser = {
  id: 'usr-901234567',
  name: 'Foydalanuvchi',
  phone: '+998901234567',
  isSubscribed: true, // Default active for seamless first run, toggleable via API
  subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  plan: 'MONTHLY_29000',
  activeExamMode: 'ENGLISH' as ExamMode | string,
  stats: {
    testsCompleted: 14,
    overallBand: 7.0,
    studyStreakDays: 5,
  },
};

// Registered Users registry for bot & admin lookups
const registeredUsers = new Map<string, typeof currentUser>();
registeredUsers.set(currentUser.phone, currentUser);

// Telegram Web Login Sessions (deep-link / QR code / WebApp auth)
interface TelegramAuthSession {
  code: string;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  createdAt: number;
  user?: any;
  token?: string;
}
const telegramAuthSessions = new Map<string, TelegramAuthSession>();

// ==========================================
// Nomzodlar va 1 Haftalik Limit Tahlili Tizimi
// (Qancha foydalanuvchi, kimlar, qachon kirgan, 1 haftalik limiti qachon tugaydi)
// ==========================================
export interface CandidateRecord {
  id: string;
  name: string;
  telegramId?: number;
  username?: string;
  phone: string;
  photoUrl?: string;
  isTelegramLinked: boolean;
  joinedAt: string;          // Qachon kirgan
  lastLoginAt: string;       // Oxirgi kirgan vaqti
  trialExpiresAt: string;    // 1 haftalik limiti qachon tugaydi
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  isTrialActive: boolean;
  targetBand?: string;
  currentBand?: number;
  plan: string;
}

const nowMs = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

export const initialCandidatesList: CandidateRecord[] = [
  {
    id: 'usr-tg-6956456422',
    name: 'Diyorbek Olimov (Admin)',
    telegramId: 6956456422,
    username: 'diyor_admin',
    phone: '+998901234567',
    isTelegramLinked: true,
    joinedAt: new Date(nowMs - 1.2 * dayMs).toISOString(),
    lastLoginAt: new Date(nowMs - 15 * 60 * 1000).toISOString(),
    trialExpiresAt: new Date(nowMs + (7 - 1.2) * dayMs).toISOString(),
    trialDaysRemaining: 6,
    trialHoursRemaining: 139,
    isTrialActive: true,
    targetBand: '8.0 Academic',
    currentBand: 7.0,
    plan: '7_KUNLIK_BEPUL_SINOV',
  },
  {
    id: 'usr-tg-589123412',
    name: 'Madina Karimova',
    telegramId: 589123412,
    username: 'madina_ielts',
    phone: '+998935551234',
    isTelegramLinked: true,
    joinedAt: new Date(nowMs - 0.5 * dayMs).toISOString(),
    lastLoginAt: new Date(nowMs - 2 * 60 * 60 * 1000).toISOString(),
    trialExpiresAt: new Date(nowMs + (7 - 0.5) * dayMs).toISOString(),
    trialDaysRemaining: 7,
    trialHoursRemaining: 156,
    isTrialActive: true,
    targetBand: '7.5 Academic',
    currentBand: 6.5,
    plan: '7_KUNLIK_BEPUL_SINOV',
  },
  {
    id: 'usr-tg-712894123',
    name: 'Javohir Rustamov',
    telegramId: 712894123,
    username: 'javohir_r',
    phone: '+998971112233',
    isTelegramLinked: true,
    joinedAt: new Date(nowMs - 3.8 * dayMs).toISOString(),
    lastLoginAt: new Date(nowMs - 6 * 60 * 60 * 1000).toISOString(),
    trialExpiresAt: new Date(nowMs + (7 - 3.8) * dayMs).toISOString(),
    trialDaysRemaining: 4,
    trialHoursRemaining: 77,
    isTrialActive: true,
    targetBand: '7.0 Academic',
    currentBand: 6.0,
    plan: '7_KUNLIK_BEPUL_SINOV',
  },
  {
    id: 'usr-tg-441298711',
    name: 'Iroda Saidova',
    telegramId: 441298711,
    username: 'iroda_ielts9',
    phone: '+998994445566',
    isTelegramLinked: true,
    joinedAt: new Date(nowMs - 5.5 * dayMs).toISOString(),
    lastLoginAt: new Date(nowMs - 14 * 60 * 60 * 1000).toISOString(),
    trialExpiresAt: new Date(nowMs + (7 - 5.5) * dayMs).toISOString(),
    trialDaysRemaining: 2,
    trialHoursRemaining: 36,
    isTrialActive: true,
    targetBand: '7.5 General',
    currentBand: 6.5,
    plan: '7_KUNLIK_BEPUL_SINOV',
  },
  {
    id: 'usr-tg-319876221',
    name: 'Shahzod Bekmurodov',
    telegramId: 319876221,
    username: 'shahzod_bek',
    phone: '+998917778899',
    isTelegramLinked: true,
    joinedAt: new Date(nowMs - 8.5 * dayMs).toISOString(),
    lastLoginAt: new Date(nowMs - 28 * 60 * 60 * 1000).toISOString(),
    trialExpiresAt: new Date(nowMs - 1.5 * dayMs).toISOString(),
    trialDaysRemaining: 0,
    trialHoursRemaining: 0,
    isTrialActive: false,
    targetBand: '8.5 Academic',
    currentBand: 7.5,
    plan: 'SINOV_TUGAGAN',
  },
];

const candidatesStore = new Map<string, CandidateRecord>();
initialCandidatesList.forEach(c => candidatesStore.set(c.id, c));

function computeCandidateTrial(c: CandidateRecord): CandidateRecord {
  const expMs = new Date(c.trialExpiresAt).getTime();
  const diffMs = expMs - Date.now();
  c.trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  c.trialHoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
  c.isTrialActive = diffMs > 0;
  return c;
}

// Check if subscription is active (includes 7-day free trial)
const isSubscriptionActive = (user: typeof currentUser): boolean => {
  if (!user.subscriptionExpiresAt) {
    user.subscriptionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    user.isSubscribed = true;
  }
  return new Date(user.subscriptionExpiresAt).getTime() > Date.now();
};

// Admin Bot Security Middleware
const verifyAdminBot = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-telegram-bot-secret'] || (req.headers['authorization'] || '').replace('Bearer ', '');
  const expectedSecret = process.env.ADMIN_BOT_SECRET || 'mocklife_telegram_admin_bot_secret_998';
  if (!secret || secret !== expectedSecret) {
    return res.status(403).json({
      success: false,
      error: 'Ruxsat etilmagan admin bot so\'rovi (Admin Bot Secret xato yoki kiritilmagan)',
      code: 'UNAUTHORIZED_BOT_ACCESS',
    });
  }
  next();
};

// ==========================================
// 0. Onboarding & Shaxsiy O'quv Rejasi (ielts.gg uslubida 14 ta diagnostik savol)
// ==========================================

// 1. Diagnostik savollar natijasini qabul qilish va tahlil qilish
router.post('/onboarding/submit', async (req: Request, res: Response) => {
  try {
    const { answers, sessionId } = req.body;
    if (!answers) {
      return res.status(400).json({ success: false, error: 'Diagnostik javoblar kiritilmadi' });
    }
    const result = await onboardingService.submitOnboarding(answers, sessionId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Onboarding submit error:', err);
    res.status(500).json({ success: false, error: err.message || 'Xatolik yuz berdi' });
  }
});

// 2. Aylanuvchi chegirma barabani (Spin & Win)
router.post('/onboarding/spin', async (req: Request, res: Response) => {
  try {
    const { sessionId, discount } = req.body;
    const result = await onboardingService.applyWheelDiscount(sessionId, discount || 40);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Onboarding spin error:', err);
    res.status(500).json({ success: false, error: err.message || 'Xatolik yuz berdi' });
  }
});

// 3. Yakuniy ro'yxatdan o'tish (Email/Telefon) va PostgreSQL ga saqlash
router.post('/onboarding/register', async (req: Request, res: Response) => {
  try {
    const { sessionId, fullName, email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, error: 'Email yoki telefon raqam kiritilishi shart' });
    }
    const result = await onboardingService.completeRegistration({
      sessionId,
      fullName: fullName || 'IELTS Aspirant',
      email: email || '',
      phone: phone || '',
      password: password || '',
    });
    
    // Also sync with active session user
    currentUser = {
      id: result.user.id,
      name: result.user.fullName,
      phone: result.user.phone || currentUser.phone,
      isSubscribed: true,
      subscriptionExpiresAt: result.user.subscriptionExpiresAt,
      plan: 'TRIAL_7_DAYS',
      activeExamMode: 'ENGLISH',
      stats: {
        testsCompleted: 0,
        overallBand: result.diagnostic.overall,
        studyStreakDays: 1,
      },
    };
    registeredUsers.set(currentUser.phone, currentUser);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Onboarding register error:', err);
    res.status(500).json({ success: false, error: err.message || 'Xatolik yuz berdi' });
  }
});

// 4. Foydalanuvchining shaxsiy o'quv rejasini olish
router.get('/user/study-plan', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || currentUser.id;
    const plan = await onboardingService.getStudyPlan(userId);
    res.json({
      success: true,
      data: plan,
    });
  } catch (err: any) {
    console.error('Get study plan error:', err);
    res.status(500).json({ success: false, error: err.message || 'Xatolik yuz berdi' });
  }
});

// ==========================================
// 1. Foydalanuvchi & Autentifikatsiya (SMS OTP & Parol)
// ==========================================

router.post('/auth/phone', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string' || phone.trim().length < 9) {
    return res.status(400).json({ success: false, error: 'Telefon raqam noto\'g\'ri kiritildi' });
  }

  const cleanPhone = phone.trim();
  res.json({
    success: true,
    message: 'Tasdiqlash kodi telefoningizga SMS orqali yuborildi',
    phone: cleanPhone,
    debugCode: '1234',
  });
});

router.post('/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!code || (code !== '1234' && code.length !== 4)) {
    return res.status(400).json({ success: false, error: 'Tasdiqlash kodi noto\'g\'ri' });
  }

  const cleanPhone = (phone || currentUser.phone).trim();
  let user = registeredUsers.get(cleanPhone);
  if (!user) {
    user = {
      id: `usr-${cleanPhone.replace(/\D/g, '').slice(-9)}`,
      name: `Foydalanuvchi (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'MONTHLY_29000',
      activeExamMode: 'ENGLISH',
      stats: {
        testsCompleted: 0,
        overallBand: 6.5,
        studyStreakDays: 1,
      },
    };
    registeredUsers.set(cleanPhone, user);
  }
  currentUser = user;

  res.json({
    success: true,
    message: 'Tizimga muvaffaqiyatli kirildi',
    token: `jwt-mocklife-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      isSubscribed: isSubscriptionActive(user),
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      plan: user.plan,
    },
  });
});

// Ro'yxatdan o'tish (Register)
router.post('/auth/register', (req: Request, res: Response) => {
  const { name, phone, password, email } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 9) {
    return res.status(400).json({ success: false, error: 'Telefon raqam noto\'g\'ri kiritildi' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
  }

  const cleanPhone = phone.trim();
  const existing = registeredUsers.get(cleanPhone);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan' });
  }

  const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const newUser = {
    id: `usr-${cleanPhone.replace(/\D/g, '').slice(-9)}`,
    name: name.trim(),
    phone: cleanPhone,
    isSubscribed: true,
    subscriptionExpiresAt: trialExpires,
    plan: 'FREE_TRIAL_7_DAYS',
    activeExamMode: 'ENGLISH',
    stats: {
      testsCompleted: 0,
      overallBand: 0,
      studyStreakDays: 1,
    },
  };
  registeredUsers.set(cleanPhone, newUser);
  currentUser = newUser;

  res.status(201).json({
    success: true,
    message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! 7 kunlik bepul to\'liq kirish faollashtirildi.',
    token: `jwt-mocklife-${Date.now()}`,
    user: {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      isSubscribed: true,
      subscriptionExpiresAt: trialExpires,
      plan: newUser.plan,
    },
  });
});

// Parol orqali kirish (Login)
router.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, phone, password } = req.body;
  const loginPhone = (identifier || phone || '').trim();

  if (!loginPhone) {
    return res.status(400).json({ success: false, error: 'Telefon raqam yoki email kiritilishi shart' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
  }

  let user = registeredUsers.get(loginPhone);
  if (!user) {
    // If not in memory store, create on the fly for smooth dev/demo
    user = {
      id: `usr-${loginPhone.replace(/\D/g, '').slice(-9) || '901234567'}`,
      name: `Foydalanuvchi (${loginPhone.slice(-4) || 'Mock'})`,
      phone: loginPhone,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'MONTHLY_29000',
      activeExamMode: 'ENGLISH',
      stats: {
        testsCompleted: 1,
        overallBand: 6.5,
        studyStreakDays: 1,
      },
    };
    registeredUsers.set(loginPhone, user);
  }
  currentUser = user;

  res.json({
    success: true,
    message: 'Tizimga muvaffaqiyatli kirildi',
    token: `jwt-mocklife-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      isSubscribed: isSubscriptionActive(user),
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      plan: user.plan,
    },
  });
});

// Parolni tiklash (Reset Password)
router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { phone, code, newPassword } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ success: false, error: 'Telefon raqam kiritilmadi' });
  }
  if (!code || (code !== '1234' && code.length !== 4)) {
    return res.status(400).json({ success: false, error: 'Tasdiqlash kodi noto\'g\'ri' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lsin' });
  }

  res.json({
    success: true,
    message: 'Parol muvaffaqiyatli yangilandi. Endi yangi parol bilan kirishingiz mumkin.',
  });
});

// Joriy foydalanuvchi tekshiruvi (Auth check)
router.get('/auth/me', (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      id: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      isSubscribed: isSubscriptionActive(currentUser),
      subscriptionExpiresAt: currentUser.subscriptionExpiresAt,
      plan: currentUser.plan,
    },
  });
});

// ==========================================
// 1b. Telegram Autentifikatsiyasi & Sessiya Sinxronizatsiyasi
// ==========================================

// Telegram WebApp yoki Widget orqali to'g'ridan-to'g'ri kirish
router.post('/auth/telegram', (req: Request, res: Response) => {
  try {
    const { id, telegramId, first_name, last_name, name, username, photo_url, phone } = req.body;
    const tgId = Number(id || telegramId);
    if (!tgId) {
      return res.status(400).json({ success: false, error: 'Telegram ID kiritilmadi' });
    }

    const fullName = name || [first_name, last_name].filter(Boolean).join(' ') || username || `Nomzod #${tgId}`;
    const userPhone = phone || `tg_${tgId}`;

    // Foydalanuvchini izlash yoki yangi yaratish
    let user: typeof currentUser | undefined = registeredUsers.get(userPhone) || Array.from(registeredUsers.values()).find(u => (u as any).telegramId === tgId);
    if (!user) {
      const vipExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const newUser = {
        id: `usr-tg-${tgId}`,
        name: fullName,
        phone: userPhone,
        isSubscribed: true,
        subscriptionExpiresAt: vipExpires,
        plan: 'TELEGRAM_VIP',
        activeExamMode: 'ENGLISH' as ExamMode | string,
        stats: {
          testsCompleted: 0,
          overallBand: 6.5,
          studyStreakDays: 1,
        },
      };
      (newUser as any).telegramId = tgId;
      (newUser as any).username = username;
      (newUser as any).photoUrl = photo_url;
      (newUser as any).isTelegramLinked = true;
      registeredUsers.set(userPhone, newUser);
      user = newUser;
    } else {
      user.name = fullName;
      (user as any).telegramId = tgId;
      if (username) (user as any).username = username;
      (user as any).isTelegramLinked = true;
      if (photo_url) (user as any).photoUrl = photo_url;
      user.isSubscribed = true;
    }
    currentUser = user;

    const candidateId = `usr-tg-${tgId}`;
    let cand = candidatesStore.get(candidateId);
    const joined = cand ? cand.joinedAt : new Date().toISOString();
    const trialExp = cand ? cand.trialExpiresAt : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    cand = {
      id: candidateId,
      name: fullName,
      telegramId: tgId,
      username,
      phone: userPhone,
      photoUrl: photo_url,
      isTelegramLinked: true,
      joinedAt: joined,
      lastLoginAt: new Date().toISOString(),
      trialExpiresAt: trialExp,
      trialDaysRemaining: 7,
      trialHoursRemaining: 168,
      isTrialActive: true,
      targetBand: '7.5 Academic',
      currentBand: 6.5,
      plan: '7_KUNLIK_BEPUL_SINOV',
    };
    computeCandidateTrial(cand);
    candidatesStore.set(candidateId, cand);

    const token = `jwt-tg-${tgId}-${Date.now()}`;
    res.json({
      success: true,
      message: 'Telegram orqali muvaffaqiyatli kirildi',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        telegramId: tgId,
        username,
        isTelegramLinked: true,
        isSubscribed: isSubscriptionActive(user),
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        plan: user.plan,
        joinedAt: cand.joinedAt,
        lastLoginAt: cand.lastLoginAt,
        trialExpiresAt: cand.trialExpiresAt,
        trialDaysRemaining: cand.trialDaysRemaining,
        trialHoursRemaining: cand.trialHoursRemaining,
        isTrialActive: cand.isTrialActive,
      },
    });
  } catch (err: any) {
    console.error('Telegram auth error:', err);
    res.status(500).json({ success: false, error: err.message || 'Telegram kirish xatosi' });
  }
});

// Veb brauzer uchun bir martalik Telegram kirish sessiyasini yaratish (Deep link)
router.post('/auth/telegram-session/create', (_req: Request, res: Response) => {
  try {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const sessionCode = `auth_${randomSuffix}`;
    const botUsername = process.env.BOT_USERNAME || 'MockLife_bot';

    telegramAuthSessions.set(sessionCode, {
      code: sessionCode,
      status: 'PENDING',
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      sessionCode,
      botUsername,
      deepLink: `https://t.me/${botUsername}?start=${sessionCode}`,
    });
  } catch (err: any) {
    console.error('Telegram session create error:', err);
    res.status(500).json({ success: false, error: 'Sessiya yaratilmadi' });
  }
});

// Telegram bot tomonidan sessiyani tasdiqlash
router.post('/auth/telegram-session/:code/confirm', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const { telegramId, name, username, phone } = req.body;
    const session = telegramAuthSessions.get(code);

    const tgId = Number(telegramId);
    const fullName = name || username || `Nomzod #${tgId || 'Mock'}`;
    const userPhone = phone || `tg_${tgId || Date.now()}`;

    let user: typeof currentUser | undefined = registeredUsers.get(userPhone) || (tgId ? Array.from(registeredUsers.values()).find(u => (u as any).telegramId === tgId) : undefined);
    if (!user) {
      const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const newUser = {
        id: `usr-tg-${tgId || Date.now()}`,
        name: fullName,
        phone: userPhone,
        isSubscribed: true,
        subscriptionExpiresAt: trialExpires,
        plan: '7_KUNLIK_BEPUL_SINOV',
        activeExamMode: 'ENGLISH' as ExamMode | string,
        stats: {
          testsCompleted: 0,
          overallBand: 6.5,
          studyStreakDays: 1,
        },
      };
      (newUser as any).telegramId = tgId;
      (newUser as any).username = username;
      (newUser as any).isTelegramLinked = true;
      registeredUsers.set(userPhone, newUser);
      user = newUser;
    } else {
      user.name = fullName;
      if (tgId) (user as any).telegramId = tgId;
      if (username) (user as any).username = username;
      (user as any).isTelegramLinked = true;
      user.isSubscribed = true;
    }
    currentUser = user;

    // Save into candidatesStore with real trial limit tracking
    const candidateId = `usr-tg-${tgId || Date.now()}`;
    let cand = candidatesStore.get(candidateId);
    const joined = cand ? cand.joinedAt : new Date().toISOString();
    const trialExp = cand ? cand.trialExpiresAt : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    cand = {
      id: candidateId,
      name: fullName,
      telegramId: tgId || undefined,
      username,
      phone: userPhone,
      isTelegramLinked: true,
      joinedAt: joined,
      lastLoginAt: new Date().toISOString(),
      trialExpiresAt: trialExp,
      trialDaysRemaining: 7,
      trialHoursRemaining: 168,
      isTrialActive: true,
      targetBand: '7.5 Academic',
      currentBand: 6.5,
      plan: '7_KUNLIK_BEPUL_SINOV',
    };
    computeCandidateTrial(cand);
    candidatesStore.set(candidateId, cand);

    const token = `jwt-tg-${tgId || 'web'}-${Date.now()}`;
    const confirmedSession: TelegramAuthSession = {
      code,
      status: 'CONFIRMED',
      createdAt: session?.createdAt || Date.now(),
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        telegramId: tgId,
        username,
        isTelegramLinked: true,
        isSubscribed: true,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        plan: user.plan,
        joinedAt: cand.joinedAt,
        lastLoginAt: cand.lastLoginAt,
        trialExpiresAt: cand.trialExpiresAt,
        trialDaysRemaining: cand.trialDaysRemaining,
        trialHoursRemaining: cand.trialHoursRemaining,
        isTrialActive: cand.isTrialActive,
      },
    };
    telegramAuthSessions.set(code, confirmedSession);

    res.json({
      success: true,
      message: 'Telegram sessiyasi tasdiqlandi',
      session: confirmedSession,
    });
  } catch (err: any) {
    console.error('Telegram session confirm error:', err);
    res.status(500).json({ success: false, error: 'Sessiya tasdiqlanmadi' });
  }
});

// Veb brauzer tomonidan sessiya holatini tekshirish (Polling)
router.get('/auth/telegram-session/:code/status', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const session = telegramAuthSessions.get(code);
    if (!session) {
      return res.status(404).json({ success: false, status: 'NOT_FOUND' });
    }

    // 10 daqiqalik yaroqlilik muddati
    if (Date.now() - session.createdAt > 10 * 60 * 1000) {
      session.status = 'EXPIRED';
      return res.json({ success: false, status: 'EXPIRED' });
    }

    res.json({
      success: true,
      status: session.status,
      token: session.token,
      user: session.user,
    });
  } catch (err: any) {
    console.error('Telegram session status error:', err);
    res.status(500).json({ success: false, error: 'Sessiya tekshirilmadi' });
  }
});

// ==========================================
// 1c. Nomzodlar & 1 Haftalik Limit Tahlili
// (Qancha foydalanuvchi, kimlar, qachon kirgan, 1 haftalik limiti qachon tugaydi)
// ==========================================
router.get('/candidates/overview', (_req: Request, res: Response) => {
  try {
    const allCandidates = Array.from(candidatesStore.values()).map(computeCandidateTrial);
    allCandidates.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());

    const activeTrials = allCandidates.filter(c => c.isTrialActive).length;
    const expiredTrials = allCandidates.length - activeTrials;

    res.json({
      success: true,
      totalCandidates: allCandidates.length,
      activeTrials,
      expiredTrials,
      candidates: allCandidates,
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Candidates overview error:', err);
    res.status(500).json({ success: false, error: 'Nomzodlar ma\'lumotlarini olishda xatolik' });
  }
});

// Admin: Nomzodning 1 haftalik limitini uzaytirish (+7 kun)
router.post('/candidates/:id/extend-trial', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { days = 7 } = req.body;
    let cand = candidatesStore.get(id);
    if (!cand) {
      // Find by id or telegramId
      cand = Array.from(candidatesStore.values()).find(c => c.id === id || String(c.telegramId) === id);
    }
    if (!cand) {
      return res.status(404).json({ success: false, error: 'Nomzod topilmadi' });
    }

    const currentExpiry = new Date(cand.trialExpiresAt).getTime();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    cand.trialExpiresAt = new Date(baseTime + Number(days) * 24 * 60 * 60 * 1000).toISOString();
    computeCandidateTrial(cand);

    res.json({
      success: true,
      message: `${cand.name} uchun 1 haftalik sinov muddati yana +${days} kunga muvaffaqiyatli uzaytirildi!`,
      candidate: cand,
    });
  } catch (err: any) {
    console.error('Extend trial error:', err);
    res.status(500).json({ success: false, error: 'Sinov muddatini uzaytirishda xatolik yuz berdi' });
  }
});

router.get('/candidates/my-trial', (req: Request, res: Response) => {
  try {
    const tgId = Number(req.query.telegramId || (currentUser as any).telegramId || 0);
    const candidateId = tgId ? `usr-tg-${tgId}` : currentUser.id;
    let cand = candidatesStore.get(candidateId);
    if (!cand) {
      cand = {
        id: candidateId,
        name: currentUser.name,
        phone: currentUser.phone,
        telegramId: tgId || undefined,
        isTelegramLinked: !!tgId,
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        trialExpiresAt: currentUser.subscriptionExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trialDaysRemaining: 7,
        trialHoursRemaining: 168,
        isTrialActive: true,
        plan: '7_KUNLIK_BEPUL_SINOV',
      };
      candidatesStore.set(candidateId, cand);
    }
    computeCandidateTrial(cand);

    res.json({
      success: true,
      trial: {
        joinedAt: cand.joinedAt,
        lastLoginAt: cand.lastLoginAt,
        trialExpiresAt: cand.trialExpiresAt,
        trialDaysRemaining: cand.trialDaysRemaining,
        trialHoursRemaining: cand.trialHoursRemaining,
        isTrialActive: cand.isTrialActive,
        plan: cand.plan,
        name: cand.name,
        telegramId: cand.telegramId,
      },
    });
  } catch (err: any) {
    console.error('My trial error:', err);
    res.status(500).json({ success: false, error: 'Sinov holatini olishda xatolik' });
  }
});

router.get('/user/profile', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      ...currentUser,
      isSubscribed: isSubscriptionActive(currentUser),
    },
  });
});

router.put('/user/profile', (req: Request, res: Response) => {
  const updates = req.body;
  currentUser = {
    ...currentUser,
    ...updates,
    stats: {
      ...currentUser.stats,
      ...(updates.stats || {}),
    },
  };
  registeredUsers.set(currentUser.phone, currentUser);
  res.json({ success: true, data: currentUser });
});

// ==========================================
// 1.1 Telegram Integratsiyasi & Parolsiz Kirish
// ==========================================

// Telegram botdan ro'yxatdan o'tgan foydalanuvchini Web App ga sinxron qilish
router.post('/telegram/sync-user', (req: Request, res: Response) => {
  try {
    const {
      telegramId,
      fullName,
      username,
      phone,
      targetBand,
      currentBand,
      examType,
      weakSkills,
      dailyMinutes,
    } = req.body;

    if (!telegramId) {
      return res.status(400).json({ success: false, error: 'telegramId kiritilmadi' });
    }

    const cleanPhone = (phone || currentUser.phone || `+99890${String(telegramId).slice(-7)}`).trim();
    const cleanName = (fullName || 'Telegram Nomzod').trim();
    const finalTargetBand = targetBand ? `${targetBand} ${examType ? (examType === 'general' ? 'General' : 'Academic') : 'Academic'}` : '7.5 Academic';
    const finalCurrentBand = Number(currentBand) || 6.0;

    const syncedUser = {
      id: `tg-${telegramId}`,
      telegramId: Number(telegramId),
      username: username || '',
      name: cleanName,
      phone: cleanPhone,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'TELEGRAM_VIP',
      activeExamMode: 'ENGLISH',
      targetBand: finalTargetBand,
      currentBand: finalCurrentBand,
      examType: examType || 'academic',
      weakSkills: weakSkills || ['speaking', 'writing'],
      dailyMinutes: Number(dailyMinutes) || 30,
      isTelegramLinked: true,
      stats: {
        testsCompleted: 14,
        overallBand: finalCurrentBand,
        listeningBand: Math.min(9, finalCurrentBand + 0.5),
        readingBand: finalCurrentBand,
        writingBand: Math.max(5, finalCurrentBand - 0.5),
        speakingBand: finalCurrentBand,
        studyStreakDays: 7,
      },
    };

    currentUser = syncedUser as any;
    registeredUsers.set(cleanPhone, syncedUser as any);
    registeredUsers.set(`tg-${telegramId}`, syncedUser as any);

    const token = `jwt-tg-${telegramId}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Foydalanuvchi Telegram akkaunti orqali muvaffaqiyatli sinxronlandi',
      token,
      user: syncedUser,
    });
  } catch (err: any) {
    console.error('Telegram sync error:', err);
    res.status(500).json({ success: false, error: err.message || 'Sinxronizatsiya xatosi' });
  }
});

// Telegram ID bo'yicha profilni olish
router.get('/telegram/user/:telegramId', (req: Request, res: Response) => {
  const { telegramId } = req.params;
  const user = registeredUsers.get(`tg-${telegramId}`);
  if (user) {
    return res.json({ success: true, user });
  }
  // Agar topilmasa, joriy foydalanuvchini Telegram ID ga bog'lab qaytarish
  res.json({
    success: true,
    user: {
      ...currentUser,
      id: `tg-${telegramId}`,
      telegramId: Number(telegramId),
      isTelegramLinked: true,
    },
  });
});

// Web App ochilganda parolsiz avtomatik Telegram Login
router.post('/auth/telegram-auto-login', (req: Request, res: Response) => {
  try {
    const { telegramId, fullName, username, phone, targetBand, currentBand, examType } = req.body;
    const cleanId = telegramId ? String(telegramId) : 'guest';
    const cleanName = fullName || username || 'IELTS Nomzod';
    const cleanPhone = phone || currentUser.phone || '+998901234567';

    const autoUser = {
      id: `tg-${cleanId}`,
      telegramId: Number(cleanId) || 98124,
      username: username || '',
      name: cleanName,
      phone: cleanPhone,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'TELEGRAM_LINKED',
      activeExamMode: 'ENGLISH',
      targetBand: targetBand ? `${targetBand} Academic` : '7.5 Academic',
      currentBand: Number(currentBand) || 6.0,
      examType: examType || 'academic',
      isTelegramLinked: true,
      stats: {
        testsCompleted: 14,
        overallBand: Number(currentBand) || 7.0,
        studyStreakDays: 9,
      },
    };

    currentUser = autoUser as any;
    registeredUsers.set(cleanPhone, autoUser as any);
    registeredUsers.set(`tg-${cleanId}`, autoUser as any);

    const token = `jwt-tg-${cleanId}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Telegram orqali parolsiz kirish muvaffaqiyatli',
      token,
      user: autoUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Obuna (Oylik 29 000 so'm)
// ==========================================

router.get('/subscription/plan', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      price: 29000,
      currency: "so'm",
      period: "oy",
      planId: "mocklife_english_monthly",
      features: [
        "Barcha ingliz tili mock testlariga cheksiz kirish",
        "Haqiqiy imtihon vaqtiga moslashtirilgan taymer",
        "Har bir savol bo'yicha batafsil izoh va tahlil",
        "Xatolar ustida ishlash bo'limi",
        "Shaxsiy ballar va o'sish statistikasi",
        "Telefonda va kompyuterda qulay ishlash",
      ],
    },
  });
});

router.post('/subscription/create', (req: Request, res: Response) => {
  const { phone, provider = 'Click', amount = 29000 } = req.body;
  const orderId = `ME-${Date.now()}`;
  res.json({
    success: true,
    message: 'Obuna buyurtmasi yaratildi',
    data: {
      orderId,
      phone: phone || currentUser.phone,
      amount,
      provider,
      paymentUrl: `https://mock-payment.${String(provider).toLowerCase()}.uz/pay/${orderId}`,
      status: 'PENDING_PAYMENT',
    },
  });
});

router.post('/subscription/confirm', (req: Request, res: Response) => {
  const { orderId, phone } = req.body;
  const targetPhone = phone || currentUser.phone;
  const user = registeredUsers.get(targetPhone) || currentUser;

  user.isSubscribed = true;
  user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  registeredUsers.set(user.phone, user);

  res.json({
    success: true,
    message: 'Obuna muvaffaqiyatli faollashtirildi (30 kun)',
    data: {
      orderId,
      isSubscribed: true,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    },
  });
});

// ==========================================
// 3. Mock Testlar & Test Sessiyasi
// ==========================================

// Mock tests repository
interface StoredMockTest {
  id: string;
  title: string;
  section: 'Reading' | 'Listening' | 'Full Mock' | 'Grammar';
  questionsCount: number;
  durationMinutes: number;
  level: string;
  isTrialAvailable: boolean;
  completedPercent?: number;
  passageText: string;
  questions: Array<{
    id: number;
    type: string;
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

const mockTestsStore: StoredMockTest[] = [
  {
    id: '1',
    title: 'English Mock #1 — Full Test',
    section: 'Full Mock',
    questionsCount: sampleReadingTest.questions.length,
    durationMinutes: 60,
    level: 'B2-C1',
    isTrialAvailable: true,
    completedPercent: 78,
    passageText: sampleReadingTest.passageText,
    questions: sampleReadingTest.questions,
  },
  {
    id: '2',
    title: 'English Reading Diagnostic',
    section: 'Reading',
    questionsCount: 4,
    durationMinutes: 45,
    level: 'B1-B2',
    isTrialAvailable: true,
    completedPercent: 100,
    passageText: sampleReadingTest.passageText,
    questions: sampleReadingTest.questions,
  },
  {
    id: '3',
    title: 'English Listening Practice #4',
    section: 'Listening',
    questionsCount: 40,
    durationMinutes: 35,
    level: 'B2',
    isTrialAvailable: true,
    completedPercent: 45,
    passageText: 'Listening Section: Audio script simulation with conversational dialogue.',
    questions: sampleReadingTest.questions,
  },
  {
    id: '4',
    title: 'Grammar & Vocabulary Sprint',
    section: 'Grammar',
    questionsCount: 50,
    durationMinutes: 40,
    level: 'General',
    isTrialAvailable: true,
    completedPercent: 0,
    passageText: 'Diagnostic Grammar & Vocabulary test questions across CEFR levels.',
    questions: sampleReadingTest.questions,
  },
];

// Active Test Sessions & Saved Results
interface TestSession {
  sessionId: string;
  testId: string;
  userId: string;
  startTime: string;
  expiresAt: string;
  durationMinutes: number;
  isTrial: boolean;
  answers: Record<number, string>;
}

const activeSessions = new Map<string, TestSession>();
const testResultsStore = new Map<string, any>();

// 3.1. Testlar ro'yxati
router.get('/mock-tests', (_req: Request, res: Response) => {
  const list = mockTestsStore.map((t) => ({
    id: t.id,
    title: t.title,
    section: t.section,
    questionsCount: t.questionsCount,
    durationMinutes: t.durationMinutes,
    level: t.level,
    isTrialAvailable: t.isTrialAvailable,
    completedPercent: t.completedPercent || 0,
  }));
  res.json({ success: true, data: list });
});

// 3.2. Testni boshlash (7 kunlik bepul to'liq foydalanish — hech qanday pul to'sig'i yo'q)
router.post('/tests/:id/start', (req: Request, res: Response) => {
  const testId = req.params.id;
  const { isTrial = false } = req.body;
  const test = mockTestsStore.find((t) => t.id === testId) || mockTestsStore[0];

  const sessionId = `sess-${Date.now()}`;
  const duration = test.durationMinutes;
  const startTime = new Date().toISOString();
  const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();

  // Full questions available for 7-day free trial
  const rawQuestions = test.questions;

  // IMPORTANT: Strip correctAnswer and explanation so user cannot cheat during test!
  const sanitizedQuestions = rawQuestions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
  }));

  activeSessions.set(sessionId, {
    sessionId,
    testId: test.id,
    userId: currentUser.id,
    startTime,
    expiresAt,
    durationMinutes: duration,
    isTrial,
    answers: {},
  });

  res.json({
    success: true,
    data: {
      sessionId,
      testId: test.id,
      title: test.title,
      passageText: test.passageText,
      durationMinutes: duration,
      startTime,
      expiresAt,
      isTrial,
      questions: sanitizedQuestions,
    },
  });
});

// 3.3. Javobni saqlash (Autosave)
router.post('/tests/:id/save-answer', (req: Request, res: Response) => {
  const { sessionId, questionId, selectedAnswer } = req.body;
  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Faol test sessiyasi topilmadi' });
  }

  session.answers[Number(questionId)] = String(selectedAnswer || '');
  res.json({ success: true, saved: true, sessionId, questionId });
});

// 3.4. Testni tugatish va natijani hisoblash (To'g'ri javob va izohlar faqat shu yerda beriladi!)
router.post('/tests/:id/finish', (req: Request, res: Response) => {
  const testId = req.params.id;
  const { sessionId, userAnswers = {} } = req.body;
  const session = activeSessions.get(sessionId);
  const test = mockTestsStore.find((t) => t.id === testId) || mockTestsStore[0];

  const mergedAnswers = {
    ...(session ? session.answers : {}),
    ...userAnswers,
  };

  const targetQuestions = session?.isTrial ? test.questions.slice(0, 2) : test.questions;
  let correctCount = 0;

  const details = targetQuestions.map((q) => {
    const userAns = (mergedAnswers[q.id] || '').trim().toUpperCase();
    const correctAns = q.correctAnswer.trim().toUpperCase();
    const isCorrect = userAns === correctAns;
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      userAnswer: mergedAnswers[q.id] || '',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation, // Explanations returned exclusively upon submission!
    };
  });

  const percentage = Math.round((correctCount / targetQuestions.length) * 100);
  let estimatedBand = 5.5;
  if (percentage >= 90) estimatedBand = 8.5;
  else if (percentage >= 75) estimatedBand = 7.5;
  else if (percentage >= 50) estimatedBand = 6.5;

  const timeSpentMinutes = session
    ? Math.max(1, Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000))
    : 15;

  currentUser.stats.testsCompleted += 1;
  currentUser.stats.overallBand = estimatedBand;
  registeredUsers.set(currentUser.phone, currentUser);

  const resultData = {
    sessionId: sessionId || `res-${Date.now()}`,
    testId: test.id,
    title: test.title,
    totalQuestions: targetQuestions.length,
    correctCount,
    percentage,
    estimatedBand,
    timeSpentMinutes,
    submittedAt: new Date().toISOString(),
    details,
  };

  if (sessionId) {
    testResultsStore.set(sessionId, resultData);
    activeSessions.delete(sessionId);
  }

  res.json({ success: true, data: resultData });
});

// 3.5. Natijani ID bo'yicha ko'rish
router.get('/tests/results/:sessionId', (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const result = testResultsStore.get(sessionId);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Natija topilmadi' });
  }
  res.json({ success: true, data: result });
});

// ==========================================
// 4. Statistika & Foydalanuvchi Progressi
// ==========================================

router.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      testsCompleted: '[N]+',
      activeStudents: '[N]+',
      availability: '24/7',
      monthlyPrice: '29 000 UZS',
    },
  });
});

router.get('/user/progress', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      weeklyStreak: ['D', 'S', 'CH', 'P', 'J'],
      activeDaysCount: currentUser.stats.studyStreakDays,
      totalDaysInWeek: 7,
      completedTestsCount: currentUser.stats.testsCompleted,
      averageBand: currentUser.stats.overallBand,
      targetBand: '7.5 Academic',
    },
  });
});

// ==========================================
// 5. Sharhlar, FAQ & Lug'at
// ==========================================

router.get('/reviews', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      averageRating: 4.8,
      totalCount: '[00 000]',
      reviews: [
        { id: '1', author: '[Ism]', city: '[Shahar]', rating: 5, scoreText: 'BALL [0.0]', text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]', date: '[PLACEHOLDER]' },
        { id: '2', author: '[Ism]', city: '[Shahar]', rating: 5, scoreText: 'BALL [0.0]', text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]', date: '[PLACEHOLDER]' },
        { id: '3', author: '[Ism]', city: '[Shahar]', rating: 5, scoreText: 'BALL [0.0]', text: '[PLACEHOLDER: O\'quvchining sinov testlari va natijalari haqidagi haqiqiy sharhi]', date: '[PLACEHOLDER]' },
      ],
    },
  });
});

router.get('/faq', (req: Request, res: Response) => {
  const lang = (req.query.lang || 'uz') as string;
  const faqsByLang: Record<string, any[]> = {
    uz: [
      { id: 'faq-1', question: 'Platformada qaysi fanlardan testlar mavjud?', answer: 'Platformamiz faqat ingliz tili fani bo\'yicha ixtisoslashgan. Barcha darajadagi testlar va imtihon formatlari mukammal ishlab chiqilgan.' },
      { id: 'faq-2', question: 'Obunani qanday to\'layman va qancha vaqt amal qiladi?', answer: 'Oylik obuna narxi 29 000 so\'m. To\'lov qilingan kundan boshlab 30 kun davomida barcha testlar va imkoniyatlar to\'liq ochiq bo\'ladi.' },
      { id: 'faq-3', question: 'Testlarni telefondan yechish mumkinmi?', answer: 'Ha, MockLife to\'liq mobile-first dizaynga ega. Smartfoningiz orqali istalgan joyda qulay test topshirishingiz mumkin.' },
    ],
    ru: [
      { id: 'faq-1', question: 'По каким предметам доступны тесты на платформе?', answer: 'Наша платформа специализируется исключительно на английском языке. Тесты всех уровней и стандарты экзаменов проработаны до мелочей.' },
      { id: 'faq-2', question: 'Как оплатить подписку и на сколько она действует?', answer: 'Стоимость месячной подписки составляет 29 000 сум. С момента оплаты все тесты и аналитика открыты на 30 дней.' },
      { id: 'faq-3', question: 'Можно ли проходить тесты со смартфона?', answer: 'Да, MockLife создан по принципу mobile-first. Вы можете комфортно решать тесты с любого смартфона в любом месте.' },
    ],
    en: [
      { id: 'faq-1', question: 'What subjects are available on MockLife?', answer: 'Our platform is 100% specialized in English. Every test format, section, and difficulty level is crafted specifically for English tests.' },
      { id: 'faq-2', question: 'How does the subscription work and how long is it valid?', answer: 'The monthly pass is 29,000 UZS. It unlocks unlimited access across all test sets for 30 consecutive days from activation.' },
      { id: 'faq-3', question: 'Can I take mock tests on my smartphone?', answer: 'Yes! MockLife is engineered with a strict mobile-first design so you can test smoothly anywhere on your phone.' },
    ],
  };

  res.json({ success: true, data: faqsByLang[lang] || faqsByLang.uz });
});

router.get('/vocab', (_req: Request, res: Response) => {
  res.json({ success: true, data: vocabService.getAll() });
});

router.post('/vocab/save', (req: Request, res: Response) => {
  const { word, definition, translationUz, partOfSpeech, cefrLevel, exampleSentence, collocations } = req.body;
  if (!word) {
    return res.status(400).json({ success: false, error: 'Word is required' });
  }
  const saved = vocabService.saveWord({
    word,
    definition: definition || 'Academic definition pending',
    translationUz: translationUz || '',
    partOfSpeech: partOfSpeech || 'noun',
    cefrLevel: cefrLevel || 'C1',
    exampleSentence: exampleSentence || '',
    collocations: collocations || [],
  });
  res.json({ success: true, data: saved });
});

// ==========================================
// 6. Telegram Bot Admin Endpoints (No Web Admin UI)
// ==========================================

router.get('/admin/bot/stats', verifyAdminBot, (_req: Request, res: Response) => {
  const activeSubsCount = Array.from(registeredUsers.values()).filter(isSubscriptionActive).length;
  res.json({
    success: true,
    data: {
      totalCandidates: registeredUsers.size,
      activeSubscribers: activeSubsCount,
      totalTestsCount: mockTestsStore.length,
      revenueTotalUZS: activeSubsCount * 29000,
      serverTime: new Date().toISOString(),
    },
  });
});

router.get('/admin/bot/users', verifyAdminBot, (_req: Request, res: Response) => {
  const usersList = Array.from(registeredUsers.values()).map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    isSubscribed: isSubscriptionActive(u),
    subscriptionExpiresAt: u.subscriptionExpiresAt,
    testsCompleted: u.stats.testsCompleted,
  }));
  res.json({ success: true, data: usersList });
});

router.post('/admin/bot/subscription/grant', verifyAdminBot, (req: Request, res: Response) => {
  const { phone, days = 30 } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Telefon raqam ko\'rsatilmadi' });
  }

  const cleanPhone = phone.trim();
  let user = registeredUsers.get(cleanPhone);
  if (!user) {
    user = {
      id: `usr-${cleanPhone.replace(/\D/g, '').slice(-9)}`,
      name: `Foydalanuvchi (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      isSubscribed: true,
      subscriptionExpiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'MONTHLY_29000',
      activeExamMode: 'ENGLISH',
      stats: { testsCompleted: 0, overallBand: 6.5, studyStreakDays: 1 },
    };
    registeredUsers.set(cleanPhone, user);
  } else {
    user.isSubscribed = true;
    user.subscriptionExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  res.json({
    success: true,
    message: `${cleanPhone} raqamli foydalanuvchiga ${days} kunlik obuna muvaffaqiyatli berildi`,
    expiresAt: user.subscriptionExpiresAt,
  });
});

router.post('/admin/bot/tests/upload', verifyAdminBot, (req: Request, res: Response) => {
  const { title, section = 'Reading', durationMinutes = 60, level = 'B2-C1', passageText, questions = [] } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Test sarlavhasi (title) talab qilinadi' });
  }

  const newTest: StoredMockTest = {
    id: `test-${Date.now()}`,
    title,
    section,
    questionsCount: questions.length || 40,
    durationMinutes,
    level,
    isTrialAvailable: true,
    completedPercent: 0,
    passageText: passageText || sampleReadingTest.passageText,
    questions: questions.length > 0 ? questions : sampleReadingTest.questions,
  };

  mockTestsStore.push(newTest);
  res.json({
    success: true,
    message: 'Yangi test bot orqali bazaga muvaffaqiyatli qo\'shildi',
    data: {
      id: newTest.id,
      title: newTest.title,
      questionsCount: newTest.questionsCount,
    },
  });
});

// ==========================================
// 7. Web Admin Studio & AI Configuration Endpoints
// ==========================================

let systemConfig = {
  aiMode: 'custom_ngrok', // 'groq' | 'custom_ngrok' | 'openai'
  ngrokUrl: 'https://slyvia-cushy-noreen.ngrok-free.dev',
  customAiEndpoint: '',
  coreApiUrl: 'http://localhost:8000',
  groqApiKey: process.env.GROQ_API_KEY || '',
  customApiKey: '',
  examinerModel: 'llama-3.3-70b-versatile',
  examinerVoice: 'en-GB-SoniaNeural',
  systemPrompt: '',
};

// Additional store for Admin Studio materials
const adminListeningStore: any[] = [];
const adminReadingStore: any[] = [];
const adminWritingStore: any[] = [];
const adminSpeakingStore: any[] = [];

// 7.1. Get AI and Platform Configuration
router.get('/admin/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      ...systemConfig,
      groqConfigured: Boolean(systemConfig.groqApiKey),
      maskedKey: systemConfig.groqApiKey ? `${systemConfig.groqApiKey.slice(0, 7)}...${systemConfig.groqApiKey.slice(-4)}` : '',
      maskedCustomKey: systemConfig.customApiKey ? `${systemConfig.customApiKey.slice(0, 5)}...${systemConfig.customApiKey.slice(-4)}` : '',
    },
  });
});

// 7.2. Update AI and ngrok Configuration
router.post('/admin/config', (req: Request, res: Response) => {
  const {
    aiMode,
    ngrokUrl,
    customAiEndpoint,
    coreApiUrl,
    groqApiKey,
    customApiKey,
    examinerModel,
    examinerVoice,
    systemPrompt,
  } = req.body;

  if (aiMode !== undefined) systemConfig.aiMode = String(aiMode).trim();
  if (ngrokUrl !== undefined) systemConfig.ngrokUrl = String(ngrokUrl).trim();
  if (customAiEndpoint !== undefined) systemConfig.customAiEndpoint = String(customAiEndpoint).trim();
  if (coreApiUrl !== undefined) systemConfig.coreApiUrl = String(coreApiUrl).trim();
  if (groqApiKey !== undefined && String(groqApiKey).trim()) systemConfig.groqApiKey = String(groqApiKey).trim();
  if (customApiKey !== undefined) systemConfig.customApiKey = String(customApiKey).trim();
  if (examinerModel !== undefined) systemConfig.examinerModel = String(examinerModel).trim();
  if (examinerVoice !== undefined) systemConfig.examinerVoice = String(examinerVoice).trim();
  if (systemPrompt !== undefined) systemConfig.systemPrompt = String(systemPrompt).trim();

  res.json({
    success: true,
    message: 'AI va ngrok API konfiguratsiyasi muvaffaqiyatli yangilandi!',
    data: systemConfig,
  });
});

// 7.3. Test AI API Connectivity
router.post('/admin/config/test', async (req: Request, res: Response) => {
  const { url, apiKey, model, systemPrompt } = req.body;
  const targetUrl = url || systemConfig.customAiEndpoint || systemConfig.ngrokUrl;
  const targetKey = apiKey || systemConfig.customApiKey || systemConfig.groqApiKey;
  const targetModel = model || systemConfig.examinerModel;

  try {
    const pingStart = Date.now();
    // Test fetch to the provided endpoint
    const testResp = await aiExaminerService.chatWithExaminer({
      message: 'Hello! I am testing the IELTS examiner connection from the Admin Studio.',
      customApiUrl: targetUrl,
      apiKey: targetKey,
      model: targetModel,
      systemPrompt: systemPrompt || systemConfig.systemPrompt || undefined,
      part: 1,
      topic: 'Test Connection',
    });
    const latencyMs = Date.now() - pingStart;

    res.json({
      success: true,
      message: `API ulanishi muvaffaqiyatli o'rnatildi! (Kechikish: ${latencyMs}ms)`,
      latencyMs,
      sampleResponse: testResp.reply,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `API ga ulanib bo'lmadi: ${err.message || 'Tarmoq xatosi'}`,
    });
  }
});

// 7.4. Material Upload: Listening
router.post('/admin/listening/upload', (req: Request, res: Response) => {
  const item = {
    id: `listening-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  adminListeningStore.push(item);
  res.json({
    success: true,
    message: 'Listening materiali muvaffaqiyatli saqlandi!',
    data: item,
  });
});

// 7.5. Material Upload: Reading
router.post('/admin/reading/upload', (req: Request, res: Response) => {
  const item = {
    id: `reading-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  adminReadingStore.push(item);

  // Also sync to mockTestsStore so it's instantly playable in Reading/Mock Arena
  if (item.title && item.passageText) {
    mockTestsStore.push({
      id: item.id,
      title: item.title,
      section: 'Reading',
      questionsCount: 4,
      durationMinutes: 20,
      level: item.cefrLevel || 'C1',
      isTrialAvailable: true,
      completedPercent: 0,
      passageText: item.passageText,
      questions: [
        {
          id: 1,
          type: item.questionType || 'TRUE_FALSE_NOT_GIVEN',
          prompt: item.questionPrompt || 'The passage explicitly supports this statement.',
          options: ['TRUE', 'FALSE', 'NOT GIVEN'],
          correctAnswer: item.correctAnswer || 'TRUE',
          explanation: 'Passage text confirms the answer directly.',
        },
      ],
    });
  }

  res.json({
    success: true,
    message: 'Reading matni va savoli muvaffaqiyatli bazaga qo\'shildi!',
    data: item,
  });
});

// 7.6. Material Upload: Writing
router.post('/admin/writing/upload', (req: Request, res: Response) => {
  const item = {
    id: `writing-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  adminWritingStore.push(item);
  res.json({
    success: true,
    message: 'Writing topshirig\'i muvaffaqiyatli saqlandi!',
    data: item,
  });
});

// 7.7. Material Upload: Speaking
router.post('/admin/speaking/upload', (req: Request, res: Response) => {
  const item = {
    id: `speaking-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  adminSpeakingStore.push(item);
  res.json({
    success: true,
    message: 'Speaking Cue Card muvaffaqiyatli saqlandi!',
    data: item,
  });
});

// 7.8. Get All Admin Uploaded Materials
router.get('/admin/content/all', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      listening: adminListeningStore,
      reading: adminReadingStore,
      writing: adminWritingStore,
      speaking: adminSpeakingStore,
      mockTests: mockTestsStore,
      totalCount: adminListeningStore.length + adminReadingStore.length + adminWritingStore.length + adminSpeakingStore.length + mockTestsStore.length,
    },
  });
});

// 7.9. Delete Admin Uploaded Material
router.delete('/admin/content/:category/:id', (req: Request, res: Response) => {
  const { category, id } = req.params;
  let deleted = false;

  if (category === 'listening') {
    const idx = adminListeningStore.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) { adminListeningStore.splice(idx, 1); deleted = true; }
  } else if (category === 'reading') {
    const idx = adminReadingStore.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) { adminReadingStore.splice(idx, 1); deleted = true; }
  } else if (category === 'writing') {
    const idx = adminWritingStore.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) { adminWritingStore.splice(idx, 1); deleted = true; }
  } else if (category === 'speaking') {
    const idx = adminSpeakingStore.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) { adminSpeakingStore.splice(idx, 1); deleted = true; }
  } else if (category === 'mockTests') {
    const idx = mockTestsStore.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) { mockTestsStore.splice(idx, 1); deleted = true; }
  }

  if (deleted) {
    res.json({ success: true, message: 'Material muvaffaqiyatli o\'chirildi!' });
  } else {
    res.status(404).json({ success: false, error: 'Material topilmadi' });
  }
});

// ==========================================
// 8. Live AI Examiner Speaking Conversation Endpoint
// ==========================================

router.post('/speaking/live-ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history, topic, part, customApiUrl, apiKey, model, systemPrompt } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Xabar matni (message) kiritilishi shart' });
    }

    const effectiveUrl = customApiUrl || systemConfig.customAiEndpoint || systemConfig.ngrokUrl;
    const effectiveKey = apiKey || systemConfig.customApiKey || systemConfig.groqApiKey;
    const effectiveModel = model || systemConfig.examinerModel;

    const result = await aiExaminerService.chatWithExaminer({
      message,
      history,
      topic: topic || 'General Conversation',
      part: Number(part) || 1,
      customApiUrl: effectiveUrl,
      apiKey: effectiveKey,
      model: effectiveModel,
      systemPrompt: systemPrompt || systemConfig.systemPrompt || undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('AI Speaking Chat error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'AI Examiner bilan bog\'lanishda xatolik yuz berdi',
    });
  }
});

router.post('/speaking/evaluate', (req: Request, res: Response) => {
  try {
    const { transcript, part = 1 } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, error: 'Matn (transcript) kiritilmadi' });
    }
    const evalData = aiExaminerService.evaluateResponse(transcript, Number(part));
    res.json({ success: true, data: evalData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

