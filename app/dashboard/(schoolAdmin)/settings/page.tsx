'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SchoolSettings() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // In a real app, fetch these initial values via a useEffect or pass them as props
  const [formData, setFormData] = useState({
    welcome_message: '',
    // Files would be handled via standard file input logic
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('schools')
      .update({ 
        welcome_message: formData.welcome_message,
        // Update images here after uploading to Supabase Storage
      })
      // RLS Policy ensures they can only update THEIR school id
      .eq('id', 'YOUR_SCHOOL_ID_FROM_AUTH_CONTEXT'); 

    if (error) alert('Error updating settings');
    else alert('School Front Page Updated!');
    
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">School Branding Settings</h1>
      
      <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
        
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Preview</span>
            </div>
            <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
        </div>

        {/* Welcome Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
          <textarea 
            rows={4}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            placeholder="Welcome to DPS Online Exam Portal..."
            value={formData.welcome_message}
            onChange={(e) => setFormData({...formData, welcome_message: e.target.value})}
          />
          <p className="mt-1 text-sm text-gray-500">This text appears on your custom login page.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}