import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Info */}
        <div className="w-full md:w-2/5 bg-gray-900 text-white p-10 md:p-16 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-6">Let's Talk</h2>
            <p className="text-gray-400 mb-10 text-lg">
              Have a question about our pricing, features, or just want to say hi? Drop us a line.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                  <p className="font-medium">hello@testexplorer.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Phone</p>
                  <p className="font-medium">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-0">
             <p className="text-sm text-gray-500">© 2025 Test Explorer Inc.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-3/5 p-10 md:p-16">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Message</label>
              <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none" placeholder="Tell us what you need..." />
            </div>

            <button type="button" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              Send Message
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}