'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateExamDetails } from '../actions'
import { 
  Loader2, 
  Save, 
  ChevronLeft, 
  Layout, 
  Calendar, 
  CheckCircle, 
  Plus, 
  Trash2, 
  FileText,
  BookOpen,
  Library,
  CreditCard,
  Key,
  Trophy,
  Scissors,
  Users,
  GraduationCap,
  HelpCircle,
  Grid,
  FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import ListEditor from '@/components/admin/ListEditor'
import { Badge } from '@/components/ui/badge'

// 1. Enhanced Tab Configuration with Icons
const TABS = [
  { id: 'overview', label: 'Highlights', icon: Layout },
  { id: 'important-dates', label: 'Important Dates', icon: Calendar },
  { id: 'updates_section', label: 'Updates & Events', icon: Calendar },
  { id: 'eligibility', label: 'Eligibility', icon: CheckCircle },
  { id: 'application_process', label: 'Application', icon: FileCheck },
  { id: 'exam_pattern', label: 'Pattern', icon: Grid },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { id: 'preparation', label: 'Preparation', icon: Library },
  { id: 'admit_card', label: 'Admit Card', icon: CreditCard },
  { id: 'answer_key', label: 'Answer Key', icon: Key },
  { id: 'results', label: 'Result', icon: Trophy },
  { id: 'cutoffs', label: 'Cutoff', icon: Scissors },
  { id: 'counselling', label: 'Counselling', icon: Users },
  { id: 'participating_universities', label: 'Universities', icon: GraduationCap },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
]

  const StringListAdapter = ({ 
    items, 
    onChange, 
    label, 
    title 
  }: { 
    items: string[]; 
    onChange: (val: string[]) => void; 
    label?: string; 
    title?: string;
  }) => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <ListEditor
        title={title}
        items={items?.map((s) => ({ value: s })) || []}
        onChange={(newItems) => onChange(newItems.map((i: any) => i.value))}
        template={{ value: '' }}
        fields={[{ key: 'value', label: label || 'Description', type: 'textarea' }]}
      />
    </div>
  )
  
