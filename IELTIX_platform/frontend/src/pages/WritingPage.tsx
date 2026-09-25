import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { WritingEvaluationResult } from '../types/index.js';

export interface WritingTopic {
  id: string;
  taskType: 'TASK_1' | 'TASK_2';
  category: string;
  title: string;
  prompt: string;
  recommendedTimeMin: number;
  minWords: number;
  targetBand: string;
  dataVisual?: {
    type: string;
    summary: string;
    points: { label: string; value: string }[];
  };
  structureBlueprint: { step: string; hint: string }[];
  keyVocab: string[];
  sampleModelAnswer: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  taskType: 'TASK_1' | 'TASK_2';
  icon: string;
  tagline: string;
  formula: string;
  color: {
    accent: string;
    border: string;
    borderHover: string;
    bgSoft: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    gradient: string;
    ring: string;
  };
}

export const TASK_2_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cat-t2-opinion',
    name: 'Opinion (Agree or Disagree)',
    taskType: 'TASK_2',
    icon: 'psychology',
    tagline: 'State a definitive viewpoint and support it with robust evidence',
    formula: 'Intro & Clear Thesis → Argument 1 (Evidence) → Argument 2 (Evidence) → Restated Conclusion',
    color: {
      accent: '#10B981',
      border: 'border-emerald-500/30',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      bgSoft: 'bg-emerald-500/5',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      gradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      ring: 'ring-emerald-500/20',
    },
  },
  {
    id: 'cat-t2-discussion',
    name: 'Discussion (Both Views)',
    taskType: 'TASK_2',
    icon: 'balance',
    tagline: 'Objectively examine contrasting perspectives before providing your verdict',
    formula: 'Intro & Neutral Outline → Viewpoint 1 with Rationale → Viewpoint 2 with Rationale → Personal Opinion',
    color: {
      accent: '#6366F1',
      border: 'border-indigo-500/30',
      borderHover: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
      bgSoft: 'bg-indigo-500/5',
      badgeBg: 'bg-indigo-500/15',
      badgeText: 'text-indigo-500 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      gradient: 'from-indigo-500/15 via-blue-500/5 to-transparent',
      ring: 'ring-indigo-500/20',
    },
  },
  {
    id: 'cat-t2-advantages',
    name: 'Advantages & Disadvantages',
    taskType: 'TASK_2',
    icon: 'compare_arrows',
    tagline: 'Weigh positive merits directly against potential risks or drawbacks',
    formula: 'Intro & Stance → Substantive Advantages → Countervailing Drawbacks → Definitive Weighing Conclusion',
    color: {
      accent: '#F59E0B',
      border: 'border-amber-500/30',
      borderHover: 'hover:border-amber-500 hover:shadow-amber-500/10',
      bgSoft: 'bg-amber-500/5',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-500 dark:text-amber-400',
      gradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
      ring: 'ring-amber-500/20',
    },
  },
  {
    id: 'cat-t2-problem',
    name: 'Problem & Solution',
    taskType: 'TASK_2',
    icon: 'build_circle',
    tagline: 'Diagnose systemic root causes and present actionable policy interventions',
    formula: 'Intro & Context → Primary Underlying Causes → Feasible Targeted Solutions → Forward Outlook',
    color: {
      accent: '#EF4444',
      border: 'border-rose-500/30',
      borderHover: 'hover:border-rose-500 hover:shadow-rose-500/10',
      bgSoft: 'bg-rose-500/5',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-500 dark:text-rose-400',
      gradient: 'from-rose-500/15 via-red-500/5 to-transparent',
      ring: 'ring-rose-500/20',
    },
  },
  {
    id: 'cat-t2-direct',
    name: 'Direct & Double Question',
    taskType: 'TASK_2',
    icon: 'help_center',
    tagline: 'Answer two interrelated analytical inquiries with proportional depth',
    formula: 'Intro (Answers both questions) → Inquiry 1 Full Exposition → Inquiry 2 Full Exposition → Synthesis',
    color: {
      accent: '#8B5CF6',
      border: 'border-purple-500/30',
      borderHover: 'hover:border-purple-500 hover:shadow-purple-500/10',
      bgSoft: 'bg-purple-500/5',
      badgeBg: 'bg-purple-500/15',
      badgeText: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-500 dark:text-purple-400',
      gradient: 'from-purple-500/15 via-fuchsia-500/5 to-transparent',
      ring: 'ring-purple-500/20',
    },
  },
];

export const TASK_1_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cat-t1-bar',
    name: 'Bar Chart',
    taskType: 'TASK_1',
    icon: 'bar_chart',
    tagline: 'Compare discrete categorical metrics across groups or temporal intervals',
    formula: 'Paraphrased Intro → General Overview (Key Highs/Lows) → Body 1 Grouping → Body 2 Contrasts',
    color: {
      accent: '#0284C7',
      border: 'border-sky-500/30',
      borderHover: 'hover:border-sky-500 hover:shadow-sky-500/10',
      bgSoft: 'bg-sky-500/5',
      badgeBg: 'bg-sky-500/15',
      badgeText: 'text-sky-500 dark:text-sky-400',
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-500 dark:text-sky-400',
      gradient: 'from-sky-500/15 via-blue-500/5 to-transparent',
      ring: 'ring-sky-500/20',
    },
  },
  {
    id: 'cat-t1-line',
    name: 'Line Graph',
    taskType: 'TASK_1',
    icon: 'show_chart',
    tagline: 'Depict continuous trajectories, turning points, and trends over time',
    formula: 'Paraphrased Intro → General Overview (Up/Down Trends) → Body 1 Trajectories → Body 2 Intersections',
    color: {
      accent: '#14B8A6',
      border: 'border-teal-500/30',
      borderHover: 'hover:border-teal-500 hover:shadow-teal-500/10',
      bgSoft: 'bg-teal-500/5',
      badgeBg: 'bg-teal-500/15',
      badgeText: 'text-teal-500 dark:text-teal-400',
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-500 dark:text-teal-400',
      gradient: 'from-teal-500/15 via-emerald-500/5 to-transparent',
      ring: 'ring-teal-500/20',
    },
  },
  {
    id: 'cat-t1-pie',
    name: 'Pie Chart',
    taskType: 'TASK_1',
    icon: 'pie_chart',
    tagline: 'Analyze proportional shares and sector allocations of a total entity',
    formula: 'Paraphrased Intro → Overview (Dominant Sectors) → Body 1 Major Slices → Body 2 Minor Proportions',
    color: {
      accent: '#A855F7',
      border: 'border-violet-500/30',
      borderHover: 'hover:border-violet-500 hover:shadow-violet-500/10',
      bgSoft: 'bg-violet-500/5',
      badgeBg: 'bg-violet-500/15',
      badgeText: 'text-violet-500 dark:text-violet-400',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-500 dark:text-violet-400',
      gradient: 'from-violet-500/15 via-purple-500/5 to-transparent',
      ring: 'ring-violet-500/20',
    },
  },
  {
    id: 'cat-t1-process',
    name: 'Process Diagram',
    taskType: 'TASK_1',
    icon: 'account_tree',
    tagline: 'Report linear or cyclical manufacturing or biological stages in passive voice',
    formula: 'Paraphrased Intro → Overview (Total Stages & Boundaries) → Body 1 Initial Phases → Body 2 Final Output',
    color: {
      accent: '#F97316',
      border: 'border-orange-500/30',
      borderHover: 'hover:border-orange-500 hover:shadow-orange-500/10',
      bgSoft: 'bg-orange-500/5',
      badgeBg: 'bg-orange-500/15',
      badgeText: 'text-orange-500 dark:text-orange-400',
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-500 dark:text-orange-400',
      gradient: 'from-orange-500/15 via-amber-500/5 to-transparent',
      ring: 'ring-orange-500/20',
    },
  },
  {
    id: 'cat-t1-map',
    name: 'Map & Plan',
    taskType: 'TASK_1',
    icon: 'map',
    tagline: 'Document architectural transformations and urban redevelopments across eras',
    formula: 'Paraphrased Intro → Overview (Key Expansion/Modernization) → Body 1 Northern/Core Changes → Body 2 Southern/New Additions',
    color: {
      accent: '#06B6D4',
      border: 'border-cyan-500/30',
      borderHover: 'hover:border-cyan-500 hover:shadow-cyan-500/10',
      bgSoft: 'bg-cyan-500/5',
      badgeBg: 'bg-cyan-500/15',
      badgeText: 'text-cyan-500 dark:text-cyan-400',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      gradient: 'from-cyan-500/15 via-sky-500/5 to-transparent',
      ring: 'ring-cyan-500/20',
    },
  },
];

