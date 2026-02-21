"use client";

import { X, Mail, Calendar, User, Building2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MessageDetailModal({ message, markAsReadAction }: any) {
  const router = useRouter();

  const close = () => router.push("/dashboard/admin/messages");

  // Check if the message is already read/resolved
  const isResolved = message.status === "read" || message.status === "resolved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 md:p-12">
          <button 
            onClick={close}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              {message.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none">{message.name}</h2>
              <p className="text-slate-500 font-medium mt-1">{message.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Received On</p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                {new Date(message.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Organization</p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Building2 className="w-4 h-4 text-purple-500" />
                {message.organizations?.name || "Global Support"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Message Detail</p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-600 leading-relaxed min-h-[150px] whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button
              disabled={isResolved}
              onClick={async () => {
                await markAsReadAction(message.id);
                close();
              }}
              className={`flex-1 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                isResolved 
                  ? "bg-emerald-50 text-emerald-500 cursor-not-allowed border border-emerald-100" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              }`}
            >
              <CheckCircle className="w-5 h-5" /> 
              {isResolved ? "Resolved" : "Mark as Resolved"}
            </button>
            <button 
              onClick={close}
              className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}