import Link from "next/link";
import { Lock, Phone } from "lucide-react";

export default function AccessDenied({ subjectTitle }: { subjectTitle?: string }) {
  return (
    <div className=" flex flex-col items-center justify-center p-8 text-center bg-gray-50 h-[800px]">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-red-600" />
      </div>
      
      <h2 className="text-3xl font-black text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-gray-500 max-w-md mb-8 text-lg font-medium">
        You are not enrolled in <span className="text-gray-900 font-bold">{subjectTitle || "this subject"}</span>. 
        <br />
        Please contact your school administrator to request access.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          Back to Dashboard
        </Link>
        <Link 
          href="/contact" 
          className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Phone className="w-4 h-4" /> Contact Support
        </Link>
      </div>
    </div>
  );
}