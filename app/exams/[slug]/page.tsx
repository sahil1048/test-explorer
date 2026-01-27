import { createClient } from '@/lib/supabase/server'
import JoinExamButton from '@/components/landing/JoinExamButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarDays, BookOpen, HelpCircle, CreditCard, 
  Trophy, ChevronRight, Download, Phone, Clock, 
  MapPin, FileText, CheckCircle2, Building2, Upload,
  Library, TrendingUp,
  UserCheck,
  AlertCircle,
  Edit3
} from 'lucide-react'
import ExamNavigationPills from '@/components/landing/ExamNavigationPills'

// --- Types ---
type ExamTab = {
  highlights_intro?: string;
  whats_new?: string;
  highlights?: { label: string; value: string }[];
  important_dates?: { event: string; date: string }[];
  important_dates_intro?: string;
  eligibility?: { title?: string; intro?: string; components: { label: string; text: string }[]; outro?: string }; // Updated structure
  application_fee?: { category: string; fee: string; extra_subject?: string }[];
  application_process?: { 
    intro?: string;
    steps_title?: string;
    steps_intro?: string;
    steps: string[];
    documents_title?: string;
    documents_intro?: string;
    documents_list?: string[];
    document_specs_title?: string;
    document_specs?: { name: string; type: string; size: string }[];
    fee_title?: string;
    fee_intro?: string;
    correction_window?: { 
      intro?: string;
      dates: string; 
      steps_title?: string;
      steps?: string[];
      fields_intro?: string;
      editable_any_one?: { title: string; fields: string[] }; 
      editable_all?: { title: string; fields: string[] }; 
    };
  };
  documents?: { name: string; type: string; size: string }[];
  exam_pattern?: { 
    intro?: string; 
    sections: { section: string; questions: string; duration: string }[] 
  };
  marking_scheme?: { 
    intro?: string;
    correct: string; 
    incorrect: string; 
    unattempted: string; 
    rules?: string[];
  };
  exam_pattern_link?: string;
  syllabus_intro?: string;
  syllabus?: { subject: string; topics: string[] }[];
  participating_universities?: {
    intro: string;
    groups: {
      type: string;
      names: string[];
    }[];
  };
  preparation?: { 
    intro?: string; 
    tips: string[]; 
  };
  books?: { name: string; author: string }[];
  admit_card?: { 
    intro: string; 
    download_title: string;
    download_steps: string[];
    details_title: string;
    details_list: string[];
    correction_note: string;
  };
  answer_key?: {
    intro: string;
    access_steps_title: string;
    access_steps: string[];
    challenge_title: string;
    challenge_fee: string;
    challenge_steps: string[];
  };
  results?: {
    intro: string;
    check_steps_title: string;
    check_steps: string[];
    details_printed_title: string;
    details_printed_intro: string;
    details_list: string[];
  };
  cutoffs?: { 
    intro?: string;
    factors_text?: string;
    table_title?: string;
    data: { 
      college: string; 
      programme: string; 
      category: string; 
      rank: string; 
      score: string; 
    }[];
  };
  counselling?: {
    intro: string;
    documents_title: string;
    documents_intro: string;
    documents_list: string[];
  };
  faqs?: { question: string; answer: string }[];
  news?: { title: string; date: string }[];
  updates_section?: {
    current_title: string;
    current_events: { event: string; date: string; status?: string }[];
    expired_title: string;
    expired_events: { event: string; date: string }[];
  };
}

