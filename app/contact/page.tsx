import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";
import { Mail, Phone, Building2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "true";

  // 1. Detect Subdomain from Headers
  const headersList = await headers();
  const schoolSlug = headersList.get("x-school-slug"); // <--- CHANGED: Read Middleware Header
  const supabase = await createClient()
  
  
  let schoolData: any = null;
  if (schoolSlug) {
    // We assume getSchoolBySubdomain queries by the 'slug' column
    schoolData = await getSchoolBySubdomain(schoolSlug);
  }

  // 2. Fetch School Data using your SLUG logic
  if (schoolSlug && !["www", "test-explorer", "testexplorer"].includes(schoolSlug)) {
    schoolData = await getSchoolBySubdomain(schoolSlug);
  }

  // 3. Server Action (Now accepts orgId as the first parameter)
  async function handleSubmit(orgId: string | null, formData: FormData) {
    "use server";
    
    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert([{
      name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      email: formData.get("email"),
      message: formData.get("message"),
      organization_id: orgId, // Directly uses the bound ID
      status: "unread",
    }]);

    if (error) throw error;
    redirect("/contact?success=true");
  }

  // 4. BIND THE ID TO THE ACTION
  // This securely attaches the ID to the function before sending it to the Client Component
  const boundSubmit = handleSubmit.bind(null, schoolData?.id || null);

  const contactInfo = {
    title: schoolData ? `Contact ${schoolData.name}` : "Let's Talk",
    description: schoolData 
      ? `Have questions about admissions, academics, or exams at ${schoolData.name}? Reach out to our administration.` 
      : "Have a question about Test Explorer's features or pricing? We're here to help.",
    email: schoolData?.email || "help@testexplorer.in",
    phone: schoolData?.phone || "+91 98966 62669",
    companyName: schoolData ? schoolData.name : "Test Explorer Inc."
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Side UI */}
        <div className="w-full md:w-2/5 bg-slate-900 text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 tracking-tight">{contactInfo.title}</h2>
            <p className="text-slate-400 mb-12 text-lg leading-relaxed">{contactInfo.description}</p>
            <div className="space-y-8">
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Mail className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Email Us</p>
                  <p className="font-bold text-lg">{contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Phone className="text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Call Us</p>
                  <p className="font-bold text-lg">{contactInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Building2 className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Organization</p>
                  <p className="font-bold text-lg">{contactInfo.companyName}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 md:mt-0 pt-8 border-t border-slate-800/50">
             <p className="text-xs text-slate-600">© {new Date().getFullYear()} {contactInfo.companyName}</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-3/5 p-10 md:p-16 bg-white">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><Send className="w-10 h-10 text-green-600" /></div>
              <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
              <p className="text-slate-500 max-w-sm">We've received your inquiry and will be in touch shortly.</p>
              <Link href="/contact" className="mt-6 text-blue-600 font-bold hover:underline">Send another message</Link>
            </div>
          ) : (
            <ContactForm 
              action={boundSubmit} 
              placeholder={schoolData ? `Hi ${schoolData.name}, I'm interested in...` : "How can we help?"} 
            />
          )}
        </div>
      </div>
    </div>
  );
}