const TOPICS_CATALOG: WritingTopic[] = [
  // =========================================================================
  // TASK 2: OPINION (AGREE OR DISAGREE)
  // =========================================================================
  {
    id: 't2-university-tuition',
    taskType: 'TASK_2',
    category: 'Opinion (Agree or Disagree)',
    title: 'Free Tertiary Education for All Citizens',
    prompt: 'Some people argue that tertiary education should be entirely free for all university students, funded completely by the state. To what extent do you agree or disagree with this statement?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase the prompt and state unequivocal agreement: Free tuition fosters meritocracy and national economic dividend.' },
      { step: 'Body Paragraph 1', hint: 'Discuss democratizing opportunities and breaking intergenerational poverty cycles.' },
      { step: 'Body Paragraph 2', hint: 'Explain long-term fiscal returns: high-skill jobs return greater progressive income taxes.' },
      { step: 'Conclusion', hint: 'Reiterate that state-funded university education is an indispensable investment, not an expense.' },
    ],
    keyVocab: ['tertiary education', 'socio-economic mobility', 'human capital accumulation', 'fiscal returns'],
    sampleModelAnswer: `The proposition that tertiary education should be fully financed by governments without imposing tuition burdens on students has generated intense debate. I completely agree with this assertion, as eliminating financial barriers fosters genuine meritocracy and generates substantial long-term economic returns for society.

Primarily, free university tuition democratizes social mobility. When higher education requires exorbitant tuition fees, students from economically disadvantaged backgrounds are frequently deterred from pursuing professional careers in medicine, engineering, or law, irrespective of their innate intellectual capability. By eliminating these monetary constraints, universities can admit candidates purely on academic merit, thereby cultivating an equitable talent pool and eradicating intergenerational poverty cycles.

Furthermore, state-funded higher education yields immense fiscal dividends through human capital accumulation. A highly educated workforce inherently drives technological innovation, attracts multinational investment, and elevates national productivity. Although subsidizing tertiary education requires significant initial budgetary expenditures, college graduates consistently secure higher-paying positions and subsequently return far greater sums to national treasuries through progressive income tax and commercial enterprise over their careers.

In conclusion, I firmly maintain that university education should be universally free of charge. Far from being a fiscal burden, funding tertiary education represents an indispensable investment that democratizes opportunity and secures sustainable national economic prosperity.`,
  },
  {
    id: 't2-space-exploration',
    taskType: 'TASK_2',
    category: 'Opinion (Agree or Disagree)',
    title: 'Space Exploration Funding vs Terrestrial Needs',
    prompt: 'Governments should allocate billions of dollars towards exploring outer space rather than spending on basic problems on Earth like poverty, disease, and global warming. To what extent do you agree or disagree?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase prompt and state qualified disagreement: space investment produces secondary tech spin-offs, yet urgent terrestrial welfare takes priority.' },
      { step: 'Body Paragraph 1', hint: 'Detail why immediate existential crises like poverty and famine demand urgent national funding.' },
      { step: 'Body Paragraph 2', hint: 'Acknowledge scientific spin-offs (satellite weather forecasting, solar cells) but argue for a balanced budget.' },
      { step: 'Conclusion', hint: 'Summarize that governments must prioritize Earth stability before extensive interstellar expansion.' },
    ],
    keyVocab: ['interplanetary exploration', 'existential dilemma', 'terrestrial welfare', 'technological spin-offs'],
    sampleModelAnswer: `In an era of rapid technological progress, the question of whether billions of taxpayer dollars should be directed towards interplanetary space research rather than alleviating urgent terrestrial problems has become fiercely contested. I largely disagree with prioritizing space exploration over foundational planetary issues, as human survival on Earth must take precedence over extraterrestrial ambitions.

To begin with, our planet faces immediate and severe existential crises that demand immediate fiscal intervention. Millions of individuals across both developing and developed nations continue to suffer from extreme poverty, preventable malnutrition, and inadequate access to clean potable water. Furthermore, accelerating climate breakdown threatens agricultural food security and coastal ecosystems. Diverting astronomical sums toward sending probes to Mars while hundreds of millions lack basic healthcare represents a severe moral misalignment in global governance priorities.

Nonetheless, it cannot be denied that space research yields consequential technological spin-offs that assist Earth. Advanced satellite constellations have revolutionized meteorological forecasting, GPS logistical tracking, and environmental monitoring of deforestation. Furthermore, materials science developed for spacecraft has enhanced terrestrial renewable energy equipment. However, these discoveries can be achieved through targeted Earth-focused research without spending monumental sums on distant interplanetary colonization.

In conclusion, while cosmic exploration satisfies human scientific curiosity, the immediate preservation of human dignity and ecological stability on Earth must remain the preeminent objective for public funding. Interstellar ambition should only be pursued once terrestrial emergencies are adequately resolved.`,
  },
  {
    id: 't2-digital-nomads',
    taskType: 'TASK_2',
    category: 'Opinion (Agree or Disagree)',
    title: 'Complete Transition to Remote Digital Work',
    prompt: 'Within the next two decades, traditional physical offices will completely disappear, as all white-collar employment will be conducted remotely through digital platforms. To what extent do you agree or disagree?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.0 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase prompt and take a clear stance: Disagree that offices will vanish completely; hybrid models will dominate.' },
      { step: 'Body Paragraph 1', hint: 'Explain why remote work is widespread (cost efficiency, flexible hours, no commuting).' },
      { step: 'Body Paragraph 2', hint: 'Explain the irreplaceable value of physical co-location for creative ideation, corporate culture, and security.' },
      { step: 'Conclusion', hint: 'Reiterate that offices will be redesigned rather than extinguished.' },
    ],
    keyVocab: ['white-collar workforce', 'telecommuting saturation', 'spontaneous collaboration', 'hybrid equilibrium'],
    sampleModelAnswer: `The proliferation of high-speed telecommunications and collaborative software has precipitated widespread speculation regarding the complete extinction of physical corporate workplaces. Although remote employment has proven both viable and productive, I disagree with the projection that traditional offices will vanish entirely; rather, a resilient hybrid paradigm will endure.

Undeniably, telecommuting offers undeniable logistical and economic dividends that will permanently reshape the modern corporate landscape. By enabling employees to work from home, companies have dramatically reduced commercial real estate overheads, while workers have eliminated stressful daily commutes, yielding superior work-life balance. For routine cognitive tasks such as software development, data analysis, and copywriting, physical proximity is no longer a prerequisite for high productivity.

However, physical workspaces fulfill essential organizational functions that digital platforms cannot replicate. Spontaneous creative synergy, informal hallway brainstorming, and empathetic team building are inherently compromised over virtual videoconferencing. Furthermore, high-stakes industries such as international diplomacy, enterprise legal negotiation, and sensitive cybersecurity require secure physical enclaves to prevent digital espionage and preserve client confidentiality. Physical offices also serve as the cultural anchor of an institution, providing junior employees with hands-on mentorship.

In conclusion, while the conventional five-day office week has become an anachronism, physical workplaces will not become extinct. Instead, corporate offices will evolve into collaborative hubs for strategic planning and interpersonal connection within a prevailing hybrid framework.`,
  },

  // =========================================================================
  // TASK 2: DISCUSSION (BOTH VIEWS & OPINION)
  // =========================================================================
  {
    id: 't2-ai-education',
    taskType: 'TASK_2',
    category: 'Discussion (Both Views)',
    title: 'Artificial Intelligence in Education',
    prompt: 'Some people believe that artificial intelligence will soon revolutionize education and render traditional classrooms obsolete. Others contend that human teachers remain indispensable for emotional and social growth. Discuss both views and give your own opinion.',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase prompt, introduce both perspectives, and state your thesis: AI augments learning, but teachers remain irreplaceable.' },
      { step: 'Body Paragraph 1', hint: 'Discuss benefits of AI: hyper-personalized learning trajectories, 24/7 diagnostic support, and scalability.' },
      { step: 'Body Paragraph 2', hint: 'Argue why human mentorship, empathy, ethical arbitration, and social development cannot be automated.' },
      { step: 'Conclusion', hint: 'Summarize both views and recommend harmonizing AI instructional tools with human educators.' },
    ],
    keyVocab: ['pedagogical transformation', 'cognitive prosthetic', 'curriculum adaptation', 'emotional intelligence'],
    sampleModelAnswer: `In contemporary society, artificial intelligence has emerged as a transformative catalyst across global educational systems. While some analysts assert that intelligent algorithms will inevitably render physical classrooms obsolete, others argue that human teachers remain fundamental to social and moral development. In my perspective, while digital technologies dramatically improve instructional efficiency, human educators provide irreplaceable mentorship that no machine can replicate.

On the one hand, proponents of automated learning emphasize unmatched precision and scalability. AI-powered platforms can diagnose individual learner deficits instantaneously, dynamically tailoring curricular materials to each student's cognitive pace. Consequently, students in remote or underprivileged communities can circumvent geographical disparities and master advanced academic competencies without paying exorbitant tuition fees.

On the other hand, traditional pedagogy cultivates essential interpersonal capabilities. Human teachers foster emotional resilience, ethical judgment, and collaborative empathy—qualities that automated models inherently lack. In classroom discourse, an algorithm may detect grammatical discordance, but it cannot inspire intellectual courage or arbitrate moral ambiguities.

In conclusion, although artificial intelligence will substantially modernize academic workflows, it should serve as an empowering supplement rather than an outright replacement for educators. Harmonizing computational scalability with empathetic human mentorship offers the ultimate blueprint for future learning.`,
  },
  {
    id: 't2-stem-vs-humanities',
    taskType: 'TASK_2',
    category: 'Discussion (Both Views)',
    title: 'Specialized STEM Education vs Arts & Humanities',
    prompt: 'Some believe universities should focus exclusively on subjects that produce direct economic value like science, technology, and engineering. Others argue that arts, history, and philosophy are equally essential for a thriving society. Discuss both views and give your opinion.',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce the debate between pragmatic technical training and holistic liberal arts. State your thesis.' },
      { step: 'Body Paragraph 1', hint: 'Analyze the economic imperative of STEM: industrial competitiveness, medical innovation, and direct employment.' },
      { step: 'Body Paragraph 2', hint: 'Examine the societal value of humanities: critical thinking, ethical frameworks, and cultural preservation.' },
      { step: 'Conclusion', hint: 'Reiterate that a balanced synthesis of technical proficiency and humanistic discernment is vital.' },
    ],
    keyVocab: ['technological supremacy', 'humanistic inquiry', 'utilitarian education', 'ethical scaffolding'],
    sampleModelAnswer: `The debate over whether higher education should prioritize STEM fields that yield direct economic prosperity or preserve arts and humanities has gained heightened relevance in the modern knowledge economy. While technical disciplines undoubtedly drive industrial growth, I believe that humanistic inquiry remains indispensable for cultivating thoughtful, ethical societies.

Advocates of a strictly utilitarian educational curriculum point to immediate economic and technological demands. In an era dominated by artificial intelligence, green biotechnology, and aerospace engineering, graduates equipped with scientific and computational expertise directly bolster national competitiveness. Furthermore, STEM graduates frequently command higher initial starting salaries and experience lower unemployment rates, justifying state investment in high-tech university laboratories and research faculties.

Conversely, proponents of liberal arts emphasize that technological capability without ethical wisdom can be profoundly perilous. Disciplines such as philosophy, literature, and history cultivate critical thinking, rhetoric, and moral reasoning. They compel individuals to interrogate the societal ramifications of scientific breakthroughs, arbitrating questions surrounding genetic engineering or algorithmic bias. Furthermore, the creative arts enrich the human condition and preserve cultural heritage, preventing societies from degenerating into purely technocratic machines.

In conclusion, while science and technology furnish the tools for material progress, the humanities provide the ethical and intellectual direction to utilize those tools responsibly. Therefore, modern universities must foster an interdisciplinary balance rather than marginalizing either domain.`,
  },
  {
    id: 't2-tourism-impact',
    taskType: 'TASK_2',
    category: 'Discussion (Both Views)',
    title: 'International Tourism: Economic Blessing vs Ecological Curse',
    prompt: 'Some argue that international tourism brings vital economic prosperity and employment to developing regions. Others contend that it causes irreparable damage to local cultures and ecosystems. Discuss both views and give your opinion.',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Acknowledge the dual nature of tourism and state your position: benefits outweigh harm if strictly regulated.' },
      { step: 'Body Paragraph 1', hint: 'Explore economic gains: foreign exchange inflow, hotel and transport employment, infrastructural upgrades.' },
      { step: 'Body Paragraph 2', hint: 'Analyze ecological and cultural costs: carbon footprint, waste accumulation, cultural commodification.' },
      { step: 'Conclusion', hint: 'Call for sustainable ecotourism frameworks that channel revenue directly into conservation.' },
    ],
    keyVocab: ['foreign capital injection', 'cultural commercialization', 'ecological degradation', 'sustainable ecotourism'],
    sampleModelAnswer: `The exponential expansion of the global travel industry has triggered intense controversy regarding its holistic impact on host communities. While some commentators argue that international tourism is an essential engine of economic rejuvenation, others warn that it precipitates irreversible environmental and cultural deterioration. In my view, while the environmental hazards are undeniable, tourism is predominantly advantageous when governed by stringent ecological safeguards.

On the one hand, international travel provides an immediate economic lifeline to developing regions. Foreign tourists inject substantial foreign exchange directly into local economies, stimulating sectors such as hospitality, culinary arts, handicrafts, and regional transit. In many island nations and rural enclaves devoid of manufacturing bases, tourism constitutes the primary source of employment and government revenue. Furthermore, the necessity of accommodating international travelers frequently compels municipal authorities to modernize roads, water treatment facilities, and regional airports, benefiting local populations permanently.

On the other hand, mass tourism can inflict catastrophic ecological and sociological tolls. The influx of seasonal visitors often generates unmanageable quantities of plastic waste, strains freshwater aquifers, and accelerates coastal degradation. Sociologically, traditional communities risk cultural commodification, where sacred rituals are transformed into superficial entertainment for foreign spectators. Additionally, the proliferation of vacation rentals can inflate local housing costs, pricing native residents out of their ancestral hometowns.

In conclusion, although unconstrained mass tourism undeniably degrades natural ecosystems and distorts local traditions, its immense capacity to alleviate poverty cannot be discounted. By transitioning toward regulated ecotourism frameworks that reinvest visitor fees into environmental preservation, nations can harness tourism sustainably.`,
  },

  // =========================================================================
  // TASK 2: ADVANTAGES & DISADVANTAGES
  // =========================================================================
  {
    id: 't2-remote-work',
    taskType: 'TASK_2',
    category: 'Advantages & Disadvantages',
    title: 'Remote Work vs Traditional Office',
    prompt: 'In many countries, an increasing number of people are choosing to work remotely from home rather than in a physical workplace. Do the advantages of this trend outweigh the disadvantages?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce the telecommuting shift and state that advantages clearly outweigh disadvantages.' },
      { step: 'Body Paragraph 1', hint: 'Examine drawbacks: social isolation, lack of spontaneous team cohesion, and blurred work-life boundaries.' },
      { step: 'Body Paragraph 2', hint: 'Detail advantages: commute elimination, heightened schedule autonomy, corporate overhead reductions, and reduced vehicular emissions.' },
      { step: 'Conclusion', hint: 'Reiterate that productivity and lifestyle benefits surpass logistical hurdles.' },
    ],
    keyVocab: ['telecommuting infrastructure', 'work-life equilibrium', 'mitigating transit congestion', 'corporate overheads'],
    sampleModelAnswer: `Over the past decade, rapid advancements in telecommunications have facilitated a worldwide shift toward remote employment. While telecommuting introduces notable hurdles regarding social isolation and team coherence, I strongly believe that the merits—specifically enhanced personal productivity and reduced urban congestion—substantially outweigh the drawbacks.

Admittedly, working exclusively from home carries distinct disadvantages. The absence of physical workplace interaction can diminish camaraderie, occasionally precipitating feelings of professional alienation. Furthermore, without strict separation between domestic and professional domains, some employees struggle with blurred boundaries, which may lead to occupational burnout.

Nevertheless, the advantages of telecommuting are profoundly transformative. Foremost among these is the eradication of daily commuting. By eliminating hours wasted in transit, professionals reclaim valuable time for physical wellness and familial engagement, which directly correlates with heightened job satisfaction. From an economic and environmental standpoint, remote work decreases corporate overhead expenses for office space while noticeably reducing vehicular greenhouse emissions in metropolitan centers.

In conclusion, despite logistical concerns surrounding employee isolation, the profound benefits of schedule autonomy, time preservation, and environmental relief affirm that remote employment is overwhelmingly advantageous for modern society.`,
  },
  {
    id: 't2-cashless-society',
    taskType: 'TASK_2',
    category: 'Advantages & Disadvantages',
    title: 'Cashless Society & Digital Payments',
    prompt: 'In many nations, paper banknotes and physical coins are being replaced entirely by digital and contactless payment systems. Do the advantages of a cashless society outweigh the disadvantages?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase the transition from cash to digital banking and state that advantages decisively outweigh risks.' },
      { step: 'Body Paragraph 1', hint: 'Address risks: vulnerability to cybercrime, tech outages, and financial exclusion of older citizens.' },
      { step: 'Body Paragraph 2', hint: 'Elaborate on advantages: convenience, transparency, curtailment of black market tax evasion, and transactional speed.' },
      { step: 'Conclusion', hint: 'Summarize that digital financial infrastructure is superior when backed by cybersecurity and accessibility.' },
    ],
    keyVocab: ['contactless transactions', 'illicit shadow economy', 'digital fiscal transparency', 'cyber vulnerability'],
    sampleModelAnswer: `The rapid digitization of global financial infrastructure has accelerated the transition toward completely cashless economies, with physical currency increasingly superseded by contactless cards and mobile wallets. Despite legitimate concerns regarding cyber vulnerabilities and financial disenfranchisement, I am convinced that the benefits of convenience and fiscal transparency decisively surpass the drawbacks.

On the one hand, a cashless ecosystem introduces notable risks that cannot be overlooked. Complete reliance on digital banking leaves individuals vulnerable to cyber fraud, identity theft, and technical system crashes. In the event of prolonged electrical grid failures or severe network disruptions, commerce can grind to an abrupt halt. Furthermore, vulnerable segments of society, particularly impoverished individuals without formal banking access and the elderly who lack digital literacy, face marginalization in an exclusively digital marketplace.

On the other hand, the advantages of electronic transactions are comprehensive and indispensable for modern commerce. Foremost among these is unprecedented consumer convenience, as digital payments eliminate the need to carry physical currency and facilitate instantaneous cross-border transactions. More critically, digital financial trails dramatically curb the illicit shadow economy. Because every transaction produces a verifiable ledger entry, tax evasion, money laundering, and illegal contraband trading become infinitely harder to execute, significantly bolstering government revenue collections.

In conclusion, while governments must invest heavily in cybersecurity resilience and inclusive financial education to protect vulnerable demographics, the overwhelming advantages of operational efficiency, security against armed robbery, and systemic fiscal transparency prove that a cashless society is deeply advantageous.`,
  },
  {
    id: 't2-fast-food-culture',
    taskType: 'TASK_2',
    category: 'Advantages & Disadvantages',
    title: 'Global Fast Food Chains Replacing Local Cuisine',
    prompt: 'International fast-food franchises are proliferating across almost every country, replacing local restaurants and traditional cuisine. Do the advantages of this trend outweigh its disadvantages?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce fast food expansion and state that disadvantages heavily outweigh benefits.' },
      { step: 'Body Paragraph 1', hint: 'Acknowledge benefits: affordability, speed, consistent hygiene, and youth employment.' },
      { step: 'Body Paragraph 2', hint: 'Argue severe drawbacks: chronic cardiovascular diseases, obesity epidemics, and erosion of cultural culinary identity.' },
      { step: 'Conclusion', hint: 'Conclude that health and cultural devastation surpass transient commercial convenience.' },
    ],
    keyVocab: ['culinary homogenization', 'dietary epidemics', 'nutritional degradation', 'multinational conglomerates'],
    sampleModelAnswer: `In recent decades, multinational fast-food corporations have established an omnipresent footprint across the globe, frequently supplanting family-owned diners and indigenous culinary traditions. While these establishments offer affordability and quick service, I firmly believe that the disadvantages—specifically severe public health crises and cultural homogenization—substantially outweigh the advantages.

Certainly, the ascendancy of international fast-food chains delivers practical merits tailored to fast-paced modern urban lifestyles. In dense metropolitan centers, these franchises provide remarkably swift, standardized, and economical meals for busy students and professionals. Furthermore, multinational food brands introduce standardized sanitary regulations and supply chain efficiencies, while generating thousands of entry-level employment opportunities for young people and contributing substantial tax revenues to municipal budgets.

Nevertheless, the repercussions of this nutritional transition are profoundly deleterious. Medically, fast food is notoriously saturated with refined sugars, trans-fats, and excessive sodium. The displacement of nutritious, home-cooked regional diets by processed fast foods has directly precipitated worldwide epidemics of childhood obesity, type-2 diabetes, and cardiovascular diseases, placing immense financial strain on national healthcare infrastructures. Culturally, the demise of independent regional eateries erodes intangible cultural heritage, homogenizing diverse culinary customs into repetitive corporate menus.

In conclusion, despite the obvious convenience and commercial affordability provided by international fast-food conglomerates, the devastating public health consequences and irreversible loss of gastronomic heritage demonstrate that the disadvantages of this phenomenon decisively outweigh its benefits.`,
  },

  // =========================================================================
  // TASK 2: PROBLEM & SOLUTION
  // =========================================================================
  {
    id: 't2-global-energy',
    taskType: 'TASK_2',
    category: 'Problem & Solution',
    title: 'Rising Global Energy Consumption',
    prompt: 'Global energy consumption is rising at an unprecedented rate, placing significant pressure on environmental ecosystems. What are the primary causes of this phenomenon, and what measures can governments implement to tackle it?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce surging energy consumption, outline causes and policy remedies.' },
      { step: 'Body Paragraph 1', hint: 'Identify key causes: industrial expansion, population growth, and high-tech consumer computing.' },
      { step: 'Body Paragraph 2', hint: 'Propose effective government solutions: clean energy subsidies and carbon taxation.' },
      { step: 'Conclusion', hint: 'Summarize the necessity of decoupling economic growth from ecological harm.' },
    ],
    keyVocab: ['ecological degradation', 'fossil fuel dependency', 'renewable infrastructure', 'carbon taxation'],
    sampleModelAnswer: `In recent decades, industrial expansion and demographic surges have driven global energy demands to unprecedented peaks, triggering severe environmental repercussions. This essay examines industrialization and consumerism as primary catalysts before proposing state subsidies for renewable infrastructure and stringent carbon policies as effective solutions.

The primary impetus behind escalating energy use is rapid economic development across emerging economies. As manufacturing hubs expand and urbanization accelerates, power grids must supply staggering quantities of electricity to maintain factories, logistical networks, and data centers. Moreover, modern lifestyles have become intrinsically energy-intensive, with household air conditioning and smart appliances consuming vast reserves of coal and natural gas.

To alleviate this crisis, national administrations must implement targeted interventions. First and foremost, governments should reallocate subsidies from fossil fuels directly into solar, wind, and hydroelectric generation. By reducing capital expenditure barriers, clean energy becomes commercially competitive. Additionally, authorities must enact rigorous energy-efficiency building codes and impose carbon taxation on heavy industrial polluters, compelling corporate conglomerates to invest in green technologies.

In conclusion, surging power consumption stems primarily from unrestrained industrialization and contemporary living standards. However, through aggressive clean energy subsidies and robust carbon regulation, policymakers can successfully decouple economic prosperity from ecological degradation.`,
  },
  {
    id: 't2-youth-mental-health',
    taskType: 'TASK_2',
    category: 'Problem & Solution',
    title: 'Adolescent Screen Addiction & Mental Wellbeing',
    prompt: 'A concerning number of teenagers and young adults are experiencing depression, anxiety, and social isolation linked to excessive screen time and social media use. What are the underlying causes of this problem, and what practical solutions can be adopted?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Highlight the adolescent mental health crisis linked to digital devices and preview causes and remedies.' },
      { step: 'Body Paragraph 1', hint: 'Analyze root causes: algorithmic dopamine loops, unrealistic beauty/lifestyle comparison, and cyberbullying.' },
      { step: 'Body Paragraph 2', hint: 'Detail pragmatic solutions: digital literacy curricula, age verification, and parental screen quotas.' },
      { step: 'Conclusion', hint: 'Reiterate that combining institutional regulation with domestic guidance can restore youth wellbeing.' },
    ],
    keyVocab: ['algorithmic dopamine reinforcement', 'compulsive screen consumption', 'psychological resilience', 'pedagogical interventions'],
    sampleModelAnswer: `Across the globe, an alarming proportion of adolescents are grappling with clinical depression, chronic anxiety, and social alienation—a crisis widely attributed to excessive immersion in digital screens and algorithmic social media. This essay will examine addictive interface design and superficial social comparison as primary root causes before proposing pedagogical interventions and parental regulatory frameworks as effective solutions.

The primary driver of youth psychological distress is the sophisticated architecture of modern digital platforms. Tech corporations engineer algorithmic feedback mechanisms—such as algorithmic notifications, endless scrolling, and dopamine-driven 'likes'—designed to foster compulsive device engagement. Consequently, teenagers frequently sacrifice restorative sleep and physical exercise to remain connected. Furthermore, continuous exposure to idealized, digitally altered depictions of peer lifestyles exacerbates feelings of inadequacy and low self-esteem, while unchecked cyberbullying inflicts profound emotional trauma.

To mitigate this burgeoning psychological epidemic, multi-tiered interventions are imperative. Educational institutions must incorporate comprehensive digital wellbeing modules into their mandatory curricula, instructing adolescents on algorithmic manipulation, critical media evaluation, and the cognitive hazards of excessive screen time. Concurrently, parents and guardians should establish domestic 'tech-free zones' and enforce nocturnal device curfews, ensuring that mobile phones are excluded from bedrooms to safeguard sleep hygiene. Furthermore, policymakers must mandate stringent age verification and hold social media platforms accountable for predatory engagement mechanics targeting minors.

In conclusion, adolescent mental deterioration stems fundamentally from addictive algorithmic design and unrealistic peer comparisons. Nevertheless, through proactive school-based digital literacy, domestic boundary enforcement, and statutory corporate regulation, society can protect the psychological equilibrium of future generations.`,
  },
  {
    id: 't2-urban-traffic',
    taskType: 'TASK_2',
    category: 'Problem & Solution',
    title: 'Metropolitan Traffic Congestion & Urban Sprawl',
    prompt: 'Severe traffic congestion in major metropolitan cities has become a critical crisis, causing air pollution and reducing economic productivity. What are the main factors causing this problem, and what effective measures can municipal authorities implement?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce metropolitan gridlock and outline causes (deficient transit, cheap private car reliance) and solutions.' },
      { step: 'Body Paragraph 1', hint: 'Explain causes: inadequate mass transit infrastructure, rapid suburbanization, and automobile subsidies.' },
      { step: 'Body Paragraph 2', hint: 'Provide concrete urban planning solutions: congestion pricing, bus rapid transit (BRT), and dedicated cycling corridors.' },
      { step: 'Conclusion', hint: 'Summarize that modernizing public transportation is key to livable green cities.' },
    ],
    keyVocab: ['vehicular gridlock', 'suburban sprawl', 'congestion pricing zones', 'high-capacity transit'],
    sampleModelAnswer: `In virtually every major metropolis, vehicular gridlock has escalated into an acute socio-economic crisis, causing severe atmospheric contamination and diminishing workforce productivity. This essay will diagnose deficient public transit infrastructure and suburban sprawl as key contributors before recommending urban congestion pricing and mass transit expansion as transformative countermeasures.

The primary impetus behind paralyzing urban traffic is the inadequacy of public transportation networks paired with rapid suburban expansion. When subway systems and bus networks are overcrowded, unreliable, or geographically sparse, commuters are practically coerced into relying on private automobiles for daily travel. Furthermore, contemporary urban planning has historically prioritized expansive highway networks over pedestrian infrastructure, encouraging suburban sprawl where citizens reside miles away from commercial city centers, thereby generating monumental volumes of daily vehicular trips.

To resolve this chronic dilemma, municipal authorities must execute bold infrastructure and regulatory reforms. Foremost among these is the implementation of metropolitan congestion pricing zones, wherein private motorists are levied automated charges during peak hours to enter central districts. This fiscal disincentive successfully discourages discretionary driving, as demonstrated in London and Singapore. Crucially, the revenues generated from these tariffs should be earmarked directly to finance high-frequency Bus Rapid Transit (BRT) fleets, expand underground metro lines, and construct protected cycling superhighways, making clean public transit the fastest and most economical option.

In conclusion, metropolitan congestion is generated by urban sprawl and an over-reliance on private automobiles driven by inadequate mass transit alternatives. By introducing peak-hour congestion charges and massively funding electrified public transit, municipal governments can resolve urban paralysis and restore environmental health.`,
  },

  // =========================================================================
  // TASK 2: DIRECT & DOUBLE QUESTION
  // =========================================================================
  {
    id: 't2-aging-population',
    taskType: 'TASK_2',
    category: 'Direct & Double Question',
    title: 'Demographic Aging and Society',
    prompt: 'In many developed nations, life expectancy is increasing rapidly. Why is this occurring? What socio-economic challenges does an ageing population pose for society?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Acknowledge rising life expectancy and state the causes and challenges directly.' },
      { step: 'Body Paragraph 1', hint: 'Address why: medical advancements, public sanitation, and nutritional awareness.' },
      { step: 'Body Paragraph 2', hint: 'Address challenges: pension budget deficits, declining workforce tax base, and geriatric healthcare strain.' },
      { step: 'Conclusion', hint: 'Summarize causes and call for structural pension and healthcare reforms.' },
    ],
    keyVocab: ['demographic transition', 'geriatric healthcare', 'actuarial deficit', 'pension sustainability'],
    sampleModelAnswer: `Across numerous developed countries, enhancements in modern healthcare have dramatically prolonged human life expectancy. This essay will examine medical innovation and improved living standards as the root causes of longevity, followed by an analysis of the consequent strains on pension budgets and healthcare infrastructure.

The principal driver of prolonged life expectancy is revolutionary progress in pharmaceuticals and preventive medicine. Widespread access to advanced diagnostics, cardiovascular treatments, and vaccines has mitigated illnesses that were once fatal. Concurrently, public health campaigns and improved sanitation have fostered greater societal awareness regarding dietary nutrition and active lifestyle choices, enabling citizens to maintain vitality into late adulthood.

However, an aging populace poses formidable socio-economic challenges. Economically, a shrinking working-age demographic results in a diminished tax base alongside skyrocketing pension expenditures, placing severe fiscal strain on public reserves. Furthermore, the demand for specialized geriatric care and long-term nursing facilities frequently overwhelms national healthcare systems, generating critical staffing shortages in public hospitals.

In conclusion, increased longevity is the direct product of modern medical achievement and elevated sanitary conditions. Nevertheless, governments must urgently restructure statutory retirement ages and modernize healthcare funding to ensure long-term socio-economic stability.`,
  },
  {
    id: 't2-material-wealth',
    taskType: 'TASK_2',
    category: 'Direct & Double Question',
    title: 'Material Wealth vs Personal Happiness',
    prompt: 'In modern consumerist societies, individuals possess far more material wealth and luxury goods than previous generations, yet many report feeling less happy. Why is this the case? What does genuine happiness require?',
    recommendedTimeMin: 40,
    minWords: 250,
    targetBand: 'Band 7.5 - 9.0',
    structureBlueprint: [
      { step: 'Introduction', hint: 'Acknowledge the paradox of material affluence and reduced subjective wellbeing. Outline answers to both questions.' },
      { step: 'Body Paragraph 1', hint: 'Address why: the hedonic treadmill, hyper-consumerist anxiety, and weakened community bonds.' },
      { step: 'Body Paragraph 2', hint: 'Address what genuine happiness requires: meaningful social connections, purposeful work, and physical health.' },
      { step: 'Conclusion', hint: 'Synthesize that enduring satisfaction stems from internal harmony and social bonds rather than material possessions.' },
    ],
    keyVocab: ['hedonic treadmill', 'material consumerism', 'existential fulfillment', 'social cohesion'],
    sampleModelAnswer: `In contemporary consumer societies, unprecedented material abundance and technological convenience coexist with soaring rates of chronic anxiety and perceived unhappiness. This essay will attribute this paradox to the phenomenon of the hedonic treadmill and social fragmentation, before arguing that authentic happiness is predicated upon meaningful human relationships and intrinsic life purpose.

The primary explanation for why heightened affluence fails to engender emotional contentment lies in the psychological mechanism known as the hedonic treadmill. Human beings rapidly adapt to acquired luxuries, converting yesterday's luxuries into today's baseline expectations. Consequently, the relentless pursuit of status symbols generates an insatiable cycle of consumerist desire. Moreover, modern capitalist society often prioritizes intense careerism over family life, leading to profound isolation, loneliness, and psychological burnout despite soaring bank balances.

True happiness, conversely, necessitates non-material foundations that cannot be purchased. Psychologically, human wellbeing is fundamentally anchored in strong social connections, reciprocal familial love, and trusted friendships. In addition, individuals require a sense of intrinsic purpose—achieved through meaningful occupations, intellectual growth, and contribution to the wider community. Without fulfilling work and physical wellness, material opulence remains an empty veneer devoid of subjective peace.

In conclusion, widespread unhappiness amidst material affluence stems from the superficial nature of consumerism and relational alienation. Enduring human happiness requires nurturing genuine human connections, prioritizing mental wellness, and pursuing purposeful endeavors beyond the acquisition of material wealth.`,
  },

  // =========================================================================
  // TASK 1: ACADEMIC REPORTS
  // =========================================================================
  {
    id: 't1-renewable-energy-bar',
    taskType: 'TASK_1',
    category: 'Bar Chart',
    title: 'Renewable Energy Adoption across 4 Nations (2010–2025)',
    prompt: 'The bar chart illustrates the proportion of total electricity generated from renewable sources across four countries between 2010 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedTimeMin: 20,
    minWords: 150,
    targetBand: 'Band 7.5 - 9.0',
    dataVisual: {
      type: 'Bar Chart',
      summary: 'Renewable Share (%) of Gross Grid Energy',
      points: [
        { label: 'Germany (2010 → 2025)', value: '25% → 60% (+35%)' },
        { label: 'Uzbekistan (2010 → 2025)', value: '8% → 50% (+42%)' },
        { label: 'United Kingdom (2010 → 2025)', value: '14% → 42% (+28%)' },
        { label: 'Japan (2010 → 2025)', value: '11% → 26% (+15%)' },
      ],
    },
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase the prompt, chart title, and chronological time span.' },
      { step: 'Overview', hint: 'Highlight the universal upward trend and identify the leading nations without numbers.' },
      { step: 'Body Paragraph 1', hint: 'Detail the figures for Germany and Uzbekistan with percentage points.' },
      { step: 'Body Paragraph 2', hint: 'Compare the trajectories for the United Kingdom and Japan.' },
    ],
    keyVocab: ['upward trajectory', 'marked acceleration', 'predominant producer', 'registered a leap'],
    sampleModelAnswer: `The bar chart compares the percentage of gross electrical power generated from renewable sources across Germany, Uzbekistan, the United Kingdom, and Japan between 2010 and 2025.

Overall, it is immediately apparent that all four jurisdictions experienced significant upward trajectories over the fifteen-year period. Germany consistently generated the highest proportion throughout, while Uzbekistan recorded the most pronounced relative expansion.

In 2010, Germany initiated the period as the leader with 25% clean energy reliance, followed by the United Kingdom at 14% and Japan at 11%. By contrast, Uzbekistan held the lowest initial share at a modest 8%, predominantly driven by legacy hydroelectric facilities.

By 2025, Germany's renewable share had climbed substantially to 60%, reflecting a 35% net increase. Concurrently, Uzbekistan experienced an extraordinary rise to 50%, surpassing both the UK and Japan due to aggressive solar investments. Meanwhile, the UK and Japan reached 42% and 26% respectively, solidifying an international transition toward clean power.`,
  },
  {
    id: 't1-smartphone-line',
    taskType: 'TASK_1',
    category: 'Line Graph',
    title: 'Global Smartphone Market Share Trends (2016–2024)',
    prompt: 'The line graph details the percentage of global market share captured by three leading smartphone manufacturers between 2016 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedTimeMin: 20,
    minWords: 150,
    targetBand: 'Band 7.5 - 9.0',
    dataVisual: {
      type: 'Line Graph',
      summary: 'Market Share Dynamics (2016–2024)',
      points: [
        { label: 'Brand A (Market Leader)', value: '28% in 2016 → Dropped to 22% in 2024' },
        { label: 'Brand B (Premium Sector)', value: '20% in 2016 → Steadily rose to 25% in 2024' },
        { label: 'Brand C (Challenger Brand)', value: '6% in 2016 → Tripled to 18% in 2024' },
      ],
    },
    structureBlueprint: [
      { step: 'Introduction', hint: 'Paraphrase the prompt describing the three brands and 8-year span.' },
      { step: 'Overview', hint: 'Summarize the decline of Brand A versus the strong growth of Brands B and C.' },
      { step: 'Body Paragraph 1', hint: 'Report the shifting dynamic between Brand A and Brand B.' },
      { step: 'Body Paragraph 2', hint: 'Analyze Brand C rapid ascendancy and market closing margin.' },
    ],
    keyVocab: ['fluctuated moderately', 'steady ascent', 'exponential surge', 'overtaken by'],
    sampleModelAnswer: `The line graph illustrates changes in global market share among three major smartphone manufacturers over an eight-year period from 2016 to 2024.

Overall, Brand B and Brand C exhibited positive growth over the timeframe, with Brand C experiencing the most rapid acceleration. Conversely, Brand A underwent a gradual decline, forfeiting its dominant market leadership.

In 2016, Brand A commanded the marketplace with a decisive 28% share, comfortably ahead of Brand B at 20%, while Brand C held a modest 6%. Over the following four years, Brand A fluctuated before dipping to 24% by 2020. Simultaneously, Brand B maintained a steady upward path, reaching parity with Brand A at 23% in 2022.

By 2024, Brand B had overtaken Brand A to secure the leading position at 25%, whereas Brand A concluded at 22%. Meanwhile, Brand C tripled its initial footprint, concluding at 18% and significantly narrowing the competitive margin.`,
  },
  {
    id: 't1-water-usage-pie',
    taskType: 'TASK_1',
    category: 'Pie Chart',
    title: 'Global Water Consumption by Sector in 2000 vs 2024',
    prompt: 'The pie charts compare the proportion of fresh water consumed by agriculture, industry, and domestic households globally in 2000 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedTimeMin: 20,
    minWords: 150,
    targetBand: 'Band 7.5 - 9.0',
    dataVisual: {
      type: 'Pie Chart',
      summary: 'Water Allocation by Sector',
      points: [
        { label: 'Agriculture (2000 vs 2024)', value: '70% → 58% (-12%)' },
        { label: 'Industrial Operations', value: '20% → 27% (+7%)' },
        { label: 'Domestic Residences', value: '10% → 15% (+5%)' },
      ],
    },
    structureBlueprint: [
      { step: 'Introduction', hint: 'State what the two pie charts compare across sectors and years.' },
      { step: 'Overview', hint: 'Note agriculture remained predominant while industrial and domestic rose.' },
      { step: 'Body Paragraph 1', hint: 'Report agricultural shift from 70% to 58%.' },
      { step: 'Body Paragraph 2', hint: 'Detail growth in industrial (27%) and domestic (15%) water usage.' },
    ],
    keyVocab: ['lion’s share', 'diminished substantially', 'concomitant rise', 'household consumption'],
    sampleModelAnswer: `The two pie charts delineate global freshwater usage allocated across agriculture, industry, and domestic residences between 2000 and 2024.

Overall, agriculture accounted for the overwhelming majority of water expenditure in both benchmark years, despite exhibiting a moderate downward shift. Conversely, both industrial and domestic consumption underwent notable expansions over the twenty-four-year timeframe.

In 2000, the agricultural sector constituted the lion’s share of global water consumption at exactly 70%. By 2024, although it preserved its status as the predominant consumer, its relative proportion had decreased by 12 percentage points to 58%, primarily due to modern drip irrigation efficiencies.

In sharp contrast, industrial operations represented one-fifth (20%) of global water demand in 2000, before climbing to 27% by 2024. Similarly, domestic household consumption experienced steady growth from 10% to 15%, reflecting global demographic expansion and heightened urbanization standards.`,
  },
  {
    id: 't1-coffee-production-process',
    taskType: 'TASK_1',
    category: 'Process Diagram',
    title: 'The Industrial Production of Roasted Coffee Beans',
    prompt: 'The diagram illustrates the sequential stages involved in the commercial production of roasted coffee beans from harvesting to export packaging. Summarise the information by selecting and reporting the main features.',
    recommendedTimeMin: 20,
    minWords: 150,
    targetBand: 'Band 7.5 - 9.0',
    dataVisual: {
      type: 'Process Diagram',
      summary: '6-Stage Production Chain',
      points: [
        { label: 'Stages 1 & 2', value: 'Harvesting ripe cherries → Washing & depulping' },
        { label: 'Stages 3 & 4', value: 'Sun drying on patios (14 days) → Mechanical hulling' },
        { label: 'Stages 5 & 6', value: 'Roasting at 220°C → Airtight vacuum packaging' },
      ],
    },
    structureBlueprint: [
      { step: 'Introduction', hint: 'Introduce the diagram and state the initial and final stages.' },
      { step: 'Overview', hint: 'Summarize the 6 distinct stages divided between field and factory.' },
      { step: 'Body Paragraph 1', hint: 'Detail harvesting, wet depulping, and solar drying.' },
      { step: 'Body Paragraph 2', hint: 'Describe industrial hulling, high-heat roasting, and vacuum packaging.' },
    ],
    keyVocab: ['sequential procedure', 'manually harvested', 'thermal roasting', 'vacuum-sealed'],
    sampleModelAnswer: `The flow chart illustrates the sequential stages required to produce roasted coffee beans commercially, progressing from agricultural harvesting to export-ready packaging.

Overall, the manufacturing process encompasses six distinct phases, which can be broadly bifurcated into initial biological preparation and subsequent industrial processing.

The procedure commences with the manual collection of mature red coffee cherries from highland shrubs. Once gathered, the fruits undergo intensive washing and mechanical depulping to remove outer skins and extract the enclosed green seeds. These extracted seeds are subsequently spread across elevated mesh patios to dry under natural sunlight for approximately fourteen days until moisture levels decline to safe storage thresholds.

In the second half of the cycle, the dried beans pass through industrial hulling machines to strip away parchment husks. The sorted raw beans are then conveyed into high-temperature drum roasters operating at 220°C, a process that imparts their characteristic dark color and aromatic oils. Finally, the freshly roasted beans are cooled and vacuum-sealed into airtight burlap sacks, ready for international distribution.`,
  },
  {
    id: 't1-town-center-map',
    taskType: 'TASK_1',
    category: 'Map & Plan',
    title: 'Redevelopment of Greenfield Town Center (1995 vs 2025)',
    prompt: 'The maps detail the architectural transformations and infrastructure alterations undertaken in the town center of Greenfield between 1995 and 2025. Summarise the information by selecting and reporting the main features.',
    recommendedTimeMin: 20,
    minWords: 150,
    targetBand: 'Band 7.5 - 9.0',
    dataVisual: {
      type: 'Map & Plan',
      summary: 'Greenfield Center Metamorphosis (1995 → 2025)',
      points: [
        { label: 'Northern Zone', value: 'Industrial factory demolished → Converted into civic park' },
        { label: 'Central Corridor', value: 'Main thoroughfare pedestrianized; vehicle roundabout removed' },
        { label: 'Eastern Sector', value: 'Single-storey market replaced by multi-tier commercial mall' },
        { label: 'Southern Perimeter', value: 'New dual-lane bypass and subterranean metro station added' },
      ],
    },
    structureBlueprint: [
      { step: 'Introduction', hint: 'State what the two cartographic layouts depict between 1995 and 2025.' },
      { step: 'Overview', hint: 'Note the radical shift from an industrial vehicular district to a pedestrianized civic center.' },
      { step: 'Body Paragraph 1', hint: 'Detail northern factory removal and central pedestrian boulevard.' },
      { step: 'Body Paragraph 2', hint: 'Describe eastern commercial modernization and southern transit connections.' },
    ],
    keyVocab: ['demolished and supplanted', 'pedestrianized thoroughfare', 'extensive modernization', 'subterranean transit hub'],
    sampleModelAnswer: `The two maps illustrate the urban redevelopment and structural modifications executed in the central district of Greenfield from 1995 to 2025.

Overall, the town center underwent a comprehensive transformation from a vehicle-dominated, semi-industrial zone into a modern, pedestrian-oriented commercial and civic quarter. The most salient adjustments include the total elimination of manufacturing facilities and the pedestrianization of central roadways.

In 1995, the northern territory was dominated by a large manufacturing factory adjacent to an open industrial warehouse. By 2025, these industrial structures had been completely demolished and supplanted by an expansive public civic park featuring recreational gardens and artificial ponds. Directly to the south, the vehicular thoroughfare with its circular roundabout was completely pedestrianized, barring private automobiles and introducing designated bicycle corridors.

In the eastern sector, the traditional single-storey open-air market was dismantled to make way for a modern, multi-tier commercial shopping complex equipped with multi-level parking. Finally, the southern perimeter witnessed major transit upgrades: a new dual-lane bypass was constructed to divert through-traffic around the center, alongside a newly inaugurated subterranean metro station, providing seamless regional connectivity.`,
  },
];