type ExamDetails = {
  tagline?: string;
  description?: string;
  table_of_contents?: string[];
  tabs?: ExamTab;
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ExamLandingPage({ params }: PageProps) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Fetch Course Data
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!course) return notFound()

  const details = (course.details || {}) as ExamDetails
  const tabs = details.tabs || {}

  // Mock data for sidebar if DB empty
  const upcomingExams = [
    { name: "NIFT 2026", date: "Feb 9, 2026", logo: "N" },
    { name: "IPU CET 2026", date: "Apr 18 - Jun 9, 2026", logo: "I" },
    { name: "AMUEEE 2026", date: "Apr 26, 2026", logo: "A" },
  ]

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-900 pb-20">
      
      {/* ================= 1. HEADER SECTION ================= */}
      <div className="bg-white pt-4 pb-2">
        <div className="max-w-[80%] mx-auto px-4">
           {/* Breadcrumbs */}
           <div className="flex items-center text-xs text-gray-500 mb-4 gap-2">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/exams" className="hover:text-blue-600">Exams</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-800 font-medium">{course.title}</span>
           </div>

           {/* Title & Actions */}
           <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-4">
              <div className="flex gap-4 items-start">
                 <div className="w-16 h-16 rounded-full bg-white border border-gray-200 p-1 shadow-sm flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xl">
                        {course.title.substring(0, 2)}
                    </div>
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                       {details.tagline || course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                       <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-gray-400" /> National Level</span>
                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                       <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> 200+ Cities</span>
                    </div>
                 </div>
              </div>

                    <div className="[&>button]:bg-[#1e293b] [&>button]:text-white [&>button]:rounded-lg [&>button]:px-6 [&>button]:py-2 [&>button]:text-sm [&>button]:font-semibold [&>button]:hover:bg-slate-800">
                        <JoinExamButton courseId={course.id} label="Get Free Mock Tests" />
                    </div>
           </div>
        </div>
      </div>

      {/* ================= 2. PILL NAVIGATION (Sticky) ================= */}
      <ExamNavigationPills />

          <div className="text-xs text-gray-500 flex items-center gap-2 max-w-[90%] ml-28 mt-4">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Updated on Jan 20, 2026 by <span className="text-blue-600 font-medium">TestExplorer Team</span>
          </div>
      {/* ================= 3. CONTENT LAYOUT ================= */}
      <div className="max-w-[90%] mx-auto px-4 py-6 grid lg:grid-cols-12 gap-6 ">
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="lg:col-span-9 space-y-6 bg-white px-8 py-4 rounded-sm">


          {/* DESCRIPTION */}
          <div >
             {/* Dynamic Description Text */}
             <div className="text-sm text-gray-700 leading-7 mb-6 whitespace-pre-line">
                {details.description}
             </div>

             {/* Table of Contents - Exact UI Match */}
             {details.table_of_contents && details.table_of_contents.length > 0 && (
               <div className="border border-blue-200 rounded-lg overflow-hidden font-sans">
                  {/* Header */}
                  <div className="bg-[#2563EB] text-white px-4 py-2.5 text-sm font-medium">
                     Table of Contents
                  </div>
                  
                  {/* List Container */}
                  <div className="bg-white flex flex-col">
                     {/* First 5 Items (Always Visible) */}
                     {details.table_of_contents.slice(0, 5).map((item, i) => (
                        <a 
                          key={i} 
                          href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                          className="block px-4 py-2.5 text-sm text-blue-600 border-b border-gray-100 hover:underline hover:bg-blue-50 transition-colors"
                        >
                           {item}
                        </a>
                     ))}
                     
                     {/* Remaining Items (Collapsible) */}
                     {details.table_of_contents.length > 5 && (
                        <details className="group">
                           {/* Toggle Button */}
                           <summary className="list-none cursor-pointer px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors select-none">
                              <span className="group-open:hidden flex items-center gap-1">
                                 + {details.table_of_contents.length - 5} View More
                              </span>
                              <span className="hidden group-open:block">
                                 - View Less
                              </span>
                           </summary>
                           
                           {/* Hidden Items */}
                           <div className="border-t border-gray-100">
                              {details.table_of_contents.slice(5).map((item, i) => (
                                 <a 
                                    key={i} 
                                    href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} 
                                    className="block px-4 py-2.5 text-sm text-blue-600 border-b border-gray-100 hover:underline hover:bg-blue-50 transition-colors last:border-0"
                                 >
                                    {item}
                                 </a>
                              ))}
                           </div>
                        </details>
                     )}
                  </div>
               </div>
             )}
          </div>

          {/* HIGHLIGHTS SECTION */}
          {tabs.highlights && (
            <div id="overview" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.title} Highlights</h2>
               
               {/* Intro Paragraph */}
               {tabs.highlights_intro && (
                 <p className="text-sm text-gray-700 leading-relaxed mb-6">
                   {tabs.highlights_intro}
                 </p>
               )}

               {/* Table with Blue Header */}
               <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                 <table className="w-full text-sm text-left border-collapse table-fixed">
                   <thead className="bg-[#2563EB] text-white">
                     <tr>
                       <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">Particulars</th>
                       <th className="px-6 py-4 font-bold w-1/2 text-base">Details</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200 bg-white">
                     {tabs.highlights.map((row, i) => (
                       <tr key={i} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200 align-top leading-relaxed bg-gray-50/30">
                           {row.label}
                         </td>
                         
                         <td className="px-6 py-4 text-gray-700 align-top leading-relaxed whitespace-pre-line">
                           {row.value}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {tabs.whats_new && (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                       <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">NEW</span>
                       What&apos;s New in JEE Main 2026?
                    </h3>
                    <p className="text-sm text-gray-700 leading-7 text-justify">
                       {tabs.whats_new}
                    </p>
                 </div>
               )}
            </div>
          )}

          {/* DATES SECTION */}
          {tabs.important_dates && (
            <div id="dates" className='scroll-mt-40'>
               <h2 className="text-xl font-bold text-gray-900 mb-4">CUET 2026 Important Dates</h2>
               
               {/* NEW: Intro Paragraph */}
               {tabs.important_dates_intro && (
                 <p className="text-sm text-gray-700 leading-relaxed mb-6">
                   {tabs.important_dates_intro}
                 </p>
               )}

               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-[#2563EB] text-white">
                       <tr>
                         <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">CUET 2026 Events</th>
                         <th className="px-6 py-4 font-bold w-1/2 text-base">Dates</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                       {tabs.important_dates.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50 ">
                             <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200 align-top leading-relaxed bg-gray-50/30">{item.event}</td>
                             <td className="px-6 py-4 text-gray-700 align-top leading-relaxed whitespace-pre-line">{item.date}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* ELIGIBILITY SECTION */}
          {tabs.eligibility && (
            <div id="eligibility" className='scroll-mt-40'>
               <h2 className="text-xl font-bold text-gray-900 mb-4">{tabs.eligibility.title || "Eligibility Criteria"}</h2>
               
               {/* Intro Text */}
               {tabs.eligibility.intro && (
                 <p className="text-sm text-gray-700 leading-relaxed mb-6">
                   {tabs.eligibility.intro}
                 </p>
               )}

               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#2563EB] text-white">
                       <tr>
                         <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">Category</th>
                         <th className="px-6 py-4 font-bold w-1/2 text-base">Eligibility Criteria</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                       {tabs?.eligibility?.components?.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                             <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200 align-top leading-relaxed bg-gray-50/30">
                               {item.label}
                             </td>
                             <td className="px-6 py-4 text-gray-700 align-top leading-relaxed whitespace-pre-line">
                               {item.text}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
               </div>

               {/* Outro Text */}
               {tabs.eligibility.outro && (
                 <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                   {tabs.eligibility.outro}
                 </p>
               )}
            </div>
          )}

          {/* APPLICATION PROCESS */}
          <div id="application" className="scroll-mt-40">
             <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Application Process</h2>
             
             {/* 1. Intro */}
             {tabs.application_process?.intro && (
               <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                 {tabs.application_process.intro}
               </p>
             )}

             {/* 2. Steps to Apply (Bulleted List) */}
             {tabs.application_process?.steps && (
                <div className="mb-8">
                   <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {tabs.application_process.steps_title || "How to Apply for CUET 2026?"}
                   </h3>
                   {tabs.application_process.steps_intro && (
                      <p className="text-sm text-gray-700 mb-3">{tabs.application_process.steps_intro}</p>
                   )}
                   
                   <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                      {tabs.application_process.steps.map((step, i) => (
                         <li key={i} className="leading-relaxed pl-1">
                            {step}
                         </li>
                      ))}
                   </ul>
                </div>
             )}

             {/* 3. Documents Required (Bulleted List) */}
             {tabs.application_process?.documents_list && (
                <div className="mb-8">
                   <h3 className="font-bold text-gray-900 text-lg mb-2">
                     {tabs.application_process.documents_title || "Documents Required for CUET 2026 Application Process"}
                   </h3>
                   {tabs.application_process.documents_intro && (
                      <p className="text-sm text-gray-700 mb-3">{tabs.application_process.documents_intro}</p>
                   )}

                   <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 mb-6">
                     {tabs.application_process.documents_list.map((doc, i) => (
                       <li key={i} className="pl-1">
                          {doc}
                       </li>
                     ))}
                   </ul>
                </div>
             )}

             {/* 4. Specifications Table (Blue Header) */}
             {tabs.application_process?.document_specs && (
               <div className="mb-8 font-sans">
                  {tabs.application_process.document_specs_title && (
                     <p className="text-sm text-gray-700 mb-3">
                        {tabs.application_process.document_specs_title || "Here is the specification of documents that need to be submitted:"}
                     </p>
                  )}
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#2563EB] text-white">
                           <tr>
                             <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3">Document</th>
                             <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3">File Type</th>
                             <th className="px-6 py-4 font-bold w-1/3">File Size</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                           {tabs.application_process.document_specs.map((doc, i) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200">{doc.name}</td>
                                 <td className="px-6 py-4 text-gray-600 border-r border-gray-200">{doc.type}</td>
                                 <td className="px-6 py-4 text-gray-600">{doc.size}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
             )}

             {/* 5. Application Fee Table (If needed, styled similarly) */}
             {tabs.application_fee && (
               <div className="mb-8">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {tabs.application_process?.fee_title || "Application Fee"}
                    </h3>
                    {tabs.application_process?.fee_intro && <p className="text-sm text-gray-700">{tabs.application_process.fee_intro}</p>}
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#2563EB] text-white">
                           <tr>
                             <th className="px-6 py-4 font-bold border-r border-blue-400">Category</th>
                             <th className="px-6 py-4 font-bold border-r border-blue-400">Application Fee</th>
                             <th className="px-6 py-4 font-bold">Add. Subject</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                           {tabs.application_fee.map((fee, i) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200">{fee.category}</td>
                                 <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200">{fee.fee}</td>
                                 <td className="px-6 py-4 text-gray-600">{fee.extra_subject || "-"}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
             )}
          </div>

          {/* APPLICATION CORRECTION */}
          {tabs.application_process?.correction_window && (
             <div id="correction" className="scroll-mt-40">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Application Form Correction</h2>
                
                {/* Intro Text */}
                {tabs.application_process.correction_window.intro && (
                   <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                      {tabs.application_process.correction_window.intro}
                   </p>
                )}

                {/* How to Access Section */}
                {tabs.application_process.correction_window.steps && (
                   <div className="mb-8">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                         {tabs.application_process.correction_window.steps_title || "How to Access the CUET 2026 Application Correction Window?"}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">The candidates can follow the steps to unlock the application correction window:</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                         {tabs.application_process.correction_window.steps.map((step, i) => (
                            <li key={i} className="pl-1 leading-relaxed">
                               {step}
                            </li>
                         ))}
                      </ul>
                   </div>
                )}

                {/* Editable Fields Section */}
                {(tabs.application_process.correction_window.editable_any_one || tabs.application_process.correction_window.editable_all) && (
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">CUET 2026 Application Editable Fields</h3>
                      {tabs.application_process.correction_window.fields_intro && (
                         <p className="text-sm text-gray-700 mb-6 leading-relaxed text-justify">
                            {tabs.application_process.correction_window.fields_intro}
                         </p>
                      )}

                      {/* List 1: Any One */}
                      {tabs.application_process.correction_window.editable_any_one && (
                         <div className="mb-6">
                            <p className="text-sm text-gray-700 mb-2">
                               Here is the list of fields that the candidate can edit in any one of them:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                               {tabs.application_process.correction_window.editable_any_one.fields.map((field, i) => (
                                  <li key={i} className="pl-1">
                                     {field}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      )}

                      {/* List 2: All Fields */}
                      {tabs.application_process.correction_window.editable_all && (
                         <div>
                            <p className="text-sm text-gray-700 mb-2">
                               Here is the list of fields that the candidate can edit in all the fields:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                               {tabs.application_process.correction_window.editable_all.fields.map((field, i) => (
                                  <li key={i} className="pl-1">
                                     {field}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      )}
                   </div>
                )}
             </div>
          )}

          {/* EXAM PATTERN & MARKING */}
          {(tabs.exam_pattern || tabs.marking_scheme) && (
            <div id="pattern" className="scroll-mt-40">
               {/* 1. Exam Pattern Section */}
               {tabs.exam_pattern && (
                 <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Exam Pattern</h2>
                    
                    {tabs.exam_pattern.intro && (
                      <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                        {tabs.exam_pattern.intro}
                      </p>
                    )}
                    
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#2563EB] text-white">
                          <tr>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Section</th>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Number of Questions per Section</th>
                            <th className="px-6 py-4 font-bold text-base w-1/3">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tabs?.exam_pattern?.sections?.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-top">
                                {row.section}
                              </td>
                              <td className="px-6 py-4 text-gray-700 border-r border-gray-200 align-top">
                                {row.questions}
                              </td>
                              <td className="px-6 py-4 text-gray-700 align-top">
                                {row.duration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* "Also Read" Link if available (Mocked based on image) */}
                    <div className="mt-4">
                       <a href="#" className="text-sm text-blue-600 font-medium hover:underline">
                          Also Read: CUET 2026 Exam Pattern
                       </a>
                    </div>
                 </div>
               )}

               {/* 2. Marking Scheme Section */}
               {tabs.marking_scheme && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Marking Scheme</h2>
                    {tabs.marking_scheme.intro && (
                       <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          {tabs.marking_scheme.intro}
                       </p>
                    )}

                    {/* Simple Bulleted List (Removed Cards & Icons) */}
                    {tabs.marking_scheme.rules && (
                      <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                         {tabs.marking_scheme.rules.map((rule, i) => (
                            <li key={i} className="leading-relaxed pl-1">
                               {/* Render bold text logic if needed, otherwise plain text */}
                               <span dangerouslySetInnerHTML={{ 
                                  __html: rule
                                    .replace(/\+5 marks/g, "<b>+5 marks</b>")
                                    .replace(/penalty of 1 mark/g, "<b>penalty of 1 mark</b>")
                                    .replace(/zero marks/g, "<b>zero marks</b>") 
                               }} />
                            </li>
                         ))}
                      </ul>
                    )}
                  </div>
               )}
            </div>
          )}

          {/* SYLLABUS SECTION */}
          {tabs.syllabus && (
            <div id="syllabus" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Syllabus</h2>
               
               {/* Intro Text */}
               {tabs.syllabus_intro && (
                 <p className="text-sm text-gray-700 leading-7 mb-8 text-justify">
                   {tabs.syllabus_intro}
                 </p>
               )}

               <div className="space-y-10">
                  {/* --- SECTION 1: LANGUAGE --- */}
                  {tabs.syllabus.filter(s => s.subject.includes("Section 1")).map((item, i) => (
                     <div key={i}>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{item.subject}</h3>
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                           Section 1 of the CUET 2026 Exam is Language. The authority is offering 13 different languages for the CUET 2026 Exam, such as <strong>English, Hindi, Assamese, Bengali, Gujarati, Kannada, Marathi, Malayalam, Odia, Punjabi, Tamil, Telugu and Urdu.</strong>
                        </p>
                        <p className="text-sm text-gray-700 mb-4">
                           The Section 1 paper will have questions based on the <strong>Reading Comprehension and Verbal Ability.</strong> The breakdown of the Section 1 Syllabus is as follows:
                        </p>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                           <table className="w-full text-sm text-left border-collapse">
                              <thead className="bg-[#2563EB] text-white">
                                 <tr>
                                    <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Topics</th>
                                    <th className="px-6 py-4 font-bold text-base">Sub-Topics</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                 <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-middle">Reading Comprehension</td>
                                    <td className="px-6 py-4 text-gray-700 align-top space-y-2">
                                       <p>Factual</p>
                                       <p>Narrative</p>
                                       <p>Literary</p>
                                    </td>
                                 </tr>
                                 <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-middle">Verbal Ability</td>
                                    <td className="px-6 py-4 text-gray-700 align-top space-y-2">
                                       <p>Rearranging the parts</p>
                                       <p>Match the following</p>
                                       <p>Choosing the correct word</p>
                                       <p>Synonyms</p>
                                       <p>Antonyms</p>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  ))}

                  {/* --- SECTION 2: DOMAIN SUBJECTS (NOW A TABLE) --- */}
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-3">Section 2: Domain-Specific Subject</h3>
                     <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                        The other section of the CUET 2026 Exam is the Domain-Specific Subject. The candidates will be allowed to <strong>choose up to 5 subjects</strong> as per the university. The breakdown of the Section 2 Syllabus is as follows:
                     </p>
                     
                     <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                        <table className="w-full text-sm text-left border-collapse">
                           <thead className="bg-[#2563EB] text-white">
                              <tr>
                                 <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Subject</th>
                                 <th className="px-6 py-4 font-bold text-base">Topics</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200 bg-white">
                              {tabs.syllabus
                                 .filter(s => !s.subject.includes("Section 1") && !s.subject.includes("Section 3"))
                                 .map((subject, i) => (
                                 <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200 align-top bg-gray-50/30">
                                       {subject.subject}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 align-top">
                                       <ul className="list-disc pl-4 space-y-1">
                                          {subject.topics.map((topic, t) => (
                                             <li key={t}>{topic}</li>
                                          ))}
                                       </ul>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* --- SECTION 3: GENERAL TEST --- */}
                  {tabs.syllabus.filter(s => s.subject.includes("Section 3")).map((item, i) => (
                     <div key={i}>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{item.subject}</h3>
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                           The last section of the CUET 2026 Exam is the General Test, and this section covers general knowledge, basic science questions, logical reasoning, current affairs, and basic mathematics. The breakdown of the Section 3 Syllabus is as follows:
                        </p>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                           <table className="w-full text-sm text-left border-collapse">
                              <thead className="bg-[#2563EB] text-white">
                                 <tr>
                                    <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">Topics</th>
                                    <th className="px-6 py-4 font-bold text-base w-1/2">Topics</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                 <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 border-r border-gray-200 align-top">
                                       General Knowledge and Current Affairs
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 align-top">
                                       General Math Ability
                                    </td>
                                 </tr>
                                 <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 border-r border-gray-200 align-top">
                                       Logical and Analytical Reasoning
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 align-top">
                                       General Science and Environment Literacy
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  ))}
               </div>
               
               {/* PDF Download Button */}
               <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Need the complete PDF?</span>
                  <button className="flex items-center gap-2 text-sm font-bold text-white bg-[#1e293b] px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                     <Download className="w-4 h-4" /> Download Syllabus PDF
                  </button>
               </div>
            </div>
          )}

          {/* PREPARATION & BOOKS SECTION */}
          {(tabs.preparation || tabs.books) && (
            <div id="preparation" className="scroll-mt-40">
               {/* 1. Preparation Tips */}
               {tabs.preparation && (
                 <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Preparations</h2>
                    
                    {tabs.preparation.intro && (
                      <p className="text-sm text-gray-700 leading-relaxed mb-4 text-justify">
                        {tabs.preparation.intro}
                      </p>
                    )}
                    
                    {/* Simple Bulleted List (No Cards/Icons) */}
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                       {tabs.preparation.tips.map((tip, i) => (
                          <li key={i} className="pl-1 leading-relaxed">
                             {tip}
                          </li>
                       ))}
                    </ul>
                 </div>
               )}

               {/* 2. Recommended Books */}
               {tabs.books && (
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                       CUET 2026 Recommended Books
                    </h2>
                    <p className="text-sm text-gray-700 mb-6">
                       The candidate may refer to the listed books for their preparation:
                    </p>
                    
                    {/* Blue Header Table with Grid Lines */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                       <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-[#2563EB] text-white">
                             <tr>
                                <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">Book Name</th>
                                <th className="px-6 py-4 font-bold text-base w-1/2">Author</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                             {tabs.books.map((book, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                   <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-middle">
                                      {book.name}
                                   </td>
                                   <td className="px-6 py-4 text-gray-700 align-middle">
                                      {book.author}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* ADMIT CARD SECTION */}
          {tabs.admit_card && (
            <div id="admit-card" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Admit Card</h2>
               
               {/* 1. Intro */}
               {tabs.admit_card.intro && (
                  <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                    {tabs.admit_card.intro}
                  </p>
               )}

               {/* 2. Download Steps */}
               {tabs.admit_card.download_steps && (
                  <div className="mb-8">
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.admit_card.download_title || "How to Download CUET 2026 Admit Card?"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3">
                        The candidate can access the CUET 2026 Admit Card by following the steps mentioned below:
                     </p>
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.admit_card.download_steps.map((step, i) => (
                           <li key={i} className="pl-1 leading-relaxed">
                              {step}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* 3. Details Checklist */}
               {tabs.admit_card.details_list && (
                  <div className="mb-4">
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.admit_card.details_title || "Details Mentioned On The CUET 2026 Admit Card"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3">
                        The following details will be present on the CUET 2026 Admit Card:
                     </p>
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.admit_card.details_list.map((detail, i) => (
                           <li key={i} className="pl-1">
                              {detail}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* 4. Correction Note */}
               {tabs.admit_card.correction_note && (
                  <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                     {tabs.admit_card.correction_note}
                  </p>
               )}
            </div>
          )}

          {/* ANSWER KEY SECTION */}
          {tabs.answer_key && (
            <div id="answer-key" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Answer Key</h2>
               
               {/* Intro */}
               {tabs.answer_key.intro && (
                  <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                    {tabs.answer_key.intro}
                  </p>
               )}

               {/* Access Steps */}
               {tabs.answer_key.access_steps && (
                  <div className="mb-8">
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.answer_key.access_steps_title || "How to Access the CUET 2026 Answer Key?"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3">
                        The candidate can check the CUET 2026 Answer Key by following the steps mentioned below:
                     </p>
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.answer_key.access_steps.map((step, i) => (
                           <li key={i} className="pl-1 leading-relaxed">
                              {step}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* Challenge Process */}
               {tabs.answer_key.challenge_steps && (
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.answer_key.challenge_title || "How to Challenge the CUET 2026 Provisional Answer Key?"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        The candidate is required to make a payment of the fee of <strong>{tabs.answer_key.challenge_fee || "INR 200 per question"}</strong> to object to the answer key. The candidate can object or challenge the CUET 2026 Provisional Answer Key by following the instructions below:
                     </p>
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.answer_key.challenge_steps.map((step, i) => (
                           <li key={i} className="pl-1 leading-relaxed">
                              {step}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
          )}

          {/* RESULTS SECTION */}
          {tabs.results && (
            <div id="results" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Results</h2>
               
               {/* Intro */}
               {tabs.results.intro && (
                  <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                    {tabs.results.intro}
                  </p>
               )}

               {/* Check Steps */}
               {tabs.results.check_steps && (
                  <div className="mb-8">
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.results.check_steps_title || "How to Check the CUET 2026 Results?"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3">
                        The candidates will be able to unlock and download their CUET 2026 Results by following the steps mentioned below:
                     </p>
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.results.check_steps.map((step, i) => (
                           <li key={i} className="pl-1 leading-relaxed">
                              {step}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* Details Printed */}
               {tabs.results.details_list && (
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.results.details_printed_title || "Key Details Printed on CUET 2026 Results"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {tabs.results.details_printed_intro || "After downloading the CUET 2026 Results, the candidate must review the details mentioned on it and ensure that every detail is correct. The list of information printed on the CUET 2026 Results is as follows:"}
                     </p>
                     
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.results.details_list.map((detail, i) => (
                           <li key={i} className="pl-1">
                              {detail}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
          )}

          {/* CUTOFFS SECTION */}
          {tabs.cutoffs && (
            <div id="cutoffs" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Cutoff</h2>
               
               {/* Intro Text */}
               {tabs.cutoffs.intro && (
                 <p className="text-sm text-gray-700 leading-7 mb-4 text-justify">
                   {tabs.cutoffs.intro}
                 </p>
               )}
               
               {/* Factors Text (Bolded part logic handled via dangerouslySetInnerHTML or just text) */}
               {tabs.cutoffs.factors_text && (
                 <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                   {tabs.cutoffs.factors_text}
                 </p>
               )}

               {/* Table Title (if separate) or just spacing */}
               {tabs.cutoffs.table_title && (
                 <p className="text-sm text-gray-700 mb-4 font-medium">
                   {tabs.cutoffs.table_title}
                 </p>
               )}

               {/* Blue Header Table with Grid Lines */}
               <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                      <thead className="bg-[#2563EB] text-white">
                         <tr>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 text-base">College</th>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 text-base">Programme</th>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 text-base">Category</th>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 text-base">Cutoff Rank</th>
                            <th className="px-6 py-4 font-bold text-base">Cutoff Score</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                         {tabs.cutoffs.data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                               <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-middle">
                                  {row.college}
                               </td>
                               <td className="px-6 py-4 text-gray-700 border-r border-gray-200 align-middle">
                                  {row.programme}
                               </td>
                               <td className="px-6 py-4 text-gray-600 border-r border-gray-200 align-middle">
                                  {row.category}
                               </td>
                               <td className="px-6 py-4 text-gray-900 font-medium border-r border-gray-200 align-middle">
                                  {row.rank}
                               </td>
                               <td className="px-6 py-4 text-gray-900 align-middle">
                                  {row.score}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}

          {/* COUNSELLING SECTION */}
          {tabs.counselling && (
            <div id="counselling" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Counselling</h2>
               
               {/* Intro */}
               {tabs.counselling.intro && (
                 <p className="text-sm text-gray-700 leading-7 mb-6 text-justify">
                   {tabs.counselling.intro}
                 </p>
               )}

               {/* Documents Required */}
               {tabs.counselling.documents_list && (
                  <div>
                     <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {tabs.counselling.documents_title || "CUET 2026 Counselling Documents Required"}
                     </h3>
                     <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {tabs.counselling.documents_intro || "The candidate must arrange the following documents that are required during the CUET 2026 Counselling:"}
                     </p>
                     
                     <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                        {tabs.counselling.documents_list.map((doc, i) => (
                           <li key={i} className="pl-1 leading-relaxed">
                              {doc}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
          )}

          {/* PARTICIPATING UNIVERSITIES SECTION */}
          {tabs.participating_universities && (
            <div id="universities" className="scroll-mt-40">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">CUET 2026 Participating Universities</h2>
               
               {/* Main Intro */}
               {tabs.participating_universities.intro && (
                  <p className="text-sm text-gray-700 leading-7 mb-8 text-justify">
                     {tabs.participating_universities.intro}
                  </p>
               )}

               {/* University Groups Loop */}
               <div className="space-y-10">
                  {tabs.participating_universities.groups.map((group, i) => (
                     <div key={i}>
                        {/* Group Heading (e.g., Central Universities...) */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                           {group.type} Participating in CUET 2026
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">
                           The following list of {group.type.toLowerCase()} will accept CUET 2026 for admission to various courses:
                        </p>

                        {/* Table Structure */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                           <table className="w-full text-sm text-left border-collapse">
                              <thead className="bg-[#2563EB] text-white">
                                 <tr>
                                    <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">College Name</th>
                                    <th className="px-6 py-4 font-bold text-base w-1/2">College Name</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                 {Array.from({ length: Math.ceil(group.names.length / 2) }).map((_, rowIndex) => {
                                    const col1 = group.names[rowIndex * 2];
                                    const col2 = group.names[rowIndex * 2 + 1];

                                    return (
                                       <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-6 py-4 text-gray-900 border-r border-gray-200 align-middle">
                                             {col1}
                                          </td>
                                          <td className="px-6 py-4 text-gray-900 align-middle">
                                             {col2 || ""}
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* FAQs SECTION */}
          {tabs.faqs && (
             <div id="faqs" className='scroll-mt-40'>
                <h2 className="text-xl font-bold text-gray-900 mb-4">CUET 2026 FAQs</h2>
                <div className="space-y-4">
                  {tabs.faqs.map((faq, i) => (
                    <details key={i} className="group border border-gray-200 bg-white rounded-lg [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-gray-900 font-medium hover:bg-gray-50 transition-colors">
                        <span className="text-sm">{faq.question}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 transition duration-300 group-open:-rotate-90 text-gray-400" />
                      </summary>
                      <p className="px-4 pb-4 leading-relaxed text-gray-600 text-sm border-t border-gray-100 pt-3">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
             </div>
          )}

   {/* IMPORTANT UPDATES & EXPIRED EVENTS */}
          {tabs.updates_section && (
            <div>
            <div id="important-dates" className="scroll-mt-40">
               
               {/* 1. Current Updates Table */}
               {tabs.updates_section.current_events && (
                 <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                       <h2 className="text-2xl font-bold text-gray-900">
                          {tabs.updates_section.current_title || "CUET Important Update"}
                       </h2>
                       <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                          <Download className="w-4 h-4" /> Download Report
                       </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#2563EB] text-white">
                          <tr>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Event</th>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/3 text-base">Description</th>
                            <th className="px-6 py-4 font-bold text-base w-1/3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tabs.updates_section.current_events.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-top">
                                {item.event}
                              </td>
                              <td className="px-6 py-4 text-gray-700 border-r border-gray-200 align-top">
                                {item.date}
                              </td>
                              <td className="px-6 py-4 align-top">
                                <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded text-xs border border-red-100">
                                   {item.status || "Tentative"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               )}
               </div>

               <div>

               {/* 2. Expired Events Table */}
               {tabs.updates_section.expired_events && (
                 <div id='expired-events'>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                       {tabs.updates_section.expired_title || "CUET Expired Events"}
                    </h2>
                    
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#2563EB] text-white">
                          <tr>
                            <th className="px-6 py-4 font-bold border-r border-blue-400 w-1/2 text-base">Events</th>
                            <th className="px-6 py-4 font-bold text-base w-1/2">Dates</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tabs.updates_section.expired_events.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 align-top">
                                {item.event}
                              </td>
                              <td className="px-6 py-4 text-gray-700 align-top">
                                {item.date}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               )}
            </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-3 space-y-6">
           
           {/* 1. UPCOMING EXAMS (Normal Scroll) */}
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2">
                 <CalendarDays className="w-4 h-4 text-white" />
                 <h3 className="font-bold text-white text-sm uppercase tracking-wide">Upcoming Exams</h3>
              </div>
              <div className="divide-y divide-gray-100">
                 {upcomingExams.map((exam, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                       <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 font-bold bg-white group-hover:border-blue-500 group-hover:text-blue-600">
                          {exam.logo}
                       </div>
                       <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{exam.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{exam.date}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* 2. NEWS WIDGET */}
           {tabs.news && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">Trending News</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {tabs.news.map((item, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-800 font-medium hover:text-blue-600 leading-snug line-clamp-2">{item.title}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3" /> {item.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
           )}

           {/* 3. AD BANNER 1 (Square) */}
           <div className="w-full aspect-square bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Advertisement</span>
              <span className="text-[10px] text-gray-300 mt-2">300x250 Square</span>
           </div>

           {/* 4. PYQ (Previous Year Questions) */}
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2">
                 <Download className="w-4 h-4 text-white" />
                 <h3 className="font-bold text-white text-sm uppercase tracking-wide">Previous Papers</h3>
              </div>
              <div className="p-4 space-y-3">
                 {[2025, 2024, 2023].map((year) => (
                    <div key={year} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-blue-50 group cursor-pointer transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded text-red-600">
                             <FileText className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700">{course.title} {year}</div>
                             <div className="text-[10px] text-gray-500">PDF • 2.4 MB</div>
                          </div>
                       </div>
                       <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                 ))}
                 <button className="w-full text-center text-xs font-bold text-blue-600 mt-2 hover:underline">View All Papers</button>
              </div>
           </div>

           {/* 5. ACCEPTING UNIVERSITIES (*** STICKY START ***) */}
           <div className="sticky top-32 z-30 space-y-6">
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                       <Building2 className="w-4 h-4" /> Participating Colleges
                    </h3>
                 </div>
                 <div className="p-5">
                    {/* Count Header */}
                    <div className="text-center mb-6 border-b border-gray-100 pb-6">
                       <div className="text-3xl font-bold text-gray-900 mb-1">
                          {tabs.participating_universities?.groups.reduce((acc, g) => acc + g.names.length, 0) || "250+"}
                       </div>
                       <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Universities Accepting Score</p>
                    </div>

                    {/* Top 5 Colleges List */}
                    <div className="mb-6">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Universities</div>
                        <div className="space-y-3">
                           {['University of Delhi', 'Banaras Hindu University', 'Jawaharlal Nehru University', 'Jamia Millia Islamia', 'Aligarh Muslim University'].map((uni, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm text-gray-700 group cursor-pointer hover:text-blue-600">
                                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {uni.substring(0, 1)}
                                 </div>
                                 <span className="font-medium truncate leading-tight">{uni}</span>
                              </div>
                           ))}
                        </div>
                    </div>
                    
                    <a href="#universities" className="block w-full bg-[#1e293b] text-white text-sm font-bold py-2.5 rounded-lg text-center hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                       View All Colleges
                    </a>
                 </div>
              </div>

              {/* 6. AD BANNER 2 */}
              <div className="w-full h-[300px] bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
                 <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Advertisement</span>
                 <span className="text-[10px] text-gray-300 mt-2">300x300 Vertical</span>
              </div>

              {/* 7. SIMILAR EXAMS */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="bg-[#1e293b] px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-white text-sm">Similar Exams</h3>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {['JEE Main 2026', 'NEET UG 2026', 'IPU CET 2026'].map((exam, i) => (
                       <div key={i} className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{exam}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                       </div>
                    ))}
                 </div>
              </div>

           </div> 
           {/* End Sticky Container */}

        </div>
      </div>
    </div>
  )
}