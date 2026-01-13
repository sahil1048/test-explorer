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
    
    // Flatten the array
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
  // 5. ✅ NEW: RANK PREDICTION LOGIC
  // ---------------------------------------------------------
  let predictedRank = null
  let predictedPercentile = null

  // Only attempt prediction if we have a courseId (rank data is linked to courses)
  if (courseId) {
    // Find the range where the score fits: min_score <= currentScore <= max_score
    const { data: prediction } = await supabase
      .from('exam_rank_predictions')
      .select('approx_rank, approx_percentile')
      .eq('course_id', courseId)
      .lte('min_score', currentScore)
      .gte('max_score', currentScore)
      .limit(1)
      .maybeSingle() // Use maybeSingle to avoid errors if no range matches

    if (prediction) {
      predictedRank = prediction.approx_rank
      predictedPercentile = prediction.approx_percentile
    }
  }

  // ---------------------------------------------------------
  // 6. SAVE ATTEMPT
  // ---------------------------------------------------------
  const attemptPayload = {
    user_id: user.id,
    score: currentScore,
    total_marks: totalMaxMarks,
    percentage: totalMaxMarks > 0 ? (currentScore / totalMaxMarks) * 100 : 0,
    time_taken_seconds: timeTaken,
    answers: answers,
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
  // 7. RETURN DATA (With Predicted Rank)
  // ---------------------------------------------------------
  const sections = Object.entries(subjectAnalysis).map(([subject, stats]) => ({
    subject,
    score: stats.score,
    total: stats.total
  }));

  return { 
    success: true, 
    attemptId: attempt.id,
    redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`,
    examTitle: EXAM_TITLE,
    score: currentScore,
    totalMarks: totalMaxMarks,
    correct: correctCount,
    incorrect: incorrectCount,
    unattempted: unattemptedCount,
    sections: sections,
    
    // ✅ Include these in the return type
    predictedRank,
    predictedPercentile
  }
}