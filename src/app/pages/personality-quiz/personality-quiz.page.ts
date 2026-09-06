import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PersonalityQuizService,
  QuizQuestion,
} from '../../core/services/personality-quiz.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-personality-quiz',
  templateUrl: './personality-quiz.page.html',
  styleUrls: ['./personality-quiz.page.scss'],
  standalone: false,
})
export class PersonalityQuizPage implements OnInit {
  questions: QuizQuestion[] = [];
  index = 0;
  answers: Record<string, string> = {};
  selectedOptionId?: string;
  loading = false;
  isRetake = false;

  constructor(
    private readonly quiz: PersonalityQuizService,
    private readonly session: UserSessionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.questions = this.quiz.getQuestions();
    this.isRetake = this.route.snapshot.queryParamMap.get('retake') === '1';
    const existing = this.session.onboarding.quizAnswers;
    if (existing) {
      this.answers = { ...existing };
    }
    this.syncSelection();
  }

  get current(): QuizQuestion | undefined {
    return this.questions[this.index];
  }

  get progress(): number {
    if (!this.questions.length) {
      return 0;
    }
    return ((this.index + 1) / this.questions.length) * 100;
  }

  get canContinue(): boolean {
    return !!this.selectedOptionId && !this.loading;
  }

  questionText(): string {
    return this.current ? this.quiz.questionLabel(this.current) : '';
  }

  optionText(optionId: string): string {
    const option = this.current?.options.find((o) => o.id === optionId);
    return option ? this.quiz.optionLabel(option) : '';
  }

  selectOption(optionId: string): void {
    this.selectedOptionId = optionId;
  }

  async continue(): Promise<void> {
    if (!this.current || !this.selectedOptionId) {
      return;
    }

    this.answers[this.current.id] = this.selectedOptionId;

    if (this.index < this.questions.length - 1) {
      this.index += 1;
      this.syncSelection();
      return;
    }

    this.loading = true;
    try {
      const result = await this.quiz.resolveAnimal(this.answers);
      this.session.patchOnboarding({
        selectedAnimal: result.animal,
        quizAnswers: result.answers,
        quizScores: result.scores,
      });

      if (this.isRetake && this.session.currentUser) {
        this.session.updateAnimal(result.animal);
        const uid = this.session.currentUser.id;
        this.session.setCurrentUser({
          ...this.session.currentUser,
          animal: result.animal,
          quizAnswers: result.answers,
          quizScores: result.scores,
          totemAssignedAt: new Date().toISOString(),
        });
        void uid;
      }

      await this.router.navigate(['/totem-reveal'], {
        queryParams: this.isRetake ? { retake: 1 } : {},
      });
    } finally {
      this.loading = false;
    }
  }

  goBack(): void {
    if (this.index > 0) {
      this.index -= 1;
      this.syncSelection();
      return;
    }
    if (this.isRetake) {
      void this.router.navigate(['/tabs/my-card']);
      return;
    }
    void this.router.navigate(['/login']);
  }

  private syncSelection(): void {
    const q = this.current;
    this.selectedOptionId = q ? this.answers[q.id] : undefined;
  }
}
