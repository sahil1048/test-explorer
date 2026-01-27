'use client'

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  ChevronsUpDown, 
  X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils' // Ensure you have this utility or remove cn() usage

interface ListEditorProps {
  items: any[]
  onChange: (newItems: any[]) => void
  template: any
  fields: { key: string; label: string; type?: 'text' | 'textarea' | 'number' }[]
  title?: string
}

export default function ListEditor({ 
  items = [], 
  onChange, 
  template, 
  fields, 
  title 
}: ListEditorProps) {
  
  // State to track which items are expanded (for cleaner UI on long lists)
  // By default, we might want the last added item to be expanded
  const [expandedIndices, setExpandedIndices] = useState<number[]>([])

  // --- ACTIONS ---

  const addItem = () => {
    const newItems = [...items, { ...template }]
    onChange(newItems)
    // Automatically expand the new item
    setExpandedIndices([...expandedIndices, newItems.length - 1])
  }

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx)
    onChange(newItems)
    // Cleanup expanded state
    setExpandedIndices(expandedIndices.filter(i => i !== idx).map(i => i > idx ? i - 1 : i))
  }

  const updateItem = (idx: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    onChange(newItems)
  }

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === items.length - 1) return

    const newItems = [...items]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    
    // Swap elements
    const temp = newItems[idx]
    newItems[idx] = newItems[swapIdx]
    newItems[swapIdx] = temp

    onChange(newItems)
    
    // Handle expanding state logic for the move
    const newExpanded = [...expandedIndices]
    const isCurrentExpanded = newExpanded.includes(idx)
    const isSwapExpanded = newExpanded.includes(swapIdx)

    if (isCurrentExpanded && !isSwapExpanded) {
        setExpandedIndices(newExpanded.map(i => i === idx ? swapIdx : i))
    } else if (!isCurrentExpanded && isSwapExpanded) {
        setExpandedIndices(newExpanded.map(i => i === swapIdx ? idx : i))
    }
  }

  const duplicateItem = (idx: number) => {
    const itemToCopy = items[idx]
    const newItems = [...items]
    newItems.splice(idx + 1, 0, { ...itemToCopy })
    onChange(newItems)
    setExpandedIndices([...expandedIndices, idx + 1])
  }

  const toggleExpand = (idx: number) => {
    setExpandedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const expandAll = () => setExpandedIndices(items.map((_, i) => i))
  const collapseAll = () => setExpandedIndices([])

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-gray-50/50">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
           <h3 className="font-bold text-gray-800 text-lg">{title || "List Items"}</h3>
           <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
             {items.length}
           </span>
        </div>
        
        <div className="flex gap-2">
          {items.length > 0 && (
            <>
              <Button onClick={collapseAll} size="sm" variant="ghost" className="h-8 text-xs text-gray-500">
                Collapse All
              </Button>
              <Button onClick={expandAll} size="sm" variant="ghost" className="h-8 text-xs text-gray-500">
                Expand All
              </Button>
            </>
          )}
          <Button onClick={addItem} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus size={14} /> Add New
          </Button>
        </div>
      </div>

      {/* List Area */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const isExpanded = expandedIndices.includes(idx)
          // Try to find a meaningful title for the collapsed header
          const itemTitle = item[fields[0].key] || item[fields[1]?.key] || `Item ${idx + 1}`

          return (
            <div 
              key={idx} // Using Index is safe here because we handle moves carefully. Ideally use item.id if available.
              className={cn(
                "group bg-white border rounded-lg shadow-sm transition-all duration-200",
                isExpanded ? "ring-1 ring-blue-500/20 shadow-md" : "hover:border-blue-300"
              )}
            >
              {/* Item Header / Toolbar */}
              <div className="flex items-center gap-2 p-3 bg-white rounded-t-lg">
                
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 text-gray-400">
                  <button 
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button 
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Collapsible Trigger */}
                <div 
                    onClick={() => toggleExpand(idx)}
                    className="flex-1 cursor-pointer flex items-center gap-3"
                >
                    <span className="font-medium text-sm text-gray-700 truncate max-w-[200px] sm:max-w-md">
                        {itemTitle || <span className="text-gray-400 italic">Empty Item</span>}
                    </span>
                    {!isExpanded && (
                       <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                         Click to edit
                       </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                   <Button 
                    onClick={() => duplicateItem(idx)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-gray-400 hover:text-blue-600"
                    title="Duplicate"
                  >
                    <Copy size={13} />
                  </Button>
                  <Button 
                    onClick={() => removeItem(idx)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button
                    onClick={() => toggleExpand(idx)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                </div>
              </div>

              {/* Form Fields (Only rendered when expanded) */}
              {isExpanded && (
                <div className="p-4 border-t bg-gray-50/30 grid gap-4 animate-in slide-in-from-top-1 duration-200">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <Textarea 
                          value={item[field.key] || ''} 
                          onChange={(e) => updateItem(idx, field.key, e.target.value)}
                          className="min-h-[80px] bg-white focus:bg-white transition-colors"
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      ) : (
                        <Input 
                          type={field.type || 'text'}
                          value={item[field.key] || ''} 
                          onChange={(e) => updateItem(idx, field.key, e.target.value)}
                          className="bg-white focus:bg-white transition-colors"
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">This list is empty</p>
            <Button onClick={addItem} variant="outline" size="sm">
                <Plus size={14} className="mr-2"/> Add First Item
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}