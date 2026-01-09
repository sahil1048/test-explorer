"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Check, Loader2, Save, Search, X } from "lucide-react";
import { toast } from "sonner";

// Types for props
interface CourseRelation {
  title: string;
}

interface Subject {
  id: string;
  title: string;
  courses: CourseRelation[] | CourseRelation | null;
}

interface EnrollmentManagerProps {
  studentId: string;
  studentName: string;
  allSubjects: any[]; // We cast this inside
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

  // 1. Fetch User's EXISTING enrollments when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchEnrollments = async () => {
        setLoadingData(true);
        const { data, error } = await supabase
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

  // 2. Group Subjects by Course (Same logic as before)
  const castedSubjects = allSubjects as Subject[];
  const groupedSubjects = castedSubjects.reduce((acc, subject) => {
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

  // 3. Toggle Selection
  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 4. Save Changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("student_enrollments").delete().eq("user_id", studentId);

      if (selectedIds.length > 0) {
        const inserts = selectedIds.map((subject_id) => ({
          user_id: studentId,
          subject_id: subject_id,
        }));
        await supabase.from("student_enrollments").insert(inserts);
      }
      setIsOpen(false);
      
      // REPLACED ALERT WITH TOAST
      toast.success("Enrollments updated successfully", {
        description: `Granted access to ${selectedIds.length} subjects.`
      });

    } catch (error) {
      console.error(error);
      toast.error("Failed to save enrollments", {
        description: "Please try again later."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md"
      >
        <BookOpen className="w-4 h-4" />
        Manage Access
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-gray-900">Manage Enrollments</h2>
                <p className="text-sm text-gray-500">Assigning subjects to <span className="font-bold text-black">{studentName}</span></p>
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
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* List */}
                  <div className="space-y-6">
                    {Object.entries(groupedSubjects).map(([courseTitle, courseSubjects]) => {
                      const filtered = courseSubjects.filter((s) =>
                        s.title.toLowerCase().includes(search.toLowerCase())
                      );
                      if (filtered.length === 0) return null;

                      return (
                        <div key={courseTitle} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          {/* <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider text-blue-600">{courseTitle}</h3> */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((subject) => {
                              const isSelected = selectedIds.includes(subject.id);
                              return (
                                <div
                                  key={subject.id}
                                  onClick={() => toggleSubject(subject.id)}
                                  className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                      : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-white"
                                  }`}
                                >
                                  <span className="text-sm font-bold">{subject.title}</span>
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                {selectedIds.length} subjects selected
              </span>
              <button
                onClick={handleSave}
                disabled={saving || loadingData}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
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