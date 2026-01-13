"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Trophy, 
  BookOpen, 
  Medal, 
  Loader2, 
  School,
  GraduationCap
} from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  title: string;
}

interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  organization_name: string; // <--- Renamed from school_name
  total_score: number;
  tests_taken: number;
  avg_percentage: number;
}

interface Props {
  courses: Course[]; // Initial list of courses
  schoolId?: string; // Optional filter for School Admins
}

export default function LeaderboardClient({ courses, schoolId }: Props) {
  const supabase = createClient();

  // Selection States
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  
  // Data States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  
  // Loading States
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // 1. Fetch Subjects when Course Changes
  useEffect(() => {
    if (!selectedCourse) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      // Assuming 'subjects' table has 'course_id' column
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .eq('course_id', selectedCourse)
        .order('title');

      if (error) {
        console.error("Error fetching subjects:", error);
      } else {
        setSubjects(data || []);
        // Auto-select first subject if available
        if (data && data.length > 0) setSelectedSubject(data[0].id);
        else setSelectedSubject("");
      }
      setLoadingSubjects(false);
    };

    fetchSubjects();
  }, [selectedCourse, supabase]);

  // 2. Fetch Leaderboard when Subject Changes
  useEffect(() => {
    if (!selectedSubject) {
      setLeaderboardData([]);
      return;
    }

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      
      const { data, error } = await supabase.rpc(
        'get_leaderboard_v6', 
        { 
          target_subject_id: selectedSubject,
          target_organization_id: schoolId || null
        }
      );

      console.log("🔍 SUPABASE RESPONSE:", { data, error, selectedSubject });

      if (error) console.error("Leaderboard Error:", error);
      setLeaderboardData(data || []);
      setLoadingLeaderboard(false);
    };

    fetchLeaderboard();
  }, [selectedSubject, schoolId, supabase]);

  // UI Helper for Medals
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal className="w-6 h-6 text-yellow-500 fill-yellow-100" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400 fill-gray-100" />;
      case 2: return <Medal className="w-6 h-6 text-orange-600 fill-orange-100" />;
      default: return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-2 text-gray-600">
           <Trophy className="w-5 h-5 text-yellow-500" />
           <span className="font-bold">Leaderboard</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Course Selector */}
          <div className="relative w-full md:w-56">
             <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <select
               value={selectedCourse}
               onChange={(e) => setSelectedCourse(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium"
             >
               <option value="" disabled>Select Course</option>
               {courses.map((c) => (
                 <option key={c.id} value={c.id}>{c.title}</option>
               ))}
             </select>
          </div>

          {/* Subject Selector */}
          <div className="relative w-full md:w-56">
             {loadingSubjects ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
             ) : (
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             )}
             <select
               value={selectedSubject}
               onChange={(e) => setSelectedSubject(e.target.value)}
               disabled={!selectedCourse || subjects.length === 0}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <option value="" disabled>Select Subject</option>
               {subjects.map((s) => (
                 <option key={s.id} value={s.id}>{s.title}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
        {!selectedCourse ? (
           <div className="flex flex-col items-center justify-center h-64 gap-3">
             <GraduationCap className="w-12 h-12 text-gray-200" />
             <p className="text-gray-400">Please select a course to start.</p>
           </div>
        ) : !selectedSubject ? (
           <div className="flex flex-col items-center justify-center h-64 gap-3">
             <BookOpen className="w-12 h-12 text-gray-200" />
             <p className="text-gray-400">Please select a subject.</p>
           </div>
        ) : loadingLeaderboard ? (
           <div className="flex flex-col items-center justify-center h-64 gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
             <p className="text-gray-400 text-sm">Calculating ranks...</p>
           </div>
        ) : leaderboardData.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 gap-3">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-400">No test data available for this subject yet.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                  <th className="p-4 pl-6 w-20 text-center">Rank</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">School</th>
                  <th className="p-4 text-center">Tests Taken</th>
                  <th className="p-4 text-center">Avg. Score</th>
                  <th className="p-4 text-right pr-6">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboardData.map((row, index) => (
                  <tr key={row.student_id} className={`hover:bg-blue-50/30 transition-colors ${index < 3 ? 'bg-yellow-50/10' : ''}`}>
                    <td className="p-4 pl-6 text-center">
                      <div className="flex justify-center">{getRankIcon(index)}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{row.student_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <School className="w-3.5 h-3.5 text-gray-400" />
                        {row.organization_name || 'Individual'}
                      </div>
                    </td>
                    <td className="p-4 text-center text-gray-600 font-medium">{row.tests_taken}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.avg_percentage >= 80 ? 'bg-green-100 text-green-700' :
                        row.avg_percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.avg_percentage}%
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 font-black text-gray-900">{row.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}