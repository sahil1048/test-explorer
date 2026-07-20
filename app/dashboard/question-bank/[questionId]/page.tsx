import QuestionEditor from '@/features/question-editor/components/question-editor'
export default async function EditQuestionPage({ params }: { params: Promise<{ questionId: string }> }) { return <QuestionEditor questionId={(await params).questionId} /> }
