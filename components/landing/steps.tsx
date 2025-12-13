import { BookOpen, PenTool, TrendingUp } from "lucide-react";

export default function Steps() {
  return (
    <section className="py-24 px-4 bg-gray-50/50">
      <div className="container mx-auto">
        
        <div className="text-center mb-16">
          <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">May We Help You</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">
            3 Simple Steps for <span className="bg-black text-white px-2 rounded-lg transform -rotate-1 inline-block">Success</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Visual Cards (from screenshot) */}
          <div className="flex-1 w-full relative">
             <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20" />
             <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex gap-4 overflow-hidden">
                {/* Decorative Cards inside */}
                <div className="flex-1 bg-red-400 aspect-3/4 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center transform hover:scale-105 transition-transform shadow-lg shadow-red-200">
                    <BookOpen className="w-8 h-8 mb-2 opacity-80" />
                    <span className="font-bold text-sm">General English</span>
                </div>
                <div className="flex-1 bg-orange-400 aspect-3/4 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center transform -translate-y-4 shadow-lg shadow-orange-200">
                    <PenTool className="w-8 h-8 mb-2 opacity-80" />
                    <span className="font-bold text-sm">Domain Subjects</span>
                </div>
                <div className="flex-1 bg-teal-500 aspect-3/4 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center transform hover:scale-105 transition-transform shadow-lg shadow-teal-200">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                    <span className="font-bold text-sm">General Test</span>
                </div>
             </div>
          </div>

          {/* Right: Timeline Steps */}
          <div className="flex-1 space-y-10">
            {[
              { 
                step: "1", 
                title: "Appear for Mock Test", 
                desc: "We believe students need to take tests regularly to know where they stand in today's competitive environment.",
                color: "bg-orange-500"
              },
              { 
                step: "2", 
                title: "Practice Questions", 
                desc: "Our content team has executed thousands of interactive MCQs with detailed explanations to help you improve.",
                color: "bg-gray-700"
              },
              { 
                step: "3", 
                title: "Plan, Review and Execute", 
                desc: "We recommend spending 4-5 hours every week for extensive practice and observe considerable growth.",
                color: "bg-gray-500"
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 relative">
                 {/* Connecting Line */}
                 {i !== 2 && <div className="absolute left-6 top-14 bottom-10 w-0.5 border-l-2 border-dashed border-gray-200" />}
                 
                 <div className={`shrink-0 w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-xl shadow-md z-10`}>
                   {item.step}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{item.title}</h3>
                   <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                 </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}