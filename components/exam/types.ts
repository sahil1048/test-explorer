export type Option = { id: string; text: string }
export type Question = { id: string; text: string; options: Option[]; direction?: string }

export interface ExamData {
  title?: string
  duration_minutes?: number
  total_marks?: number
  total_questions?: number
  negative_marking?: boolean
}

export interface UserData {
  user_metadata?: {
    full_name?: string
  }
}