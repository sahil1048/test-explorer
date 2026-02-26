"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { deleteSubjectAction, updateSubjectAction } from "@/app/dashboard/admin/subjects/actions"; // Ensure this path matches your project

export default function EditableSubjectItem({ sub }: { sub: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(sub.title);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Prevent saving if empty or unchanged
    if (!newTitle.trim() || newTitle === sub.title) {
      setIsEditing(false); 
      setNewTitle(sub.title);
      return;
    }

    const toastId = toast.loading("Updating subject...");
    
    try {
      // 2. Build FormData exactly as your action expects
      const formData = new FormData();
      formData.append("id", sub.id);
      formData.append("title", newTitle);
      
      // Pass the existing course_id so it doesn't get detached!
      if (sub.course_id) {
        formData.append("course_id", sub.course_id); 
      }

      // 3. Call your existing action
      await updateSubjectAction(formData);
      
      toast.success("Subject updated successfully", { id: toastId });
      setIsEditing(false);
    } catch (error: any) {
      // 4. Catch the thrown error from your action
      toast.error(error.message || "Failed to update subject", { id: toastId });
      setNewTitle(sub.title); // Revert back to original title on error
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      {/* Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2 w-full">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-white border border-blue-200 rounded px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button 
            type="submit" 
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setNewTitle(sub.title); // Revert to original
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* View Mode */
        <div className="flex items-center justify-between w-full group">
          <span className="text-gray-900 font-medium">{sub.title}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const toastId = toast.loading("Deleting subject...");
                try {
                  const formData = new FormData(e.currentTarget);
                  await deleteSubjectAction(formData);
                  toast.success("Subject deleted", { id: toastId });
                } catch (error: any) {
                  toast.error(error.message || "Failed to delete subject", { id: toastId });
                }
              }}
            >
              <input type="hidden" name="id" value={sub.id} />
              <button type="submit" className="p-1.5 text-gray-300 hover:text-red-600 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}