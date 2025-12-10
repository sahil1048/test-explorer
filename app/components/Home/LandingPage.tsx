import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowBigLeft,
  ArrowBigRight,
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Globe2, 
  GraduationCap, 
  Layout, 
  PlayCircle, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              TE
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Test Explorer</span>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#subjects" className="hover:text-blue-600 transition-colors">Subjects</Link>
            <Link href="#testimonials" className="hover:text-blue-600 transition-colors">Success Stories</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* --- Hero Section --- */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background Decor */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
          
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New CUET 2025 Syllabus Updated
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Master Your <span className="text-blue-600">CUET Prep</span> with <br/> Real-Time Testing
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of students practicing on India's most advanced testing platform. 
              Real NTA-style interface, detailed analytics, and global benchmarking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
              >
                Start Practicing Free
                <ArrowBigRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Layout className="w-5 h-5" />
                View Dashboard
              </Link>
            </div>

            {/* Dashboard Mockup / Hero Image */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border bg-white shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1]">
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
                {/* Replace with actual screenshot later */}
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Dashboard Preview Image</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="bg-blue-900 py-12 text-white">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Students', value: '10,000+' },
              { label: 'Tests Attempted', value: '500k+' },
              { label: 'Partner Schools', value: '50+' },
              { label: 'Questions', value: '25,000+' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Features Grid --- */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Test Explorer?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide the exact environment you'll face in the actual exam, combined with powerful analytics to improve your score.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.colorBg} ${feature.colorText} group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Subjects Section --- */}
        <section id="subjects" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Subject Coverage</h2>
                <p className="text-gray-600">Expertly curated content for all major streams.</p>
              </div>
              <Link href="/courses" className="text-blue-600 font-semibold hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                View All Subjects <span className="text-xl">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {subjects.map((subject) => (
                <div key={subject} className="p-4 rounded-xl border border-gray-200 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <span className="font-semibold text-gray-800">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Ace Your Exams?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join the platform trusted by top schools and toppers. Start your free trial today and see the difference.
            </p>
            <Link 
              href="/register" 
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TE</div>
                <span className="text-xl font-bold text-white">Test Explorer</span>
              </div>
              <p className="max-w-xs">
                Empowering students with national-level testing standards and analytics.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">For Schools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Test Explorer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Data Constants ---
const features = [
  {
    title: "Real NTA Interface",
    desc: "Practice on the exact same interface used in the actual CUET exam to build muscle memory.",
    icon: <Layout className="w-6 h-6" />,
    colorBg: "bg-blue-100",
    colorText: "text-blue-600"
  },
  {
    title: "Detailed Analytics",
    desc: "Get question-wise analysis, time management reports, and accuracy checks after every test.",
    icon: <BarChart3 className="w-6 h-6" />,
    colorBg: "bg-green-100",
    colorText: "text-green-600"
  },
  {
    title: "Global Benchmarking",
    desc: "Compare your performance with students from schools across the country, not just your class.",
    icon: <Globe2 className="w-6 h-6" />,
    colorBg: "bg-purple-100",
    colorText: "text-purple-600"
  },
  {
    title: "Expert Content",
    desc: "Questions curated by top educators and subject matter experts strictly adhering to the syllabus.",
    icon: <ShieldCheck className="w-6 h-6" />,
    colorBg: "bg-orange-100",
    colorText: "text-orange-600"
  },
  {
    title: "School Integration",
    desc: "Seamlessly integrated with your school's curriculum while offering national level exposure.",
    icon: <GraduationCap className="w-6 h-6" />,
    colorBg: "bg-pink-100",
    colorText: "text-pink-600"
  },
  {
    title: "24/7 Availability",
    desc: "Practice anytime, anywhere. Our platform is optimized for both desktop and mobile devices.",
    icon: <Clock className="w-6 h-6" />,
    colorBg: "bg-teal-100",
    colorText: "text-teal-600"
  }
];

const subjects = [
  "Physics", "Chemistry", "Mathematics", "Biology", 
  "English", "General Test", "Accountancy", "Economics", 
  "Business Studies", "History"
];