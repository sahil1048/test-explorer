export const QUESTION_TYPES = [
  ['multiple_choice', 'Multiple Choice'], ['multiple_select', 'Multiple Select'], ['true_false', 'True / False'],
  ['fill_blank', 'Fill in the Blank'], ['numerical', 'Numerical Answer'], ['short_answer', 'Short Answer'], ['long_answer', 'Long Answer / Essay'],
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number][0]
export type QuestionStatus = 'draft' | 'review' | 'approved' | 'archived'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface QuestionSummary {
  id: string
  title: string
  bodyText: string
  type: QuestionType
  difficulty: QuestionDifficulty
  status: QuestionStatus
  marks: number
  grade: string
  subject: string
  chapter?: string
  author: string
  updatedAt: string
  usageCount: number
  lastUsedAt?: string
}
