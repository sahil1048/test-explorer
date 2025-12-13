import { Zap, Target, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    desc: "No more waiting. Get your score and detailed analysis immediately after submission.",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Adaptive Testing",
    desc: "Questions that adapt to your skill level, ensuring you are always challenged just right.",
    color: "bg-red-100 text-red-700",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Deep Analytics",
    desc: "Visualize your progress with beautiful charts. Identify weak areas in seconds.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "School Integration",
    desc: "Teachers can create tests, manage batches, and track every student's growth.",
    color: "bg-green-100 text-green-700",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Why students <span className="text-blue-600">love us</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            We don't just give you questions. We give you a roadmap to success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-4xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}