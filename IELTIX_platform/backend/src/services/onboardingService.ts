import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/db.js';

export interface OnboardingAnswers {
  studyReason: string;
  examType: 'ACADEMIC' | 'GENERAL';
  currentLevel: string; // 'A1_A2' | 'B1' | 'B2' | 'C1'
  targetBand: number; // e.g. 7.0, 7.5, 8.0
  targetTimeline: string; // 'LESS_1_MONTH' | '1_2_MONTHS' | '3_6_MONTHS'
  weakSkills: string[]; // ['speaking', 'writing']
  dailyMinutes: number; // 15, 30, 60, 120
  pastExperience?: string;
  learningStyle?: string;
  studyTimeOfDay?: string;
  confidenceLevel?: string;
}

export interface DiagnosticScores {
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  projectedTimeline: {
    day1: number;
    day7: number;
    day14: number;
    day30: number;
    day90: number;
  };
}

export interface StudyPlanTask {
  id: string;
  dayNumber: number;
  skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'mock';
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  score?: number;
}

// In-memory fallback repository when offline or initializing
const memorySubmissions = new Map<string, any>();
const memoryUsers = new Map<string, any>();
const memoryPlans = new Map<string, any>();

class OnboardingService {
  private jwtSecret = process.env.JWT_SECRET || 'mocklife_jwt_production_secret_2026';

  /**
   * Diagnostic Band Score kalkulyatori (ielts.gg metodikasi asosida)
   */
  public calculateDiagnostic(answers: OnboardingAnswers): DiagnosticScores {
    let baseBand = 5.0;
    switch (answers.currentLevel) {
      case 'A1_A2':
        baseBand = 4.5;
        break;
      case 'B1':
        baseBand = 5.5;
        break;
      case 'B2':
        baseBand = 6.0;
        break;
      case 'C1':
        baseBand = 7.0;
        break;
      default:
        baseBand = 5.5;
    }

    const weak = (answers.weakSkills || []).map((s) => s.toLowerCase());

    const listening = Math.round((baseBand + (weak.includes('listening') ? -0.5 : 0.5)) * 2) / 2;
    const reading = Math.round((baseBand + (weak.includes('reading') ? -0.5 : 0.5)) * 2) / 2;
    const writing = Math.round((baseBand + (weak.includes('writing') ? -0.5 : 0.0)) * 2) / 2;
    const speaking = Math.round((baseBand + (weak.includes('speaking') ? -0.5 : 0.0)) * 2) / 2;

    const overall = Math.round(((listening + reading + writing + speaking) / 4) * 2) / 2;
    const target = answers.targetBand || 7.0;

    // Progression curve calculation
    const day1 = overall;
    const day7 = Math.min(target, Math.round((overall + 0.3) * 2) / 2);
    const day14 = Math.min(target, Math.round((overall + 0.7) * 2) / 2);
    const day30 = Math.min(target, Math.round((overall + 1.2) * 2) / 2);
    const day90 = Math.min(9.0, Math.max(target, Math.round((overall + 1.8) * 2) / 2));

    return {
      overall,
      listening,
      reading,
      writing,
      speaking,
      projectedTimeline: { day1, day7, day14, day30, day90 },
    };
  }

