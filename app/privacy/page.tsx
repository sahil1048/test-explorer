import { ShieldCheck, Eye, Lock, Globe, ChevronRight } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    { id: "collection", title: "Information Collection", icon: <Eye className="w-5 h-5" /> },
    { id: "usage", title: "How We Use Data", icon: <Globe className="w-5 h-5" /> },
    { id: "protection", title: "Data Protection", icon: <Lock className="w-5 h-5" /> },
    { id: "rights", title: "Your Rights", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-4 h-4" /> Trusted Education
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            At Test Explorer, your privacy is our priority. We are committed to protecting the data of students, teachers, and educational institutions.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Navigation - Sticky */}
          <aside className="md:w-1/4">
            <div className="sticky top-32 space-y-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 ml-4">Contents</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between group px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-600 hover:text-blue-600 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
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
            
            {/* Introduction Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm leading-relaxed text-slate-600">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Introduction</h2>
              <p className="mb-4">
                This Privacy Policy describes how Test Explorer ("we", "us", or "our") collects, uses, and shares your personal information when you use our platform, subdomains, and services.
              </p>
              <p>
                By accessing Test Explorer, you agree to the terms outlined in this policy. We ensure that your data is handled in compliance with international data protection standards.
              </p>
            </div>

            {/* Section: Collection */}
            <section id="collection" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Information Collection</h2>
                <div className="space-y-4 text-slate-600">
                  <p>We collect information that you provide directly to us:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-bold text-slate-800">Account Data:</span> Name, email address, and school affiliation.</li>
                    <li><span className="font-bold text-slate-800">Performance Data:</span> Quiz results, test scores, and progress reports.</li>
                    <li><span className="font-bold text-slate-800">Technical Data:</span> IP address, browser type, and device information.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section: Usage */}
            <section id="usage" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">How We Use Your Data</h2>
                <p className="text-slate-600 mb-6">
                  The primary purpose of collecting your information is to provide a personalized educational experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2 text-sm uppercase">Academic Analysis</h4>
                    <p className="text-xs text-slate-500">To generate performance reports and identify areas for student improvement.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-900 mb-2 text-sm uppercase">School Management</h4>
                    <p className="text-xs text-slate-500">To help administrators manage their specific subdomains and student lists.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Protection */}
            <section id="protection" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Data Security</h2>
                <p className="text-slate-600">
                  We implement industry-standard security measures including SSL encryption and secure database protocols provided by Supabase. However, no method of transmission over the Internet is 100% secure.
                </p>
              </div>
            </section>

            <footer className="pt-8 border-t border-slate-200 text-center md:text-left">
              <p className="text-slate-400 text-sm italic">
                Last updated: February 21, 2026. For questions, contact us at <span className="text-blue-600 font-bold">privacy@testexplorer.in</span>
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}