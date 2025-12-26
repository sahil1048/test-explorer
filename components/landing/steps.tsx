import { BookOpen, MonitorPlay, BarChart, Award } from "lucide-react";

export default function Steps() {
  // Data for the 4 Steps (Right Side)
  const steps = [
    { 
      step: "1", 
      title: "Choose Your Exam", 
      desc: "Select the entrance exam you’re preparing for.",
      color: "bg-blue-600",
      icon: <BookOpen className="w-5 h-5" />
    },
    { 
      step: "2", 
      title: "Take Mock Test", 
      desc: "Attempt the test in real exam-like environment with timer.",
      color: "bg-orange-500",
      icon: <MonitorPlay className="w-5 h-5" />
    },
    { 
      step: "3", 
      title: "Get Instant Results", 
      desc: "View score, accuracy, time taken & percentile instantly.",
      color: "bg-teal-500",
      icon: <BarChart className="w-5 h-5" />
    },
    { 
      step: "4", 
      title: "Rank Predictor", 
      desc: "Know Your Expected Rank Before the Actual Result.",
      color: "bg-purple-600",
      icon: <Award className="w-5 h-5" />
    }
  ];

  // Data for the 4 Visual Cards (Left Side)
  // We use slightly different styles/transforms to create the 'wave' effect
  const cards = [
    {
      title: "Select Exam",
      icon: BookOpen,
      bg: "bg-blue-500",
      shadow: "shadow-blue-200",
      transform: "translate-y-0" 
    },
    {
      title: "Mock Tests",
      icon: MonitorPlay,
      bg: "bg-orange-500",
      shadow: "shadow-orange-200",
      transform: "-translate-y-4" // Staggered Up
    },
    {
      title: "Analysis",
      icon: BarChart,
      bg: "bg-teal-500",
      shadow: "shadow-teal-200",
      transform: "translate-y-0"
    },
    {
      title: "Rankings",
      icon: Award,
      bg: "bg-purple-500",
      shadow: "shadow-purple-200",
      transform: "-translate-y-4" // Staggered Up
    }
  ];

  return (
    <section className="py-24 px-4 bg-gray-50/50">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">Simple Process</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">
            How You Practice on <span className="bg-black text-white px-2 rounded-lg transform -rotate-1 inline-block">This Platform</span>
          </h2>
        </div>

        <div className="flex flex-col xl:flex-row items-center gap-16">
          
          {/* Left: 4 Visual Cards */}
          <div className="flex-1 w-full relative hidden xl:block">
             {/* Background Blur Effect */}
             <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 transform scale-90" />
             
             <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex gap-4 min-h-[400px] items-center justify-center">
                {cards.map((card, i) => (
                  <div 
                    key={i}
                    className={`
                      flex-1 ${card.bg} h-64 rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center 
                      transform transition-all duration-300 hover:scale-105 shadow-xl ${card.shadow} ${card.transform}
                    `}
                  >
                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-sm leading-tight">{card.title}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Right: 4 Timeline Steps */}
          <div className="flex-1 w-full space-y-8 max-w-2xl mx-auto xl:max-w-none">
            {steps.map((item, i) => (
              <div key={i} className="flex gap-6 relative group">
                 {/* Connecting Line (Only show if NOT the last item) */}
                 {i !== steps.length - 1 && (
                   <div className="absolute left-6 top-14 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors" />
                 )}
                 
                 {/* Step Number Circle */}
                 <div className={`shrink-0 w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-gray-200 z-10 relative ring-4 ring-white`}>
                   {item.step}
                 </div>
                 
                 {/* Content */}
                 <div className="pb-2 pt-1">
                   <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                     {item.title}
                   </h3>
                   <p className="text-gray-600 font-medium leading-relaxed max-w-md">
                     {item.desc}
                   </p>
                 </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}