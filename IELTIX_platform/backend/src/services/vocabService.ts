import { VocabItem } from '../types/index.js';
import { sampleVocabVault } from '../data/mockData.js';

export class VocabService {
  private vault: VocabItem[] = [...sampleVocabVault];

  getAll(): VocabItem[] {
    return this.vault;
  }

  saveWord(item: Omit<VocabItem, 'id' | 'savedAt'>): VocabItem {
    const existing = this.vault.find(v => v.word.toLowerCase() === item.word.toLowerCase());
    if (existing) {
      return existing;
    }
    const newItem: VocabItem = {
      ...item,
      id: `v-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    this.vault.unshift(newItem);
    return newItem;
  }

  lookupContextWord(word: string): Partial<VocabItem> {
    const cleanWord = word.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
    const existing = this.vault.find(v => v.word.toLowerCase() === cleanWord);
    if (existing) return existing;

    // Smart contextual dictionary definitions
    const dict: Record<string, Partial<VocabItem>> = {
      phenomenon: {
        word: 'Phenomenon',
        definition: 'A fact or situation that is observed to exist or happen, especially one whose cause or explanation is in question.',
        translationUz: 'Hodisa, fenomen',
        cefrLevel: 'C1',
        partOfSpeech: 'noun',
        collocations: ['natural phenomenon', 'cultural phenomenon', 'widespread phenomenon'],
        exampleSentence: 'Urban biodiversity growth is a remarkable biological phenomenon.',
      },
      divergence: {
        word: 'Divergence',
        definition: 'The process or state of dividing and going in differing directions.',
        translationUz: 'Tafovut, ajralish, chetlanish',
        cefrLevel: 'C2',
        partOfSpeech: 'noun',
        collocations: ['phenotypic divergence', 'marked divergence', 'divergence of opinion'],
        exampleSentence: 'Genomic divergence was observed among isolated city populations.',
      },
      circumvent: {
        word: 'Circumvent',
        definition: 'To find a way around an obstacle, regulation, or acoustic interference.',
        translationUz: 'Aylanib o\'tmoq, yo\'lini topmoq',
        cefrLevel: 'C1',
        partOfSpeech: 'verb',
        collocations: ['circumvent the problem', 'circumvent regulations', 'circumvent acoustic barriers'],
        exampleSentence: 'Avian species circumvent morning acoustic interference by singing earlier.',
      },
    };

    return dict[cleanWord] || {
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      definition: `Academic term recognized in high-stakes tests. Essential for C1/C2 mastery.`,
      translationUz: 'Kontekstdagi akademik so\'z',
      cefrLevel: 'C1',
      partOfSpeech: 'term',
      collocations: ['academic usage', 'frequent collocation'],
      exampleSentence: `Understanding the word in context significantly bolsters reading comprehension scores.`,
    };
  }
}

export const vocabService = new VocabService();
