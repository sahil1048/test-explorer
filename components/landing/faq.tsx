"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "When is the next exam cycle?", a: "The exam schedule is usually released by the board 3-4 months in advance. Check our dashboard for live updates." },
  { q: "Can I make corrections to my application after submission?", a: "Yes, a correction window is usually provided for 2-3 days after the registration closes. However, not all fields are editable." },
  { q: "When will admit cards be released?", a: "Admit cards are generally released 1 week prior to the examination date." },
  { q: "What is the exam pattern?", a: "The exam consists of 3 sections: Language, Domain-Specific Subjects, and a General Test. All questions are MCQ based." },
  { q: "Is filling the preference sheet technical?", a: "It can be tricky. We provide a dedicated 'Preference Optimizer' tool to help you order colleges based on your predicted score." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black bg-black text-white inline-block px-4 py-2 rounded-lg transform -rotate-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div 
              key={i}
              className="group overflow-hidden rounded-2xl transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full flex items-center justify-between p-6 text-left transition-all ${
                  openIndex === i 
                    ? "bg-linear-to-r from-orange-400 to-orange-300 text-white" 
                    : "bg-linear-to-r from-orange-100 to-gray-200 text-gray-800 hover:from-orange-200"
                }`}
              >
                <span className="font-bold text-lg">{item.q}</span>
                {openIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              
              <div 
                className={`bg-white px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? "max-h-40 py-6 opacity-100" : "max-h-0 py-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 font-medium">{item.a}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}