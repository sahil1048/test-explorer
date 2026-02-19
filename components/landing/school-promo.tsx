import { Zap, Gift } from "lucide-react";

export default function SchoolPromo({ schoolName }: { schoolName: string }) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto relative group">
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-white border border-gray-100 rounded-[2rem] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
          
          {/* Background Pattern Decor */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100">
              <Zap className="w-3 h-3 fill-current" /> Exclusive School Benefit
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Special Access for <br />
              <span className="text-blue-600">{schoolName}</span> Students
            </h2>
            
            <p className="text-gray-500 font-medium max-w-md">
              Your institution has partnered with us to provide premium course access at no cost to you.
            </p>
          </div>

          <div className="shrink-0 bg-gray-50 p-8 rounded-[1.5rem] border border-gray-100 text-center min-w-[240px] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase italic">
              Limited Time
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 line-through text-lg font-bold">₹1000</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">FREE</span>
              </div>
            </div>

            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
              Claim Access
              <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}