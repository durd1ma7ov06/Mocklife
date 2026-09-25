import React, { useState, useEffect, useRef } from 'react';
import { useExam } from '../context/ExamContext.js';
import { useUser } from '../context/UserContext.js';

// --- Question Types & Interfaces ---
export type ListeningQuestionType = 
  | 'FORM_COMPLETION' 
  | 'NOTE_COMPLETION' 
  | 'MAP_LABELLING' 
  | 'MULTIPLE_CHOICE' 
  | 'MATCHING_FEATURES' 
  | 'TABLE_COMPLETION';

export interface ListeningQuestionItem {
  id: number;
  part: 1 | 2 | 3 | 4;
  type: ListeningQuestionType;
  prompt: string;
  options?: string[]; // for multiple-choice or map pins
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  transcriptTimestamp: string;
  prefix?: string;
  suffix?: string;
}

export interface MapPin {
  label: string;
  x: number;
  y: number;
  hint: string;
}

export interface MapData {
  imageTitle: string;
  description: string;
  pins: MapPin[];
}

export interface ListeningTestItem {
  id: string;
  partNumber: 1 | 2 | 3 | 4;
  testIndex: number;
  title: string;
  domain: string;
  context: string;
  audioDurationMin: number;
  targetBand: string;
  questionTypes: ListeningQuestionType[];
  wordLimit: string;
  scenario: string;
  audioNarrationText: string;
  fullTranscript: string;
  mapData?: MapData;
  questions: ListeningQuestionItem[];
}

export interface PartMeta {
  partNumber: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  typicalFormat: string;
  targetBand: string;
  colorHex: string;
  accentClass: string;
  borderClass: string;
  bgSoft: string;
  icon: string;
  typicalQuestionTypes: string[];
  strategyNote: string;
}

// --- Signpost / Vocab item for Listening Word Bank ---
export interface ListeningVocabItem {
  id: string;
  category: 'Signpost Transition' | 'Distractor Trap' | 'Academic Collocation' | 'Spelling Trap';
  phrase: string;
  definition: string;
  uzbekMeaning: string;
  exampleInAudio: string;
  cefr: 'B2' | 'C1' | 'C2';
}

// --- IELTS 4-Part Metas ---
export const PART_METAS: Record<1 | 2 | 3 | 4, PartMeta> = {
  1: {
    partNumber: 1,
    title: 'Part 1: Social & Everyday Dialogue',
    subtitle: 'Everyday Accommodation, Registrations & Customer Service',
    typicalFormat: '2 speakers • 10 questions • Form & Notes Completion',
    targetBand: 'Band 6.5 – 7.5',
    colorHex: '#0284C7',
    accentClass: 'text-[#0284C7]',
    borderClass: 'border-sky-500/40',
    bgSoft: 'bg-sky-500/5',
    icon: 'chat',
    typicalQuestionTypes: ['Form Completion', 'Notes Completion', 'Table Completion'],
    strategyNote: 'Anticipate numbers, names, dates, and postal codes. Beware of speakers correcting themselves midway!'
  },
  2: {
    partNumber: 2,
    title: 'Part 2: Public Talk & Guided Tour',
    subtitle: 'Local Attractions, Nature Reserves & Community Facilities',
    typicalFormat: '1 speaker • 10 questions • Map Labelling & Multiple Choice',
    targetBand: 'Band 7.0 – 8.0',
    colorHex: '#10B981',
    accentClass: 'text-[#10B981]',
    borderClass: 'border-emerald-500/40',
    bgSoft: 'bg-emerald-500/5',
    icon: 'explore',
    typicalQuestionTypes: ['Map / Diagram Labelling', 'Multiple Choice', 'Pick 2 from 5'],
    strategyNote: 'Follow spatial directional cues (clockwise, north/south, right opposite, adjacent to, behind the pavilion).'
  },
  3: {
    partNumber: 3,
    title: 'Part 3: Academic Tutorial & Research',
    subtitle: 'University Students & Professor Research Discussion',
    typicalFormat: '2–3 speakers • 10 questions • Multiple Choice & Matching',
    targetBand: 'Band 7.5 – 8.5',
    colorHex: '#8B5CF6',
    accentClass: 'text-[#8B5CF6]',
    borderClass: 'border-purple-500/40',
    bgSoft: 'bg-purple-500/5',
    icon: 'school',
    typicalQuestionTypes: ['Multiple Choice', 'Matching Features', 'Opinion Attribution'],
    strategyNote: 'Track speakers by name and vocal timbre. Identify consensus vs disagreement and nuanced hedging.'
  },
  4: {
    partNumber: 4,
    title: 'Part 4: University Academic Lecture',
    subtitle: 'Cognitive Neuroscience, Archaeology & Scientific Innovations',
    typicalFormat: '1 speaker monologue • 10 questions • No pause in audio',
    targetBand: 'Band 8.0 – 9.0',
    colorHex: '#FF7A00',
    accentClass: 'text-[#FF7A00]',
    borderClass: 'border-amber-500/40',
    bgSoft: 'bg-amber-500/5',
    icon: 'psychology',
    typicalQuestionTypes: ['Lecture Summary', 'Flow-chart Completion', 'Notes Completion'],
    strategyNote: 'Audio plays without any mid-way pause! Listen for signposting words ("Turning now to...", "Crucially...").'
  }
};

// --- Listening Signpost & Vocab Bank ---
export const LISTENING_VOCAB_BANK: ListeningVocabItem[] = [
  {
    id: 'lv-1',
    category: 'Signpost Transition',
    phrase: 'Turning now to...',
    definition: 'Indicates the speaker is changing focus to the next topic or slide in a lecture.',
    uzbekMeaning: 'Endi keyingi mavzuga o\'tsak...',
    exampleInAudio: 'Turning now to the neurobiological mechanisms of memory transfer...',
    cefr: 'C1',
  },
  {
    id: 'lv-2',
    category: 'Distractor Trap',
    phrase: 'I originally thought..., but actually...',
    definition: 'Classic IELTS distractor where the initial number or date is immediately corrected.',
    uzbekMeaning: 'Avval shunday deb o\'ylagandim, lekin aslida...',
    exampleInAudio: 'I originally planned on Tuesday, but actually Thursday works best.',
    cefr: 'B2',
  },
  {
    id: 'lv-3',
    category: 'Signpost Transition',
    phrase: 'What surprised researchers most...',
    definition: 'Highlights the most significant experimental finding, usually answering a key question.',
    uzbekMeaning: 'Tadqiqotchilarni eng hayratlantirgan narsa...',
    exampleInAudio: 'What surprised us most was the moisture retention under solar panels.',
    cefr: 'C1',
  },
  {
    id: 'lv-4',
    category: 'Academic Collocation',
    phrase: 'Thermodynamic barrier',
    definition: 'An energetic threshold that prevents or slows down a chemical or biological reaction.',
    uzbekMeaning: 'Termodinamik to\'siq / energiya cheklovi',
    exampleInAudio: 'How do you propose overcoming this thermodynamic barrier in cold water?',
    cefr: 'C2',
  },
  {
    id: 'lv-5',
    category: 'Spelling Trap',
    phrase: 'Accommodation vs Acomodation',
    definition: 'High-frequency Part 1 spelling trap requiring double C and double M.',
    uzbekMeaning: 'Turar joy (qo\'shaloq c va m bilan yoziladi)',
    exampleInAudio: 'Meadowlands Eco-Housing Community offers student accommodation.',
    cefr: 'B2',
  },
  {
    id: 'lv-6',
    category: 'Distractor Trap',
    phrase: 'Rather than / In place of...',
    definition: 'Signals that the speaker is rejecting an alternative option in favor of another.',
    uzbekMeaning: '...ning o\'rniga / bundan ko\'ra',
    exampleInAudio: 'Rather than mechanical recycling, we explored biological catalysts.',
    cefr: 'C1',
  },
  {
    id: 'lv-7',
    category: 'Academic Collocation',
    phrase: 'Memory consolidation',
    definition: 'The biological process by which temporary memories are transformed into long-term storage.',
    uzbekMeaning: 'Xotirani mustahkamlash / uzoq muddatga o\'tkazish',
    exampleInAudio: 'Slow-wave sleep is vital for synaptic memory consolidation.',
    cefr: 'C2',
  },
  {
    id: 'lv-8',
    category: 'Spelling Trap',
    phrase: 'Quiescence',
    definition: 'A state or period of inactivity or dormancy (tricky spelling with sc).',
    uzbekMeaning: 'Sokinlik, passiv dam olish holati',
    exampleInAudio: 'Sleep was mischaracterized as a state of physiological quiescence.',
    cefr: 'C2',
  },
];

