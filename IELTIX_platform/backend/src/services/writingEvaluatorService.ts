import { WritingSubmission, WritingEvaluationResult } from '../types/index.js';

export class WritingEvaluatorService {
  evaluateWriting(submission: WritingSubmission): WritingEvaluationResult {
    const { taskType, essayText } = submission;
    const words = essayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const targetWordCount = taskType === 'TASK_1' ? 150 : 250;

    let taScore = 6.5; // Task Achievement
    let ccScore = 6.5; // Coherence & Cohesion
    let lrScore = 6.5; // Lexical Resource
    let graScore = 6.5; // Grammatical Range & Accuracy

    // Word count penalty or reward
    if (wordCount < targetWordCount) {
      taScore = Math.max(5.0, taScore - 1.0);
    } else if (wordCount >= targetWordCount + 30) {
      taScore += 0.5;
    }

    // Paragraphing check
    const paragraphs = essayText.split(/\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 4) {
      ccScore += 0.5;
    }

    // Academic linking markers
    const connectors = ['however', 'moreover', 'furthermore', 'in addition', 'consequently', 'on the other hand', 'in contrast', 'ultimately'];
    const usedConnectors = connectors.filter(c => essayText.toLowerCase().includes(c));
    if (usedConnectors.length >= 3) {
      ccScore += 0.5;
    }

    // Lexical sophistication
    const highLevelWords = ['ubiquitous', 'pivotal', 'exacerbate', 'exponential', 'ramifications', 'counterargument', 'predominantly', 'sustainable'];
    const usedHighLevel = highLevelWords.filter(w => essayText.toLowerCase().includes(w));
    if (usedHighLevel.length >= 2) {
      lrScore += 0.5;
    }
    if (usedHighLevel.length >= 4) {
      lrScore += 0.5;
    }

    // Grammar complexity
    const complexGrammar = ['not only', 'although', 'despite', 'whereas', 'had it not been', 'it is argued that'];
    const usedGrammar = complexGrammar.filter(g => essayText.toLowerCase().includes(g));
    if (usedGrammar.length >= 2) {
      graScore += 0.5;
    }

    // Clamp scores
    taScore = Math.min(9.0, Math.max(4.0, taScore));
    ccScore = Math.min(9.0, Math.max(4.0, ccScore));
    lrScore = Math.min(9.0, Math.max(4.0, lrScore));
    graScore = Math.min(9.0, Math.max(4.0, graScore));

    const overallBand = Math.round(((taScore + ccScore + lrScore + graScore) / 4) * 2) / 2;

    return {
      overallBand,
      taskAchievementScore: taScore,
      coherenceCohesionScore: ccScore,
      lexicalResourceScore: lrScore,
      grammarAccuracyScore: graScore,
      wordCount,
      targetWordCount,
      feedback: {
        generalSummary: `Well-structured ${taskType === 'TASK_1' ? 'Task 1 summary' : 'Task 2 argumentative essay'}. Clear progression of ideas with ${paragraphs.length} distinct paragraphs and satisfactory developmental depth.`,
        strengths: [
          `Appropriate length (${wordCount} words against the recommended ${targetWordCount}+ minimum).`,
          `Effective paragraph structuring adhering strictly to IELTS academic writing conventions.`,
          `Thoughtful use of cohesion markers: ${usedConnectors.slice(0, 3).join(', ') || 'logical transition phrases'}.`,
        ],
        weaknesses: [
          wordCount < targetWordCount ? 'Underlength penalty applied: aim for at least the minimum threshold to avoid TR deductions.' : 'Ensure every body paragraph includes a concrete real-world illustration or data point.',
          'Watch out for repetitive simple sentence structures in transitional sentences.',
        ],
        grammarCorrections: [
          {
            original: 'people thinks that technology make life easy',
            correction: 'many individuals argue that technological advancement significantly streamlines daily existence',
            explanation: 'Subject-verb agreement error ("people think") upgraded to an academic passive stance',
          },
        ],
        advancedVocabularySuggestions: [
          { word: 'important', advancedAlternative: 'pivotal / paramount' },
          { word: 'make worse', advancedAlternative: 'exacerbate' },
          { word: 'everywhere', advancedAlternative: 'ubiquitous / omnipresent' },
        ],
      },
    };
  }
}

export const writingEvaluatorService = new WritingEvaluatorService();
