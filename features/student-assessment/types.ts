import type { QuestionType } from '@/features/question-bank/types'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'retrying'
export type ConnectivityStatus = 'online' | 'poor' | 'offline'
export type DeliveryAnswer = string | string[] | number | boolean | null
export interface DeliveryQuestion { id:string; number:number; type:QuestionType; body:string; options?:{id:string;label:string}[]; marks:number; section?:string }
export interface DeliveryAssessment { id:string; title:string; subject:string; teacher:string; durationMinutes:number; totalMarks:number; instructions:string[]; calculatorAllowed:boolean; fullscreenRequired:boolean; resultPolicy:'immediate'|'scheduled'|'teacher_approval'|'hidden' }
export interface AssignedAssessmentSummary { id:string; title:string; teacher:string; subject:string; className:string; dueAt?:string; durationMinutes:number; status:'upcoming'|'active'|'completed'|'overdue'; attemptsRemaining:number; progress:number }
