import { ShieldAlert, Lock, Database, Key, Server, EyeOff, ChevronRight, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    { id: "encryption", title: "Data Encryption", icon: <Lock className="w-5 h-5" /> },
    { id: "infrastructure", title: "Infrastructure", icon: <Server className="w-5 h-5" /> },
    { id: "access", title: "Access Control", icon: <Key className="w-5 h-5" /> },
    { id: "compliance", title: "Privacy First", icon: <EyeOff className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Header */}
      <div className="bg-[#0f172a] pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldAlert className="w-4 h-4" /> Secure Infrastructure
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Security at Test Explorer
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We employ industry-leading security protocols to ensure that every student's progress and every school's data remains private and protected.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="md:w-1/4">
            <div className="sticky top-32 space-y-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 ml-4">Security Standards</p>
              {securityFeatures.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center justify-between group px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-600 hover:text-indigo-600 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm">{item.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <main className="md:w-3/4 space-y-12">
            
            {/* Encryption Section */}
            <section id="encryption" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Data Encryption</h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Your data is protected both in transit and at rest. We use bank-grade encryption to ensure your information is unreadable to unauthorized parties.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">TLS 1.3 Encryption</h4>
                      <p className="text-xs text-slate-500 mt-1">All traffic between your browser and our servers is encrypted using modern TLS protocols.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">AES-256 at Rest</h4>
                      <p className="text-xs text-slate-500 mt-1">Database backups and sensitive data are encrypted using the Advanced Encryption Standard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Infrastructure Section */}
            <section id="infrastructure" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Database className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Cloud Infrastructure</h2>
                <p className="text-slate-600 mb-8">
                  Test Explorer is powered by **Supabase** and hosted on highly secure AWS data centers. 
                </p>
                <ul className="space-y-4">
                  {[
                    "Isolated database environments for platform stability.",
                    "Automated daily backups with 99.9% uptime reliability.",
                    "Continuous monitoring for DDoS attacks and vulnerabilities."
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Access Control Section */}
            <section id="access" className="scroll-mt-32">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
                <h2 className="text-3xl font-black mb-6 tracking-tight">Access Control</h2>
                <p className="text-slate-400 mb-8">
                  We follow the principle of least privilege. Users only have access to the data they absolutely need.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-indigo-400 mb-1">Row Level Security</h4>
                    <p className="text-xs text-slate-400">Our database uses RLS to ensure a school administrator can never see another school's data.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <h4 className="font-bold text-indigo-400 mb-1">Authenticated Sessions</h4>
                    <p className="text-xs text-slate-400">Secure JWT-based authentication prevents session hijacking and unauthorized access.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reporting Section */}
            <section id="reporting" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm text-center">
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-900 mb-4">Found a vulnerability?</h2>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                  We take security seriously. If you've discovered a bug or security flaw, please report it to our team immediately.
                </p>
                <a 
                  href="mailto:security@testexplorer.in" 
                  className="inline-flex items-center px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Contact Security Team
                </a>
              </div>
            </section>

            <footer className="pt-8 border-t border-slate-200 text-center md:text-left">
              <p className="text-slate-400 text-sm italic">
                Our security protocols are reviewed monthly. Last review: February 2026.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}