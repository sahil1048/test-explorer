"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, Search, Save, Loader2 } from "lucide-react";

// 1. Correct Interface matching Supabase response
interface CourseRelation {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  title: string;
  courses: CourseRelation[] | CourseRelation | null; // Handle array OR object
}

export default function AssignSubjectsForm({ 
  studentId, 
  subjects, 
  initialEnrollments 
}: { 
  studentId: string, 
  subjects: any[], // Using 'any' for props to avoid strict initial mismatch, casting inside
  initialEnrollments: string[] 
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialEnrollments);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const supabase = createClient();
  const router = useRouter();

  // 2. Safe Grouping Logic
  const castedSubjects = subjects as Subject[];

  const groupedSubjects = castedSubjects.reduce((acc, subject) => {
    // Safely extract course title whether it's an array or object
    let courseTitle = "Uncategorized";
    
    if (Array.isArray(subject.courses) && subject.courses.length > 0) {
      courseTitle = subject.courses[0].title;
    } else if (subject.courses && !Array.isArray(subject.courses)) {
      // @ts-ignore
      courseTitle = subject.courses.title;
    }

    if (!acc[courseTitle]) acc[courseTitle] = [];
    acc[courseTitle].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const toggleSubject = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // A. Remove existing enrollments
      const { error: deleteError } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('user_id', studentId);

      if (deleteError) throw deleteError;

      // B. Add new enrollments
      if (selectedIds.length > 0) {
        const inserts = selectedIds.map(subject_id => ({
          user_id: studentId,
          subject_id: subject_id,
          // assigned_by: (you can fetch current admin ID here if needed)
        }));
        
        const { error: insertError } = await supabase.from('student_enrollments').insert(inserts);
        if (insertError) throw insertError;
      }

      router.refresh();
      router.push('/dashboard/admin/users'); // Redirect on success
    } catch (error: any) {
      alert("Error saving: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search for subjects or streams..." 
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Subjects Grid */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 pb-10 custom-scrollbar">
        {Object.entries(groupedSubjects).map(([courseTitle, courseSubjects]) => {
          // Filter logic
          const filtered = courseSubjects.filter((s) => 
            s.title.toLowerCase().includes(search.toLowerCase()) || 
            courseTitle.toLowerCase().includes(search.toLowerCase())
          );
          
          if (filtered.length === 0) return null;

          return (
            <div key={courseTitle} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-3 border-b border-gray-100 mb-4">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  {courseTitle}
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">
                    {filtered.length}
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((subject) => {
                  const isSelected = selectedIds.includes(subject.id);
                  return (
                    <div 
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700"
                      }`}
                    >
                      <span className="font-bold text-sm">{subject.title}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-white bg-white text-blue-600" : "border-gray-200"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
         <p className="text-sm text-gray-500 font-medium">
           {selectedIds.length} subjects selected
         </p>
         <button 
           onClick={handleSave}
           disabled={loading}
           className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-gray-200"
         >
           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
           {loading ? "Saving..." : "Save Assignments"}
         </button>
      </div>
    </div>
  );
}