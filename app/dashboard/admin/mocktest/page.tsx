import { createClient } from '@/lib/supabase/server'
import CategoryAccordion from '@/components/admin/CategoryAccordion'

export default async function AdminMockTestsPage() {
  const supabase = await createClient()

  // 1. Fetch Categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('title')

  if (catError) return <div className="p-8 text-red-500">Error: {catError.message}</div>

  // 2. Fetch Mocks
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

  // 3. Group Mocks by Category
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
          <p className="text-gray-500 mt-1">Manage all your generated mock tests here.</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories?.map((category) => {
          const categoryMocks = mocksByCategoryId[category.id] || []
          
          return (
            <CategoryAccordion 
              key={category.id} 
              category={category} 
              mocks={categoryMocks} 
            />
          )
        })}

        {(!categories || categories.length === 0) && (
          <div className="text-center p-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">No Categories Found</h3>
            <p className="text-gray-500">Please create categories (streams) first.</p>
          </div>
        )}
      </div>
    </div>
  )
}