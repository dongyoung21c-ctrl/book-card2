export type CardType = 'fact' | 'feeling' | 'connect';

export interface QuestionCard {
  type: CardType;
  categoryTitle: string;
  question: string;
  hint: string;
  thinkingPrompt: string;
}

export interface ApiResponse {
  isAppropriate: boolean;
  rejectionReason?: string;
  bookTitle?: string;
  cards?: QuestionCard[];
}
