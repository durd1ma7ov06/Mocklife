import { UserProfile, VocabItem, ReadingTest, ExamReport, SpeakingQuestion } from '../types/index.js';

export const initialUserProfile: UserProfile = {
  id: 'usr-98124',
  name: 'Mansur Toshmatov',
  role: 'IELTS Academic Candidate',
  avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UlOsPkcdzSPImEUBoR0zhlYs7JEQ5eT1tzkbVLLrc-94W0HaQJ3514CX5yCFeoPmvhbiCmhUMsOZoOUnHSyLCS7mfRcUNiIgZ0-yrahMk27_-0vTua8MD1P_h-yk7l9VF4xaKFnRv-vvZklHEp3KGZDtze-2U3MGYiRjjlrjYMHNcr5yzluKVgiBj1RH71gQtFe84MfDhhBjIMRQJla6I2qejuBSlRYoKva8ThrWJrGbjGZc6L2ToQZjPk',
  targetBand: '7.5 Academic',
  examDate: 'Oct 26, 2025',
  daysLeft: 38,
  vipTier: 'MAX_VIP',
  activeExamMode: 'IELTS',
  stats: {
    testsCompleted: 14,
    overallBand: 7.0,
    listeningBand: 7.5,
    readingBand: 7.0,
    writingBand: 6.5,
    speakingBand: 7.0,
    studyStreakDays: 9,
  },
};

export const sampleVocabVault: VocabItem[] = [
  {
    id: 'v-1',
    word: 'Pivotal',
    definition: 'Of crucial importance in relation to the development or success of something else.',
    translationUz: 'Hal qiluvchi, o\'ta muhim',
    partOfSpeech: 'adjective',
    cefrLevel: 'C1',
    exampleSentence: 'The technological revolution played a pivotal role in modern diagnostics.',
    collocations: ['pivotal role', 'pivotal moment', 'pivotal decision'],
    savedAt: '2026-09-05T10:15:00Z',
  },
  {
    id: 'v-2',
    word: 'Exacerbate',
    definition: 'To make a problem, bad situation, or negative feeling worse.',
    translationUz: 'Og\'irlashtirmoq, kuchaytirmoq',
    partOfSpeech: 'verb',
    cefrLevel: 'C2',
    exampleSentence: 'Rapid urbanization can exacerbate environmental degradation in developing regions.',
    collocations: ['exacerbate the problem', 'exacerbate symptoms', 'exacerbate tensions'],
    savedAt: '2026-09-06T14:30:00Z',
  },
  {
    id: 'v-3',
    word: 'Discrepancy',
    definition: 'An illogical or unexpected lack of compatibility or similarity between two or more facts.',
    translationUz: 'Tafovut, nomuvofiqlik',
    partOfSpeech: 'noun',
    cefrLevel: 'C1',
    exampleSentence: 'There appears to be a noticeable discrepancy between the predicted and observed data.',
    collocations: ['wide discrepancy', 'apparent discrepancy', 'explain the discrepancy'],
    savedAt: '2026-09-07T08:00:00Z',
  },
  {
    id: 'v-4',
    word: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere.',
    translationUz: 'Hamma joyda uchraydigan, yalpi tarqalgan',
    partOfSpeech: 'adjective',
    cefrLevel: 'C2',
    exampleSentence: 'Smartphones have become ubiquitous in daily communications worldwide.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'almost ubiquitous'],
    savedAt: '2026-09-07T12:00:00Z',
  },
];

export const speakingTestFlow: SpeakingQuestion[] = [
  // Part 1: Introduction & General Questions (3 questions)
  {
    part: 1,
    topic: 'Hometown & Technology',
    question: 'Hello, I am Foxy, your AI Examiner. To begin Part 1, could you tell me where you grew up and how technology has changed your hometown over the last few years?',
  },
  {
    part: 1,
    topic: 'Studies & Daily Routine',
    question: 'Do you prefer to study in the morning or late at night, and why do you find that time most productive for concentration?',
  },
  {
    part: 1,
    topic: 'Digital Communication Habits',
    question: 'How much time do you spend communicating online through messages compared to meeting people face-to-face?',
  },

  // Part 2: Candidate Task Card (Cue Card)
  {
    part: 2,
    topic: 'An Inspiring Technological Innovation',
    question: 'Describe an artificial intelligence tool or technological innovation that you believe has fundamentally transformed the way people learn or work.',
    preparationTimeSec: 60,
    cuePoints: [
      'What this technology or tool is',
      'When and how you first discovered it',
      'What specific tasks or study goals it assists you with',
      'And explain why you consider this innovation particularly impactful for future generations',
    ],
  },

  // Part 3: Two-Way Discussion (3 Analytical Questions)
  {
    part: 3,
    topic: 'AI in the Classroom & Teaching Roles',
    question: 'In Part 3, let\'s look at broader perspectives: Do you think artificial intelligence will eventually replace human teachers, or will it simply enhance the pedagogical experience?',
  },
  {
    part: 3,
    topic: 'Critical Thinking & Reliance on Algorithms',
    question: 'Some educators worry that students might lose critical thinking skills if they rely too heavily on automated AI tools. What is your view on this concern?',
  },
  {
    part: 3,
    topic: 'Ethics & Future Safeguards',
    question: 'What ethical boundaries and regulations should governments implement to ensure AI technologies remain safe and equitable for all learners?',
  },
];

