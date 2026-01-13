"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Check, Loader2, Save, Search, X, FolderTree } from "lucide-react";
import { toast } from "sonner";

// Updated Interface for Deep Hierarchy
interface Subject {
  id: string;
  title: string;
  courses: {
    title: string;
    categories: {
      title: string;
    } | null;
  } | null;
}

interface EnrollmentManagerProps {
  studentId: string;
  studentName: string;
  allSubjects: any[]; 
}

export default function EnrollmentManager({
  studentId,
  studentName,
  allSubjects,
}: EnrollmentManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      const fetchEnrollments = async () => {
        setLoadingData(true);
        const { data } = await supabase
          .from("student_enrollments")
          .select("subject_id")
          .eq("user_id", studentId);

        if (data) {
          setSelectedIds(data.map((item) => item.subject_id));
        }
        setLoadingData(false);
      };

      fetchEnrollments();
    }
  }, [isOpen, studentId, supabase]);

  // --- NEW GROUPING LOGIC (By Exam/Category) ---
  const castedSubjects = allSubjects as Subject[];
  
  const groupedSubjects = castedSubjects.reduce((acc, subject) => {
    let groupTitle = "General Subjects";
    
    // Check if subject has a course, and if that course has a category (Exam)
    const course = Array.isArray(subject.courses) ? subject.courses[0] : subject.courses;
    
    // Handle Supabase returning array or single object for relations
    const category = Array.isArray(course?.categories) ? course?.categories[0] : course?.categories;

    if (category?.title) {
       groupTitle = category.title; // e.g., "JEE Mains", "NEET"
    } else if (course?.title) {
       groupTitle = course.title;   // Fallback to Course Name
    }

    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  // Sort groups alphabetically
  const sortedGroupKeys = Object.keys(groupedSubjects).sort();

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Clear existing
      await supabase.from("student_enrollments").delete().eq("user_id", studentId);

      // 2. Add new
      if (selectedIds.length > 0) {
        const inserts = selectedIds.map((subject_id) => ({
          user_id: studentId,
          subject_id: subject_id,
        }));
        await supabase.from("student_enrollments").insert(inserts);
      }
      setIsOpen(false);
      
      toast.success("Access Updated", {
        description: `Student now has access to ${selectedIds.length} subjects.`
      });

    } catch (error) {
      console.error(error);
      toast.error("Failed to save enrollments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
      >
        <BookOpen className="w-3 h-3" />
        Manage Access
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-gray-900">Manage Access</h2>
                <p className="text-sm text-gray-500">Select exams/subjects for <span className="font-bold text-black">{studentName}</span></p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              
              {loadingData ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm text-gray-400">Loading current access...</p>
                </div>
              ) : (
                <>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search for subjects or exams..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm shadow-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-6">
                    {sortedGroupKeys.map((groupTitle) => {
                      const subjects = groupedSubjects[groupTitle];
                      
                      // Filter logic: Match Subject Title OR Group Title (Exam Name)
                      const filtered = subjects.filter((s) =>
                        s.title.toLowerCase().includes(search.toLowerCase()) || 
                        groupTitle.toLowerCase().includes(search.toLowerCase())
                      );
                      
                      if (filtered.length === 0) return null;

                      // Check if all filtered subjects in this group are selected
                      const allSelected = filtered.every(s => selectedIds.includes(s.id));

                      return (
                        <div key={groupTitle} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <FolderTree className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-gray-900 text-lg">{groupTitle}</h3>
                            </div>
                            
                            {/* "Select All" for this group */}
                            <button 
                                onClick={() => {
                                    if (allSelected) {
                                        // Deselect all in this group
                                        const idsToUncheck = filtered.map(s => s.id);
                                        setSelectedIds(prev => prev.filter(id => !idsToUncheck.includes(id)));
                                    } else {
                                        // Select all in this group
                                        const newIds = filtered.map(s => s.id).filter(id => !selectedIds.includes(id));
                                        setSelectedIds(prev => [...prev, ...newIds]);
                                    }
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                {allSelected ? "Unselect All" : "Select All"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {filtered.map((subject) => {
                              const isSelected = selectedIds.includes(subject.id);
                              return (
                                <div
                                  key={subject.id}
                                  onClick={() => toggleSubject(subject.id)}
                                  className={`cursor-pointer p-3 rounded-xl border-2 flex items-center justify-between transition-all group ${
                                    isSelected
                                      ? "bg-black border-black text-white shadow-md transform scale-[1.02]"
                                      : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="text-sm font-bold truncate pr-2">{subject.title}</span>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? "border-white bg-white text-black" : "border-gray-300 group-hover:border-gray-400"}`}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Empty State */}
                    {sortedGroupKeys.every(key => 
                        groupedSubjects[key].filter(s => 
                            s.title.toLowerCase().includes(search.toLowerCase()) || 
                            key.toLowerCase().includes(search.toLowerCase())
                        ).length === 0
                    ) && (
                        <div className="text-center py-12 text-gray-400">
                            No exams or subjects found matching "{search}"
                        </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">
                <span className="text-black font-black text-lg">{selectedIds.length}</span> subjects selected
              </span>
              <button
                onClick={handleSave}
                disabled={saving || loadingData}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-gray-200"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}