export default function ExamEditorPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // This state holds the entire 'details' JSON object
  const [details, setDetails] = useState<any>({ tabs: {} })
  const [courseTitle, setCourseTitle] = useState('')

  // 2. Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()
      
      if (data) {
        setCourseTitle(data.title)
        setDetails(data.details || { tabs: {} })
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  // 3. Save Handler
  const handleSave = async () => {
    setSaving(true)
    const result = await updateExamDetails(id as string, details)
    setSaving(false)
    if (result.success) toast.success('Exam details updated successfully!')
    else toast.error('Failed to save: ' + result.message)
  }

  // Helper to update state deeply
  const updateTab = (tabKey: string, newData: any) => {
    setDetails((prev: any) => ({
      ...prev,
      tabs: { ...prev.tabs, [tabKey]: newData }
    }))
  }

  // Helper for simple text fields inside a tab
  const updateTabText = (tabKey: string, field: string, value: string) => {
    setDetails((prev: any) => ({
      ...prev,
      tabs: { 
        ...prev.tabs, 
        [tabKey]: { ...prev.tabs?.[tabKey], [field]: value } 
      }
    }))
  }

  // Helper to adapt string[] to ListEditor's expected object format

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-sm text-gray-500 font-medium">Loading editor...</p>
    </div>
  )

  // 4. Content Renderer
  const renderTabContent = () => {
    const data = details.tabs || {}

    switch (activeTab) {
      case 'overview': 
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
              <Textarea 
                value={data.highlights_intro || ''} 
                onChange={(e) => setDetails({...details, tabs: {...data, highlights_intro: e.target.value}})} 
                rows={5}
                className="resize-none border-gray-200 focus:border-blue-500 transition-colors"
                placeholder="Write a brief introduction about the exam..."
              />
            </div>
            
            <div className="bg-white rounded-xl border shadow-sm">
              <ListEditor 
                title="Highlights Table"
                items={data.highlights || []} 
                template={{ label: '', value: '' }} 
                fields={[{ key: 'label', label: 'Particular' }, { key: 'value', label: 'Details' }]}
                onChange={(val) => setDetails({...details, tabs: {...data, highlights: val}})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">What's New Section</label>
              <Textarea 
                value={data.whats_new || ''} 
                onChange={(e) => setDetails({...details, tabs: {...data, whats_new: e.target.value}})} 
                rows={5}
                className="resize-none border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        )

      case 'important-dates':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Introduction Text</label>
              <Textarea 
                value={data.important_dates_intro || ''} 
                onChange={(e) => setDetails({...details, tabs: {...data, important_dates_intro: e.target.value}})} 
                rows={3}
              />
            </div>
            <div className="bg-white rounded-xl border shadow-sm">
              <ListEditor 
                title="Key Dates Table"
                items={data.important_dates || []} 
                template={{ event: '', date: '' }} 
                fields={[{ key: 'event', label: 'Event Name' }, { key: 'date', label: 'Date String' }]}
                onChange={(val) => setDetails({...details, tabs: {...data, important_dates: val}})}
              />
            </div>
          </div>
        )

      case 'updates_section':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Current Updates
              </h3>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <ListEditor 
                  items={data.updates_section?.current_events || []} 
                  template={{ event: '', date: '', status: 'Tentative' }}
                  fields={[
                    { key: 'event', label: 'Event Name' }, 
                    { key: 'date', label: 'Date / Deadline' },
                    { key: 'status', label: 'Status Tag (e.g. Live)' }
                  ]}
                  onChange={(val) => updateTabText('updates_section', 'current_events', val as any)}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Past Events
              </h3>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <ListEditor 
                  items={data.updates_section?.expired_events || []} 
                  template={{ event: '', date: '' }}
                  fields={[{ key: 'event', label: 'Event Name' }, { key: 'date', label: 'Date' }]}
                  onChange={(val) => updateTabText('updates_section', 'expired_events', val as any)}
                />
              </div>
            </div>
          </div>
        )

      case 'eligibility':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Section Title</label>
                  <Input 
                    value={data.eligibility?.title || ''} 
                    onChange={(e) => updateTabText('eligibility', 'title', e.target.value)} 
                    placeholder="e.g. Eligibility Criteria"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Introduction</label>
                  <Textarea 
                    value={data.eligibility?.intro || ''} 
                    onChange={(e) => updateTabText('eligibility', 'intro', e.target.value)} 
                    rows={1}
                    className="min-h-[42px]"
                  />
                </div>
             </div>
            
            <div className="bg-white rounded-xl border shadow-sm">
              <ListEditor 
                title="Eligibility Criteria Details"
                items={data.eligibility?.components || []} 
                template={{ label: '', text: '' }} 
                fields={[{ key: 'label', label: 'Criteria (e.g. Age)' }, { key: 'text', label: 'Description' }]}
                onChange={(val) => updateTabText('eligibility', 'components', val as any)}
              />
            </div>
          </div>
        )

      case 'faqs':
        return (
          <div className="bg-white rounded-xl border shadow-sm animate-in fade-in duration-500">
             <ListEditor 
                title="Frequently Asked Questions"
                items={data.faqs || []} 
                template={{ question: '', answer: '' }} 
                fields={[
                  { key: 'question', label: 'Question' }, 
                  { key: 'answer', label: 'Answer', type: 'textarea' }
                ]}
                onChange={(val) => setDetails({...details, tabs: {...data, faqs: val}})}
              />
          </div>
        )

        case 'application_process':
        const appData = data.application_process || {}
        
        const updateApp = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, application_process: { ...appData, [field]: value } }
          })
        }

        const updateCorrection = (field: string, value: any) => {
          updateApp('correction_window', { ...(appData.correction_window || {}), [field]: value })
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            
            {/* Steps Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="bg-blue-100 p-2 rounded-lg"><FileText className="text-blue-600 w-5 h-5"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Application Steps</h3>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Main Introduction</label>
                  <Textarea 
                    value={appData.intro || ''} 
                    onChange={(e) => updateApp('intro', e.target.value)} 
                    rows={3}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Steps Section Title</label>
                    <Input 
                      value={appData.steps_title || ''} 
                      onChange={(e) => updateApp('steps_title', e.target.value)} 
                      placeholder="e.g., Steps to Apply"
                    />
                  </div>
                   <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Steps Intro Text</label>
                    <Input 
                      value={appData.steps_intro || ''} 
                      onChange={(e) => updateApp('steps_intro', e.target.value)} 
                    />
                  </div>
                </div>

                <StringListAdapter 
                  title="List of Application Steps"
                  items={appData.steps}
                  onChange={(val) => updateApp('steps', val)}
                  label="Step Description"
                />
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="bg-purple-100 p-2 rounded-lg"><FileText className="text-purple-600 w-5 h-5"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Documents Required</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Documents Title</label>
                    <Input 
                      value={appData.documents_title || ''} 
                      onChange={(e) => updateApp('documents_title', e.target.value)} 
                    />
                  </div>
                   <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Documents Intro</label>
                    <Input 
                      value={appData.documents_intro || ''} 
                      onChange={(e) => updateApp('documents_intro', e.target.value)} 
                    />
                  </div>
              </div>

              <StringListAdapter 
                  title="List of Documents"
                  items={appData.documents_list}
                  onChange={(val) => updateApp('documents_list', val)}
                  label="Document Name"
              />

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                 <div className="space-y-4 mb-4">
                    <label className="text-sm font-semibold text-gray-700">Specification Table Title</label>
                    <Input 
                      value={appData.document_specs_title || ''} 
                      onChange={(e) => updateApp('document_specs_title', e.target.value)} 
                      placeholder="e.g., Document Specifications"
                      className="bg-white"
                    />
                  </div>
                  <div className="bg-white rounded-xl border shadow-sm">
                    <ListEditor 
                      title="Document Specifications Table"
                      items={appData.document_specs || []}
                      template={{ name: '', type: '', size: '' }}
                      fields={[
                        { key: 'name', label: 'Document' },
                        { key: 'type', label: 'Format (JPG/PDF)' },
                        { key: 'size', label: 'Size (e.g. 10-200KB)' },
                      ]}
                      onChange={(val) => updateApp('document_specs', val)}
                    />
                  </div>
              </div>
            </div>

            {/* Fees Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="bg-green-100 p-2 rounded-lg"><CreditCard className="text-green-600 w-5 h-5"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Application Fee Info</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Fee Title</label>
                    <Input 
                      value={appData.fee_title || ''} 
                      onChange={(e) => updateApp('fee_title', e.target.value)} 
                    />
                  </div>
                   <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Fee Intro/Note</label>
                    <Textarea 
                      value={appData.fee_intro || ''} 
                      onChange={(e) => updateApp('fee_intro', e.target.value)} 
                      rows={2}
                    />
                  </div>
              </div>
            </div>

            {/* Correction Window */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                   <Scissors className="w-5 h-5"/> Correction Window
                 </h3>
                 <Badge className="bg-blue-600">Advanced Config</Badge>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-blue-800">Overview/Intro</label>
                    <Textarea 
                      value={appData.correction_window?.intro || ''} 
                      onChange={(e) => updateCorrection('intro', e.target.value)} 
                      className="bg-white/80"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-blue-800">Date Range</label>
                    <Input 
                      value={appData.correction_window?.dates || ''} 
                      onChange={(e) => updateCorrection('dates', e.target.value)} 
                      placeholder="e.g., Dec 1-2, 2025"
                      className="bg-white/80"
                    />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-sm font-semibold text-blue-800">Steps Title</label>
                  <Input 
                    value={appData.correction_window?.steps_title || ''} 
                    onChange={(e) => updateCorrection('steps_title', e.target.value)}
                    className="bg-white/80" 
                  />
               </div>
               <StringListAdapter 
                  title="Correction Steps"
                  items={appData.correction_window?.steps}
                  onChange={(val) => updateCorrection('steps', val)}
                  label="Step Description"
              />

              <div className="space-y-6 pt-6 border-t border-blue-200">
                 <h4 className="font-bold text-blue-900">Editable Fields Logic</h4>
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-blue-800">Fields Intro</label>
                    <Textarea 
                      value={appData.correction_window?.fields_intro || ''} 
                      onChange={(e) => updateCorrection('fields_intro', e.target.value)} 
                      className="bg-white/80"
                    />
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                       <h5 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Group 1: Edit Any One</h5>
                       <Input 
                          placeholder="Title (e.g., Can edit only one of...)"
                          value={appData.correction_window?.editable_any_one?.title || ''}
                          onChange={(e) => updateCorrection('editable_any_one', { ...appData.correction_window?.editable_any_one, title: e.target.value })}
                       />
                       <StringListAdapter 
                          items={appData.correction_window?.editable_any_one?.fields}
                          onChange={(val) => updateCorrection('editable_any_one', { ...appData.correction_window?.editable_any_one, fields: val })}
                          label="Field Name"
                       />
                    </div>

                    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                       <h5 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Group 2: Edit All</h5>
                       <Input 
                          placeholder="Title (e.g., Can edit all...)"
                          value={appData.correction_window?.editable_all?.title || ''}
                          onChange={(e) => updateCorrection('editable_all', { ...appData.correction_window?.editable_all, title: e.target.value })}
                       />
                       <StringListAdapter 
                          items={appData.correction_window?.editable_all?.fields}
                          onChange={(val) => updateCorrection('editable_all', { ...appData.correction_window?.editable_all, fields: val })}
                          label="Field Name"
                       />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )

        case 'exam_pattern':
        const patternData = data.exam_pattern || {}
        const markingData = data.marking_scheme || {}

        const updatePattern = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, exam_pattern: { ...patternData, [field]: value } }
          })
        }

        const updateMarking = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, marking_scheme: { ...markingData, [field]: value } }
          })
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* EXAM STRUCTURE */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-blue-100 p-2 rounded-lg"><Grid className="text-blue-600 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Exam Structure</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Pattern Introduction</label>
                <Textarea 
                  value={patternData.intro || ''} 
                  onChange={(e) => updatePattern('intro', e.target.value)} 
                  placeholder="e.g., The exam consists of two papers..."
                  rows={4}
                />
              </div>

              <div className="bg-white rounded-xl border shadow-sm">
                <ListEditor 
                  title="Paper/Section Breakdown"
                  items={patternData.sections || []}
                  template={{ section: '', questions: '', duration: '' }}
                  fields={[
                    { key: 'section', label: 'Section Name (e.g. Paper 1)' },
                    { key: 'questions', label: 'No. of Questions' },
                    { key: 'duration', label: 'Duration (e.g. 3 Hours)' }
                  ]}
                  onChange={(val) => updatePattern('sections', val)}
                />
              </div>
            </div>

            {/* MARKING SCHEME */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="text-green-600 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Marking Scheme</h3>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Scheme Introduction</label>
                <Textarea 
                  value={markingData.intro || ''} 
                  onChange={(e) => updateMarking('intro', e.target.value)} 
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                 <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2">
                    <label className="text-xs font-bold text-green-700 uppercase tracking-wide">Correct Answer</label>
                    <Input 
                      value={markingData.correct || ''} 
                      onChange={(e) => updateMarking('correct', e.target.value)} 
                      placeholder="+4"
                      className="font-mono text-lg bg-white"
                    />
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                    <label className="text-xs font-bold text-red-700 uppercase tracking-wide">Incorrect Answer</label>
                    <Input 
                      value={markingData.incorrect || ''} 
                      onChange={(e) => updateMarking('incorrect', e.target.value)} 
                      placeholder="-1"
                      className="font-mono text-lg bg-white"
                    />
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Unattempted</label>
                    <Input 
                      value={markingData.unattempted || ''} 
                      onChange={(e) => updateMarking('unattempted', e.target.value)} 
                      placeholder="0"
                      className="font-mono text-lg bg-white"
                    />
                 </div>
              </div>

              <StringListAdapter 
                title="Additional Marking Rules"
                items={markingData.rules}
                onChange={(val) => updateMarking('rules', val)}
                label="Rule Description"
              />
            </div>
          </div>
        )

        case 'syllabus':
        const syllabusList = data.syllabus || []

        const addSubject = () => {
          const newSyllabus = [...syllabusList, { subject: '', topics: [] }]
          setDetails({ ...details, tabs: { ...data, syllabus: newSyllabus } })
        }

        const removeSubject = (index: number) => {
          const newSyllabus = syllabusList.filter((_ : any, i: number) => i !== index)
          setDetails({ ...details, tabs: { ...data, syllabus: newSyllabus } })
        }

        const updateSubject = (index: number, field: string, value: any) => {
          const newSyllabus = [...syllabusList]
          newSyllabus[index] = { ...newSyllabus[index], [field]: value }
          setDetails({ ...details, tabs: { ...data, syllabus: newSyllabus } })
        }

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Syllabus Introduction</label>
              <Textarea 
                value={data.syllabus_intro || ''} 
                onChange={(e) => setDetails({ ...details, tabs: { ...data, syllabus_intro: e.target.value } })}
                rows={5}
                placeholder="Overview of the syllabus..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl text-sm text-yellow-800 flex items-start gap-3">
               <div className="bg-yellow-100 p-1.5 rounded-full shrink-0"><HelpCircle className="w-4 h-4 text-yellow-700"/></div>
               <div>
                  <strong>Formatting Note:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-yellow-800/90">
                      <li>Use <strong>&quot;Section 1&quot;</strong> in subject name for Language sections.</li>
                      <li>Use <strong>&quot;Section 3&quot;</strong> in subject name for General Test sections.</li>
                      <li>All other subjects will appear in the Domain Subjects table.</li>
                  </ul>
               </div>
            </div>

            <div className="space-y-6">
              {syllabusList.map((item: any, index: number) => (
                <div key={index} className="bg-white border rounded-xl p-6 shadow-sm relative group transition-all hover:shadow-md hover:border-blue-200">
                   <div className="absolute right-4 top-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeSubject(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                      >
                         <Trash2 size={16} />
                      </Button>
                   </div>

                   <div className="grid gap-6">
                      <div className="space-y-3 max-w-lg">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subject / Section Name</label>
                         <Input 
                            value={item.subject || ''}
                            onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                            placeholder="e.g. Physics or Section 1: Language"
                            className="font-medium text-lg"
                         />
                      </div>

                      <div className="bg-gray-50/50 p-1 rounded-xl">
                         <StringListAdapter 
                            title="Topics & Chapters"
                            label="Topic Name"
                            items={item.topics || []}
                            onChange={(val) => updateSubject(index, 'topics', val)}
                         />
                      </div>
                   </div>
                </div>
              ))}

              <Button 
                onClick={addSubject} 
                variant="outline" 
                className="w-full py-10 border-dashed border-2 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all text-gray-500 hover:text-blue-600"
              >
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Plus size={24} />
                </div>
                <span className="font-semibold text-lg">Add New Subject</span>
              </Button>
            </div>
          </div>
        )

        case 'preparation':
        const prepData = data.preparation || {}
        const booksData = data.books || []

        const updatePrep = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, preparation: { ...prepData, [field]: value } }
          })
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-yellow-100 p-2 rounded-lg"><Library className="text-yellow-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Preparation Strategy</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
                <Textarea 
                  value={prepData.intro || ''} 
                  onChange={(e) => updatePrep('intro', e.target.value)} 
                  rows={4}
                  placeholder="e.g. JEE Mains is one of the toughest exams..."
                />
              </div>

              <div className="bg-white rounded-xl border shadow-sm">
                 <StringListAdapter 
                   title="Preparation Tips (Bulleted List)"
                   label="Tip Content"
                   items={prepData.tips || []}
                   onChange={(val) => updatePrep('tips', val)}
                 />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-blue-100 p-2 rounded-lg"><BookOpen className="text-blue-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Recommended Books</h3>
              </div>
              
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <ListEditor 
                  title="Books List Table"
                  items={booksData}
                  template={{ name: '', author: '' }}
                  fields={[
                    { key: 'name', label: 'Book Name' },
                    { key: 'author', label: 'Author / Publisher' }
                  ]}
                  onChange={(val) => setDetails({...details, tabs: {...data, books: val}})}
                />
              </div>
            </div>
          </div>
        )

        case 'admit_card':
        const admitCardData = data.admit_card || {}

        const updateAdmitCard = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, admit_card: { ...admitCardData, [field]: value } }
          })
        }

        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            
            {/* OVERVIEW */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
              <Textarea 
                value={admitCardData.intro || ''} 
                onChange={(e) => updateAdmitCard('intro', e.target.value)} 
                rows={4}
                placeholder="e.g., The NTA has released the admit card..."
              />
            </div>

            {/* DOWNLOAD PROCESS */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Download Process</h3>
                <Badge>Step 1</Badge>
              </div>
              
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700">Section Title</label>
                 <Input 
                   value={admitCardData.download_title || ''} 
                   onChange={(e) => updateAdmitCard('download_title', e.target.value)} 
                   placeholder="Default: How to Download Admit Card?"
                 />
              </div>

              <StringListAdapter 
                title="Step-by-Step Instructions"
                label="Step Description"
                items={admitCardData.download_steps || []}
                onChange={(val) => updateAdmitCard('download_steps', val)}
              />
            </div>

            {/* CHECKLIST */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Card Details & Corrections</h3>
                <Badge variant="outline">Step 2</Badge>
              </div>

              <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700">Details Section Title</label>
                 <Input 
                   value={admitCardData.details_title || ''} 
                   onChange={(e) => updateAdmitCard('details_title', e.target.value)} 
                   placeholder="Default: Details Mentioned On The Admit Card"
                 />
              </div>

              <StringListAdapter 
                 title="Details Checklist (Bulleted List)"
                 label="Detail Item (e.g. Roll Number)"
                 items={admitCardData.details_list || []}
                 onChange={(val) => updateAdmitCard('details_list', val)}
              />

              <div className="bg-red-50 p-6 rounded-xl border border-red-100 space-y-3">
                 <label className="text-sm font-bold text-red-800 flex items-center gap-2">
                    <Trash2 className="w-4 h-4"/> Correction Note / Error Handling
                 </label>
                 <Textarea 
                    value={admitCardData.correction_note || ''} 
                    onChange={(e) => updateAdmitCard('correction_note', e.target.value)} 
                    rows={3}
                    placeholder="e.g. In case of any discrepancy..."
                    className="bg-white border-red-100 focus:border-red-300"
                 />
              </div>
            </div>
          </div>
        )

        case 'answer_key':
        const keyData = data.answer_key || {}

        const updateKey = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, answer_key: { ...keyData, [field]: value } }
          })
        }

        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
              <Textarea 
                value={keyData.intro || ''} 
                onChange={(e) => updateKey('intro', e.target.value)} 
                rows={4}
              />
            </div>

            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg"><Key className="text-blue-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Access Instructions</h3>
              </div>
              
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700">Section Title</label>
                 <Input 
                   value={keyData.access_steps_title || ''} 
                   onChange={(e) => updateKey('access_steps_title', e.target.value)} 
                 />
              </div>

              <StringListAdapter 
                title="Access Steps (Bulleted List)"
                label="Step Description"
                items={keyData.access_steps || []}
                onChange={(val) => updateKey('access_steps', val)}
              />
            </div>

            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-lg"><CheckCircle className="text-orange-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Challenge Process</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Challenge Title</label>
                    <Input 
                      value={keyData.challenge_title || ''} 
                      onChange={(e) => updateKey('challenge_title', e.target.value)} 
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Challenge Fee Text</label>
                    <Input 
                      value={keyData.challenge_fee || ''} 
                      onChange={(e) => updateKey('challenge_fee', e.target.value)} 
                      placeholder="e.g. INR 200 per question"
                      className="font-mono text-sm"
                    />
                 </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                 <StringListAdapter 
                   title="Challenge Steps (Bulleted List)"
                   label="Step Description"
                   items={keyData.challenge_steps || []}
                   onChange={(val) => updateKey('challenge_steps', val)}
                 />
              </div>
            </div>
          </div>
        )

        case 'results':
        const resultsData = data.results || {}

        const updateResults = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, results: { ...resultsData, [field]: value } }
          })
        }

        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Overview Text</label>
              <Textarea 
                value={resultsData.intro || ''} 
                onChange={(e) => updateResults('intro', e.target.value)} 
                rows={4}
              />
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h3 className="font-bold text-gray-900 text-lg">Checking Procedure</h3>
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700">Section Title</label>
                 <Input 
                   value={resultsData.check_steps_title || ''} 
                   onChange={(e) => updateResults('check_steps_title', e.target.value)} 
                 />
              </div>
              <StringListAdapter 
                title="Step-by-Step Instructions"
                label="Step Description"
                items={resultsData.check_steps || []}
                onChange={(val) => updateResults('check_steps', val)}
              />
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h3 className="font-bold text-gray-900 text-lg">Scorecard Details</h3>
              <div className="grid gap-4">
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Details Section Title</label>
                    <Input 
                      value={resultsData.details_printed_title || ''} 
                      onChange={(e) => updateResults('details_printed_title', e.target.value)} 
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Details Intro Text</label>
                    <Textarea 
                      value={resultsData.details_printed_intro || ''} 
                      onChange={(e) => updateResults('details_printed_intro', e.target.value)} 
                      rows={2}
                    />
                 </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                 <StringListAdapter 
                   title="List of Printed Details"
                   label="Detail Item (e.g. Percentile Score)"
                   items={resultsData.details_list || []}
                   onChange={(val) => updateResults('details_list', val)}
                 />
              </div>
            </div>
          </div>
        )

        case 'cutoffs':
        const cutoffData = data.cutoffs || {}

        const updateCutoff = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, cutoffs: { ...cutoffData, [field]: value } }
          })
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-red-100 p-2 rounded-lg"><Scissors className="text-red-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Cutoff Overview</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
                <Textarea 
                  value={cutoffData.intro || ''} 
                  onChange={(e) => updateCutoff('intro', e.target.value)} 
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Factors Affecting Cutoff (Optional)</label>
                <Textarea 
                  value={cutoffData.factors_text || ''} 
                  onChange={(e) => updateCutoff('factors_text', e.target.value)} 
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-blue-100 p-2 rounded-lg"><FileText className="text-blue-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Cutoff Data Table</h3>
              </div>

              <div className="space-y-3">
                 <label className="text-sm font-semibold text-gray-700">Table Title</label>
                 <Input 
                   value={cutoffData.table_title || ''} 
                   onChange={(e) => updateCutoff('table_title', e.target.value)} 
                 />
              </div>
              
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <ListEditor 
                  title="Cutoff Rows"
                  items={cutoffData.data || []}
                  template={{ college: '', programme: '', category: 'General', rank: '', score: '' }}
                  fields={[
                    { key: 'college', label: 'College / Institute' },
                    { key: 'programme', label: 'Course / Branch' },
                    { key: 'category', label: 'Category' },
                    { key: 'rank', label: 'Rank Range' },
                    { key: 'score', label: 'Score / Percentile' },
                  ]}
                  onChange={(val) => updateCutoff('data', val)}
                />
              </div>
            </div>
          </div>
        )

        case 'counselling':
        const counsellingData = data.counselling || {}

        const updateCounselling = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, counselling: { ...counsellingData, [field]: value } }
          })
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-blue-100 p-2 rounded-lg"><Users className="text-blue-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Process Overview</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
                <Textarea 
                  value={counsellingData.intro || ''} 
                  onChange={(e) => updateCounselling('intro', e.target.value)} 
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-purple-100 p-2 rounded-lg"><FileText className="text-purple-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Required Documents</h3>
              </div>

              <div className="grid gap-6">
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Section Title</label>
                    <Input 
                      value={counsellingData.documents_title || ''} 
                      onChange={(e) => updateCounselling('documents_title', e.target.value)} 
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">List Introduction</label>
                    <Input 
                      value={counsellingData.documents_intro || ''} 
                      onChange={(e) => updateCounselling('documents_intro', e.target.value)} 
                    />
                 </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                 <StringListAdapter 
                   title="Documents Checklist (Bulleted List)"
                   label="Document Name"
                   items={counsellingData.documents_list || []}
                   onChange={(val) => updateCounselling('documents_list', val)}
                 />
              </div>
            </div>
          </div>
        )

        case 'participating_universities':
        const uniData = data.participating_universities || {}
        const groups = uniData.groups || []

        const updateUni = (field: string, value: any) => {
          setDetails({
            ...details,
            tabs: { ...data, participating_universities: { ...uniData, [field]: value } }
          })
        }

        const addGroup = () => {
          const newGroups = [...groups, { type: '', names: [] }]
          updateUni('groups', newGroups)
        }

        const removeGroup = (index: number) => {
          const newGroups = groups.filter((_: any, i: number) => i !== index)
          updateUni('groups', newGroups)
        }

        const updateGroup = (index: number, field: string, value: any) => {
          const newGroups = [...groups]
          newGroups[index] = { ...newGroups[index], [field]: value }
          updateUni('groups', newGroups)
        }

        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b">
                 <div className="bg-blue-100 p-2 rounded-lg"><GraduationCap className="text-blue-700 w-5 h-5"/></div>
                 <h3 className="font-bold text-gray-900 text-lg">Participation Overview</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Introductory Paragraph</label>
                <Textarea 
                  value={uniData.intro || ''} 
                  onChange={(e) => updateUni('intro', e.target.value)} 
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b">
                 <h3 className="font-bold text-gray-900 text-lg">University Groups</h3>
                 <Badge variant="secondary">{groups.length} Groups</Badge>
              </div>

              <div className="space-y-8">
                {groups.map((group: any, index: number) => (
                   <div key={index} className="bg-white border rounded-xl p-6 shadow-sm relative group hover:shadow-md transition-all">
                      <div className="absolute right-4 top-4">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => removeGroup(index)}
                           className="text-red-500 hover:bg-red-50"
                         >
                            <Trash2 size={16} />
                         </Button>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-3 max-w-md">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                               Group Type / Title
                            </label>
                            <Input 
                               value={group.type || ''}
                               onChange={(e) => updateGroup(index, 'type', e.target.value)}
                               placeholder="e.g. Central Universities"
                               className="font-bold text-lg"
                            />
                         </div>

                         <div className="bg-gray-50 p-2 rounded-xl border">
                            <StringListAdapter 
                               title="List of Universities"
                               label="University Name"
                               items={group.names || []}
                               onChange={(val) => updateGroup(index, 'names', val)}
                            />
                         </div>
                      </div>
                   </div>
                ))}

                <Button 
                  onClick={addGroup} 
                  variant="outline" 
                  className="w-full py-12 border-dashed border-2 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all text-gray-500 hover:text-blue-600"
                >
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <Plus size={28} />
                  </div>
                  <span className="font-semibold text-lg">Add New University Group</span>
                </Button>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-4 border-2 border-dashed rounded-xl m-8">
            <Layout className="w-12 h-12 opacity-20" />
            <p className="font-medium">Select a tab from the sidebar to start editing.</p>
          </div>
        )
    }
  }

  // 5. Layout Structure
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{courseTitle || 'Loading...'}</h1>
            <p className="text-xs text-gray-500 font-medium">Exam Landing Page Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex text-xs text-gray-400 font-medium px-3">
             {saving ? 'Saving changes...' : 'Unsaved changes are lost on refresh'}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Changes
          </Button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Fixed Sidebar */}
        <aside className="w-72 bg-white border-r flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10">
          <div className="p-4 space-y-1">
            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sections</p>
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                  />
                  {tab.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
               <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-3">
                 {TABS.find(t => t.id === activeTab)?.icon && (() => {
                    const Icon = TABS.find(t => t.id === activeTab)!.icon
                    return <Icon className="w-8 h-8 text-gray-400" />
                 })()}
                 {TABS.find(t => t.id === activeTab)?.label}
               </h2>
               <Badge variant="secondary" className="px-3 py-1">
                 {activeTab.replace('_', ' ')}
               </Badge>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border p-8 min-h-[600px] ring-1 ring-gray-950/5">
              {renderTabContent()}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400 pb-8">
              All changes are local until you click "Save Changes".
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}