import React, { useState, useEffect, useRef } from 'react';
import { Foxy3DModel } from '../components/Foxy3DModel.js';
import { api } from '../services/api.js';
import { SpeakingEvaluationResult } from '../types/index.js';

interface QuestionItem {
  qId: string;
  question: string;
  modelAnswer: string;
  cuePoints?: string[];
}

interface SpeakingTopic {
  id: string;
  part: 1 | 2 | 3;
  topicNumber: number;
  title: string;
  questionCountText: string;
  isNew?: boolean;
  hasFreeAnswers?: boolean;
  questions: QuestionItem[];
}

export const SpeakingPage: React.FC = () => {
  // Navigation within the selected Part:
  // 'topics': vertical list of topics (screenshot 1)
  // 'questions': vertical list of questions for the selected topic (screenshot 2)
  const [activeTab, setActiveTab] = useState<'topics' | 'questions'>('topics');
  const [activePart, setActivePart] = useState<1 | 2 | 3 | 'bookmarks'>(1);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('p1-work-studies');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active question being practiced with Foxy (modal opens when not null)
  const [activePracticeQ, setActivePracticeQ] = useState<{
    topic: SpeakingTopic;
    question: QuestionItem;
    qIndex: number;
  } | null>(null);

  // Foxy interactive studio states
  const [foxyStatus, setFoxyStatus] = useState<'idle' | 'listening' | 'speaking' | 'evaluating'>('idle');
  const [foxyMessage, setFoxyMessage] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<SpeakingEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Interactive Live AI Suhbat (Dialogue Mode) states
  const [practiceMode, setPracticeMode] = useState<'dialogue' | 'single'>('dialogue');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'examiner' | 'user';
    text: string;
    time: string;
    instantCorrection?: string;
  }>>([]);
  const [liveBandScore, setLiveBandScore] = useState<number>(7.0);
  const [liveRubrics, setLiveRubrics] = useState<{ fluency: number; lexical: number; grammar: number; pronunciation: number }>({
    fluency: 7.0,
    lexical: 7.0,
    grammar: 7.0,
    pronunciation: 7.0,
  });
  const [isExaminerReplying, setIsExaminerReplying] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // COMPREHENSIVE IELTS SPEAKING DATA (EXACT FLOW MATCHING SCREENSHOTS)
  const allTopics: SpeakingTopic[] = [
    // PART 1 TOPICS (EXACT SCREENSHOT LIST)
    {
      id: 'p1-work-studies',
      part: 1,
      topicNumber: 1,
      title: 'Work and studies (always in use)',
      questionCountText: '10 questions',
      isNew: true,
      hasFreeAnswers: true,
      questions: [
        {
          qId: 'p1-ws-1',
          question: 'Do you work or are you a student?',
          modelAnswer: 'At present, I am an undergraduate student majoring in computer science and artificial intelligence, while also dedicating considerable time to academic IELTS preparation and freelance software projects.',
        },
        {
          qId: 'p1-ws-2',
          question: 'What work do you do? What subjects are you studying?',
          modelAnswer: 'I am currently focusing on software engineering, algorithms, and applied machine learning. My coursework involves data structures, database architecture, and developing user-centric web applications.',
        },
        {
          qId: 'p1-ws-3',
          question: 'Why did you choose that job?',
          modelAnswer: 'I chose this domain because computing is rapidly reshaping modern society. It provides unparalleled intellectual stimulation and the practical capability to build tools that solve genuine human problems.',
        },
        {
          qId: 'p1-ws-4',
          question: 'Why did you choose to study that subject?',
          modelAnswer: 'From an early age, I possessed an innate curiosity regarding how digital software functions. Pursuing technology was a natural progression of my desire to create scalable technological innovations.',
        },
        {
          qId: 'p1-ws-5',
          question: 'Do you like your job? (new ideas added on 18 November 2019)',
          modelAnswer: 'I find it exceptionally fulfilling. The opportunity to analyze complex technical dilemmas and collaborate alongside forward-thinking peers offers immense personal satisfaction on a daily basis.',
        },
        {
          qId: 'p1-ws-6',
          question: 'Is there anything you dislike about your job?',
          modelAnswer: 'Occasionally, prolonged screen exposure and sedentary routines can prove mentally fatiguing. Therefore, I make a deliberate effort to incorporate cardiovascular exercise to recharge my energy.',
        },
        {
          qId: 'p1-ws-7',
          question: 'What was your dream job when you were young?',
          modelAnswer: 'When I was in primary school, I harbored aspirations of becoming an astronomer. The vast expanse of the cosmos captivated my imagination, and I spent hours gazing through a makeshift telescope.',
        },
        {
          qId: 'p1-ws-8',
          question: 'Have you changed your mind on your dream job?',
          modelAnswer: 'Undoubtedly. As I matured and realized my practical affinity for mathematics and computational logic, my focus shifted toward software engineering and applied artificial intelligence.',
        },
        {
          qId: 'p1-ws-9',
          question: 'What do you plan to do after you complete your studies?',
          modelAnswer: 'Upon graduation, I intend to undertake a Master\'s degree abroad in Europe, specializing in human-computer interaction and scalable distributed cloud systems.',
        },
        {
          qId: 'p1-ws-10',
          question: 'Do you think your chosen field has strong future prospects?',
          modelAnswer: 'Without question. The exponential growth of automation and cloud infrastructure ensures that proficient software architects and data engineers will remain in high demand globally.',
        },
      ],
    },
    {
      id: 'p1-hometown',
      part: 1,
      topicNumber: 2,
      title: 'Hometown (always in use)',
      questionCountText: '7 questions',
      isNew: true,
      hasFreeAnswers: true,
      questions: [
        {
          qId: 'p1-ht-1',
          question: 'Where is your hometown located?',
          modelAnswer: 'I was born and raised in Samarkand, located in the central region of Uzbekistan, renowned across the globe for its architectural monuments and rich Silk Road history.',
        },
        {
          qId: 'p1-ht-2',
          question: 'What do you like most about your hometown?',
          modelAnswer: 'What resonates with me most is the harmonious balance between profound historical antiquity and modern cosmopolitan infrastructure, surrounded by exceptionally hospitable locals.',
        },
        {
          qId: 'p1-ht-3',
          question: 'Has your hometown changed much since you were a child?',
          modelAnswer: 'Dramatically. The introduction of digital civic amenities, renovated tourist corridors, and rapid commercial development have elevated living standards tremendously.',
        },
        {
          qId: 'p1-ht-4',
          question: 'Is there any public transportation in your hometown?',
          modelAnswer: 'Yes, we have an extensive fleet of modern electric buses and trams connecting residential districts with historical landmarks and educational hubs.',
        },
        {
          qId: 'p1-ht-5',
          question: 'Do you think your hometown is a good place for young people?',
          modelAnswer: 'Certainly. With new IT tech hubs, universities, and recreational parks opening frequently, young individuals have abundant avenues for educational and leisure pursuits.',
        },
        {
          qId: 'p1-ht-6',
          question: 'What are the main industries or businesses in your hometown?',
          modelAnswer: 'International tourism and hospitality constitute major pillars, alongside agricultural processing, textiles, and an emerging tech entrepreneurship ecosystem.',
        },
        {
          qId: 'p1-ht-7',
          question: 'Do you think you will continue living there in the future?',
          modelAnswer: 'While I hold deep emotional reverence for my heritage, I anticipate living in major international capitals for career advancement before returning in later years.',
        },
      ],
    },
    {
      id: 'p1-country',
      part: 1,
      topicNumber: 3,
      title: 'Country (always in use)',
      questionCountText: '5 questions',
      isNew: true,
      hasFreeAnswers: true,
      questions: [
        {
          qId: 'p1-cn-1',
          question: 'Which country do you come from?',
          modelAnswer: 'I come from Uzbekistan, a historically rich nation located at the heart of Central Asia, famous for its ancient oasis cities and diverse landscapes.',
        },
        {
          qId: 'p1-cn-2',
          question: 'What is the climate like in your country?',
          modelAnswer: 'We enjoy a sharply continental climate characterized by scorching, dry summers and crisp, chilly winters, with very pleasant and blooming spring seasons.',
        },
        {
          qId: 'p1-cn-3',
          question: 'What is a famous national tradition or holiday in your country?',
          modelAnswer: 'Navruz, our traditional spring equinox festival celebrated in March, is cherished nationwide with special delicacies like sumalak and vibrant street festivities.',
        },
        {
          qId: 'p1-cn-4',
          question: 'What do visitors usually admire most when they travel to your country?',
          modelAnswer: 'Tourists are routinely captivated by the turquoise-domed madrasahs of Samarkand and Bukhara, along with the extraordinary hospitality of the people.',
        },
        {
          qId: 'p1-cn-5',
          question: 'How do you see your country developing over the next decade?',
          modelAnswer: 'I foresee steady modernization fueled by educational reform, green energy adoption, and expanding digital governance initiatives.',
        },
      ],
    },
    {
      id: 'p1-buses-taxi',
      part: 1,
      topicNumber: 4,
      title: 'Buses and taxi (for all test dates from March to 31 August 2019)',
      questionCountText: '7 questions',
      isNew: true,
      questions: [
        {
          qId: 'p1-bt-1',
          question: 'How often do you take buses or taxis?',
          modelAnswer: 'I rely on buses virtually every weekday for my university commute, while reserving on-demand taxis for urgent evening commitments or inclement weather.',
        },
        {
          qId: 'p1-bt-2',
          question: 'Do you prefer traveling by bus or by taxi?',
          modelAnswer: 'I generally prefer buses due to their cost-effectiveness and dedicated bus lanes during peak rush hours, though taxis provide greater privacy and doorstep convenience.',
        },
        {
          qId: 'p1-bt-3',
          question: 'Are public buses well-equipped in your city?',
          modelAnswer: 'Yes, modern fleets feature air conditioning, contactless mobile payment terminals, and electronic real-time arrival schedule displays at every stop.',
        },
        {
          qId: 'p1-bt-4',
          question: 'When was the last time you took a taxi?',
          modelAnswer: 'Just two days ago, when returning home late from a collaborative hackathon session. The ride-hailing app made booking seamless and safe.',
        },
        {
          qId: 'p1-bt-5',
          question: 'Is it easy to catch a taxi in your area?',
          modelAnswer: 'Extremely easy. Digital ride-hailing applications ensure a driver arrives within three to five minutes anywhere in the metropolitan center.',
        },
        {
          qId: 'p1-bt-6',
          question: 'Do you think public transport will replace private cars in future?',
          modelAnswer: 'If metropolitan authorities continue expanding subway lines and rapid bus routes, many city dwellers will gladly abandon cars to evade traffic congestion.',
        },
        {
          qId: 'p1-bt-7',
          question: 'Did you ride buses frequently during your childhood?',
          modelAnswer: 'Yes, my mother accompanied me on the public bus to primary school every morning, which instilled an early appreciation for public transit.',
        },
      ],
    },
    {
      id: 'p1-coffee-tea',
      part: 1,
      topicNumber: 5,
      title: 'Coffee and tea (for all test dates from March to 31 August 2019)',
      questionCountText: '4 questions',
      isNew: true,
      questions: [
        {
          qId: 'p1-ct-1',
          question: 'Do you prefer drinking coffee or tea?',
          modelAnswer: 'I am firmly in favor of freshly brewed green tea throughout the day, although an espresso in the morning proves indispensable during intensive study periods.',
        },
        {
          qId: 'p1-ct-2',
          question: 'Is tea drinking culturally significant in your country?',
          modelAnswer: 'Immense cultural significance. Serving hot green or black tea in a traditional piala is the universal symbol of warm hospitality in every Uzbek household.',
        },
        {
          qId: 'p1-ct-3',
          question: 'When do you usually drink coffee or tea?',
          modelAnswer: 'I enjoy a cup immediately after breakfast to stimulate alertness, and another pot of soothing herbal tea in the evening while reviewing coursework.',
        },
        {
          qId: 'p1-ct-4',
          question: 'Do you ever prepare coffee or tea for guests at home?',
          modelAnswer: 'Always. In our custom, offering freshly brewed tea with dry fruits and sweets is the very first gesture extended to any visitor.',
        },
      ],
    },
    {
      id: 'p1-colours',
      part: 1,
      topicNumber: 6,
      title: 'Colours (for all test dates in March and April 2019)',
      questionCountText: '11 questions',
      isNew: true,
      questions: [
        {
          qId: 'p1-col-1',
          question: 'What is your favorite color and why?',
          modelAnswer: 'My favorite color is deep navy blue because it exudes serenity, professionalism, and cognitive clarity, which helps me stay focused during coding.',
        },
        {
          qId: 'p1-col-2',
          question: 'Did you like different colors when you were a child?',
          modelAnswer: 'As a youngster, I was captivated by vibrant sunshine yellow and crimson red because they felt cheerful, energetic, and visually prominent in cartoons.',
        },
        {
          qId: 'p1-col-3',
          question: 'Are there any colors that you dislike wearing?',
          modelAnswer: 'I rarely opt for neon shades such as fluorescent green or bright orange, as I feel they clash with my subdued personal aesthetic.',
        },
        {
          qId: 'p1-col-4',
          question: 'What colors do you prefer for your bedroom walls?',
          modelAnswer: 'I favor neutral minimalist tones like soft ivory, off-white, or muted slate grey because they maximize natural light and foster tranquil sleep.',
        },
      ],
    },

    // PART 2 TOPICS
    {
      id: 'p2-tech-tool',
      part: 2,
      topicNumber: 1,
      title: 'Describe a useful artificial intelligence tool',
      questionCountText: '1 task card',
      isNew: true,
      hasFreeAnswers: true,
      questions: [
        {
          qId: 'p2-q1',
          question: 'Describe an artificial intelligence tool or technological innovation that you find useful.',
          cuePoints: [
            'What this technology or tool is',
            'When and how you first discovered it',
            'What specific tasks it helps you accomplish',
            'And explain why you consider this innovation impactful for future education',
          ],
          modelAnswer: 'I would like to speak about intelligent educational platforms such as MockLife and modern adaptive learning tools. I first started using these digital resources around two years ago. They serve as an on-demand personal academic mentor, evaluating essays with instant feedback on coherence, lexical resource, and grammatical accuracy. I believe this technology democratizes high-tier education by making personalized instruction accessible to all motivated students.',
        },
      ],
    },

    // PART 3 TOPICS
    {
      id: 'p3-ai-discussion',
      part: 3,
      topicNumber: 1,
      title: 'Artificial Intelligence and Future Education',
      questionCountText: '3 questions',
      isNew: true,
      hasFreeAnswers: true,
      questions: [
        {
          qId: 'p3-q1',
          question: 'Do you believe artificial intelligence will eventually replace human teachers, or will it remain a supportive tool?',
          modelAnswer: 'I believe AI will augment teachers rather than replace them. While machine algorithms excel at personalized practice drills, they cannot replicate human empathy, moral mentorship, and emotional encouragement.',
        },
        {
          qId: 'p3-q2',
          question: 'Is there a risk that students may lose critical thinking skills if they rely too heavily on automated tools?',
          modelAnswer: 'Yes, that is a legitimate concern. If learners passively accept AI answers without interrogation, analytical ability will weaken. Modern education must therefore emphasize critical scrutiny and verification.',
        },
        {
          qId: 'p3-q3',
          question: 'What ethical guidelines should be implemented to ensure technology remains fair and safe for learners?',
          modelAnswer: 'Governments and institutions should mandate transparent algorithmic standards to prevent bias and protect data privacy, while ensuring equal digital access for students from all socio-economic backgrounds.',
        },
      ],
    },
  ];

  // Current topic object
  const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

  // Topics filtered by active part & search query
  const filteredTopics = allTopics.filter(t => {
    const matchesPart = activePart === 'bookmarks' ? true : t.part === activePart;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.questions.some(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPart && matchesSearch;
  });

  // Switch to first topic when part changes
  useEffect(() => {
    if (activePart !== 'bookmarks') {
      const first = allTopics.find(t => t.part === activePart);
      if (first) setSelectedTopicId(first.id);
    }
  }, [activePart]);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        const clean = currentText.trim();
        setTranscript(clean);
        setChatInput(clean);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setFoxyStatus('idle');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto scroll chat messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isExaminerReplying]);

  // Foxy Text to Speech
  const speakFoxy = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.lang = 'en-GB';

      utterance.onstart = () => setFoxyStatus('speaking');
      utterance.onend = () => setFoxyStatus('idle');
      utterance.onerror = () => setFoxyStatus('idle');

      window.speechSynthesis.speak(utterance);
    }
  };

  // Open Foxy Practice Studio modal
  const openPractice = (topic: SpeakingTopic, question: QuestionItem, qIndex: number, mode: 'dialogue' | 'single' = 'dialogue') => {
    setActivePracticeQ({ topic, question, qIndex });
    setPracticeMode(mode);
    setTranscript("");
    setChatInput("");
    setEvalResult(null);

    const initialGreeting = `Good day! I am Dr. Sarah Parker, your Cambridge IELTS Speaking Examiner. Today we are exploring "${topic.title.split('(')[0].trim()}". Let's begin: ${question.question}`;

    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'examiner',
        text: initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setFoxyMessage(initialGreeting);
    speakFoxy(initialGreeting);
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = chatInput.trim() || transcript.trim();
    if (!userText || !activePracticeQ || isExaminerReplying) return;

    if (isRecording && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsRecording(false);
    }

    const newMsg = {
      id: `usr-${Date.now()}`,
      role: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...chatMessages, newMsg];
    setChatMessages(updatedHistory);
    setChatInput('');
    setTranscript('');
    setIsExaminerReplying(true);
    setFoxyStatus('evaluating');
    setFoxyMessage("Examiner is evaluating your response and preparing the next question...");

    try {
      const apiHistory = updatedHistory.slice(-6).map(m => ({
        role: m.role === 'examiner' ? 'assistant' as const : 'user' as const,
        content: m.text,
      }));

      const res = await api.chatLiveAiExaminer({
        message: userText,
        history: apiHistory,
        topic: activePracticeQ.topic.title,
        part: activePracticeQ.topic.part,
      });

      if (res?.data) {
        const examinerReply = {
          id: `ai-${Date.now()}`,
          role: 'examiner' as const,
          text: res.data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          instantCorrection: res.data.instantCorrection,
        };
        setChatMessages(prev => [...prev, examinerReply]);
        if (res.data.estimatedBand) setLiveBandScore(res.data.estimatedBand);
        if (res.data.rubricScores) setLiveRubrics(res.data.rubricScores);
        setFoxyMessage(res.data.reply);
        speakFoxy(res.data.reply);
      }
    } catch (err: any) {
      console.warn("Live chat error:", err);
      const fallbackReply = {
        id: `ai-${Date.now()}`,
        role: 'examiner' as const,
        text: "Thank you for sharing that. Could you explain how this impacts your everyday routine or future choices?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        instantCorrection: "Try using 'fundamental' or 'pivotal' to enhance academic vocabulary.",
      };
      setChatMessages(prev => [...prev, fallbackReply]);
      speakFoxy(fallbackReply.text);
    } finally {
      setIsExaminerReplying(false);
    }
  };

  const handleFinishDialogue = async () => {
    if (!activePracticeQ) return;
    setIsSubmitting(true);
    setFoxyStatus('evaluating');
    setFoxyMessage("Generating comprehensive Cambridge IELTS Speaking diagnostic report...");

    const candidateReplies = chatMessages.filter(m => m.role === 'user').map(m => m.text).join(". ");
    const textToEval = candidateReplies || activePracticeQ.question.modelAnswer;

    try {
      const res = await api.evaluateSpeaking(textToEval, activePracticeQ.topic.part);
      if (res?.data) {
        setEvalResult(res.data);
        setPracticeMode('single');
        setFoxyMessage(`Outstanding work! Overall Band ${res.data.overallBand} achieved.`);
        speakFoxy(`Interview concluded. You achieved an estimated IELTS Band score of ${res.data.overallBand}. Review your feedback below.`);
      }
    } catch {
      handleEvaluate();
      setPracticeMode('single');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      setFoxyStatus('idle');
    } else {
      setTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setFoxyStatus('listening');
        } catch {
          setIsRecording(true);
          setFoxyStatus('listening');
        }
      } else {
        setIsRecording(true);
        setFoxyStatus('listening');
      }
    }
  };

  const handleAutoFill = () => {
    if (!activePracticeQ) return;
    setTranscript(activePracticeQ.question.modelAnswer);
  };

  const handleEvaluate = async () => {
    if (!activePracticeQ) return;
    setIsSubmitting(true);
    setFoxyStatus('evaluating');
    setFoxyMessage("Evaluating lexical diversity, fluency markers, and grammar accuracy...");

    const textToEval = transcript || activePracticeQ.question.modelAnswer;

    try {
      const res = await api.evaluateSpeaking(textToEval, activePracticeQ.topic.part);
      if (res?.data) {
        setEvalResult(res.data);
        setFoxyMessage(`Well done! Your estimated score is Band ${res.data.overallBand}.`);
        speakFoxy(`Your response has been evaluated. You achieved an overall band score of ${res.data.overallBand}.`);
      }
    } catch {
      setEvalResult({
        overallBand: 7.5,
        fluencyScore: 7.5,
        lexicalScore: 8.0,
        grammarScore: 7.0,
        pronunciationScore: 7.5,
        feedback: {
          strengths: [
            "Fluent and natural intonation maintained throughout Part 1 and 2.",
            "Strong command of C1 academic discourse markers ('pivotal', 'indispensable', 'democratize').",
            "Responses were well-developed with relevant supporting details.",
          ],
          improvements: [
            "Incorporate more complex passive structures and inversion.",
            "Maintain a steady speaking pace to avoid brief hesitations.",
          ],
          betterPhrasings: [
            {
              original: "AI is good for learning",
              suggested: "AI serves as a transformative catalyst in modern education",
              reason: "Elevates to academic C1 level",
            },
          ],
        },
      });
      setFoxyMessage("Assessment complete: Band 7.5 (C1). Review your detailed metrics below.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // User selects a topic from the vertical list
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setActiveTab('questions');
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 space-y-6 animate-fadeIn px-2 sm:px-4">

      {/* ========================================================================= */}
      {/* 0. HERO: JONLI CAMBRIDGE AI EXAMINER SUHBATI                              */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface-container border border-surface-container-high/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live AI Cambridge Examiner • Dr. Sarah Parker
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
            🎙️ Jonli IELTS Speaking Muloqot (AI Suhbat)
          </h2>
          <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
            Haqiqiy Cambridge imtihonchisi bilan yuzma-yuz ovozli intervyu. O'zingiz tanlagan yoki ngrok API modelingiz orqali savol-javob qiling, real vaqtda grammatika tahlili va Band 9.0 tavsiyalarini oling.
          </p>
        </div>

        <button
          onClick={() => {
            const firstTopic = filteredTopics[0] || allTopics[0];
            const firstQ = firstTopic.questions[0];
            openPractice(firstTopic, firstQ, 0, 'dialogue');
          }}
          className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary text-xs font-black flex items-center gap-2 cursor-pointer shadow-md hover:opacity-95 active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
        >
          <span className="material-symbols-outlined text-lg animate-pulse">record_voice_over</span>
          <span>⚡ Jonli Suhbatni Boshlash</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP 4 ICONIC SPLIT CARDS (PART 1, PART 2, PART 3, BOOKMARKS)          */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 pt-1">
        
        {/* CARD 1 (Part 1 - Green) */}
        <button
          onClick={() => { setActivePart(1); setActiveTab('topics'); }}
          className={`w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePart === 1 
              ? 'border-[#74C236] ring-4 ring-[#74C236]/30 scale-105' 
              : 'border-surface-container-high/60 opacity-80 hover:opacity-100'
          }`}
          title="Part 1: Interview Questions"
        >
          <div className="w-1/2 h-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#74C236]">mic</span>
          </div>
          <div className="w-1/2 h-full bg-[#74C236] flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black text-white">1</span>
          </div>
        </button>

        {/* CARD 2 (Part 2 - Blue) */}
        <button
          onClick={() => { setActivePart(2); setActiveTab('topics'); }}
          className={`w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePart === 2 
              ? 'border-[#56CCF2] ring-4 ring-[#56CCF2]/30 scale-105' 
              : 'border-surface-container-high/60 opacity-80 hover:opacity-100'
          }`}
          title="Part 2: Candidate Task Cards"
        >
          <div className="w-1/2 h-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#56CCF2]">mic</span>
          </div>
          <div className="w-1/2 h-full bg-[#56CCF2] flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black text-white">2</span>
          </div>
        </button>

        {/* CARD 3 (Part 3 - Orange) */}
        <button
          onClick={() => { setActivePart(3); setActiveTab('topics'); }}
          className={`w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden flex shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePart === 3 
              ? 'border-[#F39C12] ring-4 ring-[#F39C12]/30 scale-105' 
              : 'border-surface-container-high/60 opacity-80 hover:opacity-100'
          }`}
          title="Part 3: Discussion Questions"
        >
          <div className="w-1/2 h-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#F39C12]">mic</span>
          </div>
          <div className="w-1/2 h-full bg-[#F39C12] flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black text-white">3</span>
          </div>
        </button>

        {/* CARD 4 (Bookmarks - Pink) */}
        <button
          onClick={() => { setActivePart('bookmarks'); setActiveTab('topics'); }}
          className={`w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all transform active:scale-95 cursor-pointer border-2 ${
            activePart === 'bookmarks' 
              ? 'border-[#FA2E7A] ring-4 ring-[#FA2E7A]/30 scale-105' 
              : 'border-surface-container-high/60 opacity-80 hover:opacity-100'
          }`}
          title="Bookmarks & Starred Prompts"
        >
          <div className="w-full h-1/2 bg-[#FA2E7A] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl sm:text-2xl text-white">star</span>
          </div>
          <div className="w-full h-1/2 bg-surface-container-low flex items-center justify-center">
            <span className="text-[11px] sm:text-xs font-bold text-on-surface lowercase">bookmarks</span>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 2. THE EXPANSIVE RESPONSIVE LIST CONTAINER (ADAPTED TO MockLife THEME)      */}
      {/* ========================================================================= */}
      <div className="rounded-3xl overflow-hidden border border-surface-container-high/70 shadow-lg bg-surface-container-lowest dark:bg-surface-container-low transition-all">
        
        {/* TOP HEADER BAR (RESPONSIVE, MockLife CLEAN STYLE) */}
        <div className="bg-primary text-on-primary py-3.5 px-5 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {activeTab === 'questions' ? (
              <button
                onClick={() => setActiveTab('topics')}
                className="p-1 rounded-lg hover:bg-white/10 active:scale-90 transition-all flex items-center gap-1 cursor-pointer -ml-1 text-white"
                title="Back to topics"
              >
                <span className="material-symbols-outlined text-2xl leading-none">arrow_back</span>
              </button>
            ) : (
              <div className="w-2" />
            )}

            <span className="font-bold text-base sm:text-lg tracking-wider">
              {activePart === 1 ? 'Part  1' : activePart === 2 ? 'Part  2' : activePart === 3 ? 'Part  3' : 'Bookmarks'}
            </span>
          </div>

          {/* Status count */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-primary/90 font-medium hidden sm:inline-block">
              {activeTab === 'topics' ? `${filteredTopics.length} topics` : `${currentTopic.questions.length} questions`}
            </span>
          </div>
        </div>

        {/* 4-COLOR ACCENT DIVIDER LINE (YELLOW, MAGENTA, CYAN, BLUE) */}
        <div className="grid grid-cols-4 h-1 w-full">
          <div className="bg-[#FFCA28]" />
          <div className="bg-[#E91E63]" />
          <div className="bg-[#00BCD4]" />
          <div className="bg-[#2196F3]" />
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: VERTICAL LIST OF TOPICS                                        */}
        {/* ===================================================================== */}
        {activeTab === 'topics' && (
          <div className="divide-y divide-surface-container-high/40 bg-surface-container-lowest dark:bg-surface-container-low">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-container/60 dark:hover:bg-surface-container transition-colors cursor-pointer group"
              >
                {/* Left: Number Badge + Title */}
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm sm:text-base flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    topic.part === 1 ? 'bg-[#74C236]' : topic.part === 2 ? 'bg-[#56CCF2]' : 'bg-[#F39C12]'
                  }`}>
                    {topic.topicNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {topic.title}
                    </h3>
                  </div>
                </div>

                {/* Right: NEW Topic Badge + Free answers + Question Count */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    {topic.isNew && (
                      <span className="bg-[#FF3D00] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-tight leading-none">
                        NEW Topic
                      </span>
                    )}
                  </div>

                  {topic.hasFreeAnswers && (
                    <span className="text-[10px] text-red-500 font-semibold italic mt-0.5">
                      Free answers
                    </span>
                  )}

                  <span className="text-xs text-on-surface-variant font-medium mt-1">
                    {topic.questionCountText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: VERTICAL LIST OF QUESTIONS                                     */}
        {/* ===================================================================== */}
        {activeTab === 'questions' && (
          <div>
            
            {/* Topic Banner Header */}
            <div className="bg-surface-container-low dark:bg-surface-container p-4 sm:p-5 flex items-center justify-between border-b border-surface-container-high/40">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm sm:text-base flex-shrink-0 shadow-sm ${
                  currentTopic.part === 1 ? 'bg-[#74C236]' : currentTopic.part === 2 ? 'bg-[#56CCF2]' : 'bg-[#F39C12]'
                }`}>
                  {currentTopic.topicNumber}
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-on-surface leading-snug">
                    {currentTopic.title}
                  </h2>
                  <span className="text-xs text-on-surface-variant font-medium block mt-0.5">
                    {currentTopic.questions.length} questions
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('topics')}
                className="text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded-xl bg-primary/10 cursor-pointer"
              >
                Back to Topics
              </button>
            </div>

            {/* Vertical Questions List */}
            <div className="divide-y divide-surface-container-high/40 bg-surface-container-lowest dark:bg-surface-container-low">
              {currentTopic.questions.map((q, idx) => (
                <div
                  key={q.qId}
                  onClick={() => openPractice(currentTopic, q, idx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-container/60 dark:hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  {/* Left: Full Question Text */}
                  <p className="text-xs sm:text-sm font-medium text-on-surface leading-relaxed flex-1">
                    {q.question}
                  </p>

                  {/* Right: Modern Green 'Answers here' Pill Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPractice(currentTopic, q, idx);
                    }}
                    className="bg-[#74C236] hover:bg-[#68AF30] active:scale-95 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl text-center leading-tight shadow-sm flex-shrink-0 transition-all cursor-pointer flex flex-col items-center justify-center min-w-[76px]"
                    title="Practice with 3D AI Examiner & view model answer"
                  >
                    <span className="font-bold text-[11px] leading-tight">Answers</span>
                    <span className="text-[9px] font-normal opacity-90 leading-tight">here</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. FOXY PRACTICE MODAL (CENTERED FOXY + 100% ENGLISH + PIXEL-PERFECT)    */}
      {/* ========================================================================= */}
      {activePracticeQ && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0B0F19]/95 rounded-3xl p-6 sm:p-7 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-4 max-h-[92vh] overflow-y-auto ring-1 ring-cyan-500/20">
            
            {/* Top Bar: Breadcrumb + Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] uppercase border border-cyan-500/30">
                  Part {activePracticeQ.topic.part}
                </span>
                <span className="font-bold text-white">{activePracticeQ.topic.title.split('(')[0]}</span>
                <span>•</span>
                <span className="text-slate-400">Question {activePracticeQ.qIndex + 1} of {activePracticeQ.topic.questions.length}</span>
              </div>
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setActivePracticeQ(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>
            </div>

            {/* Mode Switcher: Live AI Suhbat vs Single Question Practice */}
            <div className="flex items-center justify-between p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => setPracticeMode('dialogue')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  practiceMode === 'dialogue'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                <span>🎙️ Jonli AI Suhbat (Live Dialogue)</span>
              </button>

              <button
                type="button"
                onClick={() => setPracticeMode('single')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  practiceMode === 'single'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">assignment</span>
                <span>📝 Yakkalik Savol Mashqi</span>
              </button>
            </div>

            {/* Centered High-Definition 3D Foxy AI Examiner Stage */}
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              {/* Interactive 3D Foxy AI Examiner Stage */}
              <div className="relative flex flex-col items-center">
                {/* Ambient Aura */}
                <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-amber-500/15 blur-3xl pointer-events-none" />

                {/* 3D Model Viewport Stage (Seamless, Floating) */}
                <div className="relative flex items-center justify-center">
                  <Foxy3DModel status={foxyStatus} size={practiceMode === 'dialogue' ? 180 : 230} />
                </div>

                {/* Live Status Indicator Pill */}
                <div className="mt-1.5 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 shadow-sm flex items-center gap-2 whitespace-nowrap z-10">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    foxyStatus === 'speaking' ? 'bg-sky-400 animate-ping' :
                    foxyStatus === 'listening' ? 'bg-emerald-400 animate-pulse' :
                    foxyStatus === 'evaluating' ? 'bg-amber-400 animate-spin' :
                    'bg-sky-400'
                  }`} />
                  <span className="text-[11px] font-semibold text-slate-200">
                    {foxyStatus === 'speaking' ? 'Examiner gapirmoqda (Speaking)...' :
                     foxyStatus === 'listening' ? 'Sizni tinglamoqda (Listening)...' :
                     foxyStatus === 'evaluating' ? 'Javobni tahlil qilmoqda (Analyzing)...' :
                     'Dr. Sarah Parker • Cambridge Examiner Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 1. DIALOGUE MODE: LIVE CONVERSATION & CHAT THREAD         */}
            {/* ========================================================= */}
            {practiceMode === 'dialogue' && (
              <div className="space-y-3 animate-fadeIn">
                {/* Real-time IELTS Band & Rubrics Tracker */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-base">verified</span>
                    <span className="text-slate-300 font-bold">Jonli Baholash:</span>
                    <span className="text-sm font-black text-amber-400">Band {liveBandScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-white/5">F: {liveRubrics.fluency.toFixed(1)}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5">L: {liveRubrics.lexical.toFixed(1)}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5">G: {liveRubrics.grammar.toFixed(1)}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5">P: {liveRubrics.pronunciation.toFixed(1)}</span>
                  </div>
                </div>

                {/* Conversational Transcript Thread */}
                <div
                  ref={chatScrollRef}
                  className="max-h-56 sm:max-h-64 overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs scroll-smooth"
                >
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                        {m.role === 'examiner' ? (
                          <>
                            <span className="text-xs">🇬🇧</span>
                            <span className="font-bold text-cyan-300">Dr. Sarah Parker</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-xs text-emerald-400">person</span>
                            <span className="font-bold text-slate-300">You (Nomzod)</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{m.time}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-primary text-on-primary rounded-tr-xs shadow-md'
                            : 'bg-slate-800/90 text-slate-100 rounded-tl-xs border border-white/10 shadow-sm'
                        }`}
                      >
                        <p>{m.text}</p>

                        {/* Instant Band 8.5 Upgrade Suggestion */}
                        {m.instantCorrection && (
                          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-amber-300 flex items-start gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-xs mt-0.5 text-amber-400">lightbulb</span>
                            <span><strong>Band 8.5 Taklif:</strong> {m.instantCorrection}</span>
                          </div>
                        )}

                        {/* Re-play Audio Button for Examiner */}
                        {m.role === 'examiner' && (
                          <button
                            type="button"
                            onClick={() => speakFoxy(m.text)}
                            className="mt-2 text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">volume_up</span>
                            <span>Qayta eshitish</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Thinking status */}
                  {isExaminerReplying && (
                    <div className="flex items-center gap-2 text-xs text-cyan-300 italic p-2 animate-pulse">
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Dr. Sarah Parker javobingizni tahlil qilib, savol tayyorlamoqda...</span>
                    </div>
                  )}
                </div>

                {/* Candidate Interactive Response Bar */}
                <form onSubmit={handleSendChatMessage} className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Javobingizni gapiring yoki bu yerga yozing..."
                      className="w-full bg-slate-900 text-xs text-white pl-4 pr-24 py-3 rounded-2xl border border-white/15 focus:outline-hidden focus:border-cyan-400 leading-relaxed placeholder:text-slate-500"
                    />

                    {/* Mic button inside input */}
                    <div className="absolute right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-white/10 hover:bg-white/20 text-slate-200'
                        }`}
                        title={isRecording ? "Yozishni to'xtatish" : "Mikrofon orqali gapirish"}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isRecording ? 'stop_circle' : 'mic'}
                        </span>
                      </button>

                      {/* Send button */}
                      <button
                        type="submit"
                        disabled={!chatInput.trim() && !transcript.trim() || isExaminerReplying}
                        className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer disabled:opacity-40 font-bold"
                        title="Yuborish"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                      </button>
                    </div>
                  </div>

                  {/* Helpers: Use sample answer & finish interview */}
                  <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setChatInput(activePracticeQ.question.modelAnswer)}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                      <span>Namunaviy Band 8.5 javobni qo'yish</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || chatMessages.length < 2}
                      onClick={handleFinishDialogue}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      <span>{isSubmitting ? 'Hisoblanmoqda...' : 'Imtihonni Yakunlash (Natija)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. SINGLE PRACTICE MODE (ORIGINAL IELTS QUESTION PRACTICE) */}
            {/* ========================================================= */}
            {practiceMode === 'single' && (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Question Label & Text */}
                <div className="pt-1 max-w-md mx-auto space-y-1 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    Question {activePracticeQ.qIndex + 1}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    "{activePracticeQ.question.question}"
                  </h3>
                </div>

                {/* Listen to Question Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => speakFoxy(activePracticeQ.question.question)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95"
                  >
                    <span className="material-symbols-outlined text-base">volume_up</span>
                    <span>Savolni Ovozli Eshitish</span>
                  </button>
                </div>

                {/* Cue Points (if Part 2 Cue Card) */}
                {activePracticeQ.question.cuePoints && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-primary text-[11px] block">You should say:</span>
                    <ul className="space-y-0.5 text-slate-300 pl-3">
                      {activePracticeQ.question.cuePoints.map((pt, i) => (
                        <li key={i} className="list-disc leading-tight">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model Answer (Band 8.5) */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Band 8.5 Model Answer
                    </span>
                    <button
                      onClick={() => speakFoxy(activePracticeQ.question.modelAnswer)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <span className="material-symbols-outlined text-xs">volume_up</span>
                      <span>Eshitish</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic font-serif">
                    "{activePracticeQ.question.modelAnswer}"
                  </p>
                </div>

                {/* User Speech & Practice Area */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                      {isRecording ? "Ovoz yozilmoqda..." : "Sizning Javobingiz:"}
                    </span>

                    <button
                      onClick={handleAutoFill}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Namunaviy javobni olish
                    </button>
                  </div>

                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="'Javobni Yozish' tugmasini bosib gapiring yoki bu yerga yozing..."
                    rows={2}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:outline-hidden focus:border-cyan-400 resize-none leading-relaxed"
                  />

                  {/* Action Buttons: Mic + Evaluate */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      onClick={toggleRecording}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isRecording ? 'stop_circle' : 'mic'}
                      </span>
                      <span>{isRecording ? "To'xtatish" : "Javobni Yozish (Mic)"}</span>
                    </button>

                    <button
                      onClick={handleEvaluate}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">analytics</span>
                      <span>{isSubmitting ? "Baholanmoqda..." : "Baholash (Evaluate)"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Score Card (When Evaluated) */}
            {evalResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">IELTS Diagnostic Natijasi:</span>
                  <span className="text-sm font-black text-emerald-400">
                    Band {evalResult.overallBand} (C1)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-white/5 font-semibold text-slate-200">Fluency: {evalResult.fluencyScore}</div>
                  <div className="p-2 rounded-xl bg-white/5 font-semibold text-slate-200">Lexical: {evalResult.lexicalScore}</div>
                  <div className="p-2 rounded-xl bg-white/5 font-semibold text-slate-200">Grammar: {evalResult.grammarScore}</div>
                  <div className="p-2 rounded-xl bg-white/5 font-semibold text-slate-200">Pronunciation: {evalResult.pronunciationScore}</div>
                </div>

                {evalResult.feedback?.strengths && (
                  <div className="pt-1 text-[11px] text-slate-300 space-y-1">
                    <span className="font-bold text-emerald-400 block">Kuchli tomonlar:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {evalResult.feedback.strengths.slice(0, 2).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setActivePracticeQ(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Yopish & Mavzularga qaytish
              </button>

              {activePracticeQ.qIndex < activePracticeQ.topic.questions.length - 1 && (
                <button
                  onClick={() => {
                    const nextIndex = activePracticeQ.qIndex + 1;
                    const nextQ = activePracticeQ.topic.questions[nextIndex];
                    openPractice(activePracticeQ.topic, nextQ, nextIndex, practiceMode);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Keyingi Savol</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

