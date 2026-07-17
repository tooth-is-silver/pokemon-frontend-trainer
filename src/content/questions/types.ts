export type QuestionType = "yes_no" | "multiple_choice" | "fill_blank";

export interface QuestionBase {
  questionId: string;
  type: QuestionType;
  prompt: string;
  answer: string | boolean;
  conceptGroup: string;
  explanation: string;
  sourceExcerptId: string;
}

export type YesNoQuestion = QuestionBase & {
  type: "yes_no";
  answer: boolean;
  acceptedAnswers?: string[];
};

export type MultipleChoiceQuestion = QuestionBase & {
  type: "multiple_choice";
  answer: string;
  choices: string[];
};

export type FillBlankQuestion = QuestionBase & {
  type: "fill_blank";
  answer: string;
  acceptedAnswers: string[];
};

export type Question = YesNoQuestion | MultipleChoiceQuestion | FillBlankQuestion;

export interface QuestionPage {
  sourceId: string;
  title: string;
  url: string;
  questions: Question[];
}
