import { ChevronDown } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    { q: "Is Test Explorer really free?", a: "Yes! Our core platform features for students and schools are completely free to use." },
    { q: "How do I register my school?", a: "Simply reach out via our contact form, and our team will set up your dedicated subdomain within 24 hours." },
    { q: "Can I access it on mobile?", a: "Absolutely. Test Explorer is fully responsive and works perfectly on any smartphone or tablet browser." },
  ];

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-500">Everything you need to know about the platform.</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}