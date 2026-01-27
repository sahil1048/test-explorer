import { getExamLandingPages, deleteExam } from './actions'
import Link from 'next/link'
import { Pencil, Trash2, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ExamLandingPagesList() {
  const exams = await getExamLandingPages()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Landing Pages</h1>
          <p className="text-gray-500 mt-1">Manage content for JEE, NEET, CUET, etc.</p>
        </div>
        <Link href="/dashboard/admin/exam-landing-pages/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} /> Create New Exam Page
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Exam Title</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {exams?.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={18} />
                  </div>
                  {exam.title}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{exam.slug}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/admin/exam-landing-pages/${exam.id}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteExam(exam.id)
                    }}>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 size={14} />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {exams?.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No exam pages found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}