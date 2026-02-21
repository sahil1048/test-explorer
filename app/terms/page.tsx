import { FileText, Scale, Zap, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const sections = [
    { id: "acceptance", title: "Acceptance of Terms", icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: "accounts", title: "User Accounts", icon: <Zap className="w-5 h-5" /> },
    { id: "usage", title: "Acceptable Use", icon: <Scale className="w-5 h-5" /> },
    { id: "liability", title: "Limitation of Liability", icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <FileText className="w-4 h-4" /> Usage Agreement
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            These terms govern your use of the Test Explorer platform. By using our services, you agree to these rules.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="md:w-1/4">
            <div className="sticky top-32 space-y-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 ml-4">Legal Navigation</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between group px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-600 hover:text-emerald-600 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                      {section.icon}
                    </span>
                    <span className="font-bold text-sm">{section.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <main className="md:w-3/4 space-y-12">
            
            {/* Quick Summary Card */}
            <div className="bg-emerald-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
               <h2 className="text-2xl font-black mb-6 relative z-10">Quick Summary</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <p className="text-emerald-300 font-black text-xs uppercase tracking-wider">The "Free" Promise</p>
                    <p className="text-emerald-50/80 text-sm">Our core features for schools and students remain free to use without hidden charges.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-emerald-300 font-black text-xs uppercase tracking-wider">Your Responsibility</p>
                    <p className="text-emerald-50/80 text-sm">You are responsible for keeping your account secure and using the platform ethically.</p>
                  </div>
               </div>
            </div>

            {/* Section: Acceptance */}
            <section id="acceptance" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">1. Acceptance of Terms</h2>
                <div className="prose prose-slate text-slate-600">
                  <p>
                    By accessing or using Test Explorer, you confirm your agreement to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Accounts */}
            <section id="accounts" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">2. User Accounts</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>When you create an account for a school or as a student, you must provide accurate and complete information.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Administrators are responsible for managing school-specific subdomains/paths.</li>
                    <li>We reserve the right to suspend accounts that provide false information.</li>
                    <li>You must notify us immediately of any unauthorized use of your account.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section: Usage */}
            <section id="usage" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-8">
                  <Scale className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">3. Acceptable Use</h2>
                <p className="text-slate-600 mb-6">
                  You agree not to use the platform for any unlawful purposes or to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-sm text-slate-700 font-bold">No Scraping</p>
                    <p className="text-xs text-slate-500 mt-1">Automated collection of exam data or user information is strictly prohibited.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-sm text-slate-700 font-bold">Academic Integrity</p>
                    <p className="text-xs text-slate-500 mt-1">The platform must not be used to facilitate cheating or unauthorized exam access.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Liability */}
            <section id="liability" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-8">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">4. Limitation of Liability</h2>
                <p className="text-slate-600 leading-relaxed">
                  Test Explorer is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                </p>
              </div>
            </section>

            <footer className="pt-8 border-t border-slate-200 text-center md:text-left">
              <p className="text-slate-400 text-sm italic">
                By using Test Explorer, you acknowledge that you have read and understood these Terms. Last updated: February 21, 2026.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}