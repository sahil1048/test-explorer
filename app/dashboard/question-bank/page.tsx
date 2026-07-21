import QuestionBankHeader from '@/features/question-bank/components/question-bank-header'
import QuestionLibrary from '@/features/question-library/components/question-library'
import SmartSearchHint from '@/features/productivity/components/smart-search-hint'

export default function QuestionBankPage() { return <div className="space-y-8"><QuestionBankHeader /><SmartSearchHint/><QuestionLibrary /></div> }