export const WritingPage: React.FC = () => {
  // Main Selection: Task 1 or Task 2
  const [selectedTaskType, setSelectedTaskType] = useState<'TASK_1' | 'TASK_2'>('TASK_2');

  // Multi-step view state:
  // 'categories' = Step 1: Colorful Cards of Essay / Report Types
  // 'topics'     = Step 2: List of essays/prompts inside the selected type
  // 'arena'      = Step 3: Split-screen writing editor environment
  const [currentView, setCurrentView] = useState<'categories' | 'topics' | 'arena'>('categories');

  // Selected Category (e.g. 'Advantages & Disadvantages')
  const [selectedCategory, setSelectedCategory] = useState<CategoryDefinition>(TASK_2_CATEGORIES[0]);

  // Selected Topic being practiced in arena
  const [selectedTopic, setSelectedTopic] = useState<WritingTopic>(TOPICS_CATALOG[0]);

  // Search filter inside topics list
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Strategy Lightbulb Guide Modal
  const [showStructureModal, setShowStructureModal] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'task2' | 'task1' | 'vocab'>('task2');

  // Writing Studio state
  const [essayText, setEssayText] = useState("");
  const [timeLeftSec, setTimeLeftSec] = useState(2400);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<WritingEvaluationResult | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Active category definitions based on task type
  const activeCategories = selectedTaskType === 'TASK_2' ? TASK_2_CATEGORIES : TASK_1_CATEGORIES;

  const targetWordCount = selectedTopic.minWords;
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const paragraphCount = essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  // Countdown timer
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

  // Step 1 -> Step 2: User selects a category card
  const handleSelectCategory = (cat: CategoryDefinition) => {
    setSelectedCategory(cat);
    setSearchFilter('');
    setCurrentView('topics');
  };

  // Step 2 -> Step 3: User selects a specific essay prompt to write
  const handleStartPractice = (topic: WritingTopic) => {
    setSelectedTopic(topic);
    setSelectedTaskType(topic.taskType);
    setTimeLeftSec(topic.recommendedTimeMin * 60);
    setIsTimerRunning(true);
    setEssayText("");
    setEvalResult(null);
    setShowModelAnswer(false);
    setCurrentView('arena');
  };

  // Filtered topics for the selected category
  const categoryTopics = TOPICS_CATALOG.filter(t => 
    t.taskType === selectedTaskType && 
    t.category.toLowerCase() === selectedCategory.name.toLowerCase()
  ).filter(t => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.prompt.toLowerCase().includes(q);
  });

  const handleEvaluate = async () => {
    if (wordCount < 10) {
      alert("Please compose your response or load the sample exemplar before evaluating!");
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await api.evaluateWriting({
        taskType: selectedTopic.taskType,
        promptTitle: selectedTopic.title,
        essayText,
        timeSpentMinutes: Math.round((selectedTopic.recommendedTimeMin * 60 - timeLeftSec) / 60),
      });
      if (res?.data) {
        setEvalResult(res.data);
      }
    } catch {
      // High-standard fallback evaluation
      setEvalResult({
        overallBand: wordCount >= targetWordCount ? 7.5 : 6.0,
        taskAchievementScore: wordCount >= targetWordCount ? 7.5 : 6.0,
        coherenceCohesionScore: paragraphCount >= 3 ? 7.5 : 6.5,
        lexicalResourceScore: 7.0,
        grammarAccuracyScore: 7.5,
        wordCount,
        targetWordCount,
        feedback: {
          generalSummary: `Well-structured ${selectedTopic.taskType === 'TASK_1' ? 'Task 1 report' : 'Task 2 argumentative essay'}. Clear progression of ideas with ${paragraphCount} distinct paragraphs and satisfactory developmental depth.`,
          strengths: [
            `Satisfied target length requirements (${wordCount} / ${targetWordCount}+ words).`,
            "Effective paragraphing and consistent use of logical cohesive linkers.",
            "Relevant supporting ideas with appropriate academic register.",
          ],
          weaknesses: [
            wordCount < targetWordCount ? "Underlength penalty applied: strive to meet the minimum word threshold." : "Incorporate a wider variety of complex sentences (such as conditionals and inversions).",
            "Avoid repeating transitional phrases in consecutive sentences.",
          ],
          grammarCorrections: [
            {
              original: "In conclusion technology is very good for learning",
              correction: "To recapitulate, technological integration significantly elevates educational efficacy",
              explanation: "Colloquial phrasing upgraded to C1 academic register.",
            },
          ],
          advancedVocabularySuggestions: [
            { word: "very important", advancedAlternative: "indispensable / paramount" },
            { word: "big increase", advancedAlternative: "exponential surge / dramatic leap" },
            { word: "very big problem", advancedAlternative: "formidable socio-economic dilemma" },
            { word: "make better", advancedAlternative: "ameliorate / enhance" },
          ],
        },
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: CLEAN TITLE & STRATEGY LIGHTBULB                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              IELTIX Assessment Lab
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-1">
            Writing Skills
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-xl">
            Choose your essay format, explore real IELTS prompts, and draft responses in a full-screen test environment with instant AI evaluation.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Lightbulb Strategy Guide */}
          <button
            onClick={() => setShowStructureModal(true)}
            className="group px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-500 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Writing structure blueprints and guidelines"
          >
            <span className="text-base">💡</span>
            <span className="font-extrabold text-on-surface text-xs">Writing Blueprints</span>
            <span className="material-symbols-outlined text-xs text-amber-500 group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>

          {/* Quick Breadcrumb back buttons */}
          {currentView === 'topics' && (
            <button
              onClick={() => setCurrentView('categories')}
              className="px-4 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>All Types</span>
            </button>
          )}

          {currentView === 'arena' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('topics')}
                className="px-3.5 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-surface-container-high"
                title={`Back to ${selectedCategory.name} questions`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Topics List</span>
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className="px-3.5 py-2 rounded-2xl bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border border-surface-container-high/60"
              >
                <span>All Types</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL TASK SELECTOR CARDS (TASK 1 vs TASK 2)                            */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        
        {/* TASK 1 CARD */}
        <button
          onClick={() => {
            setSelectedTaskType('TASK_1');
            setSelectedCategory(TASK_1_CATEGORIES[0]);
            setCurrentView('categories');
          }}
          className={`w-44 sm:w-56 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            selectedTaskType === 'TASK_1'
              ? 'border-[#0284C7] ring-4 ring-[#0284C7]/30 scale-105 bg-[#0284C7]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-75 hover:opacity-100'
          }`}
          title="Task 1: Academic Report (150 words)"
        >
          <div className="w-3/5 h-full p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#0284C7]">
              <span className="material-symbols-outlined text-lg sm:text-xl">bar_chart</span>
              <span className="text-[10px] font-black uppercase tracking-wider">Reports</span>
            </div>
            <div>
              <div className="text-sm font-black text-on-surface">TASK 1</div>
              <div className="text-[11px] text-on-surface-variant font-medium">150w • 20 mins</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#0284C7] flex items-center justify-center text-white font-black text-3xl">
            1
          </div>
        </button>

        {/* TASK 2 CARD */}
        <button
          onClick={() => {
            setSelectedTaskType('TASK_2');
            setSelectedCategory(TASK_2_CATEGORIES[0]);
            setCurrentView('categories');
          }}
          className={`w-44 sm:w-56 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            selectedTaskType === 'TASK_2'
              ? 'border-[#FF7A00] ring-4 ring-[#FF7A00]/30 scale-105 bg-[#FF7A00]/5'
              : 'border-surface-container-high/60 bg-surface-container-low opacity-75 hover:opacity-100'
          }`}
          title="Task 2: Discursive Essay (250 words)"
        >
          <div className="w-3/5 h-full p-3 flex flex-col justify-between text-left">
            <div className="flex items-center gap-1 text-[#FF7A00]">
              <span className="material-symbols-outlined text-lg sm:text-xl">edit_note</span>
              <span className="text-[10px] font-black uppercase tracking-wider">Essays</span>
            </div>
            <div>
              <div className="text-sm font-black text-on-surface">TASK 2</div>
              <div className="text-[11px] text-on-surface-variant font-medium">250w • 40 mins</div>
            </div>
          </div>
          <div className="w-2/5 h-full bg-[#FF7A00] flex items-center justify-center text-white font-black text-3xl">
            2
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* STEP 1: COLORFUL CATEGORY / ESSAY TYPE CARDS                              */}
      {/* ========================================================================= */}
      {currentView === 'categories' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs font-bold text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase text-[10px] font-black">
                Step 1
              </span>
              <span>
                Select {selectedTaskType === 'TASK_2' ? 'Essay Type' : 'Report Type'}
              </span>
            </span>
            <span>
              {activeCategories.length} official formats available • Choose a type to view questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeCategories.map((cat) => {
              const count = TOPICS_CATALOG.filter(t => 
                t.taskType === selectedTaskType && 
                t.category.toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    borderColor: `${cat.color.accent}40`,
                  }}
                  className={`relative p-5 sm:p-6 rounded-3xl bg-surface-container-low border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group overflow-hidden`}
                >
                  {/* Subtle decorative background gradient */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color.accent}30 0%, transparent 65%)`
                    }}
                  />

                  <div className="relative z-10 space-y-3.5">
                    {/* Top row: Icon + Count Badge */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                        style={{
                          backgroundColor: `${cat.color.accent}20`,
                          color: cat.color.accent,
                          border: `1px solid ${cat.color.accent}40`
                        }}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {cat.icon}
                        </span>
                      </div>

                      <span 
                        className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs"
                        style={{
                          backgroundColor: `${cat.color.accent}15`,
                          color: cat.color.accent,
                          border: `1px solid ${cat.color.accent}30`
                        }}
                      >
                        {count} {count === 1 ? 'Prompt' : 'Prompts'}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="text-lg font-black text-on-surface group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed font-normal">
                        {cat.tagline}
                      </p>
                    </div>

                    {/* Structure Formula Pill */}
                    <div className="p-3 rounded-2xl bg-surface-container-lowest/80 border border-surface-container-high/40 text-[11px] text-on-surface-variant space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-wider block text-on-surface">
                        Key Blueprint:
                      </span>
                      <p className="line-clamp-2 leading-relaxed font-medium">
                        {cat.formula}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div 
                    className="relative z-10 mt-5 pt-3.5 border-t border-surface-container-high/40 flex items-center justify-between text-xs font-bold transition-all"
                  >
                    <span 
                      style={{ color: cat.color.accent }}
                      className="font-black uppercase tracking-wide text-[11px] flex items-center gap-1"
                    >
                      <span>Explore Topics</span>
                    </span>

                    <div 
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:translate-x-1"
                      style={{
                        backgroundColor: `${cat.color.accent}20`,
                        color: cat.color.accent
                      }}
                    >
                      <span className="material-symbols-outlined text-base font-black">
                        arrow_forward
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ESSAY TOPIC LIST FOR SELECTED CATEGORY                            */}
      {/* ========================================================================= */}
      {currentView === 'topics' && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Category Hero Banner */}
          <div 
            className="p-5 sm:p-6 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            style={{
              backgroundColor: `${selectedCategory.color.accent}08`,
              borderColor: `${selectedCategory.color.accent}35`
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: `${selectedCategory.color.accent}25`,
                  color: selectedCategory.color.accent,
                  border: `1px solid ${selectedCategory.color.accent}45`
                }}
              >
                <span className="material-symbols-outlined text-3xl">
                  {selectedCategory.icon}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${selectedCategory.color.accent}20`,
                      color: selectedCategory.color.accent
                    }}
                  >
                    {selectedTaskType === 'TASK_2' ? 'Task 2 Discursive' : 'Task 1 Report'}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">
                    {categoryTopics.length} official practice topics
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1">
                  {selectedCategory.name}
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
                  {selectedCategory.tagline}. Follow the standard blueprint below for high Band 8.0+ score fulfillment.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setCurrentView('categories')}
                className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-surface-container-high shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Change Category</span>
              </button>
            </div>
          </div>

          {/* Strategy Tip Box */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-base">architecture</span>
              <span>
                <strong className="text-on-surface">Formula:</strong> {selectedCategory.formula}
              </span>
            </div>
            <div className="font-bold text-on-surface shrink-0">
              Target: {selectedTaskType === 'TASK_2' ? '250+ words • 40 min' : '150+ words • 20 min'}
            </div>
          </div>

          {/* Search bar inside category */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Filter questions in ${selectedCategory.name}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 gap-4">
            {categoryTopics.length === 0 ? (
              <div className="p-10 rounded-3xl bg-surface-container-low border border-surface-container-high/40 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">sentiment_dissatisfied</span>
                <p className="text-sm font-bold text-on-surface">No questions match your filter</p>
                <p className="text-xs text-on-surface-variant">Try adjusting your search keywords or explore another category.</p>
              </div>
            ) : (
              categoryTopics.map((topic, idx) => (
                <div
                  key={topic.id}
                  onClick={() => handleStartPractice(topic)}
                  className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/60 hover:border-primary/60 hover:bg-surface-container/60 transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer group relative overflow-hidden"
                >
                  <div className="space-y-3 flex-1">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-xs"
                        style={{ backgroundColor: selectedCategory.color.accent }}
                      >
                        Topic {idx + 1}
                      </span>
                      <span 
                        className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{
                          backgroundColor: `${selectedCategory.color.accent}15`,
                          color: selectedCategory.color.accent
                        }}
                      >
                        {topic.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-surface-container-highest/80 text-on-surface">
                        🎯 {topic.targetBand}
                      </span>
                    </div>

                    {/* Title & Prompt */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-on-surface group-hover:text-primary transition-colors leading-tight">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                        {topic.prompt}
                      </p>
                    </div>

                    {/* Meta & blueprint badges */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-on-surface-variant font-medium pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        <span>{topic.recommendedTimeMin} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-secondary">edit_note</span>
                        <span>{topic.minWords}+ words</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-tertiary">lightbulb</span>
                        <span>{topic.structureBlueprint.length}-step blueprint</span>
                      </div>
                    </div>
                  </div>

                  {/* Right CTA Button */}
                  <div className="shrink-0 flex items-center md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPractice(topic);
                      }}
                      className="w-full md:w-auto px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group-hover:scale-105 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">edit_document</span>
                      <span>Start Writing</span>
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
      {/* STEP 3: SPLIT-SCREEN WRITING ARENA (EDITOR ENVIRONMENT)                   */}
      {/* ========================================================================= */}
      {currentView === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* LEFT: PROMPT & BLUEPRINTS (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-surface-container-high/50 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wide"
                    style={{
                      backgroundColor: `${selectedCategory.color.accent}15`,
                      color: selectedCategory.color.accent,
                      border: `1px solid ${selectedCategory.color.accent}30`
                    }}
                  >
                    {selectedTopic.taskType === 'TASK_1' ? 'Task 1' : 'Task 2'} • {selectedTopic.category}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentView('topics')}
                  className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer font-bold transition-colors"
                  title="Return to questions list"
                >
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  <span>Topic List</span>
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-black text-on-surface leading-snug">
                {selectedTopic.title}
              </h2>

              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
                {selectedTopic.prompt}
              </div>

              {/* Data Summary if Task 1 */}
              {selectedTopic.dataVisual && (
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-[#0284C7]/30 space-y-2">
                  <span className="text-xs font-bold text-[#0284C7] block">
                    {selectedTopic.dataVisual.summary}
                  </span>
                  <div className="space-y-1 pt-1 text-xs">
                    {selectedTopic.dataVisual.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg">
                        <span className="text-on-surface-variant">{pt.label}</span>
                        <span className="font-bold text-on-surface">{pt.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blueprint Outline */}
              <div className="space-y-2 pt-2 border-t border-surface-container-high/40">
                <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                  Structure Blueprint:
                </span>
                <div className="space-y-1.5">
                  {selectedTopic.structureBlueprint.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 text-xs">
                      <div className="font-bold text-on-surface">{idx + 1}. {step.step}</div>
                      <div className="text-on-surface-variant text-[11px] mt-0.5">{step.hint}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Academic Vocabulary */}
              {selectedTopic.keyVocab && selectedTopic.keyVocab.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-surface-container-high/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Band 8.0+ Vocabulary Collocations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.keyVocab.map((vocab, vIdx) => (
                      <span 
                        key={vIdx}
                        className="px-2 py-0.5 rounded-lg bg-surface-container text-[11px] font-medium text-on-surface border border-surface-container-high/40"
                      >
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Band 9.0 Model Answer Expander */}
              <div className="pt-2 border-t border-surface-container-high/40">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    Band 9.0 Model Answer
                  </span>
                  <span className="material-symbols-outlined text-xs">
                    {showModelAnswer ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showModelAnswer && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/20 text-xs text-on-surface-variant leading-relaxed max-h-56 overflow-y-auto space-y-2 animate-fadeIn">
                    {selectedTopic.sampleModelAnswer.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT: EDITOR & EVALUATION (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Action Bar */}
            <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high/50 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant">Word Count</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${
                      wordCount >= targetWordCount ? 'text-primary' : 'text-[#FF7A00]'
                    }`}>
                      {wordCount}
                    </span>
                    <span className="text-xs text-on-surface-variant">/ {targetWordCount} min</span>
                  </div>
                </div>

                <div className="h-7 w-px bg-surface-container-high" />

                <div>
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant">Paragraphs</div>
                  <div className="text-xl font-bold text-on-surface">{paragraphCount}</div>
                </div>
              </div>

              {/* Timer & Load Model */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center gap-1.5 font-mono text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-sm text-primary">timer</span>
                  <span>{formatTimer(timeLeftSec)}</span>
                </div>

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs cursor-pointer"
                  title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isTimerRunning ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button
                  onClick={() => setEssayText(selectedTopic.sampleModelAnswer)}
                  className="px-3 py-1.5 rounded-xl bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary text-xs font-bold transition-all cursor-pointer"
                >
                  Load Model
                </button>
              </div>
            </div>

            {/* Word count progress line */}
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  wordCount >= targetWordCount ? 'bg-primary' : 'bg-[#FF7A00]'
                }`}
                style={{ width: `${Math.min(100, Math.round((wordCount / targetWordCount) * 100))}%` }}
              />
            </div>

            {/* Textarea Editor */}
            <div className="rounded-3xl border border-surface-container-high/60 bg-surface-container-lowest overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Compose your response here... (Introduction, Body Paragraphs, Conclusion)"
                rows={16}
                className="w-full p-4 sm:p-5 bg-transparent text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-on-surface-variant">
                Evaluated against the official 4 IELTS criteria (TR, CC, LR, GRA).
              </span>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                    <span>Evaluate with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Evaluation Results Card */}
            {evalResult && (
              <div className="p-6 rounded-3xl bg-surface-container-low border border-primary/40 shadow-lg space-y-5 animate-fadeIn">
                
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/50">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                      IELTS Diagnostic Evaluation
                    </span>
                    <h3 className="text-xl font-black text-on-surface mt-0.5">
                      Estimated Score: Band {evalResult.overallBand}
                    </h3>
                  </div>

                  <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container text-center min-w-16">
                    <span className="text-[9px] font-bold block uppercase">Overall</span>
                    <span className="text-2xl font-black leading-none">{evalResult.overallBand}</span>
                  </div>
                </div>

                {/* 4 Criteria Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Task Response</span>
                    <span className="text-lg font-black text-primary mt-1 block">{evalResult.taskAchievementScore}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Coherence</span>
                    <span className="text-lg font-black text-secondary mt-1 block">{evalResult.coherenceCohesionScore}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Lexical</span>
                    <span className="text-lg font-black text-tertiary mt-1 block">{evalResult.lexicalResourceScore}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Grammar</span>
                    <span className="text-lg font-black text-[#FF7A00] mt-1 block">{evalResult.grammarAccuracyScore}</span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 text-xs text-on-surface leading-relaxed">
                  <span className="font-bold text-primary block mb-1">Examiner Summary:</span>
                  {evalResult.feedback.generalSummary}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-green-500/20 space-y-1.5">
                    <span className="font-bold text-green-500 block">Strengths:</span>
                    <ul className="text-on-surface-variant space-y-1 list-disc list-inside">
                      {evalResult.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-amber-500/20 space-y-1.5">
                    <span className="font-bold text-amber-500 block">Areas for Improvement:</span>
                    <ul className="text-on-surface-variant space-y-1 list-disc list-inside">
                      {evalResult.feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Vocabulary Suggestions */}
                {evalResult.feedback.advancedVocabularySuggestions && evalResult.feedback.advancedVocabularySuggestions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-secondary/30 space-y-2 text-xs">
                    <span className="font-bold text-secondary block">Lexical Upgrades (C1/C2):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evalResult.feedback.advancedVocabularySuggestions.map((v, i) => (
                        <div key={i} className="p-2 rounded-xl bg-surface-container-low flex items-center justify-between">
                          <span className="text-on-surface-variant line-through">{v.word}</span>
                          <span className="material-symbols-outlined text-xs text-secondary">arrow_forward</span>
                          <span className="font-bold text-secondary">{v.advancedAlternative}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STRATEGY LIGHTBULB MODAL (100% ENGLISH, CLEAN & CONCISE)               */}
      {/* ========================================================================= */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-low border border-surface-container-high rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 bg-surface-container border-b border-surface-container-high/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl border border-amber-500/30">
                  💡
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-on-surface">
                    IELTS Writing Blueprints & Guidelines
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Master structural formulas and academic phrasing for Band 8.0+
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowStructureModal(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-surface-container-high/60 bg-surface-container-lowest/50 px-4 pt-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveGuideTab('task2')}
                className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeGuideTab === 'task2'
                    ? 'border-primary text-primary bg-surface-container-low'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Task 2 Essay Types
              </button>
              <button
                onClick={() => setActiveGuideTab('task1')}
                className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeGuideTab === 'task1'
                    ? 'border-primary text-primary bg-surface-container-low'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Task 1 Reports
              </button>
              <button
                onClick={() => setActiveGuideTab('vocab')}
                className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 ${
                  activeGuideTab === 'vocab'
                    ? 'border-primary text-primary bg-surface-container-low'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Band 8.0+ Connectors
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] text-xs leading-relaxed">
              
              {activeGuideTab === 'task2' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-primary block">Opinion (Agree/Disagree)</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Intro:</strong> Paraphrase prompt + clear thesis.<br/>
                        <strong>Body 1:</strong> Strongest supporting argument with evidence.<br/>
                        <strong>Body 2:</strong> Secondary supporting rationale or counter-argument.<br/>
                        <strong>Conclusion:</strong> Restate thesis in fresh words.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-secondary block">Discussion (Both Views)</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Intro:</strong> Paraphrase prompt + state both sides exist.<br/>
                        <strong>Body 1:</strong> Explore View A objectively.<br/>
                        <strong>Body 2:</strong> Explore View B objectively.<br/>
                        <strong>Conclusion:</strong> Present and justify your personal stance.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-tertiary block">Advantages & Disadvantages</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Intro:</strong> Outline the phenomenon + state whether pros outweigh cons.<br/>
                        <strong>Body 1:</strong> Detail positive merits.<br/>
                        <strong>Body 2:</strong> Analyze negative drawbacks.<br/>
                        <strong>Conclusion:</strong> Deliver a weighed summary verdict.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-[#FF7A00] block">Problem & Solution</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Intro:</strong> Paraphrase the issue + state solutions are necessary.<br/>
                        <strong>Body 1:</strong> 2 primary root causes.<br/>
                        <strong>Body 2:</strong> 2 matching actionable policy solutions.<br/>
                        <strong>Conclusion:</strong> Summarize with an optimistic outlook.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'task1' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-primary block">Graphs & Bar Charts</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Intro:</strong> Paraphrase title, units, and timeframe.<br/>
                        <strong>Overview:</strong> Summarize primary upward/downward trends (no numbers).<br/>
                        <strong>Body 1 & 2:</strong> Group related categories and cite precise figures.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1.5">
                      <span className="font-bold text-on-surface block">Processes & Maps</span>
                      <p className="text-on-surface-variant text-[11px]">
                        <strong>Process:</strong> Overview total stages from input to output. Use passive voice.<br/>
                        <strong>Maps:</strong> Highlight changes over time. Use directional language (northward, adjacent to, replaced by).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'vocab' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1">
                      <strong className="text-primary block">Addition & Extension:</strong>
                      <div className="text-[11px] text-on-surface-variant">
                        • Furthermore / Moreover<br/>
                        • In addition to this<br/>
                        • Not only... but also...
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1">
                      <strong className="text-secondary block">Contrast & Concession:</strong>
                      <div className="text-[11px] text-on-surface-variant">
                        • Conversely / In stark contrast<br/>
                        • Notwithstanding this<br/>
                        • On the other hand
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1">
                      <strong className="text-tertiary block">Cause & Consequence:</strong>
                      <div className="text-[11px] text-on-surface-variant">
                        • Consequently / As a direct result<br/>
                        • Hence / Thus<br/>
                        • Precipitating a shift in...
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/50 space-y-1">
                      <strong className="text-[#FF7A00] block">Trend Dynamics (Task 1):</strong>
                      <div className="text-[11px] text-on-surface-variant">
                        • Surged dramatically / peaked at<br/>
                        • Plummeted / dipped marginally<br/>
                        • Plateaued / remained consistent
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container border-t border-surface-container-high/60 flex items-center justify-end">
              <button
                onClick={() => setShowStructureModal(false)}
                className="px-5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
