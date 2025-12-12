import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Mail, Phone, Building2, User } from 'lucide-react'
import StudentsFilter from './students-filter'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.search || ''
  const sort = params.sort || 'newest'

  // 1. Fetch Students (Join with Organizations)
  // We use !inner if we wanted to filter by school name too, but left join is fine here
  let dbQuery = supabase
    .from('profiles')
    .select('*, organizations(name, slug)')
    .eq('role', 'student')

  // 2. Apply Search Filter
  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  const { data: rawStudents } = await dbQuery

  // 3. Handle Sorting in Memory
  // (Sorting by joined table columns "organizations.name" is complex in basic SQL APIs, 
  // so JS sorting is cleaner for dashboard views < 1000 records)
  let students = rawStudents || []

  switch (sort) {
    case 'name_asc':
      students.sort((a, b) => a.full_name.localeCompare(b.full_name))
      break
    case 'name_desc':
      students.sort((a, b) => b.full_name.localeCompare(a.full_name))
      break
    case 'school_asc':
      students.sort((a, b) => {
        // @ts-ignore
        const schoolA = a.organizations?.name || 'Ind'
        // @ts-ignore
        const schoolB = b.organizations?.name || 'Ind'
        return schoolA.localeCompare(schoolB)
      })
      break
    case 'school_desc':
      students.sort((a, b) => {
        // @ts-ignore
        const schoolA = a.organizations?.name || 'Ind'
        // @ts-ignore
        const schoolB = b.organizations?.name || 'Ind'
        return schoolB.localeCompare(schoolA)
      })
      break
    case 'oldest':
      students.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'newest':
    default:
      // Default Supabase return is usually by ID or insertion, but let's ensure newest
      students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Students</h1>
          <p className="text-gray-500 font-medium">View and manage registered students.</p>
        </div>
        <div className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold">
          Total: {students.length}
        </div>
      </div>

      <StudentsFilter />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">School / Organization</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                    // @ts-ignore
                    const schoolName = student.organizations?.name
                    // @ts-ignore
                    const schoolSlug = student.organizations?.slug

                    return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100 font-bold">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{student.full_name}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                           {/* Phone */}
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Phone className="w-3.5 h-3.5 text-gray-400" />
                             {student.phone || <span className="text-gray-300 italic">No phone</span>}
                           </div>
                           {/* You can allow admin to click this to email in future */}
                           {/* <div className="flex items-center gap-2 text-xs text-gray-400">
                             <Mail className="w-3 h-3" /> email@placeholder.com
                           </div> */}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {schoolName ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                            <Building2 className="w-3.5 h-3.5" />
                            {schoolName}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
                            <User className="w-3.5 h-3.5" />
                            Individual
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-gray-500 font-medium tabular-nums">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}