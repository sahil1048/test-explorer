import { createClient } from "@/lib/supabase/server";
import { Bell, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

// Add this animation style for the vertical scroll
const scrollAnimationStyles = {
  animation: "scroll-vertical 20s linear infinite",
};

export default async function SchoolUpdates({ school }: { school: any }) {
  const supabase = await createClient();

  // 1. Fetch Announcements for this specific school
  const { data: announcements } = await supabase
    .from("school_announcements")
    .select("*")
    .eq("organization_id", school.id) // Filter by School ID
    .order("created_at", { ascending: false })
    .limit(5);

  const list = announcements || [];
  // Duplicate list for seamless infinite scrolling
  const scrollingList = [...list, ...list]; 

  return (
    <section className="relative w-full py-20 bg-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* === LEFT COLUMN: Content === */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold tracking-wide">
              WELCOME TO {school.name.toUpperCase()}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Excellence in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Education & Growth
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              {school.welcome_message || 
                "We are committed to providing a nurturing environment that fosters academic excellence, character development, and lifelong learning. Our innovative curriculum and dedicated faculty ensure every student reaches their full potential."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                About Our School <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2">
                Admissions
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div>
                    <h4 className="text-3xl font-black text-gray-900">100%</h4>
                    <p className="text-sm text-gray-500 font-medium">Result</p>
                </div>
                <div>
                    <h4 className="text-3xl font-black text-gray-900">50+</h4>
                    <p className="text-sm text-gray-500 font-medium">Awards</p>
                </div>
                <div>
                    <h4 className="text-3xl font-black text-gray-900">25:1</h4>
                    <p className="text-sm text-gray-500 font-medium">Student Ratio</p>
                </div>
            </div>
          </div>

          {/* === RIGHT COLUMN: Notice Board (Your Requested Section) === */}
          <div className="w-full h-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-2xl border border-white/50 relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Bell className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900">Notice Board</h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> 
                      Live Updates
                    </p>
                  </div>
                </div>

                {/* Scrolling Content Area */}
                <div className="relative h-[400px] overflow-hidden group">
                  
                  {/* Gradients */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

                  {/* The Scrolling List */}
                  {list.length > 0 ? (
                    <div 
                      className="space-y-4 hover:[animation-play-state:paused]" 
                      style={scrollAnimationStyles}
                    >
                      {scrollingList.map((item: any, i: number) => (
                        <div 
                          key={`${item.id}-${i}`} 
                          className="p-5 rounded-2xl bg-white hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 shadow-sm cursor-pointer group/item"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                              {item.tag || "NOTICE"}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                               <Calendar className="w-3 h-3" />
                               {new Date(item.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <h4 className="text-sm font-bold text-gray-900 leading-snug mb-2 group-hover/item:text-blue-700 transition-colors">
                            {item.title}
                          </h4>
                          
                          {item.content && (
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                              {item.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No new notices at the moment.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Style for this component's animation */}
      <style>{`
        @keyframes scroll-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </section>
  );
}