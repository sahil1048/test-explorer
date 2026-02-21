import { Rocket, School, User, CheckCircle2, ArrowRight, Laptop, GraduationCap, Globe } from "lucide-react";
import Link from "next/link";

export default function GettingStarted() {
  const adminSteps = [
    { title: "Register School", desc: "Fill out the contact form with your school details.", icon: <School className="w-5 h-5" /> },
    { title: "Custom Path", desc: "Get your dedicated URL (e.g., testexplorer.in/your-school).", icon: <Globe className="w-5 h-5" /> },
    { title: "Upload Data", desc: "Add your students and exam categories via the dashboard.", icon: <Laptop className="w-5 h-5" /> },
  ];

  const studentSteps = [
    { title: "Find School", desc: "Access your school's unique portal link.", icon: <Search className="w-5 h-5" /> },
    { title: "Login", desc: "Use the credentials provided by your administrator.", icon: <User className="w-5 h-5" /> },
    { title: "Start Testing", desc: "Browse categories and begin your mock exams.", icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
            <Rocket className="w-4 h-4" /> Welcome to Test Explorer
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Let's get you <span className="text-blue-500">set up.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Whether you are an educator managing a school or a student preparing for success, we've made the journey simple.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Path 1: For Schools */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <School className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900">For School Admins</h2>
            </div>
            
            <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
               
               {adminSteps.map((step, idx) => (
                 <div key={idx} className="flex gap-6 relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      {idx !== adminSteps.length - 1 && <div className="w-0.5 h-full bg-blue-100 my-2" />}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                 </div>
               ))}

               <Link href="/contact" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                 Register Your School <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>

          {/* Path 2: For Students */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-900">For Students</h2>
            </div>

            <div className="bg-emerald-50/30 rounded-[2.5rem] p-8 md:p-12 border border-emerald-100 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

               {studentSteps.map((step, idx) => (
                 <div key={idx} className="flex gap-6 relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-500 font-black text-sm shrink-0">
                        {idx + 1}
                      </div>
                      {idx !== studentSteps.length - 1 && <div className="w-0.5 h-full bg-emerald-100 my-2" />}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                 </div>
               ))}

               <Link href="/login" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                 Go to Student Login <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">Ready to start your exam journey?</h2>
          <p className="text-blue-100 mb-10 text-lg relative z-10 max-w-xl mx-auto">
            Join thousands of students and hundreds of schools using our free mock test platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
             <Link href="/contact" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all">Get Started Free</Link>
             <Link href="/about" className="px-10 py-5 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all border border-blue-500">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  );
}