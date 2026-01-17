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
  let settingsTable = 'exams'; 
  if (testType === 'mock') settingsTable = 'mock_tests';
  else if (testType === 'practice') settingsTable = 'practice_tests';
  
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
    const { data: mockData, error: fetchError } = await supabase
      .from('mock_test_questions')
      .select(`question:questions (${selectQuery})`)
      .eq('mock_test_id', examId);

    if (fetchError) return { error: 'Failed to load questions.' };
    
    // Flatten the array (mock questions are joined via a junction table)
    questions = mockData?.map((item: any) => item.question).filter((q: any) => q !== null) || [];

  } else {
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
  
  const subjectAnalysis: Record<string, { total: number, score: number }> = {}

  questions.forEach(q => {
    // @ts-ignore
    const subjectName = q.question_bank?.subject?.title || 'General';
    
    if (!subjectAnalysis[subjectName]) {
      subjectAnalysis[subjectName] = { total: 0, score: 0 };
    }

    subjectAnalysis[subjectName].total += Number(MARKS_CORRECT); 

    // @ts-ignore
    const correctOption = q.options.find((o: any) => o.is_correct);
    const userSelectedOptionId = answers[q.id];
    let questionScore = 0;
    
    if (!userSelectedOptionId) {
      unattemptedCount += 1;
      questionScore = Number(MARKS_UNATTEMPTED);
    } else {
      if (correctOption && userSelectedOptionId === correctOption.id) {
        correctCount += 1;
        questionScore = Number(MARKS_CORRECT);
      } else {
        incorrectCount += 1;
        questionScore = Number(MARKS_INCORRECT); 
      }
    }

    currentScore += questionScore;
    subjectAnalysis[subjectName].score += questionScore;
  });

  const totalMaxMarks = questions.length * MARKS_CORRECT;

  // ---------------------------------------------------------
  // 5. RANK PREDICTION LOGIC
  // ---------------------------------------------------------
  let predictedRank = null
  let predictedPercentile = null

  if (courseId) {
    const { data: prediction } = await supabase
      .from('exam_rank_predictions')
      .select('approx_rank, approx_percentile')
      .eq('course_id', courseId)
      .lte('min_score', currentScore)
      .gte('max_score', currentScore)
      .limit(1)
      .maybeSingle()

    if (prediction) {
      predictedRank = prediction.approx_rank
      predictedPercentile = prediction.approx_percentile
    }
  }

  // ---------------------------------------------------------
  // 6. SAVE OR UPDATE ATTEMPT (FIXED)
  // ---------------------------------------------------------
  
  // A. Determine which column ID to check based on test type
  const foreignKeyCol = testType === 'mock' ? 'mock_test_id' 
                      : testType === 'practice' ? 'practice_test_id' 
                      : 'exam_id';

  // B. Look for an existing "in_progress" attempt to update
  const { data: existingAttempt } = await supabase
    .from('exam_attempts')
    .select('id, started_at')
    .eq('user_id', user.id)
    .eq(foreignKeyCol, examId)
    .eq('status', 'in_progress')
    .maybeSingle()

  // C. Prepare the data payload
  const attemptPayload = {
    user_id: user.id,
    score: currentScore,
    total_marks: totalMaxMarks,
    percentage: totalMaxMarks > 0 ? (currentScore / totalMaxMarks) * 100 : 0,
    time_taken_seconds: timeTaken,
    answers: answers,
    status: 'completed',           
    completed_at: new Date().toISOString(),
    
    // Ensure correct foreign key is set
    mock_test_id: testType === 'mock' ? examId : null, 
    practice_test_id: testType === 'practice' ? examId : null,
    exam_id: (testType !== 'mock' && testType !== 'practice') ? examId : null
  }

  let finalAttemptId;
  let saveError;

  if (existingAttempt) {
    // SCENARIO 1: UPDATE (Merge with existing start record)
    const { data: updated, error } = await supabase
      .from('exam_attempts')
      .update(attemptPayload)
      .eq('id', existingAttempt.id)
      .select()
      .single()
      
    finalAttemptId = updated?.id
    saveError = error
  } else {
    // SCENARIO 2: INSERT (Fallback if no start record found)
    const { data: inserted, error } = await supabase
      .from('exam_attempts')
      .insert({
        ...attemptPayload,
        // Back-calculate started_at so duration makes sense
        started_at: new Date(Date.now() - (timeTaken * 1000)).toISOString()
      })
      .select()
      .single()
      
    finalAttemptId = inserted?.id
    saveError = error
  }

  if (saveError) {
    console.error('Submission Error:', saveError)
    return { error: 'Failed to save attempt' }
  }

  // ---------------------------------------------------------
  // 7. RETURN DATA
  // ---------------------------------------------------------
  const sections = Object.entries(subjectAnalysis).map(([subject, stats]) => ({
    subject,
    score: stats.score,
    total: stats.total
  }));

  return { 
    success: true, 
    attemptId: finalAttemptId,
    redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${finalAttemptId}`,
    examTitle: EXAM_TITLE,
    score: currentScore,
    totalMarks: totalMaxMarks,
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    sections: sections,
    predictedRank,
    predictedPercentile
  }
}