import { Zap, Gift, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SchoolPromo({ schoolName }: { schoolName: string }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
          
          {/* Decorative Rings */}
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

          <div className="flex-1 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              <Zap className="w-3 h-3 fill-current" /> School Partnership
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              Premium Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                100% Sponsored
              </span>
            </h2>
            
            <p className="text-gray-500 text-lg font-medium max-w-lg mx-auto lg:mx-0">
              Exclusive benefit for students of <span className="text-gray-900 font-bold underline decoration-blue-500/30 underline-offset-4">{schoolName}</span>. 
              Get full access to all mock tests and materials.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-bold text-gray-600">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Syllabus</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Expert Analysis</div>
            </div>
          </div>

          {/* Price Card */}
          <div className="shrink-0 bg-slate-50 p-10 rounded-[2rem] border border-slate-100 text-center min-w-[280px] relative shadow-inner">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-md">
              School Discount Applied
            </div>

            <div className="space-y-2 mt-4">
              <div className="relative inline-block">
                {/* LARGE STRIKE-THROUGH PRICE */}
                <span className="text-3xl md:text-4xl font-black text-gray-400 opacity-50 tracking-tighter">
                  ₹1000
                </span>
                {/* THE RED BOLD LINE */}
                <div className="absolute top-1/2 left-0 w-full h-[4px] md:h-[6px] bg-red-500 -rotate-12 rounded-full shadow-sm"></div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-6xl md:text-7xl font-black text-blue-600 tracking-tighter drop-shadow-sm">
                  FREE
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">For your lifetime</span>
              </div>
            </div>

            <Link href="/exams/cuet" className="block mt-8 w-full">
  <button className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-3 group active:scale-95">
    Get Started Now
    <Gift className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
  </button>
</Link>
          </div>

        </div>
      </div>
    </section>
  );
}