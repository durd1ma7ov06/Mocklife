import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { VocabItem } from '../types/index.js';

export type QuestionType = 
  | 'TRUE_FALSE_NOT_GIVEN' 
  | 'YES_NO_NOT_GIVEN' 
  | 'MULTIPLE_CHOICE' 
  | 'SUMMARY_COMPLETION' 
  | 'MATCHING_HEADINGS';

export interface ReadingQuestion {
  id: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ReadingTestItem {
  id: string;
  passageNumber: 1 | 2 | 3;
  testIndex: number;
  title: string;
  domain: string;
  wordCount: number;
  recommendedTimeMin: number;
  targetBand: string;
  questionTypes: QuestionType[];
  excerpt: string;
  paragraphs: { label: string; text: string }[];
  questions: ReadingQuestion[];
}

export interface PassageMeta {
  passageNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  typicalLength: string;
  targetBand: string;
  colorHex: string;
  accentClass: string;
  borderClass: string;
  bgSoft: string;
  typicalQuestionTypes: string[];
  strategyNote: string;
}

export const PASSAGE_METAS: Record<1 | 2 | 3, PassageMeta> = {
  1: {
    passageNumber: 1,
    title: 'Passage 1: Factual & Descriptive',
    subtitle: 'Everyday Academic, Historical & Scientific Overviews',
    typicalLength: '650 – 750 words • 13-14 questions',
    targetBand: 'Band 6.5 – 7.5',
    colorHex: '#0284C7',
    accentClass: 'text-[#0284C7]',
    borderClass: 'border-sky-500/40',
    bgSoft: 'bg-sky-500/5',
    typicalQuestionTypes: ['TRUE / FALSE / NOT GIVEN', 'Summary Completion', 'Multiple Choice', 'Table / Flowchart'],
    strategyNote: 'Scan for chronological markers, dates, and concrete factual nouns. Answers follow sequential order.'
  },
  2: {
    passageNumber: 2,
    title: 'Passage 2: Applied Research & Analysis',
    subtitle: 'Contemporary Innovations, Social Science & Environmental Dilemmas',
    typicalLength: '750 – 850 words • 13-14 questions',
    targetBand: 'Band 7.0 – 8.5',
    colorHex: '#10B981',
    accentClass: 'text-[#10B981]',
    borderClass: 'border-emerald-500/40',
    bgSoft: 'bg-emerald-500/5',
    typicalQuestionTypes: ['Matching Headings', 'Matching Information / Features', 'Summary with Word Box', 'TRUE / FALSE / NOT GIVEN'],
    strategyNote: 'Identify paragraph core themes first for headings. Pay close attention to researcher names and theories.'
  },
  3: {
    passageNumber: 3,
    title: 'Passage 3: Complex Analytical Arguments',
    subtitle: 'Cognitive Science, Philosophical Theories & Abstract Inquiry',
    typicalLength: '850 – 950 words • 13-14 questions',
    targetBand: 'Band 7.5 – 9.0',
    colorHex: '#8B5CF6',
    accentClass: 'text-[#8B5CF6]',
    borderClass: 'border-purple-500/40',
    bgSoft: 'bg-purple-500/5',
    typicalQuestionTypes: ['YES / NO / NOT GIVEN', 'Multiple Choice (Inference)', 'Matching Sentence Endings', "Writer's Views"],
    strategyNote: "Distinguish between the writer's own claims and external cited researchers. Beware of subtle conditional qualifiers."
  }
};

const ALL_READING_TESTS: ReadingTestItem[] = [
  // =========================================================================
  // PASSAGE 1 TESTS (Factual & Descriptive)
  // =========================================================================
  {
    id: 'p1-urban-biodiversity',
    passageNumber: 1,
    testIndex: 1,
    title: 'The Evolutionary Architecture of Urban Biodiversity',
    domain: 'Urban Ecology & Zoology',
    wordCount: 650,
    recommendedTimeMin: 20,
    targetBand: 'Band 6.5 – 7.5',
    questionTypes: ['TRUE_FALSE_NOT_GIVEN', 'MULTIPLE_CHOICE'],
    excerpt: 'As metropolitan areas worldwide expand exponentially, urban ecologists have uncovered an unexpected biological phenomenon: cities are rapidly becoming evolutionary hotspots...',
    paragraphs: [
      {
        label: 'A',
        text: 'As metropolitan areas worldwide expand exponentially, urban ecologists have uncovered an unexpected biological phenomenon: cities are rapidly becoming evolutionary hotspots. Far from being ecological wastelands devoid of adaptive diversity, high-density concrete ecosystems exert fierce selective pressures on wildlife, accelerating phenotypic divergence at rates seldom recorded in untouched wilderness.'
      },
      {
        label: 'B',
        text: 'A pivotal study conducted by the Global Urban Biome Initiative tracked White-footed mice (Peromyscus leucopus) inhabiting isolated public parks across New York City. Genetic sequencing revealed that city mice have developed distinct adaptations in metabolic and heavy-metal tolerance genes compared to their rural counterparts. These physiological mutations allow them to process carbohydrate-dense anthropogenic food waste without exacerbating systemic inflammation, and detoxify airborne lead particles embedded in park foliage.'
      },
      {
        label: 'C',
        text: 'Furthermore, behavioral alterations in urban avian species highlight the ubiquitous nature of adaptation. In European metropolitan hubs, European blackbirds (Turdus merula) have modulated both the pitch and the circadian timing of their territorial songs. By shifting peak vocalization to pre-dawn intervals, avian populations circumvent acoustic interference generated by morning vehicular traffic. Urban noise pollution therefore acts as an immediate selective filter, rewarding specimens with elevated auditory frequencies.'
      },
      {
        label: 'D',
        text: 'Critics often argue that urban evolution merely represents localized survivorship rather than authentic speciation. However, longitudinal genomic data demonstrates unambiguous reproductive isolation in multiple arthropod species trapped in subterranean transit networks, indicating that anthropogenic terrain is actively shaping new phylogenetic branches.'
      }
    ],
    questions: [
      {
        id: 1,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Wildlife adaptation occurs at a slower pace in urban centers than in untouched natural wilderness.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph A explicitly states that concrete ecosystems accelerate phenotypic divergence at rates seldom recorded in untouched wilderness.'
      },
      {
        id: 2,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Metabolic mutations in New York City mice assist in metabolizing discarded anthropogenic food waste.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'Paragraph B notes that these physiological mutations allow them to process carbohydrate-dense anthropogenic food waste.'
      },
      {
        id: 3,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Why have European blackbirds shifted the timing of their vocalization to pre-dawn hours?',
        options: [
          'To attract female mates before foraging begins',
          'To avoid the acoustic interference created by heavy morning traffic',
          'Because nighttime artificial illumination confuses their natural circadian rhythm',
          'To conserve metabolic energy during colder morning hours'
        ],
        correctAnswer: 'To avoid the acoustic interference created by heavy morning traffic',
        explanation: 'Paragraph C states: "By shifting peak vocalization to pre-dawn intervals, avian populations circumvent acoustic interference generated by morning vehicular traffic."'
      },
      {
        id: 4,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'All arthropod populations in underground rail networks have completely lost the ability to fly.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        explanation: 'Paragraph D mentions reproductive isolation in subterranean transit networks, but says nothing about whether they have lost the ability to fly.'
      }
    ]
  },
  {
    id: 'p1-indus-civilization',
    passageNumber: 1,
    testIndex: 2,
    title: 'Urban Engineering & Hydrology in the Ancient Indus Valley',
    domain: 'Archaeology & Ancient Civilizations',
    wordCount: 710,
    recommendedTimeMin: 20,
    targetBand: 'Band 6.5 – 7.5',
    questionTypes: ['TRUE_FALSE_NOT_GIVEN', 'SUMMARY_COMPLETION'],
    excerpt: 'Flourishing between 2600 and 1900 BCE, the Indus Valley Civilization was distinguished by astonishing metropolitan sanitary infrastructure, sophisticated standardized brick architecture...',
    paragraphs: [
      {
        label: 'A',
        text: 'Flourishing along the alluvial plains of the Indus River between 2600 and 1900 BCE, the Harappan civilization was distinguished by astonishing metropolitan sanitary infrastructure. In major centers such as Mohenjo-Daro and Harappa, civic engineers constructed orthogonal grid city layouts that surpassed contemporary Mesopotamian and Egyptian municipal planning in hygiene and consistency.'
      },
      {
        label: 'B',
        text: 'Standardization was the cornerstone of Harappan architectural mastery. Fired mud bricks throughout the vast geographic territory maintained an exact dimensional ratio of 4:2:1, reflecting centralized regulatory authority. Furthermore, individual households were equipped with private bathing chambers connected via terracotta conduits to covered subterranean municipal drainage trenches beneath paved avenues.'
      },
      {
        label: 'C',
        text: 'Remarkably, archaeological excavations have unearthed minimal evidence of royal palaces, militaristic fortifications, or monuments celebrating martial conquests. This distinctive absence suggests a social paradigm oriented towards civic commerce, public sanitation, and collective mercantile trade rather than theocratic despotism or militarism.'
      },
      {
        label: 'D',
        text: 'The abrupt de-urbanization of Harappan metropolises around 1800 BCE was historically attributed to violent invasions. However, recent paleoclimatic sediments from dried lake beds demonstrate severe reductions in summer monsoon rainfall, leading to the desiccation of the Sarasvati river basin. As perennial rivers dwindled, municipal agriculture collapsed, prompting populations to migrate eastward.'
      }
    ],
    questions: [
      {
        id: 5,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Harappan city layouts were less organized and hygienic than contemporary Mesopotamian cities.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph A states Harappan orthogonal grid layouts "surpassed contemporary Mesopotamian and Egyptian municipal planning in hygiene and consistency."'
      },
      {
        id: 6,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Fired mud bricks across different Harappan settlements followed a standardized mathematical proportion.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'Paragraph B notes that bricks maintained an exact dimensional ratio of 4:2:1 throughout the vast territory.'
      },
      {
        id: 7,
        type: 'SUMMARY_COMPLETION',
        prompt: 'Archaeological findings in Harappan cities suggest a society predominantly driven by:',
        options: [
          'Royal palaces and imperial conquest',
          'Civic commerce, sanitation, and mercantile trade',
          'Rigid theocratic despotism and standing armies',
          'Agrarian feudalism devoid of urban centers'
        ],
        correctAnswer: 'Civic commerce, sanitation, and mercantile trade',
        explanation: 'Paragraph C highlights that the evidence suggests a paradigm oriented towards civic commerce, public sanitation, and collective mercantile trade.'
      },
      {
        id: 8,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Severe reductions in monsoon precipitation contributed significantly to Harappan de-urbanization.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'Paragraph D notes paleoclimatic data demonstrates severe reductions in summer monsoon rainfall that prompted eastward migration.'
      }
    ]
  },
  {
    id: 'p1-early-paper',
    passageNumber: 1,
    testIndex: 3,
    title: 'The Inception of Cellulosic Paper & Early Information Networks',
    domain: 'History of Technology & Materials Science',
    wordCount: 680,
    recommendedTimeMin: 20,
    targetBand: 'Band 6.5 – 7.5',
    questionTypes: ['MULTIPLE_CHOICE', 'SUMMARY_COMPLETION'],
    excerpt: 'Prior to the invention of cellulosic paper in Han Dynasty China, recorded knowledge was inscribed on labor-intensive animal vellum, bulky bamboo slips, or costly silk rolls...',
    paragraphs: [
      {
        label: 'A',
        text: 'Prior to the official codification of papermaking attributed to court eunuch Cai Lun in 105 CE, recorded Chinese administrative records were transcribed upon cumbersome bamboo slips joined by hemp cords or exorbitant rolls of pure silk. Bamboo was inconveniently heavy to transport, while silk was restricted to elite imperial decrees due to prohibitive economic expense.'
      },
      {
        label: 'B',
        text: 'Cai Lun synthesized a revolutionary cellulosic pulp using macerated mulberry bark, discarded fishing nets, and old textile rags. By boiling this fibrous slurry, suspending it across fine woven bamboo sieves, and pressing the dried sheets under stone weights, artisans generated a pliable, durable, and remarkably inexpensive writing surface.'
      },
      {
        label: 'C',
        text: 'The geopolitical expansion of papermaking occurred via Central Asian trade networks. In 751 CE, following the Battle of Talas River between the Tang Empire and the Abbasid Caliphate, captured Chinese artisans transmitted the secrets of cellulosic manufacturing to the Islamic world. Samarkand swiftly transformed into a preeminent global papermaking capital, leveraging its abundant mountain runoff water and high-grade flax.'
      },
      {
        label: 'D',
        text: 'The accessibility of paper precipitated an exponential expansion in bureaucratic documentation, botanical encyclopedias, and personal correspondence. By displacing expensive animal parchment, paper democratized literacy and laid the intellectual substrate for the European Renaissance centuries later.'
      }
    ],
    questions: [
      {
        id: 9,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What was the primary drawback of using bamboo slips for administrative record keeping?',
        options: [
          'They disintegrated rapidly in humid climate conditions',
          'They were inconveniently heavy to transport and archive',
          'Artisans were unable to bind them with textile threads',
          'Ink failed to adhere to the bamboo fibers'
        ],
        correctAnswer: 'They were inconveniently heavy to transport and archive',
        explanation: 'Paragraph A indicates bamboo was "inconveniently heavy to transport," creating substantial administrative friction.'
      },
      {
        id: 10,
        type: 'SUMMARY_COMPLETION',
        prompt: 'Which Central Asian oasis became a world-renowned center of paper manufacturing after the Battle of Talas?',
        options: ['Bukhara', 'Samarkand', 'Baghdad', 'Chang\'an'],
        correctAnswer: 'Samarkand',
        explanation: 'Paragraph C states: "Samarkand swiftly transformed into a preeminent global papermaking capital, leveraging abundant mountain runoff and flax."'
      },
      {
        id: 11,
        type: 'MULTIPLE_CHOICE',
        prompt: 'How did paper democratize literacy compared to animal parchment?',
        options: [
          'By providing a far more economical and plentiful medium for written texts',
          'By eliminating the need for calligraphic pens and ink formulations',
          'By requiring government certification for private ownership',
          'By restricting text duplication to monastic scriptoriums'
        ],
        correctAnswer: 'By providing a far more economical and plentiful medium for written texts',
        explanation: 'Paragraph D notes that by displacing expensive animal parchment, inexpensive paper democratized literacy and facilitated knowledge circulation.'
      }
    ]
  },

  // =========================================================================
  // PASSAGE 2 TESTS (Applied Science & Discussions)
  // =========================================================================
  {
    id: 'p2-artificial-photosynthesis',
    passageNumber: 2,
    testIndex: 1,
    title: 'Artificial Photosynthesis & The Hydrogen Energy Frontier',
    domain: 'Renewable Engineering & Molecular Chemistry',
    wordCount: 750,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.0 – 8.5',
    questionTypes: ['TRUE_FALSE_NOT_GIVEN', 'MULTIPLE_CHOICE'],
    excerpt: "For decades, chemical engineers and molecular biologists have endeavored to mimic nature's most sophisticated bio-energetic mechanism: oxygenic photosynthesis...",
    paragraphs: [
      {
        label: 'A',
        text: "For decades, chemical engineers and molecular biologists have endeavored to mimic nature's most sophisticated bio-energetic mechanism: oxygenic photosynthesis. While conventional photovoltaic solar arrays convert sunlight into electrical current, artificial photosynthesis systems synthesize chemical fuels directly, offering high-density, storable energy without producing greenhouse emissions."
      },
      {
        label: 'B',
        text: 'The fundamental obstacle in developing artificial leaves has long been the catalyst efficiency for the oxygen-evolving reaction. Splitting water molecules (H2O) into elemental oxygen and hydrogen protons requires four distinct proton-coupled electron transfer steps—a kinetically sluggish sequence that necessitates resilient semiconductor anodes. Early laboratory prototypes relied on platinum and iridium oxides; however, their scarcity and exorbitant cost prevented industrial scalability.'
      },
      {
        label: 'C',
        text: 'Recent breakthroughs from the Zurich Institute of Nanotechnology circumvented this barrier by fabricating porous cobalt-oxide nanostructures embedded within synthetic lipid bilayers. These bio-inspired arrays achieve a solar-to-hydrogen conversion efficiency exceeding 18%, surpassing the theoretical yield of natural terrestrial plants. Furthermore, these synthetic catalysts demonstrate extraordinary resilience against photochemical degradation, maintaining peak catalytic turnover across thousands of operational hours.'
      },
      {
        label: 'D',
        text: 'Despite these milestones, engineering an economical commercial device requires addressing product separation. When hydrogen and oxygen gases are co-generated in open aqueous electrolytes, flammable stoichiometric mixtures can form, posing severe explosion risks. Implementing ion-selective polymeric membranes that isolate gas streams while permitting proton diffusion remains the paramount engineering challenge before grid-scale deployment.'
      }
    ],
    questions: [
      {
        id: 12,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Artificial photosynthesis produces storable chemical fuels rather than direct electrical current.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        explanation: 'Paragraph A specifies that artificial photosynthesis systems synthesize chemical fuels directly, offering high-density, storable energy.'
      },
      {
        id: 13,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Terrestrial plants have a higher theoretical solar-to-hydrogen conversion efficiency than cobalt-oxide nanostructures.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph C states that cobalt-oxide nanostructures achieve an efficiency exceeding 18%, "surpassing the theoretical yield of natural terrestrial plants."'
      },
      {
        id: 14,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Why were platinum and iridium catalysts considered impractical for mass commercialization?',
        options: [
          'They corroded instantly when exposed to saline water',
          'Their scarcity and exorbitant financial cost prevented industrial scalability',
          'They generated toxic chemical byproducts during hydrogen synthesis',
          'Their operational lifespan was limited to under fifty hours'
        ],
        correctAnswer: 'Their scarcity and exorbitant financial cost prevented industrial scalability',
        explanation: 'Paragraph B explicitly highlights: "however, their scarcity and exorbitant cost prevented industrial scalability."'
      },
      {
        id: 15,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Polymeric membranes for gas separation have already eliminated all explosion risks in commercial utility power grids.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph D notes that implementing ion-selective membranes "remains the paramount engineering challenge before grid-scale deployment," meaning it is not yet resolved.'
      }
    ]
  },
  {
    id: 'p2-bioluminescence',
    passageNumber: 2,
    testIndex: 2,
    title: 'Bioluminescence & Luciferin Chemistry in Abyssal Ocean Trenches',
    domain: 'Marine Biology & Photochemistry',
    wordCount: 780,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.0 – 8.5',
    questionTypes: ['MATCHING_HEADINGS', 'SUMMARY_COMPLETION'],
    excerpt: 'Beneath the epipelagic photic zone, where solar irradiance is extinguished entirely at depths surpassing 1,000 meters, organisms navigate perpetual absolute darkness using cold chemical luminescence...',
    paragraphs: [
      {
        label: 'A',
        text: 'Beneath the epipelagic photic zone, where solar irradiance is extinguished entirely at depths surpassing 1,000 meters, organisms navigate perpetual absolute darkness using cold chemical luminescence. In the bathypelagic abyss, over 75% of macroscopic organisms produce their own biological light via enzymatic oxidation.'
      },
      {
        label: 'B',
        text: 'The biochemical mechanics of oceanic bioluminescence rely on a substrate known generically as luciferin and its catalytic enzyme luciferase. When catalyzed in the presence of molecular oxygen and magnesium ions, the reaction yields oxyluciferin in an electronically excited state. As this molecule relaxes to its ground state, it releases photons primarily in blue and cyan wavelengths (470–490 nm)—the exact spectral spectrum that penetrates water with minimal optical attenuation.'
      },
      {
        label: 'C',
        text: 'Crucially, abyssal organisms harness biological photons for divergent evolutionary functions: counter-illumination camouflage against ventral predators, predatory lures (as epitomized by the esca organ in deep-sea anglerfish), and intraspecific recognition for reproductive synchrony.'
      },
      {
        label: 'D',
        text: 'In medical biotechnology, bacterial and marine luciferases have been repurposed as ultra-sensitive real-time optical biosensors. By tagging oncological cellular proteins with luciferase genes, oncologists can monitor tumor angiogenesis and pharmacological drug response in living tissue without radioactive tracer isotopes.'
      }
    ],
    questions: [
      {
        id: 16,
        type: 'MATCHING_HEADINGS',
        prompt: 'Which paragraph explains the chemical substrate and wavelength physics of photon generation?',
        options: ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D'],
        correctAnswer: 'Paragraph B',
        explanation: 'Paragraph B details the enzymatic interaction between luciferin and luciferase, and blue-cyan wavelength transmission.'
      },
      {
        id: 17,
        type: 'SUMMARY_COMPLETION',
        prompt: 'Why do deep-sea creatures primarily emit blue-green photons rather than red wavelengths?',
        options: [
          'Because blue wavelengths suffer the least optical attenuation through dense water',
          'Because deep-sea enzymes lack the capability to synthesize red pigments',
          'To intentionally dazzle and blind approaching larger predators',
          'Due to the high concentration of sodium chloride in bathypelagic water'
        ],
        correctAnswer: 'Because blue wavelengths suffer the least optical attenuation through dense water',
        explanation: 'Paragraph B notes that blue-cyan wavelengths penetrate water with minimal optical attenuation.'
      },
      {
        id: 18,
        type: 'MATCHING_HEADINGS',
        prompt: 'Which paragraph describes clinical pharmaceutical and oncology applications of marine enzymes?',
        options: ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D'],
        correctAnswer: 'Paragraph D',
        explanation: 'Paragraph D details how medical biotechnology harnesses luciferases as optical biosensors for tumor tracking.'
      }
    ]
  },
  {
    id: 'p2-decision-fatigue',
    passageNumber: 2,
    testIndex: 3,
    title: 'The Neurological Mechanics of Executive Decision Fatigue',
    domain: 'Behavioral Economics & Cognitive Psychology',
    wordCount: 760,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.0 – 8.5',
    questionTypes: ['TRUE_FALSE_NOT_GIVEN', 'MATCHING_HEADINGS'],
    excerpt: 'Every deliberate decision made throughout waking hours—from evaluating contractual clauses to selecting breakfast items—depletes a finite reserve of prefrontal executive energy...',
    paragraphs: [
      {
        label: 'A',
        text: 'Every deliberate choice made throughout waking hours—from arbitrating intricate commercial contracts to trivial consumer purchases—draws upon a unified, finite cognitive pool of executive willpower. Psychologists term the progressive deterioration in decision quality following prolonged sessions of judgment "ego depletion" or decision fatigue.'
      },
      {
        label: 'B',
        text: 'A landmark sociological investigation analyzed over 1,100 judicial rulings rendered by Israeli parole boards over a ten-month timeframe. The data demonstrated that prisoners appearing before judges early in the morning session were granted parole in approximately 65% of cases. Conversely, by late morning or immediately preceding lunch recesses, the rate of favorable rulings plummeted to near zero, before rebounding sharply following dietary replenishment.'
      },
      {
        label: 'C',
        text: 'When the dorsolateral prefrontal cortex suffers from glucose and metabolic depletion, the cognitive system instinctively defaults to behavioral shortcuts (heuristics). In high-stakes legal or clinical settings, this default manifested as preserving the status quo—denying parole or ordering conservative, redundant diagnostic imaging.'
      },
      {
        label: 'D',
        text: 'To mitigate executive exhaustion, elite organizations enforce structural decision hygiene: streamlining wardrobe and meals (as famously practiced by tech executives), scheduling critical analytical deliberation solely during morning chronotype peaks, and implementing mandatory cognitive rest protocols.'
      }
    ],
    questions: [
      {
        id: 19,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'Decision fatigue exclusively impacts individuals with pre-existing clinical attention deficits.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph A explains that decision fatigue draws upon a universal, finite cognitive pool affecting all individuals.'
      },
      {
        id: 20,
        type: 'MATCHING_HEADINGS',
        prompt: 'Which paragraph presents real-world statistical evidence from legal parole adjudications?',
        options: ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D'],
        correctAnswer: 'Paragraph B',
        explanation: 'Paragraph B details the 1,100 judicial rulings in Israeli parole boards across morning and afternoon sessions.'
      },
      {
        id: 21,
        type: 'TRUE_FALSE_NOT_GIVEN',
        prompt: 'When fatigued, human decision-makers consistently default to riskier, unconventional choices.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        explanation: 'Paragraph C explicitly states that fatigued brains default to behavioral shortcuts that preserve the status quo.'
      }
    ]
  },

  // =========================================================================
  // PASSAGE 3 TESTS (Complex Analytical & Theories)
  // =========================================================================
  {
    id: 'p3-memory-consolidation',
    passageNumber: 3,
    testIndex: 1,
    title: 'The Neurobiology of Human Memory Consolidation & Cognitive Retrieval',
    domain: 'Cognitive Neuroscience & Neuroplasticity',
    wordCount: 850,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.5 – 9.0',
    questionTypes: ['YES_NO_NOT_GIVEN', 'MULTIPLE_CHOICE'],
    excerpt: 'Cognitive neuroscientists have long debated the precise biochemical choreography by which ephemeral sensory impressions are transformed into enduring episodic memories...',
    paragraphs: [
      {
        label: 'A',
        text: 'Cognitive neuroscientists have long debated the precise biochemical choreography by which ephemeral sensory impressions are transformed into enduring episodic memories. According to the two-stage memory consolidation framework, the mammalian brain bifurcates storage into a rapid-acquisition temporary buffer located in the hippocampus, and an expansive, resilient repository situated throughout the cerebral neocortex.'
      },
      {
        label: 'B',
        text: 'During wakefulness, the hippocampus rapidly encodes multi-sensory experiences through long-term potentiation (LTP)—a process whereby synaptic junctions between pyramidal neurons are electrochemically fortified. However, hippocampal storage capacity is inherently finite; without systematic offloading, neural networks would inevitably succumb to catastrophic retroactive interference, wherein novel learning erases antecedent memories.'
      },
      {
        label: 'C',
        text: "The consolidation transfer occurs primarily during non-rapid eye movement (NREM) slow-wave sleep. High-density electroencephalography (EEG) recordings demonstrate that synchronized slow oscillations in the prefrontal cortex trigger sharp-wave ripple complexes in the hippocampus. These ripples effectively 'replay' daytime neural firing sequences at compressed temporal speeds. This iterative reactivation gradually remodels neocortical synaptic connectivity, entrenching memories into stable semantic networks independent of hippocampal integrity."
      },
      {
        label: 'D',
        text: 'Intriguingly, contemporary research challenges the dogma that consolidated memories remain immutable once established. Under the paradigm of memory reconsolidation, whenever an established memory is consciously retrieved into working memory, it temporarily reverts to an unstable, labile state. During this critical window, targeted pharmacological agents or behavioral interference can selectively attenuate or rewrite traumatic emotional valences, presenting novel therapeutic avenues for post-traumatic stress disorders.'
      }
    ],
    questions: [
      {
        id: 22,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'The hippocampus is capable of retaining an infinite volume of episodic memories without transferring data to the neocortex.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        explanation: 'Paragraph B explicitly states that hippocampal storage capacity is inherently finite and necessitates systematic offloading.'
      },
      {
        id: 23,
        type: 'MULTIPLE_CHOICE',
        prompt: 'What happens during the critical window of memory reconsolidation when an existing memory is retrieved?',
        options: [
          'The memory is immediately mirrored across both cerebral hemispheres',
          'It temporarily reverts to an unstable, labile state that can be attenuated or altered',
          'All associated sensory details are permanently expunged from the neocortex',
          'The synaptic connections undergo irrevocable calcification'
        ],
        correctAnswer: 'It temporarily reverts to an unstable, labile state that can be attenuated or altered',
        explanation: 'Paragraph D notes that whenever retrieved, a memory "temporarily reverts to an unstable, labile state. During this critical window... interference can selectively attenuate or rewrite traumatic emotional valences."'
      },
      {
        id: 24,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'Hippocampal sharp-wave ripples replay daytime neural firing sequences at accelerated temporal speeds during NREM sleep.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        explanation: 'Paragraph C states: "These ripples effectively \'replay\' daytime neural firing sequences at compressed temporal speeds."'
      },
      {
        id: 25,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'Pharmacological reconsolidation protocols have already successfully eliminated all traumatic memories in human clinical trials.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        explanation: 'Paragraph D mentions presenting novel therapeutic avenues, but makes no claim that all traumatic memories have been eliminated in human trials.'
      }
    ]
  },
  {
    id: 'p3-linguistic-relativity',
    passageNumber: 3,
    testIndex: 2,
    title: 'Linguistic Relativity & The Architecture of Conceptual Thought',
    domain: 'Cognitive Linguistics & Epistemology',
    wordCount: 880,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.5 – 9.0',
    questionTypes: ['YES_NO_NOT_GIVEN', 'SUMMARY_COMPLETION'],
    excerpt: 'Does the grammatical syntax and vocabulary of a native mother tongue circumscribe how speakers conceptualize objective reality? The Sapir-Whorf hypothesis has ignited fervent debates...',
    paragraphs: [
      {
        label: 'A',
        text: 'The proposition that language determines or significantly steers human perception of physical reality—conventionally known as the principle of linguistic relativity or the Sapir-Whorf hypothesis—has occupied a polarizing position in cognitive anthropology for over a century. Extreme linguistic determinism claims thought is imprisoned by language; weak relativity suggests language merely directs habitual cognitive focus.'
      },
      {
        label: 'B',
        text: 'Empirical substantiation has emerged from cross-linguistic studies examining spatial orientation. In the indigenous Australian language Guugu Yimithirr, egocentric spatial coordinates (such as "left", "right", "ahead") are entirely absent. Speakers utilize absolute cardinal coordinates ("north", "south-southwest", "east") for all positional descriptions, whether identifying distant geography or referring to an ant on their own foot. Neurological evaluations confirm that Guugu Yimithirr speakers possess an internal dead-reckoning navigational compass far superior to Western subjects.'
      },
      {
        label: 'C',
        text: 'Similarly, chromo-linguistic research across languages with differing lexical boundaries for color (such as Russian distinguishing light blue "goluboy" from dark blue "siniy") demonstrates that distinct grammatical categories accelerate neural perceptual discrimination at subconscious sensory thresholds.'
      },
      {
        label: 'D',
        text: 'Consequently, while modern neurobiologists reject dogmatic determinism—affirming that all humans share identical neural visual apparatus—linguistic frameworks unmistakably train our cognitive attention, subtly sculpting our mental map of the universe.'
      }
    ],
    questions: [
      {
        id: 26,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'Guugu Yimithirr speakers routinely employ relative directional words like "left" and "right" when giving directions.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        explanation: 'Paragraph B explicitly notes that egocentric terms like "left" and "right" are entirely absent in Guugu Yimithirr.'
      },
      {
        id: 27,
        type: 'SUMMARY_COMPLETION',
        prompt: 'Contemporary cognitive linguists largely agree that linguistic differences:',
        options: [
          'Completely prevent speakers from understanding universal physical laws',
          'Habitually guide attention and modulate perceptual discrimination speed',
          'Have zero measurable influence on human spatial orientation',
          'Only alter conscious writing styles rather than mental representations'
        ],
        correctAnswer: 'Habitually guide attention and modulate perceptual discrimination speed',
        explanation: 'Paragraphs C and D conclude that linguistic frameworks train cognitive attention and accelerate perceptual discrimination without completely imprisoning thought.'
      },
      {
        id: 28,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'Russian speakers possess a biologically distinct ocular retina that perceives photons differently from English speakers.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        explanation: 'Paragraph D clarifies that all humans share identical neural visual apparatus; the difference is in lexical categorization.'
      }
    ]
  },
  {
    id: 'p3-quantum-cryptography',
    passageNumber: 3,
    testIndex: 3,
    title: 'Quantum Key Distribution & The Cryptographic Paradigm Shift',
    domain: 'Quantum Information & Applied Cybersecurity',
    wordCount: 910,
    recommendedTimeMin: 20,
    targetBand: 'Band 7.5 – 9.0',
    questionTypes: ['YES_NO_NOT_GIVEN', 'MULTIPLE_CHOICE'],
    excerpt: 'Contemporary global financial networks and confidential diplomatic communications rely fundamentally on asymmetric public-key cryptography, such as RSA algorithms...',
    paragraphs: [
      {
        label: 'A',
        text: "Contemporary global telecommunications, encrypted financial transfers, and national state secrets depend upon asymmetric public-key cryptosystems, most notably RSA and elliptic-curve cryptography. The security of these mathematical protocols is predicated on computational intractability: prime factorizing a 4,096-bit integer would demand millennia from conventional supercomputers. However, the advent of fault-tolerant quantum computing running Shor's algorithm threatens to nullify this mathematical foundation within seconds."
      },
      {
        label: 'B',
        text: 'In response, cryptographers have pioneered Quantum Key Distribution (QKD), an encryption methodology grounded in the fundamental laws of quantum physics rather than mathematical complexity. In protocols such as BB84, secret cryptographic keys are encoded within quantum states of individual photons (polarization angles or phase shifts) transmitted through optical fiber networks.'
      },
      {
        label: 'C',
        text: "The inviolability of QKD stems from the Heisenberg Uncertainty Principle and the Quantum No-Cloning Theorem. An eavesdropper (conventionally designated as Eve) attempting to intercept or copy a stream of polarized photons inevitably perturbs their delicate superposition states. This perturbation introduces an immediate, statistically detectable increase in the Quantum Bit Error Rate (QBER). Legitimate communicators (Alice and Bob) instantly identify the espionage attempt and abort the key generation protocol."
      },
      {
        label: 'D',
        text: 'While theoretically impenetrable, commercial QKD deployment encounters formidable engineering constraints. Photonic attenuation in standard silica fibers restricts terrestrial quantum transmission to approximately 100 kilometers without trusted relay nodes. Developing orbital satellite laser transceivers and quantum repeaters remains the decisive frontier for constructing a truly global quantum internet.'
      }
    ],
    questions: [
      {
        id: 29,
        type: 'YES_NO_NOT_GIVEN',
        prompt: "Shor's algorithm executed on quantum computers poses an existential threat to conventional RSA mathematical encryption.",
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'YES',
        explanation: 'Paragraph A affirms that Shor\'s algorithm on fault-tolerant quantum hardware threatens to nullify conventional asymmetric cryptography within seconds.'
      },
      {
        id: 30,
        type: 'MULTIPLE_CHOICE',
        prompt: 'Why is it physically impossible for an eavesdropper to surreptitiously intercept QKD photons without detection?',
        options: [
          'Because any quantum measurement perturbs the photon state and creates a detectable error rate',
          'Because fiber optic cables are shielded by impenetrable radioactive casings',
          'Because photons disintegrate into heat energy immediately upon leaving the transmitter',
          'Because quantum keys are stored exclusively in offline mechanical vaults'
        ],
        correctAnswer: 'Because any quantum measurement perturbs the photon state and creates a detectable error rate',
        explanation: 'Paragraph C states that attempting to intercept or copy polarized photons inevitably perturbs their superposition states, introducing an immediate detectable increase in QBER.'
      },
      {
        id: 31,
        type: 'YES_NO_NOT_GIVEN',
        prompt: 'Terrestrial fiber optic cables can currently transmit quantum keys over distances exceeding 5,000 kilometers without any intermediate relay stations.',
        options: ['YES', 'NO', 'NOT GIVEN'],
        correctAnswer: 'NO',
        explanation: 'Paragraph D notes that photonic attenuation in silica fibers restricts transmission to approximately 100 kilometers without trusted relay nodes.'
      }
    ]
  }
];

export const ReadingPage: React.FC = () => {
  // Navigation mode:
  // activePassage: 1 | 2 | 3 | 'wordbank'
  const [activePassage, setActivePassage] = useState<1 | 2 | 3 | 'wordbank'>(1);

  // View state inside a passage:
  // 'list'  = Browse tests for this passage, filter by question type!
  // 'arena' = Full split-screen reading test environment!
  const [passageView, setPassageView] = useState<'list' | 'arena'>('list');

  // Selected test item being practiced in arena
  const [selectedTest, setSelectedTest] = useState<ReadingTestItem>(ALL_READING_TESTS[0]);

  // Question Type filter inside the passage list
  const [selectedQuestionTypeFilter, setSelectedQuestionTypeFilter] = useState<string>('ALL');

  // Search input in passage list
  const [testSearchQuery, setTestSearchQuery] = useState('');

  // User answers per question ID
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // Word Bank / Vocab Vault state
  const [vocabVault, setVocabVault] = useState<VocabItem[]>([]);
  const [selectedWordInfo, setSelectedWordInfo] = useState<Partial<VocabItem> | null>(null);
  const [wordLookupLoading, setWordLookupLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // In-text persistent highlighter state
  const [userHighlights, setUserHighlights] = useState<string[]>([
    'phenomenon', 'divergence', 'circumvent', 'anthropogenic', 'biomimetic', 'exorbitant', 'ephemeral', 'attenuate'
  ]);
  const [floatingToolbar, setFloatingToolbar] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Word Bank filters
  const [wordBankSearch, setWordBankSearch] = useState('');
  const [cefrFilter, setCefrFilter] = useState<'ALL' | 'B2' | 'C1' | 'C2'>('ALL');
  const [passageVaultFilter, setPassageVaultFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Timer per test
  const [timeLeftSec, setTimeLeftSec] = useState(1200); // 20 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load initial vocab vault
  useEffect(() => {
    api.getVocabVault().then(res => {
      if (res?.data && res.data.length > 0) {
        setVocabVault(res.data);
      } else {
        // High quality seed vocabulary
        setVocabVault([
          {
            id: 'v-seed-1',
            word: 'Phenomenon',
            definition: 'A fact or situation that is observed to exist or happen, especially one whose cause or explanation is in question.',
            translationUz: 'Hodisa, noyob hodisa, fenomen',
            partOfSpeech: 'noun',
            cefrLevel: 'C1',
            exampleSentence: 'Urban biodiversity growth is a remarkable biological phenomenon.',
            collocations: ['natural phenomenon', 'cultural phenomenon', 'widespread phenomenon'],
            savedAt: '2026-09-08T08:00:00Z',
            sourcePassage: 'Passage 1',
          },
          {
            id: 'v-seed-2',
            word: 'Circumvent',
            definition: 'To find an ingenious or strategic way around an obstacle, problem, or acoustic interference.',
            translationUz: 'Aylanib o\'tmoq, yo\'lini topmoq',
            partOfSpeech: 'verb',
            cefrLevel: 'C1',
            exampleSentence: 'Avian species circumvent morning acoustic interference by vocalizing before dawn.',
            collocations: ['circumvent the problem', 'circumvent regulations', 'circumvent barriers'],
            savedAt: '2026-09-08T08:10:00Z',
            sourcePassage: 'Passage 1',
          },
          {
            id: 'v-seed-3',
            word: 'Biomimetic',
            definition: 'Relating to the synthetic mimicry or replication of biological systems and natural models.',
            translationUz: 'Tabiatdagi biologik tizimlardan nusxa olingan, biomimetik',
            partOfSpeech: 'adjective',
            cefrLevel: 'C2',
            exampleSentence: 'Engineers synthesized biomimetic catalysts that duplicate natural leaf membranes.',
            collocations: ['biomimetic architecture', 'biomimetic synthesis', 'biomimetic catalysts'],
            savedAt: '2026-09-08T08:20:00Z',
            sourcePassage: 'Passage 2',
          },
          {
            id: 'v-seed-4',
            word: 'Exorbitant',
            definition: 'Unreasonably or excessively high in price, scale, or financial demand.',
            translationUz: 'Haddan tashqari yuqori, qimmat, oshiqcha',
            partOfSpeech: 'adjective',
            cefrLevel: 'C1',
            exampleSentence: 'Early laboratory prototypes required exorbitant capital expenditures for rare metals.',
            collocations: ['exorbitant prices', 'exorbitant cost', 'exorbitant fees'],
            savedAt: '2026-09-08T08:30:00Z',
            sourcePassage: 'Passage 2',
          },
          {
            id: 'v-seed-5',
            word: 'Ephemeral',
            definition: 'Lasting for a very short, transient period of time; fleeting.',
            translationUz: 'O\'tkinchi, qisqa muddatli, lahzalik',
            partOfSpeech: 'adjective',
            cefrLevel: 'C2',
            exampleSentence: 'Ephemeral sensory perceptions are converted into enduring semantic memory.',
            collocations: ['ephemeral nature', 'ephemeral pleasure', 'ephemeral impressions'],
            savedAt: '2026-09-08T08:40:00Z',
            sourcePassage: 'Passage 3',
          },
          {
            id: 'v-seed-6',
            word: 'Inviolability',
            definition: 'The state or quality of being secure from violation, infringement, or assault.',
            translationUz: 'Daxlsizlik, buzilmaslik, o\'tib bo\'lmaslik',
            partOfSpeech: 'noun',
            cefrLevel: 'C2',
            exampleSentence: 'The inviolability of quantum keys stems from fundamental quantum laws.',
            collocations: ['absolute inviolability', 'inviolability of law', 'constitutional inviolability'],
            savedAt: '2026-09-08T08:50:00Z',
            sourcePassage: 'Passage 3',
          }
        ]);
      }
    });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeftSec <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSec(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeftSec]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Top Card Select: Passage 1, 2, 3 or Word Bank
  const handleSelectPassageCard = (mode: 1 | 2 | 3 | 'wordbank') => {
    setActivePassage(mode);
    setSelectedWordInfo(null);
    setSelectedQuestionTypeFilter('ALL');
    setTestSearchQuery('');
    setPassageView('list');
  };

  // Start specific test -> Arena
  const handleStartTest = (testItem: ReadingTestItem) => {
    setSelectedTest(testItem);
    setTimeLeftSec(testItem.recommendedTimeMin * 60);
    setIsTimerRunning(true);
    setSubmittedResult(null);
    setSelectedWordInfo(null);
    setPassageView('arena');
  };

  // Text selection handler that positions the floating toolbar right above selected word
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const selectedText = selection.toString().trim();
    
    // Trigger toolbar for selections between 2 chars and 6 words
    if (selectedText.length >= 2 && selectedText.split(/\s+/).length <= 6) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFloatingToolbar({
          x: Math.max(16, rect.left + rect.width / 2),
          y: Math.max(10, rect.top - 46),
          text: selectedText,
        });
      } catch {
        // fallback
      }
    }
  };

  // 1. Mark selected text as persistent yellow highlight in passage
  const handleApplyHighlight = (textToHighlight: string) => {
    const clean = textToHighlight.trim();
    if (!clean) return;
    setUserHighlights(prev => Array.from(new Set([...prev, clean])));
    setFloatingToolbar(null);
    window.getSelection()?.removeAllRanges();
    setSaveSuccessMsg(`Highlighted "${clean}" in passage!`);
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // 2. Add selected text directly to Word Bank & also highlight it
  const handleQuickSaveToWordBank = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    // Persist highlight immediately
    setUserHighlights(prev => Array.from(new Set([...prev, clean])));
    setFloatingToolbar(null);
    window.getSelection()?.removeAllRanges();

    try {
      const res = await api.lookupWord(clean);
      const data = res?.data || {};
      const newWord: VocabItem = {
        id: `v-${Date.now()}`,
        word: data.word || (clean.charAt(0).toUpperCase() + clean.slice(1)),
        definition: data.definition || 'Academic terminology tested in IELTS Reading Passages.',
        translationUz: data.translationUz || "Kontekstdagi akademik so'z",
        partOfSpeech: data.partOfSpeech || 'term',
        cefrLevel: (data.cefrLevel as any) || 'C1',
        exampleSentence: data.exampleSentence || `Understanding "${clean}" in context elevates reading score.`,
        collocations: data.collocations || ['academic reading', 'high-frequency usage'],
        savedAt: new Date().toISOString(),
        sourcePassage: `Passage ${selectedTest.passageNumber}: ${selectedTest.title}`,
      };

      try {
        await api.saveVocabWord(newWord);
      } catch {}

      setVocabVault(prev => [newWord, ...prev.filter(v => v.word.toLowerCase() !== clean.toLowerCase())]);
      setSelectedWordInfo(newWord);
      setSaveSuccessMsg(`Added "${newWord.word}" to Word Bank!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch {
      // fallback
    }
  };

  // 3. Clicked on an already highlighted word in text -> show its info / options
  const handleHighlightClick = async (clickedWord: string) => {
    const clean = clickedWord.trim();
    const existing = vocabVault.find(v => v.word.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setSelectedWordInfo(existing);
    } else {
      setWordLookupLoading(true);
      try {
        const res = await api.lookupWord(clean);
        if (res?.data) {
          setSelectedWordInfo({
            ...res.data,
            sourcePassage: `Passage ${selectedTest.passageNumber}: ${selectedTest.title}`
          });
        }
      } catch {
        setSelectedWordInfo({
          word: clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase(),
          definition: "High-yield academic term highlighted in reading text. Save to Word Bank to study in your vault.",
          translationUz: "Kontekstdagi akademik so'z",
          cefrLevel: "C1",
          partOfSpeech: "term",
          exampleSentence: `Highlighted from Passage ${selectedTest.passageNumber}.`,
          collocations: ['academic usage'],
          sourcePassage: `Passage ${selectedTest.passageNumber}: ${selectedTest.title}`,
        });
      } finally {
        setWordLookupLoading(false);
      }
    }
  };

  // 4. Remove highlight from text
  const handleRemoveHighlight = (wordToRemove: string) => {
    const clean = wordToRemove.trim().toLowerCase();
    setUserHighlights(prev => prev.filter(w => w.toLowerCase() !== clean));
    if (selectedWordInfo?.word?.toLowerCase() === clean) {
      setSelectedWordInfo(null);
    }
    setSaveSuccessMsg(`Removed highlight for "${wordToRemove}"`);
    setTimeout(() => setSaveSuccessMsg(''), 2000);
  };

  // 5. Render paragraph text with interactive <mark> highlighting
  const renderParagraphWithHighlights = (text: string, pLabel: string) => {
    const allWordsToHighlight = Array.from(new Set([
      ...userHighlights,
      ...vocabVault.map(v => v.word)
    ])).filter(w => w && w.trim().length >= 2);

    if (allWordsToHighlight.length === 0) {
      return <span>{text}</span>;
    }

    // Sort descending by length so longer phrases match first
    const sorted = [...allWordsToHighlight].sort((a, b) => b.length - a.length);
    const escaped = sorted.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, idx) => {
          const isMatch = sorted.some(w => w.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            const inVault = vocabVault.some(v => v.word.toLowerCase() === part.toLowerCase());
            return (
              <mark
                key={`${pLabel}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHighlightClick(part);
                }}
                className={`px-1 py-0.5 rounded cursor-pointer transition-all duration-150 inline-block mx-0.5 select-none font-medium ${
                  inVault
                    ? 'bg-amber-300/40 dark:bg-amber-400/30 text-on-surface border-b-2 border-amber-500 hover:bg-amber-300/60 dark:hover:bg-amber-400/50 shadow-xs'
                    : 'bg-yellow-200/60 dark:bg-yellow-500/30 text-on-surface border-b-2 border-yellow-400 hover:bg-yellow-200/80'
                }`}
                title="Click to view definition, save to Word Bank, or remove highlight"
              >
                {part}
                {inVault && (
                  <span className="ml-0.5 text-[9px] text-amber-600 dark:text-amber-400 font-bold select-none">★</span>
                )}
              </mark>
            );
          }
          return <span key={`${pLabel}-${idx}`}>{part}</span>;
        })}
      </span>
    );
  };

  // Save selected word directly to Word Bank
  const handleSaveToWordBank = async () => {
    if (!selectedWordInfo?.word) return;
    
    const wordKey = selectedWordInfo.word.toLowerCase();
    const newWord: VocabItem = {
      id: `v-${Date.now()}`,
      word: selectedWordInfo.word,
      definition: selectedWordInfo.definition || 'Academic terminology tested in IELTS.',
      translationUz: selectedWordInfo.translationUz || "Akademik so'z",
      partOfSpeech: selectedWordInfo.partOfSpeech || 'noun',
      cefrLevel: (selectedWordInfo.cefrLevel as any) || 'C1',
      exampleSentence: selectedWordInfo.exampleSentence || '',
      collocations: selectedWordInfo.collocations || [],
      savedAt: new Date().toISOString(),
      sourcePassage: selectedWordInfo.sourcePassage || `Passage ${selectedTest.passageNumber}`,
    };

    try {
      await api.saveVocabWord(newWord);
    } catch {
      // offline fallback
    }

    setVocabVault(prev => [newWord, ...prev.filter(v => v.word.toLowerCase() !== wordKey)]);
    setUserHighlights(prev => Array.from(new Set([...prev, selectedWordInfo.word!])));
    setSaveSuccessMsg(`Added "${selectedWordInfo.word}" to Word Bank!`);
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  // Auto-Select answers for testing
  const handleAutoSelectAnswers = () => {
    const autoAnswers: Record<number, string> = {};
    selectedTest.questions.forEach(q => {
      autoAnswers[q.id] = q.correctAnswer;
    });
    setUserAnswers(prev => ({ ...prev, ...autoAnswers }));
  };

  // Submit and grade answers for active passage
  const handleSubmitPassage = () => {
    const questions = selectedTest.questions;
    let correctCount = 0;
    const details = questions.map(q => {
      const userAns = (userAnswers[q.id] || '').trim().toUpperCase();
      const correctAns = q.correctAnswer.trim().toUpperCase();
      const isCorrect = userAns === correctAns;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        userAnswer: userAnswers[q.id] || 'No Answer',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    let estimatedBand = 6.0;
    if (percentage === 100) estimatedBand = 9.0;
    else if (percentage >= 75) estimatedBand = 8.0;
    else if (percentage >= 50) estimatedBand = 7.0;

    setSubmittedResult({
      passageNumber: selectedTest.passageNumber,
      testTitle: selectedTest.title,
      totalQuestions: questions.length,
      correctCount,
      percentage,
      estimatedBand,
      details,
    });
  };

  // Filter tests inside active passage
  const currentPassageTests = typeof activePassage === 'number'
    ? ALL_READING_TESTS.filter(t => t.passageNumber === activePassage).filter(t => {
        // Question type filter
        if (selectedQuestionTypeFilter !== 'ALL') {
          if (!t.questionTypes.includes(selectedQuestionTypeFilter as QuestionType)) {
            return false;
          }
        }
        // Search query
        if (testSearchQuery.trim()) {
          const q = testSearchQuery.toLowerCase();
          return t.title.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q);
        }
        return true;
      })
    : [];

  // Filtered Word Bank items
  const filteredWords = vocabVault.filter(item => {
    if (wordBankSearch.trim()) {
      const q = wordBankSearch.toLowerCase();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchDef = item.definition.toLowerCase().includes(q);
      const matchUz = item.translationUz.toLowerCase().includes(q);
      if (!matchWord && !matchDef && !matchUz) return false;
    }
    if (cefrFilter !== 'ALL' && item.cefrLevel !== cefrFilter) return false;
    if (passageVaultFilter !== 'ALL') {
      if (!item.sourcePassage || !item.sourcePassage.includes(passageVaultFilter)) return false;
    }
    return true;
  });

  const handleDeleteWord = (wordId: string) => {
    setVocabVault(prev => prev.filter(w => w.id !== wordId));
  };

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % (filteredWords.length || 1));
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + filteredWords.length) % (filteredWords.length || 1));
  };

  // Helpers for question type labels
  const formatQuestionType = (type: QuestionType) => {
    switch (type) {
      case 'TRUE_FALSE_NOT_GIVEN': return 'True / False / Not Given';
      case 'YES_NO_NOT_GIVEN': return 'Yes / No / Not Given';
      case 'MATCHING_HEADINGS': return 'Matching Headings';
      case 'SUMMARY_COMPLETION': return 'Summary Completion';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      default: return type;
    }
  };

  const currentMeta = typeof activePassage === 'number' ? PASSAGE_METAS[activePassage] : null;

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
              Academic Reading Lab & Lexicon Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-1">
            Reading Practice
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-xl">
            Choose your passage, filter by official IELTS question types, take timed practice tests, and collect academic vocabulary into your Word Bank.
          </p>
        </div>

        {/* Action button: Word Bank shortcut or Back */}
        <div className="flex items-center gap-2.5">
          {passageView === 'arena' && (
            <button
              onClick={() => setPassageView('list')}
              className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-surface-container-high shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Passage {selectedTest.passageNumber} Tests</span>
            </button>
          )}

          <button
            onClick={() => handleSelectPassageCard('wordbank')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer font-bold text-xs shadow-xs active:scale-95 border ${
              activePassage === 'wordbank'
                ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-amber-500/20 shadow-md'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30'
            }`}
          >
            <span className="material-symbols-outlined text-base">bookmark</span>
            <span>Word Bank</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20">
              {vocabVault.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP CARDS SELECTOR: PASSAGE 1, 2, 3 + WORD BANK                        */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
        
        {/* CARD 1: PASSAGE 1 (Sky Blue) */}
        <button
          onClick={() => handleSelectPassageCard(1)}
          className={`w-36 sm:w-48 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePassage === 1
              ? 'border-[#0284C7] ring-4 ring-[#0284C7]/30 scale-105 bg-[#0284C7]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
          }`}
          title="Passage 1: Factual & Descriptive"
        >
          <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#0284C7]">
              <span className="material-symbols-outlined text-base sm:text-lg">article</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Passage</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-on-surface">PASSAGE 1</div>
              <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Factual • Band 6.5–7.5</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#0284C7] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
            1
          </div>
        </button>

        {/* CARD 2: PASSAGE 2 (Emerald Green) */}
        <button
          onClick={() => handleSelectPassageCard(2)}
          className={`w-36 sm:w-48 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePassage === 2
              ? 'border-[#10B981] ring-4 ring-[#10B981]/30 scale-105 bg-[#10B981]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
          }`}
          title="Passage 2: Applied Research & Analysis"
        >
          <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#10B981]">
              <span className="material-symbols-outlined text-base sm:text-lg">science</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Passage</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-on-surface">PASSAGE 2</div>
              <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Applied • Band 7.0–8.5</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#10B981] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
            2
          </div>
        </button>

        {/* CARD 3: PASSAGE 3 (Purple/Violet) */}
        <button
          onClick={() => handleSelectPassageCard(3)}
          className={`w-36 sm:w-48 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePassage === 3
              ? 'border-[#8B5CF6] ring-4 ring-[#8B5CF6]/30 scale-105 bg-[#8B5CF6]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
          }`}
          title="Passage 3: Complex Analytical Theory"
        >
          <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#8B5CF6]">
              <span className="material-symbols-outlined text-base sm:text-lg">psychology</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Passage</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-on-surface">PASSAGE 3</div>
              <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">Complex • Band 7.5–9.0</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#8B5CF6] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
            3
          </div>
        </button>

        {/* CARD 4: WORD BANK (Golden Amber) */}
        <button
          onClick={() => handleSelectPassageCard('wordbank')}
          className={`w-36 sm:w-48 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePassage === 'wordbank'
              ? 'border-[#F59E0B] ring-4 ring-[#F59E0B]/30 scale-105 bg-[#F59E0B]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-80 hover:opacity-100'
          }`}
          title="Word Bank & Vocab Vault"
        >
          <div className="w-3/5 h-full p-2.5 sm:p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <span className="material-symbols-outlined text-base sm:text-lg">bookmark</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Vault</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-on-surface">WORD BANK</div>
              <div className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium">{vocabVault.length} words</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#F59E0B] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
            <span className="material-symbols-outlined text-2xl sm:text-3xl">auto_stories</span>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 3. PASSAGE TESTS LIST VIEW (WITH QUESTION TYPE FILTERS)                   */}
      {/* ========================================================================= */}
      {typeof activePassage === 'number' && passageView === 'list' && currentMeta && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Passage Overview Hero Banner */}
          <div 
            className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4"
            style={{
              backgroundColor: `${currentMeta.colorHex}08`,
              borderColor: `${currentMeta.colorHex}35`
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white font-black text-2xl"
                  style={{ backgroundColor: currentMeta.colorHex }}
                >
                  {currentMeta.passageNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${currentMeta.colorHex}20`,
                        color: currentMeta.colorHex
                      }}
                    >
                      {currentMeta.targetBand}
                    </span>
                    <span className="text-xs text-on-surface-variant font-semibold">
                      {currentMeta.typicalLength}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1">
                    {currentMeta.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed max-w-2xl">
                    {currentMeta.subtitle}. {currentMeta.strategyNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Typical IELTS Question Types for this passage badge row */}
            <div className="pt-3 border-t border-surface-container-high/40 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Common IELTS Question Formats:
              </span>
              {currentMeta.typicalQuestionTypes.map((qType, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-surface-container-lowest border border-surface-container-high/60 text-on-surface shadow-xs"
                >
                  ✓ {qType}
                </span>
              ))}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/50 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                search
              </span>
              <input
                type="text"
                value={testSearchQuery}
                onChange={(e) => setTestSearchQuery(e.target.value)}
                placeholder={`Filter Passage ${activePassage} tests...`}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Question Type Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mr-1">
                Filter by Type:
              </span>

              <button
                onClick={() => setSelectedQuestionTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedQuestionTypeFilter === 'ALL'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                }`}
              >
                All Tests ({ALL_READING_TESTS.filter(t => t.passageNumber === activePassage).length})
              </button>

              {activePassage === 1 && (
                <>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('TRUE_FALSE_NOT_GIVEN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'TRUE_FALSE_NOT_GIVEN'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    True / False / Not Given
                  </button>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('SUMMARY_COMPLETION')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'SUMMARY_COMPLETION'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    Summary Completion
                  </button>
                </>
              )}

              {activePassage === 2 && (
                <>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('MATCHING_HEADINGS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'MATCHING_HEADINGS'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    Matching Headings
                  </button>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('TRUE_FALSE_NOT_GIVEN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'TRUE_FALSE_NOT_GIVEN'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    True / False / Not Given
                  </button>
                </>
              )}

              {activePassage === 3 && (
                <>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('YES_NO_NOT_GIVEN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'YES_NO_NOT_GIVEN'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    Yes / No / Not Given
                  </button>
                  <button
                    onClick={() => setSelectedQuestionTypeFilter('MULTIPLE_CHOICE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestionTypeFilter === 'MULTIPLE_CHOICE'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-container-high/60'
                    }`}
                  >
                    Multiple Choice
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Test Items Catalog */}
          <div className="grid grid-cols-1 gap-4">
            {currentPassageTests.length === 0 ? (
              <div className="p-12 rounded-3xl bg-surface-container-low border border-surface-container-high/40 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">filter_alt_off</span>
                <h3 className="text-base font-bold text-on-surface">No tests match this filter</h3>
                <p className="text-xs text-on-surface-variant">Try selecting "All Tests" or adjust your search keywords.</p>
                <button
                  onClick={() => setSelectedQuestionTypeFilter('ALL')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              currentPassageTests.map((testItem) => (
                <div
                  key={testItem.id}
                  onClick={() => handleStartTest(testItem)}
                  className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/60 hover:bg-surface-container/60 transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3 flex-1">
                    {/* Header meta badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="px-2.5 py-1 rounded-xl text-xs font-black text-white flex items-center gap-1 shadow-xs"
                        style={{ backgroundColor: currentMeta.colorHex }}
                      >
                        <span>Test {testItem.testIndex}</span>
                      </span>

                      <span 
                        className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{
                          backgroundColor: `${currentMeta.colorHex}15`,
                          color: currentMeta.colorHex
                        }}
                      >
                        {testItem.domain}
                      </span>

                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-surface-container-highest/80 text-on-surface">
                        🎯 {testItem.targetBand}
                      </span>
                    </div>

                    {/* Clean Bold Title */}
                    <h3 className="text-lg sm:text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {testItem.title}
                    </h3>

                    {/* Metadata specs row */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-on-surface-variant font-medium pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        <span>{testItem.recommendedTimeMin} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-secondary">description</span>
                        <span>{testItem.wordCount} words</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-tertiary">quiz</span>
                        <span>{testItem.questions.length} questions</span>
                      </div>

                      <span className="text-surface-container-highest hidden sm:inline">•</span>

                      {/* Question type badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {testItem.questionTypes.map((qType, qIdx) => (
                          <span
                            key={qIdx}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-surface-container-lowest border border-surface-container-high/60 text-on-surface-variant"
                          >
                            {formatQuestionType(qType)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right CTA Button */}
                  <div className="shrink-0 flex items-center md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTest(testItem);
                      }}
                      className="w-full md:w-auto px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group-hover:scale-105 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">chrome_reader_mode</span>
                      <span>Start Test</span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SPLIT-SCREEN READING TEST ARENA                                        */}
      {/* ========================================================================= */}
      {typeof activePassage === 'number' && passageView === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* LEFT PANE: PASSAGE VIEWER WITH SELECTION LISTENER (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-3xl p-5 sm:p-7 border border-surface-container-high/50 shadow-sm relative">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-surface-container-high/50 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPassageView('list')}
                  className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer font-bold mr-2"
                >
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  <span>Tests List</span>
                </button>

                <span 
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: PASSAGE_METAS[selectedTest.passageNumber].colorHex }}
                >
                  Passage {selectedTest.passageNumber} • Test #{selectedTest.testIndex}
                </span>

                <span className="text-xs font-bold text-on-surface-variant hidden sm:inline">
                  {selectedTest.targetBand}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-secondary">touch_app</span>
                <span className="hidden sm:inline">Highlight words to save to Word Bank</span>
              </div>
            </div>

            {/* Passage Title */}
            <h2 className="text-lg sm:text-xl font-black text-on-surface mb-4 leading-snug">
              {selectedTest.title}
            </h2>

            {/* Notification if word saved */}
            {saveSuccessMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-secondary/15 border border-secondary/40 text-xs font-bold text-secondary flex items-center justify-between animate-fadeIn">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{saveSuccessMsg}</span>
                </span>
                <button
                  onClick={() => handleSelectPassageCard('wordbank')}
                  className="text-[11px] uppercase tracking-wider text-secondary underline hover:opacity-80 cursor-pointer"
                >
                  Open Word Bank →
                </button>
              </div>
            )}

            {/* Floating Selection Action Tooltip */}
            {floatingToolbar && (
              <div 
                className="fixed z-50 transform -translate-x-1/2 p-1.5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-surface-container-high shadow-2xl flex items-center gap-1.5 animate-fadeIn backdrop-blur-md"
                style={{ left: `${floatingToolbar.x}px`, top: `${floatingToolbar.y}px` }}
              >
                <button
                  onClick={() => handleApplyHighlight(floatingToolbar.text)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Highlight this text in yellow in passage"
                >
                  <span className="material-symbols-outlined text-sm">brush</span>
                  <span>Highlight</span>
                </button>

                <div className="w-px h-4 bg-surface-container-high" />

                <button
                  onClick={() => handleQuickSaveToWordBank(floatingToolbar.text)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs hover:bg-primary/90"
                  title="Save to Word Bank and highlight"
                >
                  <span className="material-symbols-outlined text-sm">bookmark_add</span>
                  <span>Add to Word Bank</span>
                </button>

                <button
                  onClick={() => setFloatingToolbar(null)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer ml-0.5"
                  title="Close toolbar"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Passage Text with Selection Listener & In-Text Highlight Rendering */}
            <div
              onMouseUp={handleTextSelection}
              className="text-on-surface text-sm sm:text-[15px] leading-relaxed space-y-4 select-text font-normal"
            >
              {selectedTest.paragraphs.map((p) => (
                <div key={p.label} className="relative pl-6">
                  <span className="absolute left-0 top-0 text-xs font-black text-primary select-none opacity-80">
                    [{p.label}]
                  </span>
                  <p className="text-justify leading-relaxed">
                    {renderParagraphWithHighlights(p.text, p.label)}
                  </p>
                </div>
              ))}
            </div>

            {/* Floating / Contextual Quick Lookup Card when highlighted text is clicked */}
            {selectedWordInfo && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border-2 border-primary/40 shadow-xl animate-fadeIn space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-on-surface">{selectedWordInfo.word}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-primary-container text-on-primary-container uppercase">
                        {selectedWordInfo.cefrLevel || 'C1'}
                      </span>
                      <span className="text-xs text-on-surface-variant italic font-serif">
                        {selectedWordInfo.partOfSpeech || 'term'}
                      </span>
                      {vocabVault.some(v => v.word.toLowerCase() === selectedWordInfo.word?.toLowerCase()) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span>★ In Word Bank</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-secondary mt-1">
                      🇺🇿 {selectedWordInfo.translationUz}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                      {selectedWordInfo.definition}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!vocabVault.some(v => v.word.toLowerCase() === selectedWordInfo.word?.toLowerCase()) ? (
                      <button
                        onClick={handleSaveToWordBank}
                        className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs hover:opacity-90 flex items-center gap-1 shadow transition-all active:scale-95 cursor-pointer"
                        title="Add word to Word Bank"
                      >
                        <span className="material-symbols-outlined text-sm">bookmark_add</span>
                        <span>Save to Word Bank</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPassageCard('wordbank')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span>View in Vault</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveHighlight(selectedWordInfo.word!)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                      title="Remove highlight marker from text"
                    >
                      <span className="material-symbols-outlined text-sm">format_color_reset</span>
                      <span>Remove</span>
                    </button>

                    <button
                      onClick={() => setSelectedWordInfo(null)}
                      className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
                      title="Close"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>

                {selectedWordInfo.exampleSentence && (
                  <p className="text-[11px] text-on-surface-variant italic pl-2.5 border-l-2 border-primary/60">
                    "{selectedWordInfo.exampleSentence}"
                  </p>
                )}

                {selectedWordInfo.collocations && selectedWordInfo.collocations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-on-surface-variant">Collocations:</span>
                    {selectedWordInfo.collocations.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT PANE: QUESTIONS & TEST ARENA (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="bg-surface-container-low rounded-3xl p-5 sm:p-6 border border-surface-container-high/50 shadow-sm space-y-4">
              
              {/* Question Header & Action Buttons */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/50">
                <div>
                  <h3 className="font-black text-base text-on-surface">
                    Questions {selectedTest.questions[0].id}–{selectedTest.questions[selectedTest.questions.length - 1].id}
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    {selectedTest.questions.filter(q => userAnswers[q.id]).length} of {selectedTest.questions.length} answered
                  </span>
                </div>

                {/* Timer & Fast Test Button */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center gap-1 font-mono text-xs font-bold text-on-surface">
                    <span className="material-symbols-outlined text-xs text-primary">timer</span>
                    <span>{formatTimer(timeLeftSec)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoSelectAnswers}
                    className="text-[11px] text-secondary hover:text-secondary/80 font-bold flex items-center gap-1 bg-secondary/10 px-2.5 py-1 rounded-xl border border-secondary/30 transition-all active:scale-95 cursor-pointer"
                    title="Auto-select sample answers for testing"
                  >
                    <span>⚡ Quick Test</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {selectedTest.questions.map((q) => {
                  const answer = userAnswers[q.id];
                  const detail = submittedResult?.details?.find((d: any) => d.id === q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all ${
                        detail
                          ? detail.isCorrect
                            ? 'border-secondary/60 bg-secondary-container/10'
                            : 'border-error/60 bg-error-container/10'
                          : 'border-surface-container-high/40'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-surface-container-high text-xs font-bold flex items-center justify-center flex-shrink-0 text-on-surface">
                          {q.id}
                        </span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                          {formatQuestionType(q.type)}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-on-surface mb-3 leading-relaxed">
                        {q.prompt}
                      </p>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {(q.options || ['TRUE', 'FALSE', 'NOT GIVEN']).map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-all ${
                              answer === opt
                                ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                                : 'hover:bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt}
                              checked={answer === opt}
                              onChange={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {/* Explanation after submission */}
                      {detail && (
                        <div className="mt-3 pt-2 border-t border-surface-container-high/40 text-[11px] leading-relaxed">
                          <span className={detail.isCorrect ? 'text-secondary font-bold' : 'text-error font-bold'}>
                            {detail.isCorrect ? '✓ Correct Answer' : `✗ Incorrect (Correct: ${detail.correctAnswer})`}
                          </span>
                          <p className="text-on-surface-variant mt-1 font-medium">{detail.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmitPassage}
                  className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Submit & Calculate Band Score</span>
                </button>
              </div>

              {/* Diagnostic Score Card */}
              {submittedResult && (
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-secondary/50 text-center animate-fadeIn space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-secondary">
                    Diagnostic Passage Result
                  </span>
                  <div className="text-2xl font-black text-on-surface">
                    Band {submittedResult.estimatedBand} ({submittedResult.correctCount}/{submittedResult.totalQuestions} Correct)
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Accuracy: {submittedResult.percentage}% • Official IELTS Academic Conversion
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DEDICATED WORD BANK & VOCAB VAULT HUB                                  */}
      {/* ========================================================================= */}
      {activePassage === 'wordbank' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Word Bank Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">auto_stories</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500">
                    Smart Vocab Vault
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant">
                    {vocabVault.length} saved academic terms
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1">
                  Personal Reading Word Bank
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-xl">
                  Every word you highlight across Passages 1, 2, and 3 is preserved here with contextual definitions, Uzbek translations, and Band 8.0+ collocations.
                </p>
              </div>
            </div>

            {/* Flashcard toggle button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFlashcardMode(!isFlashcardMode)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 border ${
                  isFlashcardMode
                    ? 'bg-primary text-on-primary border-primary shadow-md'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isFlashcardMode ? 'grid_view' : 'flip'}
                </span>
                <span>{isFlashcardMode ? 'List View' : 'Flashcard Mode'}</span>
              </button>
            </div>
          </div>

          {/* FLASHCARD STUDY VIEW */}
          {isFlashcardMode && filteredWords.length > 0 && (
            <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant px-2">
                <span>Card {currentCardIndex + 1} of {filteredWords.length}</span>
                <span>Click card to reveal definition</span>
              </div>

              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="min-h-64 p-8 rounded-3xl bg-surface-container-low border-2 border-primary/40 hover:border-primary shadow-xl flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div className="w-full flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary-container text-on-primary-container">
                    {filteredWords[currentCardIndex]?.cefrLevel}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {filteredWords[currentCardIndex]?.sourcePassage || 'Passage Reading'}
                  </span>
                </div>

                {!isCardFlipped ? (
                  <div className="my-6 space-y-2">
                    <h3 className="text-3xl font-black text-on-surface tracking-tight">
                      {filteredWords[currentCardIndex]?.word}
                    </h3>
                    <p className="text-xs text-on-surface-variant italic">
                      {filteredWords[currentCardIndex]?.partOfSpeech}
                    </p>
                    <span className="inline-block mt-4 text-xs font-bold text-primary">
                      👆 Click to Flip
                    </span>
                  </div>
                ) : (
                  <div className="my-4 space-y-3 animate-fadeIn">
                    <div className="text-xl font-bold text-secondary">
                      🇺🇿 {filteredWords[currentCardIndex]?.translationUz}
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed max-w-md">
                      {filteredWords[currentCardIndex]?.definition}
                    </p>
                    {filteredWords[currentCardIndex]?.exampleSentence && (
                      <p className="text-xs text-on-surface-variant italic border-l-2 border-primary pl-2 text-left">
                        "{filteredWords[currentCardIndex]?.exampleSentence}"
                      </p>
                    )}
                  </div>
                )}

                <div className="w-full text-[11px] text-on-surface-variant font-medium">
                  {isCardFlipped ? "Click again to see word" : "Test your recall before flipping"}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handlePrevCard}
                  className="px-5 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextCard}
                  className="px-6 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <span>Next Card</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* NORMAL GRID VIEW: Search & Filters */}
          {!isFlashcardMode && (
            <>
              <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/50 flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={wordBankSearch}
                    onChange={(e) => setWordBankSearch(e.target.value)}
                    placeholder="Search saved vocabulary..."
                    className="w-full pl-10 pr-4 py-2 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                  {/* CEFR Level filter pills */}
                  <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-2xl border border-surface-container-high/50 text-xs font-bold">
                    {(['ALL', 'C2', 'C1', 'B2'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setCefrFilter(lvl)}
                        className={`px-3 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                          cefrFilter === lvl
                            ? 'bg-primary text-on-primary font-black shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {lvl === 'ALL' ? 'All Levels' : lvl}
                      </button>
                    ))}
                  </div>

                  {/* Passage filter */}
                  <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-2xl border border-surface-container-high/50 text-xs font-bold">
                    {(['ALL', '1', '2', '3'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPassageVaultFilter(p)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                          passageVaultFilter === p
                            ? 'bg-secondary text-on-secondary font-black shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {p === 'ALL' ? 'All Passages' : `P${p}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Words Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWords.length === 0 ? (
                  <div className="col-span-full p-12 rounded-3xl bg-surface-container-low border border-surface-container-high/40 text-center space-y-3">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">auto_stories</span>
                    <h3 className="text-base font-bold text-on-surface">No vocabulary found</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                      Select Passage 1, 2, or 3 above, highlight any unfamiliar word in the text, and click "Save to Word Bank".
                    </p>
                    <button
                      onClick={() => handleSelectPassageCard(1)}
                      className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      Start Reading Passage 1 →
                    </button>
                  </div>
                ) : (
                  filteredWords.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl bg-surface-container-low border border-surface-container-high/50 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Word header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-on-surface">{item.word}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-primary/15 text-primary">
                              {item.cefrLevel}
                            </span>
                            <span className="text-[11px] text-on-surface-variant italic font-serif">
                              {item.partOfSpeech}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteWord(item.id)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1 cursor-pointer"
                            title="Remove from Word Bank"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>

                        {/* Uzbek translation */}
                        <p className="text-xs font-bold text-secondary mt-1.5 flex items-center gap-1">
                          <span>🇺🇿</span>
                          <span>{item.translationUz}</span>
                        </p>

                        {/* Definition */}
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                          {item.definition}
                        </p>

                        {/* Example sentence */}
                        {item.exampleSentence && (
                          <p className="text-[11px] text-on-surface-variant/80 italic mt-2 pl-2.5 border-l-2 border-primary/50">
                            "{item.exampleSentence}"
                          </p>
                        )}
                      </div>

                      {/* Footer: Collocations & Source */}
                      <div className="pt-2 border-t border-surface-container-high/30 flex items-center justify-between text-[10px] text-on-surface-variant">
                        <span className="font-semibold text-primary truncate max-w-[180px]" title={item.sourcePassage}>
                          {item.sourcePassage || 'IELTS Academic'}
                        </span>

                        {item.collocations && item.collocations.length > 0 && (
                          <span className="truncate max-w-[120px]" title={item.collocations.join(', ')}>
                            {item.collocations[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};
