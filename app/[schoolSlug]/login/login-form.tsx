'use client'

import { login } from '@/app/auth/actions';
import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    // Calls the existing Global Auth Action
    // When successful, the user is redirected to '/'
    // Your middleware/gatekeeper at '/' will then see their school_id
    // and redirect them back to `/[schoolSlug]/dashboard`
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
          Student Email
        </label>
        <input 
          name="email" 
          type="email" 
          required 
          className="w-full px-5 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm"
          placeholder="student@school.edu"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
          Password
        </label>
        <input 
          name="password" 
          type="password" 
          required 
          className="w-full px-5 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-center justify-center animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="group w-full bg-black text-white h-12 rounded-xl text-sm font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Access Portal
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}