// --- Comprehensive 4-Part Practice Question Bank ---
export const ALL_LISTENING_TESTS: ListeningTestItem[] = [
  // =========================================================================
  // PART 1 TESTS (Social & Everyday Dialogue)
  // =========================================================================
  {
    id: 'l1-eco-housing',
    partNumber: 1,
    testIndex: 1,
    title: 'Eco-Community Tenancy & Studio Rental Inquiry',
    domain: 'Everyday Accommodation & Green Living',
    context: 'A phone conversation between a prospective tenant (Sarah) and an eco-lodge housing manager (Marcus).',
    audioDurationMin: 6,
    targetBand: 'Band 6.5 – 7.5',
    questionTypes: ['FORM_COMPLETION'],
    wordLimit: 'ONE WORD AND/OR A NUMBER',
    scenario: 'Inquiry regarding tenancy commencement, weekly rent, refundable deposit, and communal eco-amenities.',
    audioNarrationText: 'International English Language Testing System. Listening Part 1. You will hear a telephone conversation between a prospective tenant, Sarah, and Marcus, the manager of Meadowlands Eco-Housing Community. Look at questions 1 to 10.',
    fullTranscript: `MARCUS: Good morning, Meadowlands Eco-Housing Community. Marcus speaking, how can I assist you today?
SARAH: Oh hello Marcus! My name is Sarah Jenkins. I saw your advertisement regarding the sustainable studio apartments available for autumn term, and I'd like to ask a few questions.
MARCUS: Wonderful Sarah! Let me pull up our tenancy inquiry form. First of all, could you confirm your preferred move-in date?
SARAH: Yes, my semester starts on the twenty-fourth, so ideally I would like to move in on the 18th of September.
MARCUS: Perfect, the 18th of September is when our post-summer refurbishments conclude. And what is your contact telephone number?
SARAH: It is 07700 900452.
MARCUS: 07700 900452, excellent. Now regarding the apartment specifications: all our units have double glazing and solar water heating. Which apartment category are you interested in?
SARAH: I am looking for the Studio Plus with a private balcony facing the botanical garden.
MARCUS: Studio Plus, got it. The weekly rental fee for that unit is £185, which includes high-speed fiber internet and geothermal heating.
SARAH: That fits my budget nicely! And what about the security deposit?
MARCUS: The refundable deposit is £450, payable upon signing the tenancy agreement.
SARAH: Understood. Are there laundry facilities on-site?
MARCUS: Yes, every floor has a shared eco-laundry room equipped with washing machines and a solar dryer. You don't need coins; it is activated via a digital keycard.
SARAH: Oh, that's so convenient! And what about transport? Is there secure storage for a bicycle?
MARCUS: Absolutely. We have a sheltered, CCTV-monitored bicycle shed next to the main entrance. Car parking is limited to electric vehicles only.
SARAH: That is fantastic because I cycle everywhere. Lastly, is there a quiet study room or communal workspace?
MARCUS: Yes, our Pavilion Lounge on the top floor is open 24/7 for quiet study.
SARAH: Splendid! I will email you the formal reservation packet right away.`,
    questions: [
      {
        id: 1,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Preferred move-in date:',
        correctAnswer: '18th September',
        acceptableAnswers: ['18 September', '18th of September', 'September 18th', 'September 18'],
        explanation: 'Marcus confirms the date when refurbishments conclude: "the 18th of September".',
        transcriptTimestamp: '01:15',
        prefix: '1.',
      },
      {
        id: 2,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Contact telephone number: 07700',
        correctAnswer: '900452',
        acceptableAnswers: ['900452', '900 452'],
        explanation: 'Sarah gives her contact phone number as: 07700 900452.',
        transcriptTimestamp: '01:42',
        prefix: '2. 07700',
      },
      {
        id: 3,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Weekly rental price (inclusive of utilities): £',
        correctAnswer: '185',
        acceptableAnswers: ['185', '185 pounds'],
        explanation: 'Marcus states: "The weekly rental fee for that unit is £185".',
        transcriptTimestamp: '02:18',
        prefix: '3. £',
      },
      {
        id: 4,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Refundable security deposit amount: £',
        correctAnswer: '450',
        acceptableAnswers: ['450'],
        explanation: 'Marcus mentions: "The refundable deposit is £450, payable upon signing".',
        transcriptTimestamp: '02:45',
        prefix: '4. £',
      },
      {
        id: 5,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Shared laundry machines operate using a digital',
        correctAnswer: 'keycard',
        acceptableAnswers: ['keycard', 'key card', 'card'],
        explanation: 'Marcus explains: "it is activated via a digital keycard".',
        transcriptTimestamp: '03:20',
        prefix: '5. digital',
      },
      {
        id: 6,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Sheltered CCTV-monitored storage is provided for a',
        correctAnswer: 'bicycle',
        acceptableAnswers: ['bicycle', 'bike'],
        explanation: 'Marcus points out: "sheltered, CCTV-monitored bicycle shed next to the main entrance".',
        transcriptTimestamp: '04:05',
        prefix: '6.',
      },
      {
        id: 7,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Communal 24/7 top-floor study workspace is called the',
        correctAnswer: 'Pavilion',
        acceptableAnswers: ['Pavilion', 'pavilion lounge', 'Pavilion Lounge'],
        explanation: 'Marcus says: "our Pavilion Lounge on the top floor is open 24/7".',
        transcriptTimestamp: '04:48',
        prefix: '7.',
        suffix: 'Lounge',
      },
      {
        id: 8,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Car parking permits are strictly reserved for',
        correctAnswer: 'electric',
        acceptableAnswers: ['electric', 'electric vehicles'],
        explanation: 'Marcus explains parking is limited to electric vehicles only.',
        transcriptTimestamp: '05:12',
        prefix: '8.',
        suffix: 'vehicles only',
      },
      {
        id: 9,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Apartment windows are equipped with energy-saving double',
        correctAnswer: 'glazing',
        acceptableAnswers: ['glazing', 'glazed windows'],
        explanation: 'Marcus confirms: "all our units have double glazing".',
        transcriptTimestamp: '05:35',
        prefix: '9. double',
      },
      {
        id: 10,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Formal reservation packet will be transmitted via',
        correctAnswer: 'email',
        acceptableAnswers: ['email', 'e-mail'],
        explanation: 'Marcus concludes: "I will email you the formal reservation packet right away".',
        transcriptTimestamp: '05:55',
        prefix: '10.',
      },
    ],
  },
  {
    id: 'l1-sports-complex',
    partNumber: 1,
    testIndex: 2,
    title: 'University Sports Center Membership & Equipment',
    domain: 'Fitness, Health & Campus Facilities',
    context: 'A postgraduate student (David) signing up for a fitness membership at the campus sports pavilion.',
    audioDurationMin: 6,
    targetBand: 'Band 6.5 – 7.5',
    questionTypes: ['FORM_COMPLETION'],
    wordLimit: 'ONE WORD AND/OR A NUMBER',
    scenario: 'Registration covering Gold tier access, swimming pool, locker hire fees, and safety induction.',
    audioNarrationText: 'International English Language Testing System. Listening Part 1. You will hear a receptionist registering a university student for a sports facility membership. Look at questions 1 to 10.',
    fullTranscript: `RECEPTIONIST: Welcome to Oxford Riverside Sports Complex. How can I help you?
STUDENT: Hi! I'm starting my postgraduate course this semester and I'd like to join the gym and swimming pool.
RECEPTIONIST: Brilliant. Let's get you registered. May I have your full name and student ID?
STUDENT: David Chen, ID number S-94821.
RECEPTIONIST: And your contact email address?
STUDENT: david.chen98@campus.ac.uk.
RECEPTIONIST: Excellent. We offer three tiers: Bronze, Silver, and Gold. The Gold tier includes unlimited Olympic pool access, all group fitness classes, and free sauna. It costs £32 per month.
STUDENT: That sounds ideal. Does that include personal locker rental?
RECEPTIONIST: Locker rental is an additional £5 per month, or £45 for the entire annual academic year.
STUDENT: I'll take the annual option. When can I complete my compulsory safety induction?
RECEPTIONIST: We have slots tomorrow at 10:30 AM or Thursday at 4:00 PM.
STUDENT: Thursday at 4:00 PM works best with my lecture schedule.
RECEPTIONIST: Perfect. Please remember to wear proper indoor trainers and bring your student pass.`,
    questions: [
      {
        id: 1,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Student ID Number: S-',
        correctAnswer: '94821',
        acceptableAnswers: ['94821'],
        explanation: 'David confirms his student ID as S-94821.',
        transcriptTimestamp: '01:05',
        prefix: '1. S-',
      },
      {
        id: 2,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Monthly membership fee for Gold tier: £',
        correctAnswer: '32',
        acceptableAnswers: ['32', '32 pounds'],
        explanation: 'The receptionist states: "It costs £32 per month".',
        transcriptTimestamp: '01:45',
        prefix: '2. £',
      },
      {
        id: 3,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Discounted annual rental fee for a personal locker: £',
        correctAnswer: '45',
        acceptableAnswers: ['45'],
        explanation: 'Receptionist confirms £45 for the entire annual academic year.',
        transcriptTimestamp: '02:15',
        prefix: '3. £',
      },
      {
        id: 4,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Selected compulsory safety induction day and time: Thursday at',
        correctAnswer: '4:00 PM',
        acceptableAnswers: ['4:00 PM', '4 PM', '4:00pm', '16:00'],
        explanation: 'David selects Thursday at 4:00 PM.',
        transcriptTimestamp: '02:50',
        prefix: '4. Thursday at',
      },
      {
        id: 5,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Compulsory footwear required inside gym: indoor',
        correctAnswer: 'trainers',
        acceptableAnswers: ['trainers', 'sneakers', 'shoes'],
        explanation: 'Receptionist says: "Please remember to wear proper indoor trainers".',
        transcriptTimestamp: '03:15',
        prefix: '5. indoor',
      },
      {
        id: 6,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Gold membership includes free access to the steam room and',
        correctAnswer: 'sauna',
        acceptableAnswers: ['sauna'],
        explanation: 'Receptionist highlights free sauna and pool access.',
        transcriptTimestamp: '03:40',
        prefix: '6.',
      },
      {
        id: 7,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Membership pass can also be stored digitally on a mobile',
        correctAnswer: 'app',
        acceptableAnswers: ['app', 'application', 'phone'],
        explanation: 'Digital access passes are available through the university mobile app.',
        transcriptTimestamp: '04:10',
        prefix: '7. mobile',
      },
      {
        id: 8,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'International emergency contact dial code: +44',
        correctAnswer: '7911',
        acceptableAnswers: ['7911'],
        explanation: 'David provides the four-digit emergency prefix.',
        transcriptTimestamp: '04:35',
        prefix: '8. +44',
      },
      {
        id: 9,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'Clean towels are supplied free of charge for registered',
        correctAnswer: 'swimmers',
        acceptableAnswers: ['swimmers', 'swimming', 'pool users'],
        explanation: 'Receptionist notes free towel service is provided for swimmers.',
        transcriptTimestamp: '05:00',
        prefix: '9.',
      },
      {
        id: 10,
        part: 1,
        type: 'FORM_COMPLETION',
        prompt: 'First monthly debit payment processed on the 1st of',
        correctAnswer: 'October',
        acceptableAnswers: ['October', 'Oct'],
        explanation: 'Billing commences on 1st October.',
        transcriptTimestamp: '05:25',
        prefix: '10. 1st of',
      },
    ],
  },

  // =========================================================================
  // PART 2 TESTS (Public Talk & Guided Tour)
  // =========================================================================
  {
    id: 'l2-nature-reserve',
    partNumber: 2,
    testIndex: 1,
    title: 'Green Valley Nature Reserve & Trail Layout',
    domain: 'Parks, Ecology & Guided Public Briefing',
    context: 'A head park ranger briefing a group of weekend tourists before starting a wilderness trail.',
    audioDurationMin: 6,
    targetBand: 'Band 7.0 – 8.0',
    questionTypes: ['MAP_LABELLING', 'MULTIPLE_CHOICE'],
    wordLimit: 'Choose ONE letter A–G',
    scenario: 'Tour guide explaining spatial map layout, pedestrian bridges, bird observatory, and wildlife rules.',
    audioNarrationText: 'International English Language Testing System. Listening Part 2. You will hear a park ranger briefing visitors about the layout of Green Valley Nature Reserve. Look at questions 11 to 20.',
    fullTranscript: `GUIDE: Welcome everyone to Green Valley Nature Reserve! Before we set off on our afternoon exploration, please look at the orientation map displayed on the board.
We are currently standing right here at the South Gate Visitor Entrance, just beside the main ticket pavilion.
If you walk straight ahead along the main central walkway, you will reach the Central Fountain in about two hundred meters.
Now, if you turn left immediately after the entrance and follow the willow path westward, you will find the Heritage Herb Garden in the southwestern corner (Location A).
Continuing past the herb garden along the perimeter fence, you will come to our Solar Energy Pavilion (Location B), where all the park's electricity is generated.
Now, looking back toward the Central Fountain: if you take the northern path crossing over the wooden bridge, right in the center of the lake is our famous Bird Observatory (Location D).
To the east of the bridge, tucked behind the pine grove, is the Children's Adventure Playground (Location E), which has treehouses and wooden obstacle courses.
For those looking for refreshments, follow the eastern path straight from the South Gate along the rose hedge: you will arrive at the Dragonfly Cafe & Terrace (Location F).
Directly behind the cafe, in the northeastern zone, is the Wildflower Meadow & Bee Sanctuary (Location G).
Please remember: stay on the designated boardwalks to protect fragile alpine mosses, and dispose of all trash in the bear-proof recycling bins. Enjoy your visit!`,
    mapData: {
      imageTitle: 'Green Valley Nature Reserve Map',
      description: 'Interactive map layout with locations A to G relative to South Gate Entrance.',
      pins: [
        { label: 'A', x: 18, y: 78, hint: 'Southwestern corner along willow path' },
        { label: 'B', x: 15, y: 38, hint: 'Western perimeter behind herb garden' },
        { label: 'C', x: 42, y: 58, hint: 'Central Fountain courtyard' },
        { label: 'D', x: 50, y: 28, hint: 'Island in middle of lake across wooden bridge' },
        { label: 'E', x: 72, y: 34, hint: 'East of wooden bridge behind pine grove' },
        { label: 'F', x: 82, y: 72, hint: 'Eastern path along rose hedge' },
        { label: 'G', x: 86, y: 22, hint: 'Northeastern zone behind cafe' },
      ],
    },
    questions: [
      {
        id: 11,
        part: 2,
        type: 'MAP_LABELLING',
        prompt: 'Heritage Herb Garden',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        correctAnswer: 'A',
        explanation: 'Guide states: "turn left immediately after the entrance... find the Heritage Herb Garden in the southwestern corner (Location A)".',
        transcriptTimestamp: '07:20',
      },
      {
        id: 12,
        part: 2,
        type: 'MAP_LABELLING',
        prompt: 'Solar Energy Pavilion',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        correctAnswer: 'B',
        explanation: 'Guide states: "Continuing past the herb garden along the perimeter fence, you will come to our Solar Energy Pavilion (Location B)".',
        transcriptTimestamp: '07:45',
      },
      {
        id: 13,
        part: 2,
        type: 'MAP_LABELLING',
        prompt: 'Bird Observatory',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        correctAnswer: 'D',
        explanation: 'Guide states: "taking the northern path crossing over the wooden bridge, right in the center of the lake is our famous Bird Observatory (Location D)".',
        transcriptTimestamp: '08:15',
      },
      {
        id: 14,
        part: 2,
        type: 'MAP_LABELLING',
        prompt: 'Children\'s Adventure Playground',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        correctAnswer: 'E',
        explanation: 'Guide states: "To the east of the bridge, tucked behind the pine grove, is the Children\'s Adventure Playground (Location E)".',
        transcriptTimestamp: '08:42',
      },
      {
        id: 15,
        part: 2,
        type: 'MAP_LABELLING',
        prompt: 'Dragonfly Cafe & Terrace',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        correctAnswer: 'F',
        explanation: 'Guide states: "follow the eastern path straight from the South Gate... arrive at the Dragonfly Cafe & Terrace (Location F)".',
        transcriptTimestamp: '09:08',
      },
      {
        id: 16,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'According to the ranger, how must visitors protect fragile alpine mosses?',
        options: [
          'A. Avoid taking photographs near the water',
          'B. Remain strictly on designated boardwalks',
          'C. Wear specialized rubber safety footwear',
          'D. Visit only during morning sunshine hours',
        ],
        correctAnswer: 'B',
        explanation: 'The guide explicitly says: "Please remember: stay on the designated boardwalks to protect fragile alpine mosses".',
        transcriptTimestamp: '09:35',
      },
      {
        id: 17,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What special waste disposal feature is installed across the reserve?',
        options: [
          'A. Solar-powered thermal incinerators',
          'B. Underground pneumatic vacuum tubes',
          'C. Bear-proof recycling bins',
          'D. Daily manual collection bags',
        ],
        correctAnswer: 'C',
        explanation: 'Guide mentions: "dispose of all trash in the bear-proof recycling bins".',
        transcriptTimestamp: '09:50',
      },
      {
        id: 18,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'When was the clean Solar Energy Pavilion constructed?',
        options: [
          'A. During last winter\'s overhaul',
          'B. Over ten years ago',
          'C. When the reserve first opened in 1995',
          'D. As part of the recent clean energy initiative',
        ],
        correctAnswer: 'D',
        explanation: 'The guide clarifies it was built as the flagship of the clean energy initiative.',
        transcriptTimestamp: '10:10',
      },
      {
        id: 19,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What activity is strictly prohibited inside the nature reserve?',
        options: [
          'A. Bringing personal reusable water bottles',
          'B. Off-path mountain biking and open fires',
          'C. Birdwatching with optical binoculars',
          'D. Walking dogs on short leashes',
        ],
        correctAnswer: 'B',
        explanation: 'The guide reminds visitors that open fires and off-path biking are strictly forbidden.',
        transcriptTimestamp: '10:30',
      },
      {
        id: 20,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Where can visitors collect printed botanical trail guides?',
        options: [
          'A. At the Dragonfly Cafe',
          'B. Inside the Bird Observatory',
          'C. At the South Gate Visitor Entrance',
          'D. Near the Wildflower Meadow',
        ],
        correctAnswer: 'C',
        explanation: 'Trail guides are available at the South Gate Visitor Entrance pavilion.',
        transcriptTimestamp: '10:55',
      },
    ],
  },
  {
    id: 'l2-art-gallery',
    partNumber: 2,
    testIndex: 2,
    title: 'Metropolitan Art Museum • Victorian Wing Restoration',
    domain: 'Art History, Museum Layout & Architecture',
    context: 'A museum curator welcoming visitors to the newly unveiled Victorian and Impressionist galleries.',
    audioDurationMin: 6,
    targetBand: 'Band 7.0 – 8.0',
    questionTypes: ['MULTIPLE_CHOICE'],
    wordLimit: 'Choose ONE letter A, B, or C',
    scenario: 'Guided overview of architectural skylights, 3D tactile installations for the visually impaired, and cafe rules.',
    audioNarrationText: 'International English Language Testing System. Listening Part 2. You will hear an art museum curator guiding visitors through the newly restored Victorian Wing. Look at questions 11 to 20.',
    fullTranscript: `CURATOR: Good morning art lovers. Welcome to the newly restored Grand Wing of the Metropolitan Art Museum.
Our major renovation was completed after three years of meticulous acoustic and architectural preservation.
The central atrium now features triple-glazed acoustic skylights that filter out 99% of harmful ultraviolet radiation while flooding the sculpture garden with natural illumination.
On your left is the 19th Century Impressionist salon, showcasing masterpieces by Monet, Renoir, and Degas.
On your right, you will find the Contemporary Interactive Media Room, where tactile sensory installations allow visually impaired visitors to experience 3D relief sculptures.
Audio guides are available in nine languages from the information desk right next to the gift shop.`,
    questions: [
      {
        id: 11,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'How long did the comprehensive gallery restoration project take?',
        options: ['A. One year', 'B. Three years', 'C. Five years'],
        correctAnswer: 'B',
        explanation: 'Curator states: "completed after three years of meticulous acoustic and architectural preservation".',
        transcriptTimestamp: '06:10',
      },
      {
        id: 12,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What primary preservation benefit is provided by the new triple-glazed skylights?',
        options: [
          'A. Generating solar electricity for the cafe',
          'B. Filtering out 99% of harmful UV rays while admitting natural light',
          'C. Opening automatically during heavy rainfall',
        ],
        correctAnswer: 'B',
        explanation: 'Curator notes: "filter out 99% of harmful ultraviolet radiation while flooding the sculpture garden".',
        transcriptTimestamp: '06:45',
      },
      {
        id: 13,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'How does the Contemporary Media Room cater to visually impaired visitors?',
        options: [
          'A. Using scented atmospheric diffusers',
          'B. Providing tactile 3D relief sculptures and sensory installations',
          'C. Offering real-time sign language translators',
        ],
        correctAnswer: 'B',
        explanation: 'Curator explains: "tactile sensory installations allow visually impaired visitors to experience 3D relief sculptures".',
        transcriptTimestamp: '07:20',
      },
      {
        id: 14,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'In how many languages are the digital handheld audio guides available?',
        options: ['A. Five', 'B. Nine', 'C. Twelve'],
        correctAnswer: 'B',
        explanation: 'Curator states audio guides are available in nine languages.',
        transcriptTimestamp: '07:55',
      },
      {
        id: 15,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Where is the main visitor information desk situated?',
        options: ['A. Directly inside the cafe', 'B. Next to the gift shop', 'C. On the upper mezzanine'],
        correctAnswer: 'B',
        explanation: 'Curator states it is "right next to the gift shop".',
        transcriptTimestamp: '08:20',
      },
      {
        id: 16,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Camera flash photography is banned in the Impressionist salon because it:',
        options: ['A. Disturbs other patrons', 'B. Accelerates irreversible pigment oxidation', 'C. Triggers infrared motion sensors'],
        correctAnswer: 'B',
        explanation: 'Pigment preservation requires strict prohibition of camera flash.',
        transcriptTimestamp: '08:45',
      },
      {
        id: 17,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Which famous painter has original canvases in the salon?',
        options: ['A. Monet and Renoir', 'B. Picasso and Dali', 'C. Leonardo da Vinci'],
        correctAnswer: 'A',
        explanation: 'Curator cites Monet, Renoir, and Degas.',
        transcriptTimestamp: '09:10',
      },
      {
        id: 18,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'The museum cafe sources all its dairy and bakery items from:',
        options: ['A. Local certified organic farms', 'B. International catering suppliers', 'C. Direct rooftop hydroponic gardens'],
        correctAnswer: 'A',
        explanation: 'Local certified organic farms supply the museum cafe.',
        transcriptTimestamp: '09:35',
      },
      {
        id: 19,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'General admission is completely free of charge on which evening each week?',
        options: ['A. Tuesday', 'B. Thursday', 'C. Friday'],
        correctAnswer: 'C',
        explanation: 'Friday evenings provide free public entry for all visitors.',
        transcriptTimestamp: '10:00',
      },
      {
        id: 20,
        part: 2,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What historical architectural style does the restored Grand Wing exhibit?',
        options: ['A. Neoclassical', 'B. Victorian', 'C. Brutalist'],
        correctAnswer: 'B',
        explanation: 'Curator explicitly refers to the Victorian Grand Wing.',
        transcriptTimestamp: '10:25',
      },
    ],
  },

  // =========================================================================
  // PART 3 TESTS (Academic Tutorial & Research)
  // =========================================================================
  {
    id: 'l3-ocean-enzymes',
    partNumber: 3,
    testIndex: 1,
    title: 'Ocean Plastic Biodegradation & Bacterial Enzymes',
    domain: 'Marine Biology & Bio-Engineering',
    context: 'Two postgraduate researchers (Liam and Chloe) reviewing deep-sea plastic degradation with Professor Howard.',
    audioDurationMin: 7,
    targetBand: 'Band 7.5 – 8.5',
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING_FEATURES'],
    wordLimit: 'Choose ONE letter A, B, or C',
    scenario: 'Discussion covering Ideonella sakaiensis PETase enzymes, low ocean temperatures, and hyperbaric pressure testing.',
    audioNarrationText: 'International English Language Testing System. Listening Part 3. You will hear two postgraduate students, Liam and Chloe, discussing their marine biochemistry research project with their professor, Dr. Howard. Look at questions 21 to 30.',
    fullTranscript: `DR. HOWARD: Good afternoon Liam, Chloe. Let's examine your research proposal on synthetic plastic degradation in benthic ocean sediments. Liam, what prompted you to focus on bacterial PETase enzymes?
LIAM: Well, Dr. Howard, standard mechanical recycling loses polymer integrity after just two cycles. When we discovered the bacterium Ideonella sakaiensis in 2016, it demonstrated that engineered biological catalysts could break down polyethylene terephthalate into harmless organic monomers within hours, rather than centuries.
CHLOE: However, our main challenge during marine application is the ambient ocean temperature. Natural PETase operates optimally at 30 to 40 degrees Celsius, but benthic ocean temperatures average just 4 degrees Celsius.
DR. HOWARD: Exactly Chloe. How do you propose overcoming this thermodynamic barrier?
LIAM: We are exploring dual-enzyme synergistic cocktails combining engineered cold-adapted esterases with thermophilic variants that have undergone computational rational mutagenesis.
CHLOE: In preliminary trials, mutating the residue position 233 from alanine to tryptophan enhanced catalytic efficiency at low temperatures by nearly 300 percent.
DR. HOWARD: That is a remarkable increase. But what about potential ecological toxicity to phytoplankton and benthic crustaceans?
CHLOE: We conducted 72-hour bioassays on Daphnia magna and marine microalgae. The byproduct terephthalic acid showed negligible cellular cytotoxicity at concentrations up to 50 milligrams per liter.
DR. HOWARD: Good. Now let us review the methodology for your deep-sea simulation chamber. How will you replicate hydrothermal pressure?
LIAM: We've acquired a titanium hyperbaric vessel capable of sustaining hydrostatic pressures up to 60 Megapascals, equivalent to a depth of six thousand meters.
DR. HOWARD: Excellent preparation. For next week, please finalize your spectrophotometric calibration curves and ensure your control samples exclude ultraviolet exposure.`,
    questions: [
      {
        id: 21,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Why did Liam decide to investigate biological PETase enzymes rather than mechanical recycling?',
        options: [
          'A. Mechanical recycling loses polymer integrity after two cycles',
          'B. Mechanical recycling is banned in high-seas international waters',
          'C. Biological enzymes are cheaper to manufacture in standard chemical plants',
        ],
        correctAnswer: 'A',
        explanation: 'Liam points out: "standard mechanical recycling loses polymer integrity after just two cycles".',
        transcriptTimestamp: '13:00',
      },
      {
        id: 22,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What is the primary thermodynamic obstacle when deploying enzymes in deep ocean benthic sediments?',
        options: [
          'A. Excessive salinity degrading tertiary protein folds',
          'B. Cold ambient water temperatures averaging around 4°C compared to enzyme optimums of 30-40°C',
          'C. High dissolved oxygen concentrations accelerating oxidative decay',
        ],
        correctAnswer: 'B',
        explanation: 'Chloe explains: "Natural PETase operates optimally at 30 to 40 degrees Celsius, but benthic ocean temperatures average just 4 degrees Celsius".',
        transcriptTimestamp: '13:40',
      },
      {
        id: 23,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'How did the researchers boost catalytic efficiency at lower temperatures by nearly 300%?',
        options: [
          'A. By increasing substrate pressure to 100 atmospheres',
          'B. By mutating residue alanine 233 to tryptophan via rational computational design',
          'C. By adding heavy metal cofactors like zinc and copper',
        ],
        correctAnswer: 'B',
        explanation: 'Chloe states: "mutating the residue position 233 from alanine to tryptophan enhanced catalytic efficiency... by nearly 300 percent".',
        transcriptTimestamp: '14:25',
      },
      {
        id: 24,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What did the 72-hour toxicity bioassays on Daphnia magna reveal regarding terephthalic acid?',
        options: [
          'A. Severe toxicity requiring immediate chemical neutralization',
          'B. Negligible cellular cytotoxicity at concentrations up to 50 mg/L',
          'C. Irreversible mutations in microalgae chloroplast DNA',
        ],
        correctAnswer: 'B',
        explanation: 'Chloe notes: "The byproduct terephthalic acid showed negligible cellular cytotoxicity at concentrations up to 50 milligrams per liter".',
        transcriptTimestamp: '15:10',
      },
      {
        id: 25,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What material is the hyperbaric testing vessel constructed from?',
        options: [
          'A. Carbon-fiber reinforced resin',
          'B. Borosilicate tempered quartz glass',
          'C. High-grade titanium capable of sustaining 60 MPa',
        ],
        correctAnswer: 'C',
        explanation: 'Liam confirms: "We\'ve acquired a titanium hyperbaric vessel capable of sustaining hydrostatic pressures up to 60 Megapascals".',
        transcriptTimestamp: '15:45',
      },
      {
        id: 26,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Dr. Howard instructs that the laboratory control samples must strictly exclude:',
        options: ['A. Ultraviolet exposure', 'B. Ambient oxygen', 'C. Dissolved nitrogen', 'D. Bacterial spores'],
        correctAnswer: 'A',
        explanation: 'Dr. Howard advises: "ensure your control samples exclude ultraviolet exposure".',
        transcriptTimestamp: '16:15',
      },
      {
        id: 27,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'The year in which the plastic-degrading bacterium was first identified:',
        options: ['A. 2012', 'B. 2016', 'C. 2020', 'D. 2023'],
        correctAnswer: 'B',
        explanation: 'Liam explicitly mentions 2016 as the discovery year.',
        transcriptTimestamp: '16:35',
      },
      {
        id: 28,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Simulated ocean depth represented by 60 Megapascals of hydrostatic pressure:',
        options: ['A. 2,000 meters', 'B. 4,000 meters', 'C. 6,000 meters', 'D. 10,000 meters'],
        correctAnswer: 'C',
        explanation: 'Liam notes it is "equivalent to a depth of six thousand meters".',
        transcriptTimestamp: '16:50',
      },
      {
        id: 29,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Primary harmless organic byproduct resulting from PET enzymatic breakdown:',
        options: ['A. Terephthalic acid', 'B. Acetic acid', 'C. Hydrochloric acid', 'D. Nitric oxide'],
        correctAnswer: 'A',
        explanation: 'Chloe identifies the byproduct as terephthalic acid.',
        transcriptTimestamp: '17:10',
      },
      {
        id: 30,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Action item milestone assigned for the students\' next meeting:',
        options: [
          'A. Finalizing spectrophotometric calibration curves',
          'B. Publishing a draft in Nature Biotechnology',
          'C. Applying for patent licensing',
          'D. Field testing in the Mariana Trench',
        ],
        correctAnswer: 'A',
        explanation: 'Dr. Howard directs them to "finalize your spectrophotometric calibration curves".',
        transcriptTimestamp: '17:30',
      },
    ],
  },
  {
    id: 'l3-agro-voltaics',
    partNumber: 3,
    testIndex: 2,
    title: 'Agro-voltaics & Dual-Use Solar Farm Feasibility',
    domain: 'Agricultural Engineering & Clean Energy',
    context: 'Engineering students (Aisha and Tom) presenting microclimate data of crops beneath elevated solar arrays.',
    audioDurationMin: 7,
    targetBand: 'Band 7.5 – 8.5',
    questionTypes: ['MULTIPLE_CHOICE', 'MATCHING_FEATURES'],
    wordLimit: 'Choose ONE letter A, B, or C',
    scenario: 'Evaluating soil moisture conservation, spinach yield improvements, and solar cell cooling efficiencies.',
    audioNarrationText: 'International English Language Testing System. Listening Part 3. You will hear two renewable energy students discussing agro-voltaic solar farming data with Professor Lin. Look at questions 21 to 30.',
    fullTranscript: `AISHA: Professor Lin, Tom and I have evaluated the agricultural yield data under elevated bifacial photovoltaic panels.
TOM: What surprised us most was the moisture retention. In arid zones, the shading cast by the elevated solar panels reduced soil water evaporation by nearly 35 percent.
PROFESSOR LIN: That is a substantial water conservation metric. How did cool-season leafy crops like spinach and lettuce respond to the diffused solar spectra?
AISHA: Surprisingly, spinach yields increased by 18% compared to unshaded open-field controls, primarily because the panels shielded the plants from thermal heat stress during peak noon hours.
TOM: Furthermore, because crops transpire moisture beneath the panels, the localized ambient temperature dropped by 5 degrees Celsius, which actually boosted the photovoltaic efficiency of the solar cells by 3.2 percent!
PROFESSOR LIN: A mutually beneficial symbiotic loop: crops cool the panels, and panels conserve water for the crops!`,
    questions: [
      {
        id: 21,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'By what percentage did panel shading reduce soil water evaporation in arid conditions?',
        options: ['A. 15 percent', 'B. 35 percent', 'C. 50 percent'],
        correctAnswer: 'B',
        explanation: 'Tom states: "reduced soil water evaporation by nearly 35 percent".',
        transcriptTimestamp: '12:15',
      },
      {
        id: 22,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Why did spinach crop yields increase under the shaded solar arrays?',
        options: [
          'A. Panels attracted pollinating honeybees',
          'B. Plants were shielded from thermal heat stress during peak noon hours',
          'C. Fertilizer absorption doubled under blue wavelengths',
        ],
        correctAnswer: 'B',
        explanation: 'Aisha notes: "shielded the plants from thermal heat stress during peak noon hours".',
        transcriptTimestamp: '12:55',
      },
      {
        id: 23,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'How did plant transpiration underneath the panels positively impact the solar cells?',
        options: [
          'A. It lowered local ambient temperatures by 5°C, improving solar cell efficiency by 3.2%',
          'B. It formed a reflective mist layer',
          'C. It prevented dust build-up completely',
        ],
        correctAnswer: 'A',
        explanation: 'Tom states: "ambient temperature dropped by 5 degrees... boosted photovoltaic efficiency by 3.2 percent".',
        transcriptTimestamp: '13:40',
      },
      {
        id: 24,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What panel technology was utilized in this agro-voltaic trial?',
        options: ['A. Monofacial silicon', 'B. Elevated bifacial photovoltaic arrays', 'C. Thin-film perovskite sheets'],
        correctAnswer: 'B',
        explanation: 'Aisha mentions elevated bifacial photovoltaic panels.',
        transcriptTimestamp: '14:15',
      },
      {
        id: 25,
        part: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Professor Lin summarizes the mutual relationship as a:',
        options: ['A. High-risk economic venture', 'B. Mutually beneficial symbiotic loop', 'C. Temporary transition methodology'],
        correctAnswer: 'B',
        explanation: 'Prof. Lin terms it a "mutually beneficial symbiotic loop".',
        transcriptTimestamp: '14:45',
      },
      {
        id: 26,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Minimum vertical clearance required beneath panel structures for tractor passage:',
        options: ['A. 2.5 meters', 'B. 4.2 meters', 'C. 6.0 meters', 'D. 8.0 meters'],
        correctAnswer: 'B',
        explanation: '4.2 meters provides adequate clearance for standard machinery.',
        transcriptTimestamp: '15:10',
      },
      {
        id: 27,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Crop type showing greatest positive biomass response:',
        options: ['A. Spinach', 'B. Maize', 'C. Sugarcane', 'D. Sunflowers'],
        correctAnswer: 'A',
        explanation: 'Spinach demonstrated an 18% yield improvement.',
        transcriptTimestamp: '15:35',
      },
      {
        id: 28,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Primary capital cost driver identified by the engineers:',
        options: ['A. Structural steel framing', 'B. Battery storage cells', 'C. Water drip pipes', 'D. Sensor cabling'],
        correctAnswer: 'A',
        explanation: 'Elevated structural racking accounts for the majority of initial expenditure.',
        transcriptTimestamp: '16:00',
      },
      {
        id: 29,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Forecasted investment payback timeline for commercial adoption:',
        options: ['A. 3 years', 'B. 6.5 years', 'C. 12 years', 'D. 20 years'],
        correctAnswer: 'B',
        explanation: 'Economic models indicate full payback within 6.5 years.',
        transcriptTimestamp: '16:25',
      },
      {
        id: 30,
        part: 3,
        type: 'MATCHING_FEATURES',
        prompt: 'Target geographic region selected for second-stage field testing:',
        options: ['A. Southern Spain', 'B. Northern Scotland', 'C. Western Australia', 'D. Central Greece'],
        correctAnswer: 'A',
        explanation: 'Southern Spain was selected due to intense seasonal solar irradiance.',
        transcriptTimestamp: '16:50',
      },
    ],
  },

  // =========================================================================
  // PART 4 TESTS (University Academic Lecture)
  // =========================================================================
  {
    id: 'l4-sleep-neuroscience',
    partNumber: 4,
    testIndex: 1,
    title: 'Sleep Architecture & Synaptic Memory Consolidation',
    domain: 'Cognitive Neuroscience & Neurobiology',
    context: 'Professor Elena Rostova lecturing on non-REM slow-wave sleep, hippocampal ripples, and synaptic homeostasis.',
    audioDurationMin: 8,
    targetBand: 'Band 8.0 – 9.0',
    questionTypes: ['NOTE_COMPLETION'],
    wordLimit: 'NO MORE THAN TWO WORDS',
    scenario: 'Academic monologue exploring memory replay, hippocampal-to-neocortical transfer, and targeted reactivation.',
    audioNarrationText: 'International English Language Testing System. Listening Part 4. You will hear a university lecture delivered by Professor Elena Rostova on sleep architecture and synaptic memory consolidation. Look at questions 31 to 40.',
    fullTranscript: `PROFESSOR ROSTOVA: Welcome back colleagues. In today's cognitive neuroscience lecture, we are exploring the precise neurobiological mechanisms underpinning sleep-dependent memory consolidation.
For decades, scientists viewed sleep as a passive state of physiological quiescence. However, modern electroencephalography has revealed that during non-REM Slow-Wave Sleep, the brain engages in an exquisitely orchestrated two-stage memory transfer.
Initially, new episodic experiences are encoded temporarily in the hippocampus, which serves as a rapid-learning buffer with limited capacity.
During deep slow-wave sleep, characterized by cortical delta waves below one Hertz, the hippocampus generates bursts of high-frequency electrical activity known as sharp-wave ripples.
These ripples represent a compressed replay of the neural firing sequences that occurred during daytime learning, running up to twenty times faster than real-time waking experience.
Simultaneously, thalamocortical spindles coordinate with slow oscillations to create a synchronized temporal window. This precise phase-locking facilitates the long-term transfer of information from the temporary hippocampal store into the permanent neocortex.
Furthermore, according to the Synaptic Homeostasis Hypothesis, sleep performs a crucial downscaling function. During wakefulness, learning causes a net increase in synaptic strength across the brain. If left unchecked, this saturation would cause cognitive overload and catastrophic energy consumption.
Slow-wave sleep selectively prunes weaker, insignificant synaptic connections while preserving and stabilizing vital memory traces.
Recent clinical trials also demonstrate the therapeutic potential of Targeted Memory Reactivation, where subtle auditory cues or olfactory scents presented during slow oscillations can trigger targeted consolidation of specific foreign vocabulary or motor skills without waking the subject.
In conclusion, far from being downtime, sleep is an active, vital architect of human cognition and intellectual adaptability.`,
    questions: [
      {
        id: 31,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Historically, sleep was mischaracterized as a state of physiological',
        correctAnswer: 'quiescence',
        acceptableAnswers: ['quiescence', 'passive quiescence', 'rest'],
        explanation: 'Prof. Rostova notes: "scientists viewed sleep as a passive state of physiological quiescence".',
        transcriptTimestamp: '20:10',
        prefix: '31. physiological',
      },
      {
        id: 32,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'The temporary storage buffer for newly acquired episodic experiences is the',
        correctAnswer: 'hippocampus',
        acceptableAnswers: ['hippocampus'],
        explanation: 'Prof. Rostova confirms experiences are encoded temporarily in the hippocampus.',
        transcriptTimestamp: '20:45',
        prefix: '32.',
      },
      {
        id: 33,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'High-frequency bursts of hippocampal activity during deep sleep are termed sharp-wave',
        correctAnswer: 'ripples',
        acceptableAnswers: ['ripples', 'ripple waves'],
        explanation: 'Prof. Rostova describes "bursts of high-frequency electrical activity known as sharp-wave ripples".',
        transcriptTimestamp: '21:18',
        prefix: '33. sharp-wave',
      },
      {
        id: 34,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Replay of daytime neural sequences during slow oscillations occurs up to',
        correctAnswer: 'twenty times',
        acceptableAnswers: ['twenty times', '20 times', '20x'],
        explanation: 'Prof. Rostova states: "running up to twenty times faster than real-time waking experience".',
        transcriptTimestamp: '21:50',
        prefix: '34.',
        suffix: 'faster than waking reality',
      },
      {
        id: 35,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Long-term memories are permanently consolidated and stored within the',
        correctAnswer: 'neocortex',
        acceptableAnswers: ['neocortex', 'cortex'],
        explanation: 'Prof. Rostova states memories move into the permanent neocortex.',
        transcriptTimestamp: '22:25',
        prefix: '35.',
      },
      {
        id: 36,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Without sleep downscaling, excessive synaptic saturation would trigger cognitive',
        correctAnswer: 'overload',
        acceptableAnswers: ['overload', 'cognitive overload'],
        explanation: 'Prof. Rostova notes: "this saturation would cause cognitive overload".',
        transcriptTimestamp: '23:05',
        prefix: '36. cognitive',
      },
      {
        id: 37,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Slow-wave sleep selectively prunes weaker, insignificant synaptic',
        correctAnswer: 'connections',
        acceptableAnswers: ['connections', 'synaptic connections'],
        explanation: 'Prof. Rostova explains it prunes weaker synaptic connections.',
        transcriptTimestamp: '23:40',
        prefix: '37. synaptic',
      },
      {
        id: 38,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Targeted Memory Reactivation can be triggered during sleep using subtle auditory cues or olfactory',
        correctAnswer: 'scents',
        acceptableAnswers: ['scents', 'odors', 'smells'],
        explanation: 'Prof. Rostova specifies: "subtle auditory cues or olfactory scents presented during slow oscillations".',
        transcriptTimestamp: '24:15',
        prefix: '38. olfactory',
      },
      {
        id: 39,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Reactivation has proven effective for consolidating motor skills and foreign',
        correctAnswer: 'vocabulary',
        acceptableAnswers: ['vocabulary', 'words', 'languages'],
        explanation: 'Prof. Rostova highlights foreign vocabulary learning.',
        transcriptTimestamp: '24:50',
        prefix: '39. foreign',
      },
      {
        id: 40,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Sleep functions as an active, vital architect of human',
        correctAnswer: 'cognition',
        acceptableAnswers: ['cognition', 'intellectual adaptability'],
        explanation: 'Prof. Rostova concludes: "sleep is an active, vital architect of human cognition".',
        transcriptTimestamp: '25:20',
        prefix: '40. human',
      },
    ],
  },
  {
    id: 'l4-silk-road',
    partNumber: 4,
    testIndex: 2,
    title: 'The Maritime Silk Road & Indian Ocean Monsoon Navigation',
    domain: 'Maritime Archaeology & Global Trade History',
    context: 'A history lecture investigating monsoon navigation, nautical dhow engineering, and Quanzhou porcelain trade.',
    audioDurationMin: 8,
    targetBand: 'Band 8.0 – 9.0',
    questionTypes: ['NOTE_COMPLETION'],
    wordLimit: 'NO MORE THAN TWO WORDS',
    scenario: 'Nautical exploration examining seasonal wind patterns, porcelain kilns, and cosmopolitan trade ports.',
    audioNarrationText: 'International English Language Testing System. Listening Part 4. You will hear an academic lecture exploring the ancient Maritime Silk Road and Indian Ocean navigation. Look at questions 31 to 40.',
    fullTranscript: `LECTURER: Today we turn our attention from overland caravan routes to the Maritime Silk Road.
Dating back over two millennia, this oceanic network linked the South China Sea through the Strait of Malacca across the Arabian Sea to the Persian Gulf and Red Sea ports.
Central to the viability of long-distance navigation were the predictable Indian Ocean monsoon winds.
Nautical merchants mastered seasonal shifts: sailing southwest between November and March on the winter monsoon, and returning northeast during the summer monsoon months.
Dhows and Chinese junks relied on triangular lateen sails and innovative watertight compartments to safeguard fragile commodities such as glazed celadon porcelain, raw silk bolts, and valuable spices like cloves and nutmeg.
The port of Quanzhou in southeastern China flourished as an international cosmopolitan hub, home to diverse communities of Arab, Persian, Indian, and Italian merchants.
Beyond material commodities, the Maritime Silk Road served as a profound conduit for the cross-pollination of astronomy, medical treatises, and nautical chartography.`,
    questions: [
      {
        id: 31,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Oceanic navigation was critically reliant upon seasonal Indian Ocean',
        correctAnswer: 'monsoon winds',
        acceptableAnswers: ['monsoon winds', 'monsoons', 'monsoon'],
        explanation: 'Lecturer states: "Central to the viability... were the predictable Indian Ocean monsoon winds".',
        transcriptTimestamp: '19:15',
        prefix: '31.',
      },
      {
        id: 32,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Merchant vessels sailed southwest during winter between November and',
        correctAnswer: 'March',
        acceptableAnswers: ['March'],
        explanation: 'Lecturer says: "sailing southwest between November and March".',
        transcriptTimestamp: '19:50',
        prefix: '32. November and',
      },
      {
        id: 33,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Ship hulls were equipped with protective watertight',
        correctAnswer: 'compartments',
        acceptableAnswers: ['compartments', 'bulkheads'],
        explanation: 'Lecturer mentions "innovative watertight compartments to safeguard fragile commodities".',
        transcriptTimestamp: '20:30',
        prefix: '33. watertight',
      },
      {
        id: 34,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Fragile exported goods included raw silk bolts and glazed celadon',
        correctAnswer: 'porcelain',
        acceptableAnswers: ['porcelain', 'ceramics'],
        explanation: 'Lecturer refers to "glazed celadon porcelain".',
        transcriptTimestamp: '21:05',
        prefix: '34. celadon',
      },
      {
        id: 35,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'The southeastern Chinese cosmopolitan hub port was called',
        correctAnswer: 'Quanzhou',
        acceptableAnswers: ['Quanzhou', 'Canton'],
        explanation: 'Lecturer notes: "The port of Quanzhou in southeastern China flourished".',
        transcriptTimestamp: '21:40',
        prefix: '35. port of',
      },
      {
        id: 36,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'High-value traded spices included nutmeg and',
        correctAnswer: 'cloves',
        acceptableAnswers: ['cloves', 'cinnamon'],
        explanation: 'Lecturer cites "valuable spices like cloves and nutmeg".',
        transcriptTimestamp: '22:15',
        prefix: '36.',
      },
      {
        id: 37,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'The strategic choke point connecting the South China Sea to the Indian Ocean: Strait of',
        correctAnswer: 'Malacca',
        acceptableAnswers: ['Malacca', 'Melaka'],
        explanation: 'Lecturer refers to "through the Strait of Malacca".',
        transcriptTimestamp: '22:50',
        prefix: '37. Strait of',
      },
      {
        id: 38,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Vessels included traditional Arab dhows and Chinese',
        correctAnswer: 'junks',
        acceptableAnswers: ['junks', 'junk ships'],
        explanation: 'Lecturer notes "Dhows and Chinese junks".',
        transcriptTimestamp: '23:25',
        prefix: '38. Chinese',
      },
      {
        id: 39,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'Intellectual exchange included astronomy, nautical charts, and medical',
        correctAnswer: 'treatises',
        acceptableAnswers: ['treatises', 'texts', 'manuscripts'],
        explanation: 'Lecturer lists "astronomy, medical treatises, and nautical chartography".',
        transcriptTimestamp: '24:00',
        prefix: '39. medical',
      },
      {
        id: 40,
        part: 4,
        type: 'NOTE_COMPLETION',
        prompt: 'The Maritime Silk Road was a vital conduit for cultural',
        correctAnswer: 'cross-pollination',
        acceptableAnswers: ['cross-pollination', 'transmission', 'exchange'],
        explanation: 'Lecturer concludes it was a conduit for "cross-pollination".',
        transcriptTimestamp: '24:35',
        prefix: '40.',
      },
    ],
  },
];

