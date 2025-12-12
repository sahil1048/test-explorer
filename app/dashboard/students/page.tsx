import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Phone, Calendar, User } from 'lucide-react'
import SchoolStudentsFilter from './school-students-filter'

export default async function SchoolStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // 1. Get Current User's Role & Org ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  // ROUTING LOGIC:
  // If Super Admin, send them to the Super Admin View
  if (profile?.role === 'super_admin') {
    redirect('/dashboard/admin/users')
  }
  
  // If not school admin, kick them out
  if (profile?.role !== 'school_admin' || !profile.organization_id) {
    return redirect('/dashboard')
  }

  // 2. Prepare Query for School Students
  const params = await searchParams
  const query = params.search || ''
  const sort = params.sort || 'newest'

  let dbQuery = supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', profile.organization_id) // SCOPE TO THEIR SCHOOL
    .eq('role', 'student')

  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  const { data: studentsData } = await dbQuery
  let students = studentsData || []

  // 3. Handle Sorting
  switch (sort) {
    case 'name_asc':
      students.sort((a, b) => a.full_name.localeCompare(b.full_name))
      break
    case 'name_desc':
      students.sort((a, b) => b.full_name.localeCompare(a.full_name))
      break
    case 'oldest':
      students.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'newest':
    default:
      students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500">Manage students registered under your school.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100">
          Total: {students.length}
        </div>
      </div>

      <SchoolStudentsFilter />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{student.full_name}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {student.phone || <span className="text-gray-300 italic">Not Provided</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}