  /**
   * Shaxsiy 4 haftalik kunlik o'quv rejasini generatsiya qilish
   */
  public generatePersonalizedTasks(answers: OnboardingAnswers, diagnostic: DiagnosticScores): StudyPlanTask[] {
    const tasks: StudyPlanTask[] = [
      {
        id: 'task-1',
        dayNumber: 1,
        skill: 'listening',
        title: 'Listening Part 1: Raqamlar va Ismlarni aniq ilg\'ash',
        description: 'Imtihon oldi 10 ta audio savol va orfografik xatolarni tuzatish',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-2',
        dayNumber: 2,
        skill: 'speaking',
        title: 'Speaking Part 1: AI bilan 5 ta shaxsiy savol-javob',
        description: 'Fluency, intonatsiya va talaffuzni AI tekshiruvidan o\'tkazish',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-3',
        dayNumber: 3,
        skill: 'reading',
        title: 'Reading Passage 1: Skimming & Scanning texnikasi',
        description: 'True/False/Not Given savollarida kalit so\'zlarni topish strategiyasi',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-4',
        dayNumber: 4,
        skill: 'writing',
        title: 'Writing Task 1 / 2: Kirish va Paragraph tuzilishi',
        description: 'Paraphrase qilish va Band 7.0+ leksikani qo\'llash mashqi',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-5',
        dayNumber: 5,
        skill: 'speaking',
        title: 'Speaking Part 2: 2 daqiqalik monolog (Cue Card)',
        description: 'Vaqtni to\'g\'ri taqsimlash va bog\'lovchi so\'zlardan foydalanish',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-6',
        dayNumber: 6,
        skill: 'reading',
        title: 'Reading Passage 2 & 3: Matching Headings sirlari',
        description: 'Murakkab akademik matnlarni tahlil qilish va vaqt boshqaruvi',
        durationMinutes: answers.dailyMinutes || 30,
        completed: false,
      },
      {
        id: 'task-7',
        dayNumber: 7,
        skill: 'mock',
        title: 'Haftalik Mini Mock & Xatolar ustida ishlash',
        description: '1-hafta bo\'yicha o\'zlashtirish tahlili va Band o\'sishini o\'lchash',
        durationMinutes: 45,
        completed: false,
      },
    ];

    return tasks;
  }

  /**
   * 1. 14 ta savol javoblarini saqlash va diagnostikani qaytarish
   */
  public async submitOnboarding(answers: OnboardingAnswers, clientSessionId?: string) {
    const sessionId = clientSessionId || `sess_${crypto.randomUUID()}`;
    const diagnostic = this.calculateDiagnostic(answers);

    const submissionData = {
      id: `sub_${crypto.randomUUID()}`,
      sessionId,
      answers,
      diagnosticScores: diagnostic,
      discountPercentage: 0,
      status: 'quiz_done',
      createdAt: new Date().toISOString(),
    };

    memorySubmissions.set(sessionId, submissionData);

    try {
      await query(
        `INSERT INTO onboarding_submissions (id, session_id, answers, diagnostic_scores, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (session_id) 
         DO UPDATE SET answers = $3, diagnostic_scores = $4, status = $5`,
        [
          submissionData.id,
          submissionData.sessionId,
          JSON.stringify(answers),
          JSON.stringify(diagnostic),
          'quiz_done',
        ]
      );
    } catch (err: any) {
      // Postgres error fallback to memory
      console.warn('Postgres write fallback:', err.message);
    }

    return {
      sessionId,
      diagnostic,
      targetBand: answers.targetBand,
      examType: answers.examType,
    };
  }

  /**
   * 2. Spin the Wheel — gamifikatsiya chegirmasini qo'llash
   */
  public async applyWheelDiscount(sessionId: string, discount: number = 40) {
    const submission = memorySubmissions.get(sessionId);
    if (submission) {
      submission.discountPercentage = discount;
      submission.discountCode = `MOCKLIFE${discount}`;
    }

    try {
      await query(
        `UPDATE onboarding_submissions 
         SET discount_percentage = $1, discount_code = $2 
         WHERE session_id = $3`,
        [discount, `MOCKLIFE${discount}`, sessionId]
      );
    } catch (err: any) {
      console.warn('Postgres update fallback:', err.message);
    }

    return {
      success: true,
      discountPercentage: discount,
      discountCode: `MOCKLIFE${discount}`,
      pricing: {
        monthly: { original: 275000, discounted: 165000, label: '1 oylik' },
        quarterly: { original: 550000, discounted: 330000, label: '3 oylik (Tavsiya etiladi)' },
        annual: { original: 1050000, discounted: 630000, label: '12 oylik' },
      },
    };
  }