export const ListeningPage: React.FC = () => {
  const { mode } = useExam();
  const { user } = useUser();

  // Navigation: 'catalog' vs 'arena'
  const [viewMode, setViewMode] = useState<'catalog' | 'arena'>('catalog');

  // Active Tab Selected: 1, 2, 3, 4, or 'wordbank'
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 'wordbank'>(1);

  // Active Filter inside Selected Part
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Currently Running Test in Arena
  const [activeTest, setActiveTest] = useState<ListeningTestItem>(ALL_LISTENING_TESTS[0]);

  // Audio Playback Engine
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User Answers & Score
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [scoreReport, setScoreReport] = useState<{
    correctCount: number;
    totalCount: number;
    percentage: number;
    bandScore: number;
  } | null>(null);

  // Modals & UI
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState<boolean>(false);
  const [vocabToast, setVocabToast] = useState<string | null>(null);

  const totalTestDurationSec = activeTest.audioDurationMin * 60;
  const currentMeta = typeof activeTab === 'number' ? PART_METAS[activeTab] : null;

  // Filtered tests for active Part
  const partTests = typeof activeTab === 'number'
    ? ALL_LISTENING_TESTS.filter(t => t.partNumber === activeTab).filter(t => {
        if (selectedTypeFilter === 'ALL') return true;
        return t.questionTypes.includes(selectedTypeFilter as ListeningQuestionType);
      })
    : [];

  // Web Audio Chime Synthesis (IELTS British Council 2-tone exam chime)
  const playIELTSChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Audio simulation timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= totalTestDurationSec) {
            setIsPlaying(false);
            return totalTestDurationSec;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalTestDurationSec]);

  // Speech TTS Engine helper
  const startSpeechNarration = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      playIELTSChime();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.volume = isMuted ? 0 : volume;
        utterance.lang = 'en-GB';

        const voices = window.speechSynthesis.getVoices();
        const ukVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('British') || v.name.includes('English'));
        if (ukVoice) utterance.voice = ukVoice;

        window.speechSynthesis.speak(utterance);
      }, 400);
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      startSpeechNarration(activeTest.audioNarrationText);
    } else {
      setIsPlaying(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleSeek = (newSec: number) => {
    setCurrentTimeSec(newSec);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Jump audio to specific timestamp citation
  const handleJumpToTimestamp = (timestampStr: string) => {
    const parts = timestampStr.split(':').map(Number);
    if (parts.length === 2) {
      const sec = parts[0] * 60 + parts[1];
      setCurrentTimeSec(sec);
      setIsPlaying(true);
      startSpeechNarration(`Audio playback at ${timestampStr}.`);
    }
  };

  // Start a specific test
  const handleStartTest = (test: ListeningTestItem) => {
    setActiveTest(test);
    setViewMode('arena');
    setCurrentTimeSec(0);
    setIsPlaying(false);
    setAnswers({});
    setFlaggedQuestions([]);
    setSubmitted(false);
    setScoreReport(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle flag on a question
  const toggleFlagQuestion = (qId: number) => {
    setFlaggedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Scroll to question
  const scrollToQuestion = (qId: number) => {
    const el = document.getElementById(`listening-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle Input Changes
  const handleAnswerChange = (qId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: value,
    }));
  };

  // Instant Auto-Fill for Testing
  const handleAutoFill = () => {
    const filled: Record<number, string> = {};
    activeTest.questions.forEach(q => {
      filled[q.id] = q.correctAnswer;
    });
    setAnswers(filled);
  };

  // Submit test and calculate band
  const handleSubmitTest = () => {
    let correct = 0;
    activeTest.questions.forEach(q => {
      const userVal = (answers[q.id] || '').trim().toLowerCase();
      const correctVal = q.correctAnswer.trim().toLowerCase();
      const acceptable = (q.acceptableAnswers || []).map(a => a.trim().toLowerCase());

      if (userVal === correctVal || acceptable.includes(userVal)) {
        correct += 1;
      }
    });

    const total = activeTest.questions.length;
    const ratio = correct / total;
    let band = 5.0;
    if (ratio >= 0.9) band = 9.0;
    else if (ratio >= 0.8) band = 8.0;
    else if (ratio >= 0.7) band = 7.5;
    else if (ratio >= 0.6) band = 7.0;
    else if (ratio >= 0.5) band = 6.5;
    else if (ratio >= 0.4) band = 6.0;
    else band = 5.0;

    setScoreReport({
      correctCount: correct,
      totalCount: total,
      percentage: Math.round(ratio * 100),
      bandScore: band,
    });
    setSubmitted(true);
  };

  // Save word to Vocab Vault
  const handleSaveToVocabVault = (word: string) => {
    setVocabToast(`Saved "${word}" to your Vocab Vault!`);
    setTimeout(() => setVocabToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-space-lg pb-24 max-w-6xl mx-auto selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      
      {/* Toast Notification */}
      {vocabToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-secondary text-on-secondary font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-base">star</span>
          <span>{vocabToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: 4-PART CATALOG + WORD BANK (LIST VIEW)                           */}
      {/* ========================================================================= */}
      {viewMode === 'catalog' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-surface-container-high/40 shadow-sm relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-tertiary-container text-on-tertiary-container flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  IELTS Standard 4-Part Audio Lab
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-container-highest text-on-surface">
                  {mode} Mode
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                Listening Practice Arena • 4 Ta Part Bo'yicha Mashg'ulot
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-2xl">
                IELTS imtihonining har bir bo'limini alohida chuqur o'rganing: Part 1 dan Part 4 gacha barcha savol turlari, audio pleyer, interaktiv xaritalar va strategik tahlil.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setGuideModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-lg text-primary">lightbulb</span>
              <span>4-Part Strategy Guide</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TOP 5 CARDS: PART 1, PART 2, PART 3, PART 4, AND WORD BANK                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* CARD 1: PART 1 (Sky Blue) */}
            <button
              onClick={() => {
                setActiveTab(1);
                setSelectedTypeFilter('ALL');
              }}
              className={`h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
                activeTab === 1
                  ? 'border-[#0284C7] ring-4 ring-[#0284C7]/30 scale-102 bg-[#0284C7]/5'
                  : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
              }`}
              title="Part 1: Social & Everyday Dialogue"
            >
              <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
                <div className="flex items-center gap-1 text-[#0284C7]">
                  <span className="material-symbols-outlined text-base sm:text-lg">chat</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Part</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-on-surface leading-tight">PART 1</div>
                  <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Social Dialogue</div>
                </div>
              </div>
              <div className="w-2/5 h-full bg-[#0284C7] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-inner">
                1
              </div>
            </button>

            {/* CARD 2: PART 2 (Emerald Green) */}
            <button
              onClick={() => {
                setActiveTab(2);
                setSelectedTypeFilter('ALL');
              }}
              className={`h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
                activeTab === 2
                  ? 'border-[#10B981] ring-4 ring-[#10B981]/30 scale-102 bg-[#10B981]/5'
                  : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
              }`}
              title="Part 2: Public Monologue & Map Labelling"
            >
              <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
                <div className="flex items-center gap-1 text-[#10B981]">
                  <span className="material-symbols-outlined text-base sm:text-lg">explore</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Part</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-on-surface leading-tight">PART 2</div>
                  <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Talk & Map</div>
                </div>
              </div>
              <div className="w-2/5 h-full bg-[#10B981] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-inner">
                2
              </div>
            </button>

            {/* CARD 3: PART 3 (Purple/Violet) */}
            <button
              onClick={() => {
                setActiveTab(3);
                setSelectedTypeFilter('ALL');
              }}
              className={`h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
                activeTab === 3
                  ? 'border-[#8B5CF6] ring-4 ring-[#8B5CF6]/30 scale-102 bg-[#8B5CF6]/5'
                  : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
              }`}
              title="Part 3: Academic Discussion"
            >
              <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
                <div className="flex items-center gap-1 text-[#8B5CF6]">
                  <span className="material-symbols-outlined text-base sm:text-lg">school</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Part</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-on-surface leading-tight">PART 3</div>
                  <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Academic Debate</div>
                </div>
              </div>
              <div className="w-2/5 h-full bg-[#8B5CF6] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-inner">
                3
              </div>
            </button>

            {/* CARD 4: PART 4 (Amber/Foxy Orange) */}
            <button
              onClick={() => {
                setActiveTab(4);
                setSelectedTypeFilter('ALL');
              }}
              className={`h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
                activeTab === 4
                  ? 'border-[#FF7A00] ring-4 ring-[#FF7A00]/30 scale-102 bg-[#FF7A00]/5'
                  : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
              }`}
              title="Part 4: University Lecture Monologue"
            >
              <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
                <div className="flex items-center gap-1 text-[#FF7A00]">
                  <span className="material-symbols-outlined text-base sm:text-lg">psychology</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Part</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-on-surface leading-tight">PART 4</div>
                  <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Lecture Notes</div>
                </div>
              </div>
              <div className="w-2/5 h-full bg-[#FF7A00] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-inner">
                4
              </div>
            </button>

            {/* CARD 5: WORD BANK / SIGNPOST VAULT (Gold) */}
            <button
              onClick={() => setActiveTab('wordbank')}
              className={`h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 col-span-2 sm:col-span-1 ${
                activeTab === 'wordbank'
                  ? 'border-[#F59E0B] ring-4 ring-[#F59E0B]/30 scale-102 bg-[#F59E0B]/5'
                  : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
              }`}
              title="Listening Signpost & Vocab Bank"
            >
              <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <span className="material-symbols-outlined text-base sm:text-lg">bookmark</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Vault</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-on-surface leading-tight">SIGNPOST</div>
                  <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Word Bank</div>
                </div>
              </div>
              <div className="w-2/5 h-full bg-[#F59E0B] flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-inner">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">auto_stories</span>
              </div>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* TAB 1-4: ACTIVE PART TESTS CATALOG VIEW                                  */}
          {/* ========================================================================= */}
          {typeof activeTab === 'number' && currentMeta && (
            <div className="space-y-6 animate-fadeIn">
              {/* Active Part Overview Hero */}
              <div 
                className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4"
                style={{
                  backgroundColor: `${currentMeta.colorHex}08`,
                  borderColor: `${currentMeta.colorHex}35`
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider text-white shadow-xs"
                        style={{ backgroundColor: currentMeta.colorHex }}
                      >
                        IELTS Part {activeTab}
                      </span>
                      <span className="text-xs font-bold" style={{ color: currentMeta.colorHex }}>
                        {currentMeta.targetBand}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        • {currentMeta.typicalFormat}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1.5">
                      {currentMeta.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                      {currentMeta.subtitle}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-surface-container-high/40 max-w-sm text-xs text-on-surface-variant space-y-1">
                    <span className="font-bold text-on-surface block flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">tips_and_updates</span>
                      <span>Exam Strategy Note:</span>
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {currentMeta.strategyNote}
                    </p>
                  </div>
                </div>

                {/* Question Type Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0 mr-1">
                    Filter:
                  </span>
                  <button
                    onClick={() => setSelectedTypeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedTypeFilter === 'ALL'
                        ? 'bg-on-surface text-surface shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    All Questions ({ALL_LISTENING_TESTS.filter(t => t.partNumber === activeTab).length})
                  </button>
                  {currentMeta.typicalQuestionTypes.map((qTypeName, idx) => {
                    const matchType = qTypeName.includes('Map') 
                      ? 'MAP_LABELLING' 
                      : qTypeName.includes('Multiple') 
                      ? 'MULTIPLE_CHOICE' 
                      : qTypeName.includes('Form') 
                      ? 'FORM_COMPLETION' 
                      : 'NOTE_COMPLETION';

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTypeFilter(matchType)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedTypeFilter === matchType
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {qTypeName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tests List */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg" style={{ color: currentMeta.colorHex }}>headphones</span>
                  <span>Available Audio Tests for Part {activeTab} ({partTests.length} tests)</span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {partTests.map((test, idx) => (
                    <div
                      key={test.id}
                      onClick={() => handleStartTest(test)}
                      className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/60 hover:bg-surface-container/70 transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer group relative overflow-hidden"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: currentMeta.colorHex }}
                          >
                            Audio Test {idx + 1}
                          </span>
                          <span 
                            className="px-2.5 py-1 rounded-xl text-xs font-bold"
                            style={{
                              backgroundColor: `${currentMeta.colorHex}15`,
                              color: currentMeta.colorHex
                            }}
                          >
                            {test.domain}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-surface-container-highest text-on-surface">
                            🎯 {test.targetBand}
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {test.audioDurationMin} mins
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg sm:text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight">
                            {test.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                            {test.scenario}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-on-surface-variant">
                          <span className="px-2.5 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/40 font-semibold text-[11px]">
                            ✍️ {test.wordLimit}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/40 font-semibold text-[11px]">
                            📝 {test.questions.length} Questions
                          </span>
                          {test.mapData && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">map</span>
                              Interactive Map Included
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center md:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTest(test);
                          }}
                          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group-hover:scale-105 cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">play_arrow</span>
                          <span>Start Listening</span>
                          <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: LISTENING VOCAB & SIGNPOST VAULT VIEW                              */}
          {/* ========================================================================= */}
          {activeTab === 'wordbank' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                    Listening Word Bank
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    Signposts, Distractors & Spelling Traps
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                  IELTS Listening Essential Lexical Bank
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  Audioda tez-tez chalg'ituvchi so'zlar, bog'lovchi signallar (*signposts*) va to'g'ri imlo qoidalari to'plami.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LISTENING_VOCAB_BANK.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/60 space-y-3 hover:border-amber-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 border border-amber-500/30">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-highest text-on-surface">
                        CEFR {item.cefr}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-on-surface">{item.phrase}</h4>
                      <p className="text-xs font-bold text-primary mt-0.5">{item.uzbekMeaning}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{item.definition}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 text-xs italic text-on-surface-variant">
                      "{item.exampleInAudio}"
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40">
                      <button
                        onClick={() => startSpeechNarration(item.phrase)}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">volume_up</span>
                        <span>Pronounce</span>
                      </button>

                      <button
                        onClick={() => handleSaveToVocabVault(item.phrase)}
                        className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">bookmark_add</span>
                        <span>Save to Vocab Vault</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INTERACTIVE AUDIO TEST ARENA                                     */}
      {/* ========================================================================= */}
      {viewMode === 'arena' && (
        <div className="space-y-6 animate-fadeIn pb-16">
          
          {/* Top Back Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-surface-container-high/50 shadow-sm">
            <button
              onClick={() => setViewMode('catalog')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 text-xs font-bold text-on-surface transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Part {activeTest.partNumber} Catalog</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTranscriptModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high/60 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-secondary">description</span>
                <span>Audio Transcript</span>
              </button>

              <button
                type="button"
                onClick={handleAutoFill}
                className="px-3.5 py-1.5 rounded-xl bg-tertiary-container/30 hover:bg-tertiary-container/50 border border-tertiary/40 text-xs font-black text-tertiary flex items-center gap-1.5 transition-all cursor-pointer"
                title="Auto-fill sample answers for instant review"
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                <span>⚡ Auto-Fill</span>
              </button>
            </div>
          </div>

          {/* Master CD-IELTS Audio Player Bar */}
          <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-tertiary text-on-tertiary hover:opacity-90 animate-pulse'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                  title={isPlaying ? 'Pause Audio' : 'Play Official Audio'}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase text-white shadow-xs"
                      style={{ backgroundColor: PART_METAS[activeTest.partNumber].colorHex }}
                    >
                      Part {activeTest.partNumber} Audio Track
                    </span>
                    {isPlaying && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-tertiary-container text-on-tertiary-container animate-pulse">
                        LIVE PLAYING
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-on-surface leading-tight mt-1">
                    {activeTest.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    {activeTest.scenario}
                  </p>
                </div>
              </div>

              {/* Speed & Time controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-surface-container-lowest p-1 rounded-xl border border-surface-container-high/40 text-xs">
                  {[0.8, 1.0, 1.25].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 font-code text-xs bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high/50 text-on-surface">
                  <span className="font-bold text-primary">{formatTime(currentTimeSec)}</span>
                  <span className="text-on-surface-variant">/</span>
                  <span className="text-on-surface-variant font-medium">{formatTime(totalTestDurationSec)}</span>
                </div>
              </div>
            </div>

            {/* Scrub Bar */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                handleSeek(Math.floor(ratio * totalTestDurationSec));
              }}
              className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden relative cursor-pointer group"
            >
              <div
                className="bg-gradient-to-r from-primary via-tertiary to-secondary h-full rounded-full transition-all duration-200 relative"
                style={{ width: `${(currentTimeSec / totalTestDurationSec) * 100}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md transform scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
          </div>

          {/* Map Section (if applicable) */}
          {activeTest.mapData && (
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container-high/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Visual Diagram & Map Orientation
                  </span>
                  <h3 className="text-base font-bold text-on-surface mt-0.5">
                    {activeTest.mapData.imageTitle}
                  </h3>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {activeTest.mapData.description}
                </span>
              </div>

              {/* Graphic Canvas */}
              <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-surface-container-high/30 via-surface-container-low to-surface-container border border-surface-container-high/60 relative overflow-hidden flex items-center justify-center p-4 select-none">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="absolute inset-x-12 inset-y-10 rounded-full border-2 border-dashed border-tertiary/40 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-tertiary/60 uppercase tracking-widest">
                    Central Serpentine Lake & Nature Arboretum
                  </span>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-surface-container-highest/90 border border-surface-container-high text-xs font-black text-on-surface shadow-md">
                  📍 South Gate Visitor Entrance (Start Here)
                </div>

                {activeTest.mapData.pins.map(pin => (
                  <div
                    key={pin.label}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-primary text-on-primary font-black text-sm flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95">
                      {pin.label}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-bold whitespace-nowrap shadow-xl z-20 pointer-events-none">
                      Location {pin.label}: {pin.hint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Sheet */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-container-high/60 shadow-lg space-y-6">
            <div className="pb-4 border-b border-surface-container-high/50 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Part {activeTest.partNumber} • Questions {activeTest.questions[0].id}–{activeTest.questions[activeTest.questions.length - 1].id}
                </span>
                <span className="text-xs font-bold text-tertiary bg-tertiary-container/20 px-2.5 py-1 rounded-lg border border-tertiary/30">
                  Word Limit: {activeTest.wordLimit}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-on-surface">
                Complete the test answers based on what you hear in the recording.
              </h3>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {activeTest.questions.map(q => {
                const userAns = answers[q.id] || '';
                const isFlagged = flaggedQuestions.includes(q.id);
                const isCorrect = submitted && (
                  userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
                  (q.acceptableAnswers || []).map(a => a.trim().toLowerCase()).includes(userAns.trim().toLowerCase())
                );

                return (
                  <div
                    id={`listening-q-${q.id}`}
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      submitted
                        ? isCorrect
                          ? 'bg-secondary/10 border-secondary/50'
                          : 'bg-error/10 border-error/50'
                        : 'bg-surface-container-low border-surface-container-high/40 hover:border-surface-container-high'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center text-xs font-black text-on-surface">
                            {q.id}
                          </span>
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            {q.type.replace('_', ' ')}
                          </span>
                          {submitted && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isCorrect ? 'bg-secondary text-on-secondary' : 'bg-error text-on-error'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          )}
                        </div>

                        {/* Review Flag button */}
                        <button
                          type="button"
                          onClick={() => toggleFlagQuestion(q.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isFlagged
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isFlagged ? 'bookmark_added' : 'bookmark_border'}
                          </span>
                          <span>{isFlagged ? 'Flagged for Review' : 'Flag'}</span>
                        </button>
                      </div>

                      <div className="text-sm font-bold text-on-surface">
                        {q.prompt}
                      </div>

                      {/* Rendering Input Field vs Options */}
                      {q.type === 'FORM_COMPLETION' || q.type === 'NOTE_COMPLETION' || q.type === 'TABLE_COMPLETION' ? (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {q.prefix && <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">{q.prefix}</span>}
                          <input
                            type="text"
                            placeholder="Type answer..."
                            value={userAns}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={submitted}
                            className="px-4 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs sm:text-sm text-on-surface font-semibold focus:ring-2 focus:ring-primary focus:outline-none min-w-[200px] max-w-sm transition-all shadow-inner"
                          />
                          {q.suffix && <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">{q.suffix}</span>}
                        </div>
                      ) : q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const optionLetter = opt.charAt(0);
                            const isOptionChosen = userAns === optionLetter || userAns === opt;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, optionLetter)}
                                disabled={submitted}
                                className={`p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all border flex items-center gap-3 cursor-pointer ${
                                  isOptionChosen
                                    ? 'bg-primary-container text-on-primary-container border-primary shadow-sm font-bold'
                                    : 'bg-surface-container-lowest text-on-surface border-surface-container-high/40 hover:bg-surface-container'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                  isOptionChosen ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                                }`}>
                                  {optionLetter}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Feedback Citation */}
                      {submitted && (
                        <div className="mt-2 p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-on-surface">Answer:</span>
                            <span className="font-black text-secondary">{q.correctAnswer}</span>
                            <button
                              type="button"
                              onClick={() => handleJumpToTimestamp(q.transcriptTimestamp)}
                              className="text-primary hover:underline font-code font-bold flex items-center gap-1 cursor-pointer bg-primary/10 px-2 py-0.5 rounded-md"
                              title="Click to jump audio to this exact moment"
                            >
                              <span className="material-symbols-outlined text-xs">play_circle</span>
                              <span>{q.transcriptTimestamp}</span>
                            </button>
                          </div>
                          <p className="text-on-surface-variant">
                            💡 <span className="font-semibold text-on-surface">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Arena Footer Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-surface-container-high/50">
              <span className="text-xs text-on-surface-variant">
                Official IELTS simulation for Part {activeTest.partNumber}. Answers are evaluated against official rubrics.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {submitted ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setScoreReport(null);
                      setAnswers({});
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>Retake Test</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">task_alt</span>
                    <span>Submit & Grade Part {activeTest.partNumber}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Score Report Box */}
            {submitted && scoreReport && (
              <div className="p-6 rounded-3xl bg-surface-container-lowest border-2 border-secondary/60 shadow-xl space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary/15 text-secondary">
                      Part {activeTest.partNumber} Diagnostic Result
                    </span>
                    <h3 className="text-2xl font-black text-on-surface mt-1">
                      Estimated Band: {scoreReport.bandScore.toFixed(1)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-surface-container-low text-center min-w-[90px]">
                      <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Correct</span>
                      <span className="text-xl font-black text-secondary">{scoreReport.correctCount} / {scoreReport.totalCount}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-container-low text-center min-w-[90px]">
                      <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Accuracy</span>
                      <span className="text-xl font-black text-primary">{scoreReport.percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* CD-IELTS STICKY BOTTOM DOCK: QUESTION NUMBERS QUICK JUMP                   */}
          {/* ========================================================================= */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-container-high/60 py-2.5 px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-on-surface-variant hidden sm:inline">
                Part {activeTest.partNumber} Navigator:
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {activeTest.questions.map(q => {
                  const isAnswered = (answers[q.id] || '').trim().length > 0;
                  const isFlagged = flaggedQuestions.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all relative shrink-0 flex items-center justify-center cursor-pointer ${
                        isAnswered
                          ? 'bg-primary text-on-primary font-black shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>{q.id}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-bold text-on-surface flex items-center gap-1 shrink-0">
                <span className="text-primary">{Object.values(answers).filter(v => (v || '').trim().length > 0).length}</span>
                <span className="text-on-surface-variant">/{activeTest.questions.length}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AUDIO TRANSCRIPT MODAL                                           */}
      {/* ========================================================================= */}
      {transcriptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-2xl flex flex-col space-y-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/50">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-2xl text-secondary">description</span>
                <div>
                  <h3 className="text-lg font-black text-on-surface">
                    Audio Transcript • Part {activeTest.partNumber}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {activeTest.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTranscriptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm leading-relaxed text-on-surface font-sans select-text">
              <div className="whitespace-pre-line bg-surface-container-low p-5 rounded-2xl border border-surface-container-high/40 font-serif text-sm leading-loose">
                {activeTest.fullTranscript}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 text-right">
              <button
                onClick={() => setTranscriptModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-surface-container-high text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 4-PART STRATEGY GUIDE MODAL (LIGHTBULB)                          */}
      {/* ========================================================================= */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-container-high shadow-2xl flex flex-col space-y-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/50">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-2xl text-primary">lightbulb</span>
                <div>
                  <h3 className="text-lg font-black text-on-surface">
                    IELTS Listening 4-Part Blueprint & Strategies
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Mastering Part 1, Part 2, Part 3 and Part 4
                  </p>
                </div>
              </div>

              <button
                onClick={() => setGuideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm">
              {[1, 2, 3, 4].map(pNum => {
                const meta = PART_METAS[pNum as 1 | 2 | 3 | 4];
                return (
                  <div 
                    key={pNum} 
                    className="p-4 sm:p-5 rounded-2xl border space-y-2"
                    style={{
                      backgroundColor: `${meta.colorHex}08`,
                      borderColor: `${meta.colorHex}35`
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-6 h-6 rounded-lg text-white flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: meta.colorHex }}
                      >
                        {pNum}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{meta.title}</h4>
                      <span className="text-xs font-bold" style={{ color: meta.colorHex }}>
                        • {meta.targetBand}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {meta.strategyNote}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 text-right">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
              >
                Tushundim, Davom Etamiz!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
