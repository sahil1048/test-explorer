import { createClient } from '@/lib/supabase/server'
import { Phone, MapPin, ArrowLeft, User, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import EnrollmentManager from '@/components/admin/enrollment-manager'
import ExportStudentsBtn from '@/components/admin/export-students-btn' // Import Export Btn
import StudentSearch from '@/components/admin/student-search' // Import Search Component
import StudentSort from '@/components/admin/student-sort'

export default async function SchoolStudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const supabase = await createClient()
  const { schoolId } = await params
  const { search, sort } = await searchParams
  
  const query = search || ''

  // 1. Determine Filter Logic
  let dbQuery = supabase
    .from('profiles')
    .select('*, organizations(name)')
    .eq('role', 'student')

  if (schoolId === 'public') {
    dbQuery = dbQuery.is('organization_id', null)
  } else {
    dbQuery = dbQuery.eq('organization_id', schoolId)
  }

  // 2. Apply Search (Server Side Filtering)
  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  // 3. Fetch Data
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('*')
    .order('title')

  const { data: rawStudents } = await dbQuery
  let students = rawStudents || []

if (sort === 'name_asc') {
    students.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
  } else if (sort === 'name_desc') {
    students.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''))
  } else {
    // Default: Newest
    students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Get School Name for Header
  // @ts-ignore
  const currentSchoolName = schoolId === 'public' 
    ? 'Individual Students' 
    // @ts-ignore
    : students[0]?.organizations?.name || 'School Students'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/users" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentSchoolName}</h1>
            <p className="text-gray-500 font-medium">Total Students: {students.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Export */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        
        {/* Search Component */}
        <StudentSearch placeholder="Search students by name..." />

        <div className="flex gap-2">
           {/* Sort Button */}
           <StudentSort />
           
           {/* Export Button */}
           <ExportStudentsBtn data={students} />
        </div>
        
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Stream</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* NAME */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200 shadow-sm">
                          {student.full_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div>
                           <div className="font-bold text-gray-900">{student.full_name}</div>
                           <div className="text-xs text-gray-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-100">
                         <GraduationCap className="w-4 h-4 text-blue-500" />
                         {/* @ts-ignore */}
                         {student.stream || <span className="text-gray-400">N/A</span>}
                       </div>
                    </td>
                    
                    {/* PHONE */}
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                         <Phone className="w-4 h-4 text-gray-300" />
                         {student.phone || student.phone_no || <span className="text-gray-300 italic">--</span>}
                       </div>
                    </td>

                    {/* ADDRESS */}
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                         <MapPin className="w-4 h-4 text-gray-300" />
                         {/* @ts-ignore */}
                         {student.address || <span className="text-gray-300 italic">No address</span>}
                       </div>
                    </td>

                    {/* MANAGE ACCESS BUTTON */}
                    <td className="px-8 py-5 text-right">
                      <EnrollmentManager 
                        studentId={student.id}
                        studentName={student.full_name}
                        allSubjects={allSubjects || []} 
                      />
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