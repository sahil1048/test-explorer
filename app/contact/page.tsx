import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";
import { Mail, MapPin, Phone, Building2 } from "lucide-react";

export default async function ContactPage() {
  // 1. Detect Subdomain
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  let schoolData = null;

  const parts = hostname.split(".");
  let subdomain = null;

  if (hostname.includes("localhost")) {
    // Localhost logic: dps.localhost:3000
    if (parts.length >= 2) subdomain = parts[0];
  } else {
    // Production logic: dps.testexplorer.com
    if (parts.length >= 3) subdomain = parts[0];
  }

  // 2. Fetch School Data if valid subdomain
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  // 3. Define Display Constants (Fallback to Test Explorer defaults)
  const contactInfo = {
    title: schoolData ? `Contact ${schoolData.name}` : "Let's Talk",
    description: schoolData 
      ? `Have questions about admissions, academics, or events at ${schoolData.name}? We're here to help.` 
      : "Have a question about our pricing, features, or just want to say hi? Drop us a line.",
    email: schoolData?.email || "hello@testexplorer.com",
    phone: schoolData?.phone || "+91 98765 43210",
    companyName: schoolData ? schoolData.name : "Test Explorer Inc."
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Info Section */}
        <div className="w-full md:w-2/5 bg-gray-900 text-white p-10 md:p-16 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-6">{contactInfo.title}</h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
              {contactInfo.description}
            </p>
            
            <div className="space-y-8">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email</p>
                  <p className="font-medium text-lg">{contactInfo.email}</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-lg">{contactInfo.phone}</p>
                </div>
              </div>

              {/* Organization Name (Visual consistency) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Organization</p>
                  <p className="font-medium text-lg">{contactInfo.companyName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-0 pt-8 border-t border-gray-800">
             <p className="text-sm text-gray-500">© {new Date().getFullYear()} {contactInfo.companyName}</p>
          </div>
        </div>

        {/* Right: Form Section */}
        <div className="w-full md:w-3/5 p-10 md:p-16">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">First Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="John" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Last Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                placeholder="john@example.com" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none" 
                placeholder={schoolData ? `Hi ${schoolData.name}, I would like to inquire about...` : "Tell us what you need..."}
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Send Message
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}