import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import quizData from '../data/personality-quiz.json';
import { Animal } from '../interfaces/animal.interface';
import { AnimalService } from './animal.service';

export type QuizDimension =
  | 'loyal'
  | 'independant'
  | 'sociable'
  | 'protecteur'
  | 'curieux'
  | 'calme'
  | 'audacieux'
  | 'sensible'
  | 'observateur';

export interface QuizOption {
  id: string;
  labelFr: string;
  labelEn: string;
  weights: Partial<Record<QuizDimension, number>>;
}

export interface QuizQuestion {
  id: string;
  questionFr: string;
  questionEn: string;
  options: QuizOption[];
}

export interface QuizResult {
  animal: Animal;
  scores: Record<string, number>;
  answers: Record<string, string>;
  matchScore: number;
}

/** Maps normalized French/English trait tokens to quiz dimensions. */
const TRAIT_DIMENSION_MAP: Record<string, QuizDimension[]> = {
  loyal: ['loyal'],
  loyale: ['loyal'],
  fidelity: ['loyal'],
  fidele: ['loyal'],
  independant: ['independant'],
  independante: ['independant'],
  libre: ['independant'],
  free: ['independant'],
  sociable: ['sociable'],
  social: ['sociable'],
  protecteur: ['protecteur'],
  protectrice: ['protecteur'],
  protective: ['protecteur'],
  courageux: ['audacieux', 'protecteur'],
  brave: ['audacieux'],
  curieux: ['curieux'],
  curieuse: ['curieux'],
  curious: ['curieux'],
  calme: ['calme'],
  calm: ['calme'],
  patient: ['calme'],
  patiente: ['calme'],
  audacieux: ['audacieux'],
  audacieuse: ['audacieux'],
  bold: ['audacieux'],
  sensible: ['sensible'],
  sensitive: ['sensible'],
  empathique: ['sensible'],
  observateur: ['observateur'],
  observatrice: ['observateur'],
  observant: ['observateur'],
  integre: ['loyal'],
  principled: ['loyal'],
  determine: ['audacieux'],
  determined: ['audacieux'],
};

@Injectable({ providedIn: 'root' })
export class PersonalityQuizService {
  private readonly questions = quizData as QuizQuestion[];

  constructor(
    private readonly animalService: AnimalService,
    private readonly translate: TranslateService
  ) {}

  getQuestions(): QuizQuestion[] {
    return this.questions;
  }

  questionLabel(question: QuizQuestion): string {
    return this.translate.getCurrentLang() === 'en' ? question.questionEn : question.questionFr;
  }

  optionLabel(option: QuizOption): string {
    return this.translate.getCurrentLang() === 'en' ? option.labelEn : option.labelFr;
  }

  aggregateScores(answers: Record<string, string>): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const question of this.questions) {
      const optionId = answers[question.id];
      const option = question.options.find((o) => o.id === optionId);
      if (!option) {
        continue;
      }
      for (const [dim, weight] of Object.entries(option.weights)) {
        scores[dim] = (scores[dim] ?? 0) + (weight ?? 0);
      }
    }
    return scores;
  }

  async resolveAnimal(answers: Record<string, string>): Promise<QuizResult> {
    const scores = this.aggregateScores(answers);
    const animals = await this.animalService.getAnimals();
    if (animals.length === 0) {
      throw new Error('No animals available for quiz scoring');
    }

    let best = animals[0];
    let bestScore = -1;

    for (const animal of animals) {
      const score = this.scoreAnimal(animal, scores);
      if (score > bestScore || (score === bestScore && animal.id.localeCompare(best.id) < 0)) {
        bestScore = score;
        best = animal;
      }
    }

    const maxPossible = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const matchScore = Math.round((bestScore / maxPossible) * 100);

    return {
      animal: best,
      scores,
      answers,
      matchScore: Math.min(100, Math.max(40, matchScore)),
    };
  }

  private scoreAnimal(animal: Animal, scores: Record<string, number>): number {
    let total = 0;
    const tokens = this.animalTokens(animal);
    for (const token of tokens) {
      const dims = TRAIT_DIMENSION_MAP[token] ?? [];
      for (const dim of dims) {
        total += scores[dim] ?? 0;
      }
    }
    // Soft boost from personality string containing dimension keywords
    const personality = this.normalize(animal.personality);
    for (const [dim, weight] of Object.entries(scores)) {
      if (personality.includes(dim)) {
        total += weight * 0.5;
      }
    }
    return total;
  }

  private animalTokens(animal: Animal): string[] {
    return [...animal.traits, ...animal.personality.split(/[,·•|/]+/)]
      .map((t) => this.normalize(t))
      .filter(Boolean);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
