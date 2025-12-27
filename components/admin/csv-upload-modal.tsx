'use client'

import { useState } from 'react'
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadQuestionBankAction } from '@/app/dashboard/admin/question-uploads/actions' 

export default function CsvUploadModal({ 
  subjectId, 
  subjectTitle 
}: { 
  subjectId: string, 
  subjectTitle: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null) // New state for file name

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    } else {
      setFileName(null)
    }
  }

  const handleUpload = async (formData: FormData) => {
    setLoading(true)
    try {
      // Append subject_id explicitly since it's passed as prop
      formData.append('subject_id', subjectId)
      
      await uploadQuestionBankAction(formData)
      
      toast.success("Questions added to pool successfully!")
      setIsOpen(false)
      setFileName(null) // Reset on success
    } catch (error) {
      toast.error("Upload failed. Please check your CSV format.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
      >
        <Upload className="w-4 h-4" /> Upload Questions
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => { setIsOpen(false); setFileName(null); }} 
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Upload CSV</h2>
              <p className="text-gray-500 text-sm mt-1">
                Adding questions to: <span className="font-bold text-black">{subjectTitle}</span>
              </p>
            </div>

            {/* Form */}
            <form action={handleUpload} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Batch Title</label>
                <input 
                  name="title" 
                  placeholder="e.g. Organic Chemistry - Batch 1"
                  defaultValue={`Batch - ${new Date().toLocaleDateString()}`}
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  name="description" 
                  placeholder="Notes about this batch..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">CSV File</label>
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer relative group ${fileName ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-400'}`}>
                  
                  {/* Dynamic Visual Feedback */}
                  {fileName ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      <span className="text-xs font-bold text-green-700 text-center break-all px-4">{fileName}</span>
                      <span className="text-[10px] text-green-600 mt-1">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-blue-400" />
                      <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500">Click to browse CSV</span>
                    </>
                  )}
                  
                  <input 
                    type="file" 
                    name="csv_file" 
                    accept=".csv"
                    required 
                    onChange={handleFileChange} // Capture file selection
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                  <strong>Columns:</strong> description, question, option_a, option_b, option_c, option_d, correct_option, explanation
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload & Process"}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  )
}