export const sampleReadingTest: ReadingTest = {
  id: 'ieltix-ielts-passage-1',
  title: 'IELTS Academic Reading: The Evolutionary Architecture of Urban Biodiversity',
  passageText: `As metropolitan areas worldwide expand exponentially, urban ecologists have uncovered an unexpected biological phenomenon: cities are becoming evolutionary hotspots. Far from being ecological wastelands devoid of adaptive diversity, high-density concrete ecosystems exert fierce selective pressures on wildlife, accelerating phenotypic divergence at rates seldom recorded in untouched wilderness.

A pivotal study conducted by the Global Urban Biome Initiative tracked White-footed mice (Peromyscus leucopus) inhabiting isolated public parks across New York City. Genetic sequencing revealed that city mice have developed distinct adaptations in metabolic and heavy-metal tolerance genes compared to their rural counterparts. These physiological mutations allow them to process carbohydrate-dense anthropogenic food waste without exacerbating systemic inflammation, and detoxify airborne lead particles embedded in park foliage.

Furthermore, behavioral alterations in urban avian species highlight the ubiquitous nature of adaptation. In European metropolitan hubs, European blackbirds (Turdus merula) have modulated both the pitch and the circadian timing of their territorial songs. By shifting peak vocalization to pre-dawn intervals, avian populations circumvent acoustic interference generated by morning vehicular traffic. Urban noise pollution therefore acts as an immediate selective filter, rewarding specimens with elevated auditory frequencies.

Critics often argue that urban evolution merely represents localized survivorship rather than authentic speciation. However, longitudinal genomic data demonstrates unambiguous reproductive isolation in multiple arthropod species trapped in subterranean transit networks, indicating that anthropogenic terrain is actively shaping new phylogenetic branches.`,
  questions: [
    {
      id: 1,
      type: 'TRUE_FALSE_NOT_GIVEN',
      prompt: 'Wildlife adaptation occurs at a slower pace in urban centers than in untouched natural wilderness.',
      options: ['TRUE', 'FALSE', 'NOT GIVEN'],
      correctAnswer: 'FALSE',
      explanation: 'The passage explicitly states that cities accelerate phenotypic divergence at rates seldom recorded in untouched wilderness.',
    },
    {
      id: 2,
      type: 'TRUE_FALSE_NOT_GIVEN',
      prompt: 'Metabolic mutations in New York City mice assist in metabolizing discarded human food.',
      options: ['TRUE', 'FALSE', 'NOT GIVEN'],
      correctAnswer: 'TRUE',
      explanation: 'The text notes these adaptations allow them to process carbohydrate-dense anthropogenic food waste.',
    },
    {
      id: 3,
      type: 'MULTIPLE_CHOICE',
      prompt: 'Why have European blackbirds shifted the timing of their vocalization to pre-dawn hours?',
      options: [
        'To attract female mates before foraging begins',
        'To avoid the acoustic interference created by heavy morning traffic',
        'Because nighttime city lighting confuses their natural circadian rhythm',
        'To conserve metabolic energy during colder morning hours'
      ],
      correctAnswer: 'To avoid the acoustic interference created by heavy morning traffic',
      explanation: 'Paragraph 3 notes: "By shifting peak vocalization to pre-dawn intervals, avian populations circumvent acoustic interference generated by morning vehicular traffic."',
    },
    {
      id: 4,
      type: 'TRUE_FALSE_NOT_GIVEN',
      prompt: 'All arthropod populations in underground rail networks have completely lost the ability to fly.',
      options: ['TRUE', 'FALSE', 'NOT GIVEN'],
      correctAnswer: 'NOT GIVEN',
      explanation: 'The passage mentions reproductive isolation in arthropods in subterranean networks, but mentions nothing about flight ability.',
    },
  ],
};

export const sampleReport: ExamReport = {
  id: 'REP-2026-98124',
  candidateName: 'Mansur Toshmatov',
  candidateId: 'UZB-IELTS-784019',
  testDate: '07 Sep 2026',
  testType: 'IELTS Academic (Computer-Delivered Simulation)',
  overallBand: 7.5,
  scores: {
    listening: 8.0,
    reading: 7.5,
    writing: 7.0,
    speaking: 7.5,
  },
  cefrLevel: 'C1',
  verificationCode: 'IELTIX-7840-X9K2',
  qrPayload: 'https://ieltix.uz/verify/REP-2026-98124?sig=c4ca4238a0b923820dcc509a6f75849b',
  percentile: 94,
};
