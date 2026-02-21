"use client";

import { useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          Send Inquiry
          <Send className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

export default function ContactForm({ 
  action, 
  placeholder,
}: { 
  action: (formData: FormData) => Promise<void>;
  placeholder: string;
}) {
  return (
    <form action={action} className="space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
          <input name="firstName" type="text" required placeholder="John" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
          <input name="lastName" type="text" required placeholder="Doe" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
        <input name="email" type="email" required placeholder="john@example.com" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-900" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
        <textarea name="message" required placeholder={placeholder} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all h-40 resize-none font-medium text-slate-900 shadow-inner" />
      </div>

      <SubmitButton />
    </form>
  );
}