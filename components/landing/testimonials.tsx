import styles from "./marquee.module.css";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Varuna S",
      role: "Student, APS Waranagal",
      text: "The platform offered by Test Explorer is precisely mapped with CUET conducted by NTA. The difficulty level, look & feel—in short, everything.",
      gradient: "from-blue-600 to-violet-600",
      image: "https://i.pravatar.cc/150?u=varuna" 
    },
    {
      name: "S.K Malhotra",
      role: "SKM Classes (Owner), Yamuna Nagar",
      text: "I have been running my coaching centre successfully for more than 2 decades. I found the same dedication in the team at Test Explorer.",
      gradient: "from-orange-400 to-red-500",
      image: "https://i.pravatar.cc/150?u=skm",
    },
    {
      name: "Manish Kumar",
      role: "Student, DPS Patna",
      text: "I solved MCQs on the platform for hardly one month but in a consistent manner. This played a critical role in my success.",
      gradient: "from-emerald-400 to-teal-600",
      image: "https://i.pravatar.cc/150?u=manish"
    },
    // Adding a few more mock data to make the scroll look full
    {
      name: "Priya Sharma",
      role: "Student, KV Delhi",
      text: "The analytics helped me find my weak areas in Physics instantly. Highly recommended.",
      gradient: "from-pink-500 to-rose-500",
      image: "https://i.pravatar.cc/150?u=priya"
    },
    {
      name: "Rahul Verma",
      role: "Teacher, Apex Academy",
      text: "Managing mock tests for 500+ students used to be a headache. This platform solved it in one day.",
      gradient: "from-cyan-500 to-blue-500",
      image: "https://i.pravatar.cc/150?u=rahul"
    }
  ];

  // Duplicate list for seamless loop
  const scrollList = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-16 text-center">
        <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
          Testimonials
        </span>
        <h2 className="text-3xl md:text-5xl font-black mt-4 tracking-tight">
          Don't just take our word for it.
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left Fade Gradient */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* The Animated Track */}
        <div className={styles.track}>
          {scrollList.map((t, i) => (
            <div 
              key={i} 
              className={`
                relative shrink-0 w-[350px] md:w-[400px] rounded-4xl p-8 text-white 
                bg-linear-to-br ${t.gradient} shadow-xl 
                hover:scale-[1.02] transition-transform duration-300
              `}
            >
              <div className="flex flex-col items-center text-center">
                {/* Image */}
                <div className="w-16 h-16 rounded-full border-4 border-white/30 mb-4 overflow-hidden bg-white/10">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-1">{t.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wider mb-6 opacity-80 bg-black/10 px-3 py-1 rounded-full">
                  {t.role}
                </p>
                
                <p className="text-sm font-medium leading-relaxed opacity-95">
                  "{t.text}"
                </p>

                {/* Decor */}
                <div className="mt-6 w-12 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Fade Gradient */}
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
        
      </div>
    </section>
  );
}