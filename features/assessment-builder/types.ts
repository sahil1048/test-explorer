export const ASSESSMENT_TYPES = ['Quiz', 'Homework', 'Practice', 'Diagnostic', 'Unit Test', 'Chapter Test', 'Monthly Test', 'Mid-Term', 'Final Exam', 'Custom'] as const
export const ASSESSMENT_STATUSES = ['draft', 'scheduled', 'published', 'active', 'completed', 'archived'] as const
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number]

export interface AssessmentSummary { id: string; title: string; type: string; subject: string; grade: string; sections: string[]; status: AssessmentStatus; questions: number; totalMarks: number; dueAt?: string; updatedAt: string }

export interface BlueprintFinding { severity: 'error' | 'warning' | 'suggestion'; title: string; detail: string }

export function validateBlueprint(input: { questionCount: number; selectedMarks: number; totalMarks: number; easy: number; medium: number; hard: number; higherOrderCount: number; duplicateCount: number }): BlueprintFinding[] {
  const findings: BlueprintFinding[] = []
  if (!input.questionCount) findings.push({ severity: 'error', title: 'Paper has no questions', detail: 'Add at least one approved Question Bank item.' })
  if (input.selectedMarks !== input.totalMarks) findings.push({ severity: 'error', title: 'Total marks mismatch', detail: `Selected questions total ${input.selectedMarks}; blueprint expects ${input.totalMarks}.` })
  if (input.duplicateCount) findings.push({ severity: 'error', title: 'Duplicate questions', detail: `Remove ${input.duplicateCount} duplicate reference(s).` })
  if (input.easy > 60) findings.push({ severity: 'warning', title: 'Easy-question concentration', detail: `${input.easy}% of the paper is easy. Review the intended learning level.` })
  if (!input.higherOrderCount) findings.push({ severity: 'warning', title: 'No higher-order questions', detail: 'Consider adding Analyze, Evaluate, or Create questions.' })
  if (input.easy + input.medium + input.hard !== 100) findings.push({ severity: 'suggestion', title: 'Difficulty mix is incomplete', detail: 'Difficulty percentages should total 100%.' })
  return findings
}