  /**
   * 3. Yakuniy ro'yxatdan o'tish va Foydalanuvchini PostgreSQL ga yozish
   */
  public async completeRegistration(data: {
    sessionId: string;
    fullName: string;
    email: string;
    phone: string;
    password?: string;
  }) {
    const { sessionId, fullName, email, phone, password } = data;
    const submission = memorySubmissions.get(sessionId);

    const answers: OnboardingAnswers = submission?.answers || {
      studyReason: 'BACHELOR',
      examType: 'ACADEMIC',
      currentLevel: 'B1',
      targetBand: 7.0,
      targetTimeline: '1_2_MONTHS',
      weakSkills: ['writing', 'speaking'],
      dailyMinutes: 30,
    };

    const diagnostic: DiagnosticScores = submission?.diagnosticScores || this.calculateDiagnostic(answers);
    const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const userRecord = {
      id: userId,
      phone,
      email,
      fullName,
      targetBand: answers.targetBand,
      currentLevel: answers.currentLevel,
      currentBand: diagnostic.overall,
      examType: answers.examType,
      studyReason: answers.studyReason,
      dailyStudyMinutes: answers.dailyMinutes,
      weakSkills: answers.weakSkills,
      isSubscribed: true,
      subscriptionPlan: 'TRIAL_7_DAYS',
      subscriptionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      studyStreakDays: 1,
      testsCompleted: 0,
      createdAt: new Date().toISOString(),
    };

    memoryUsers.set(userId, userRecord);
    if (phone) memoryUsers.set(phone, userRecord);
    if (email) memoryUsers.set(email, userRecord);

    const dailyTasks = this.generatePersonalizedTasks(answers, diagnostic);
    const planId = `plan_${crypto.randomUUID().slice(0, 8)}`;
    const planRecord = {
      id: planId,
      userId,
      targetBand: answers.targetBand,
      currentBand: diagnostic.overall,
      examType: answers.examType,
      durationWeeks: 4,
      currentWeek: 1,
      dailyTasks,
      weeklySchedule: [
        { week: 1, title: 'Foundation & Section Breakdown', focus: answers.weakSkills?.[0] || 'writing' },
        { week: 2, title: 'Speed & Strategy Intensive', focus: answers.weakSkills?.[1] || 'speaking' },
        { week: 3, title: 'Exam Precision & Tricky Traps', focus: 'reading' },
        { week: 4, title: 'Mastery & Full Mock Rehearsals', focus: 'full_mock' },
      ],
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
    };
    memoryPlans.set(userId, planRecord);

    // Write to PostgreSQL
    try {
      await query(
        `INSERT INTO users (
           id, phone, email, full_name, password_hash, target_band, 
           current_level, current_band, exam_type, study_reason, 
           daily_study_minutes, weak_skills, is_subscribed, subscription_plan, subscription_expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (phone) DO UPDATE 
         SET full_name = $4, email = $3, target_band = $6, current_band = $8`,
        [
          userId,
          phone,
          email,
          fullName,
          passwordHash,
          answers.targetBand,
          answers.currentLevel,
          diagnostic.overall,
          answers.examType,
          answers.studyReason,
          answers.dailyMinutes,
          answers.weakSkills,
          true,
          'TRIAL_7_DAYS',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ]
      );

      // Link onboarding submission to user
      await query(
        `UPDATE onboarding_submissions 
         SET user_id = $1, email = $2, phone = $3, full_name = $4, status = 'registered' 
         WHERE session_id = $5`,
        [userId, email, phone, fullName, sessionId]
      );

      // Create study plan in PostgreSQL
      await query(
        `INSERT INTO study_plans (
           id, user_id, target_band, current_band, exam_type, 
           duration_weeks, current_week, daily_tasks, weekly_schedule, progress_percentage
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          planId,
          userId,
          answers.targetBand,
          diagnostic.overall,
          answers.examType,
          4,
          1,
          JSON.stringify(dailyTasks),
          JSON.stringify(planRecord.weeklySchedule),
          0,
        ]
      );
    } catch (err: any) {
      console.warn('Postgres registration write fallback:', err.message);
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId, email, phone, fullName, role: 'student' },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      success: true,
      token,
      user: userRecord,
      studyPlan: planRecord,
      diagnostic,
    };
  }

  /**
   * Foydalanuvchining o'quv rejasini olish
   */
  public async getStudyPlan(userId: string) {
    try {
      const res = await query('SELECT * FROM study_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
      if (res && res.rows && res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (err: any) {
      console.warn('Postgres getStudyPlan fallback:', err.message);
    }

    return memoryPlans.get(userId) || null;
  }
}

export const onboardingService = new OnboardingService();
