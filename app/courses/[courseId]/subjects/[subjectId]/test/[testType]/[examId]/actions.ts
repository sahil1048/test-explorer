'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitExamAction(
  examId: string, 
  courseId: string,
  subjectId: string,
  answers: Record<string, string>, 
  timeTaken: number,
  testType: string
) {
  const supabase = await createClient()
  
  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // ---------------------------------------------------------
  // 2. FETCH EXAM SETTINGS (Marking Scheme)
  // ---------------------------------------------------------
  let settingsTable = testType === 'mock' ? 'mock_tests' : 'exams';
  
  const { data: examSettings, error: settingsError } = await supabase
    .from(settingsTable)
    .select('title, marks_correct, marks_incorrect, marks_unattempted')
    .eq('id', examId)
    .single();

  if (settingsError || !examSettings) {
    console.error('Error fetching exam settings:', settingsError);
    return { error: 'Failed to load marking scheme.' };
  }

  // Fallback defaults if columns are null
  const MARKS_CORRECT = examSettings.marks_correct ?? 4;
  const MARKS_INCORRECT = examSettings.marks_incorrect ?? -1; 
  const MARKS_UNATTEMPTED = examSettings.marks_unattempted ?? 0;
  const EXAM_TITLE = examSettings.title || 'Exam Result';

  // ---------------------------------------------------------
  // 3. FETCH QUESTIONS (With Subject Data)
  // ---------------------------------------------------------
  const selectQuery = `
    id, 
    question_bank:question_banks(
      subject:subjects(title)
    ),
    options:question_options(id, is_correct)
  `
  
  let questions = [];

  if (testType === 'mock') {
    // Mock Tests: Fetch via the join table
    const { data: mockData, error: fetchError } = await supabase
      .from('mock_test_questions')
      .select(`question:questions (${selectQuery})`)
      .eq('mock_test_id', examId);

    if (fetchError) return { error: 'Failed to load questions.' };
    
    // Flatten the array
    questions = mockData?.map((item: any) => item.question).filter((q: any) => q !== null) || [];

  } else {
    // Standard/Practice Tests: Fetch directly
    let query = supabase.from('questions').select(selectQuery);

    if (testType === 'practice') query = query.eq('practice_test_id', examId);
    else query = query.eq('exam_id', examId);

    const { data: standardData, error: fetchError } = await query;
    if (fetchError) return { error: 'Failed to load questions.' };
    
    questions = standardData || [];
  }

  // ---------------------------------------------------------
  // 4. SCORING & SECTIONAL ANALYSIS
  // ---------------------------------------------------------
  let currentScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  
  // Data structure for Sectional Analysis
  const subjectAnalysis: Record<string, { total: number, score: number }> = {}

  questions.forEach(q => {
    // @ts-ignore
    const subjectName = q.question_bank?.subject?.title || 'General';
    
    // Init subject entry if missing
    if (!subjectAnalysis[subjectName]) {
      subjectAnalysis[subjectName] = { total: 0, score: 0 };
    }

    // Add potential marks to the total for this subject
    subjectAnalysis[subjectName].total += Number(MARKS_CORRECT); 

    // Determine correctness
    // @ts-ignore
    const correctOption = q.options.find((o: any) => o.is_correct);
    const userSelectedOptionId = answers[q.id];
    let questionScore = 0;
    
    if (!userSelectedOptionId) {
      // Case: Not Attempted
      unattemptedCount += 1;
      questionScore = Number(MARKS_UNATTEMPTED);
    } else {
      if (correctOption && userSelectedOptionId === correctOption.id) {
        // Case: Correct
        correctCount += 1;
        questionScore = Number(MARKS_CORRECT);
      } else {
        // Case: Incorrect
        incorrectCount += 1;
        questionScore = Number(MARKS_INCORRECT); 
      }
    }

    currentScore += questionScore;
    subjectAnalysis[subjectName].score += questionScore;
  });

  const totalMaxMarks = questions.length * MARKS_CORRECT;

  // ---------------------------------------------------------
  // 5. SAVE ATTEMPT
  // ---------------------------------------------------------
  const attemptPayload = {
    user_id: user.id,
    score: currentScore,
    total_marks: totalMaxMarks,
    percentage: totalMaxMarks > 0 ? (currentScore / totalMaxMarks) * 100 : 0,
    time_taken_seconds: timeTaken,
    answers: answers,
    // Correctly map IDs based on test type
    mock_test_id: testType === 'mock' ? examId : null, 
    practice_test_id: testType === 'practice' ? examId : null,
    exam_id: (testType !== 'mock' && testType !== 'practice') ? examId : null
  }
  
  const { data: attempt, error: saveError } = await supabase
    .from('exam_attempts')
    .insert(attemptPayload)
    .select()
    .single()

  if (saveError) {
    console.error('Submission Error:', saveError)
    return { error: 'Failed to save attempt' }
  }

  // ---------------------------------------------------------
  // 6. RETURN DATA
  // ---------------------------------------------------------
  // Transform analysis object to array for frontend
  const sections = Object.entries(subjectAnalysis).map(([subject, stats]) => ({
    subject,
    score: stats.score,
    total: stats.total
  }));

  return { 
    success: true, 
    redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`,
    examTitle: EXAM_TITLE,
    score: currentScore,
    totalMarks: totalMaxMarks,
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    sections: sections
  }
}