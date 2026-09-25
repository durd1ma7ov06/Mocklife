import { Router, Request, Response } from 'express';
import { initialUserProfile, sampleReadingTest, sampleReport } from '../data/mockData.js';
import { aiExaminerService } from '../services/aiExaminerService.js';
import { writingEvaluatorService } from '../services/writingEvaluatorService.js';
import { vocabService } from '../services/vocabService.js';
import { ExamMode, WritingSubmission } from '../types/index.js';

const router = Router();
let currentUserProfile = { ...initialUserProfile };

// User Profile & Preferences
router.get('/user/profile', (_req: Request, res: Response) => {
  res.json({ success: true, data: currentUserProfile });
});

router.put('/user/profile', (req: Request, res: Response) => {
  const updates = req.body;
  currentUserProfile = {
    ...currentUserProfile,
    ...updates,
    stats: {
      ...currentUserProfile.stats,
      ...(updates.stats || {}),
    }
  };
  res.json({ success: true, data: currentUserProfile });
});

// Auth Routes (Login & Register)
router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (email && email.includes('@')) {
    const namePart = email.split('@')[0];
    currentUserProfile.name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  res.json({
    success: true,
    message: 'Muvaffaqiyatli tizimga kirildi',
    data: currentUserProfile,
    token: 'jwt-ieltix-token-' + Date.now(),
  });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, targetBand, examDate, activeExamMode } = req.body;
  if (name) currentUserProfile.name = name;
  if (targetBand) currentUserProfile.targetBand = targetBand;
  if (examDate) currentUserProfile.examDate = examDate;
  if (activeExamMode) currentUserProfile.activeExamMode = activeExamMode;
  
  res.json({
    success: true,
    message: 'Ro\'yxatdan o\'tish muvaffaqiyatli bajarildi',
    data: currentUserProfile,
    token: 'jwt-ieltix-token-' + Date.now(),
  });
});

router.post('/user/mode', (req: Request, res: Response) => {
  const { mode } = req.body as { mode: ExamMode };
  if (mode === 'IELTS' || mode === 'MILLIY_BBM') {
    currentUserProfile.activeExamMode = mode;
    return res.json({ success: true, data: currentUserProfile });
  }
  res.status(400).json({ success: false, error: 'Invalid exam mode' });
});

// Speaking AI Examiner
router.get('/speaking/questions', (_req: Request, res: Response) => {
  res.json({ success: true, data: aiExaminerService.getQuestions() });
});

router.post('/speaking/evaluate', (req: Request, res: Response) => {
  const { transcript, part = 1 } = req.body;
  if (!transcript) {
    return res.status(400).json({ success: false, error: 'Transcript is required' });
  }
  const evaluation = aiExaminerService.evaluateResponse(transcript, Number(part));
  res.json({ success: true, data: evaluation });
});

// Writing Module AI Assessment
router.post('/writing/evaluate', (req: Request, res: Response) => {
  const submission: WritingSubmission = req.body;
  if (!submission?.essayText) {
    return res.status(400).json({ success: false, error: 'Essay text is required' });
  }
  const evaluation = writingEvaluatorService.evaluateWriting(submission);
  res.json({ success: true, data: evaluation });
});

// Reading Practice Lab
router.get('/reading/test', (_req: Request, res: Response) => {
  res.json({ success: true, data: sampleReadingTest });
});

router.post('/reading/submit', (req: Request, res: Response) => {
  const { userAnswers } = req.body as { userAnswers: Record<number, string> };
  const questions = sampleReadingTest.questions;
  let correctCount = 0;
  const details = questions.map(q => {
    const isCorrect = (userAnswers[q.id] || '').trim().toUpperCase() === q.correctAnswer.trim().toUpperCase();
    if (isCorrect) correctCount++;
    return {
      id: q.id,
      userAnswer: userAnswers[q.id] || '',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  let band = 5.5;
  if (percentage >= 90) band = 8.5;
  else if (percentage >= 75) band = 7.5;
  else if (percentage >= 50) band = 6.5;

  res.json({
    success: true,
    data: {
      totalQuestions: questions.length,
      correctCount,
      percentage,
      estimatedBand: band,
      details,
    },
  });
});

// Smart Vocab Vault
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

router.get('/vocab/lookup/:word', (req: Request, res: Response) => {
  const wordParam = req.params.word;
  const word = Array.isArray(wordParam) ? wordParam[0] : wordParam;
  const result = vocabService.lookupContextWord(word || '');
  res.json({ success: true, data: result });
});

// Official Verified Score Report
router.get('/reports/:id', (req: Request, res: Response) => {
  res.json({ success: true, data: sampleReport });
});

// VIP Checkout Simulation
router.post('/checkout/vip', (req: Request, res: Response) => {
  const { planName, priceUZS, provider = 'Click' } = req.body;
  currentUserProfile.vipTier = 'MAX_VIP';
  res.json({
    success: true,
    data: {
      transactionId: `TX-${Date.now()}`,
      status: 'CONFIRMED',
      planName,
      priceUZS,
      provider,
      message: `Successfully upgraded to ${planName} via ${provider}!`,
    },
  });
});

// Admin Material Management Storage & Endpoints
const uploadedListeningMaterials: any[] = [];
const uploadedReadingMaterials: any[] = [];
const uploadedWritingMaterials: any[] = [];
const uploadedSpeakingMaterials: any[] = [];

router.post('/admin/listening/upload', (req: Request, res: Response) => {
  const material = { id: `list-${Date.now()}`, ...req.body, uploadedAt: new Date().toISOString() };
  uploadedListeningMaterials.push(material);
  res.json({ success: true, message: 'Listening material saqlandi', data: material });
});

router.post('/admin/reading/upload', (req: Request, res: Response) => {
  const material = { id: `read-${Date.now()}`, ...req.body, uploadedAt: new Date().toISOString() };
  uploadedReadingMaterials.push(material);
  res.json({ success: true, message: 'Reading passaji saqlandi', data: material });
});

router.post('/admin/writing/upload', (req: Request, res: Response) => {
  const material = { id: `writ-${Date.now()}`, ...req.body, uploadedAt: new Date().toISOString() };
  uploadedWritingMaterials.push(material);
  res.json({ success: true, message: 'Writing vazifasi saqlandi', data: material });
});

router.post('/admin/speaking/upload', (req: Request, res: Response) => {
  const material = { id: `spk-${Date.now()}`, ...req.body, uploadedAt: new Date().toISOString() };
  uploadedSpeakingMaterials.push(material);
  res.json({ success: true, message: 'Speaking mavzusi saqlandi', data: material });
});

router.get('/admin/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalListening: 48 + uploadedListeningMaterials.length,
      totalReading: 36 + uploadedReadingMaterials.length,
      totalWriting: 24 + uploadedWritingMaterials.length,
      totalSpeaking: 30 + uploadedSpeakingMaterials.length,
      totalCandidates: 3,
      serverStatus: 'HEALTHY',
    }
  });
});

export default router;
