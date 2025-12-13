import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer({ school }: { school?: any }) {
  const brandName = school ? school.name : "Test Explorer";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 rounded-t-[3rem] mt-10">
      <div className="container mx-auto px-4">
        
        {/* Top Section: CTA & Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-gray-800 pb-16">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              Ready to <span className="text-blue-500">level up?</span>
            </h2>
            <p className="text-gray-400">
              Join thousands of students acing their exams with {brandName}. 
              Start your free practice session today.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
             <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-900 border border-gray-800 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 w-full md:w-80"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
                  Subscribe
                </button>
             </div>
             <p className="text-xs text-gray-500 mt-3">We care about your data in our privacy policy.</p>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          
          {/* Column 1: Brand & Logo */}
          <div className="col-span-2 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                
                {/* --- LOGO LOGIC START --- */}
                {school && school.logo_url ? (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                    <img 
                      src={school.logo_url} 
                      alt={`${brandName} Logo`} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {school ? school.name.substring(0, 1) : "TE"}
                  </div>
                )}
                {/* --- LOGO LOGIC END --- */}

                <span className="text-xl font-bold">{brandName}</span>
             </div>

             <p className="text-gray-400 text-sm leading-relaxed mb-6">
               The smartest way to prepare for competitive exams. AI-driven analytics, unlimited mock tests, and comprehensive study material.
             </p>
             <div className="flex gap-4">
               <Link href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-blue-600 transition-colors text-white">
                 <Twitter className="w-4 h-4" />
               </Link>
               <Link href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
                 <Instagram className="w-4 h-4" />
               </Link>
               <Link href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-blue-700 transition-colors text-white">
                 <Linkedin className="w-4 h-4" />
               </Link>
             </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="font-bold text-lg mb-6">Platform</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/streams" className="hover:text-white transition-colors">Streams</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Student Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-bold text-lg mb-6">Resources</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} {brandName}. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}