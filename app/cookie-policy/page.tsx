import { Cookie, Info, ShieldCheck, Settings, ChevronRight } from "lucide-react";

export default function CookiePolicy() {
  const sections = [
    { id: "what-are-cookies", title: "What are Cookies?", icon: <Info className="w-5 h-5" /> },
    { id: "how-we-use", title: "How We Use Them", icon: <Settings className="w-5 h-5" /> },
    { id: "your-choices", title: "Your Choices", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const cookieTypes = [
    { name: "Session Info", type: "Essential", purpose: "Keeps you logged into your school dashboard.", duration: "Session" },
    { name: "Preference", type: "Functional", purpose: "Remembers your dark mode or language settings.", duration: "1 Year" },
    { name: "Analytics", type: "Performance", purpose: "Helps us see which test categories are most popular.", duration: "24 Hours" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
            <Cookie className="w-4 h-4" /> Data Transparency
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We use cookies to ensure you have a smooth experience while practicing and exploring exams.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="md:w-1/4">
            <div className="sticky top-32 space-y-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4 ml-4">Policy Sections</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between group px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-slate-600 hover:text-amber-600 border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-amber-500 transition-colors">
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
            
            {/* Section: What are Cookies */}
            <section id="what-are-cookies" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">1. What are Cookies?</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Cookies are small text files that are stored on your device when you visit a website. They help us recognize your device and store some information about your preferences or past actions.
                </p>
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                    <Info className="w-6 h-6 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-900 font-medium">
                        At Test Explorer, we primarily use "First-Party" cookies which are set directly by us to make the platform work.
                    </p>
                </div>
              </div>
            </section>

            {/* Section: How We Use Them */}
            <section id="how-we-use" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm overflow-hidden">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">2. How We Use Cookies</h2>
                <div className="overflow-x-auto mt-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Purpose</th>
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {cookieTypes.map((cookie, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-4">
                            <span className="font-bold text-slate-900 block">{cookie.name}</span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{cookie.type}</span>
                          </td>
                          <td className="py-4 text-sm text-slate-600">{cookie.purpose}</td>
                          <td className="py-4 text-sm text-slate-500 font-medium">{cookie.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section: Your Choices */}
            <section id="your-choices" className="scroll-mt-32">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">3. Your Choices</h2>
                <div className="space-y-4 text-slate-600">
                    <p>
                        Most web browsers allow you to control cookies through their settings. You can:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Delete all cookies from your browser.</li>
                        <li>Block all cookies from being set.</li>
                        <li>Set your browser to notify you when a cookie is issued.</li>
                    </ul>
                    <p className="p-6 bg-red-50 text-red-700 text-sm rounded-3xl border border-red-100 font-medium mt-4">
                        Note: If you block essential cookies, you will not be able to log in or access your school subdomain dashboard.
                    </p>
                </div>
              </div>
            </section>

            <footer className="pt-8 border-t border-slate-200 text-center md:text-left">
              <p className="text-slate-400 text-sm italic">
                This policy was last updated on February 21, 2026.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}