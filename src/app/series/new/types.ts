// Type definitions for Series Creation Wizard

export interface SeriesContext {
  company?: string;
  product?: string;
  assumptions?: string;
  hypotheses?: string;
}

export interface ResearchGoal {
  id: string;
  text: string;
}

export interface InterviewQuestion {
  id: string;
  goalId: string;
  text: string;
  order: number;
}

export interface SeriesWizardData {
  title: string;
  researchFocus: string;
  context: SeriesContext;
  researchGoals: ResearchGoal[];
  questions: InterviewQuestion[];
}

export interface WizardStepProps<T = Partial<SeriesWizardData>> {
  data: T;
  onUpdate: (data: Partial<SeriesWizardData>) => void;
  onNext?: () => void;
  onComplete?: (finalQuestions?: InterviewQuestion[]) => void;
}
