'use client'

import { useState } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileSpreadsheet, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  X, 
  Eye 
} from 'lucide-react'
import { uploadRankDataAction, deleteRankDataAction } from '@/app/dashboard/admin/rank-prediction/actions'
import { toast } from 'sonner'

export default function RankUploader({ streams }: { streams: any[] }) {
  const [openStreams, setOpenStreams] = useState<Record<string, boolean>>({})
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  
  // File & Preview State
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)

  const toggleStream = (id: string) => setOpenStreams(p => ({ ...p, [id]: !p[id] }))

  // --- FILE HANDLING ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Generate Preview
      const text = await selectedFile.text()
      const rows = text.split('\n').map(row => row.split(',')).filter(r => r.length > 1).slice(0, 6) 
      setPreviewData(rows)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewData([])
  }

  // --- ACTIONS ---
  async function handleUpload(formData: FormData) {
    if (!file) {
      toast.error("Please select a CSV file first.")
      return
    }

    // ✅ FIX: Manually append the file from state, 
    // because the input might be hidden in the DOM
    formData.set('csv_file', file) 

    setLoading(true)
    try {
      const res = await uploadRankDataAction(formData)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Success! Uploaded ${res.count} rank ranges.`)
        setSelectedCourse(null)
        clearFile()
      }
    } catch (e) {
      toast.error("Upload failed due to network error.")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(courseId: string) {
    if(!confirm("Are you sure? This will delete the rank logic for this entire course.")) return
    
    setLoading(true)
    const res = await deleteRankDataAction(courseId)
    setLoading(false)
    
    if (res.success) toast.success("Rank data removed.")
    else toast.error(res.error)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-20">
      
      {/* LEFT: Hierarchy Tree */}
      <div className="w-full lg:max-w-2xl space-y-4">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleStream(stream.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                 {openStreams[stream.id] ? <ChevronDown className="w-5 h-5 text-gray-400"/> : <ChevronRight className="w-5 h-5 text-gray-400"/>}
                 <span className="text-lg font-bold text-gray-900">{stream.title}</span>
              </div>
            </button>

            {openStreams[stream.id] && (
              <div className="bg-gray-50/50 p-4 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                 {stream.courses?.map((course: any) => {
                    const hasData = course.exam_rank_predictions?.[0]?.count > 0

                    return (
                      <div key={course.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                               <Folder className="w-5 h-5" />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900">{course.title}</h4>
                               <p className="text-xs text-gray-500 font-medium">Exam / Course Level</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-2">
                            {hasData ? (
                              <>
                                <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                                  <CheckCircle className="w-3.5 h-3.5" /> UPLOADED
                                </span>
                                <button 
                                  onClick={() => handleDelete(course.id)}
                                  disabled={loading}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Data"
                                >
                                  {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => { setSelectedCourse(course); clearFile(); }}
                                className="flex items-center gap-2 text-xs font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                              >
                                <Upload className="w-3.5 h-3.5" /> Upload CSV
                              </button>
                            )}
                         </div>
                      </div>
                    )
                 })}
                 
                 {(!stream.courses || stream.courses.length === 0) && (
                    <div className="text-sm text-gray-400 italic pl-2 py-2">No exams/courses found in this stream.</div>
                 )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT: Upload Panel (Sticky) */}
      {selectedCourse && (
        <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-3xl p-6 h-fit sticky top-8 shadow-2xl animate-in slide-in-from-right-8 duration-300 z-10">
           
           {/* Header */}
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-black text-white rounded-xl shadow-lg">
                   <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-gray-900 leading-tight">Upload Config</h3>
                   <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{selectedCourse.title}</p>
                </div>
             </div>
             <button onClick={() => !loading && setSelectedCourse(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
               <X className="w-5 h-5" />
             </button>
           </div>

           {/* Preview / Instructions */}
           {!file ? (
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <h4 className="font-bold text-blue-900 text-xs uppercase mb-2 flex items-center gap-2">
                   <CheckCircle className="w-3 h-3" /> Required CSV Headers
                </h4>
                <code className="block text-[10px] bg-white p-3 rounded-lg border border-blue-100 text-gray-600 font-mono leading-relaxed">
                  min_score, max_score, rank, percentile<br/>
                  <span className="text-gray-400">Example:</span><br/>
                  0, 50, 50000+, 40-50<br/>
                  51, 100, 10000-20000, 80-85
                </code>
             </div>
           ) : (
             <div className="mb-6">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                   <Eye className="w-3 h-3" /> File Preview
                 </h4>
                 <button onClick={clearFile} disabled={loading} className="text-[10px] text-red-500 font-bold hover:underline disabled:opacity-50">Remove File</button>
               </div>
               <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 overflow-x-auto">
                 <table className="w-full text-[10px] text-left">
                   <thead>
                     <tr className="border-b border-gray-200 text-gray-400">
                       {previewData[0]?.map((h, i) => <th key={i} className="p-1 font-bold">{h}</th>)}
                     </tr>
                   </thead>
                   <tbody>
                     {previewData.slice(1).map((row, i) => (
                       <tr key={i} className="border-b border-gray-100 last:border-0">
                         {row.map((cell, j) => <td key={j} className="p-1 text-gray-700 truncate max-w-[60px]">{cell}</td>)}
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {previewData.length > 5 && <div className="text-[10px] text-gray-400 text-center mt-2 italic">... and more rows</div>}
               </div>
             </div>
           )}

           <form action={handleUpload} className="space-y-4">
              <input type="hidden" name="course_id" value={selectedCourse.id} />
              
              {/* File Input Area - Hidden when file is selected but kept in state */}
              {!file && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer relative group">
                   <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors mb-2" />
                   <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900">Click to select CSV file</span>
                   <input type="file" accept=".csv" required onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                 <button 
                   type="button"
                   onClick={() => { setSelectedCourse(null); clearFile(); }}
                   disabled={loading}
                   className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors text-sm"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={loading || !file}
                   className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                 >
                   {loading ? (
                     <>
                       <Loader2 className="w-4 h-4 animate-spin"/> Processing...
                     </>
                   ) : (
                     <>
                       <Upload className="w-4 h-4" /> Upload Data
                     </>
                   )}
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  )
}