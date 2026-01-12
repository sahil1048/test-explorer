import { createClient } from '@/lib/supabase/server'
import { Folder, AlertCircle } from 'lucide-react'
import MockTestCard from '@/components/admin/MockTestCard'

export default async function AdminMockTestsPage() {
  const supabase = await createClient()

  // 1. Fetch All Categories (Streams)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('title')

    console.log("Categories fetched:", categories)

  if (catError) return <div className="p-8 text-red-500">Error: {catError.message}</div>

  // 2. Fetch Mock Tests with Relations
  // We join 'courses' to get the category_id
  const { data: mockTests, error: mockError } = await supabase
    .from('mock_tests')
    .select(`
      *,
      questions:mock_test_questions(count),
      courses (
        id,
        title,
        category_id
      )
    `)
    .is('subject_id', null)
    .order('created_at', { ascending: false })

  if (mockError) return <div className="p-8 text-red-500">Error loading mocks: {mockError.message}</div>

  // 3. Group Mocks by Category ID
  const mocksByCategoryId: Record<string, any[]> = {}
  
  mockTests?.forEach((mock) => {
    // @ts-ignore 
    const catId = mock.courses?.category_id
    if (catId) {
      if (!mocksByCategoryId[catId]) mocksByCategoryId[catId] = []
      mocksByCategoryId[catId].push(mock)
    }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests Repository</h1>
          <p className="text-gray-500 mt-1">Overview of generated mock tests organized by category.</p>
        </div>
      </div>

      <div className="space-y-10">
        {categories?.map((category) => {
          const categoryMocks = mocksByCategoryId[category.id] || []
          const hasMocks = categoryMocks.length > 0

          return (
            <div key={category.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-200/60">
              
              {/* Category Header */}
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${hasMocks ? 'bg-white text-blue-600 border-gray-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                   <Folder className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${hasMocks ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                      {categoryMocks.length} Tests
                    </span>
                    <span className="text-sm text-gray-400 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Mocks Grid */}
              {hasMocks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {categoryMocks.map((mock) => (
                    <MockTestCard key={mock.id} mock={mock} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-medium">No mock tests generated yet.</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {(!categories || categories.length === 0) && (
          <div className="text-center p-20 bg-gray-50 rounded-3xl">
            <h3 className="text-lg font-bold text-gray-900">No Categories Found</h3>
            <p className="text-gray-500">Please create categories (streams) to organize your mock tests.</p>
          </div>
        )}
      </div>
    </div>
  )
}