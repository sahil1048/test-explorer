import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center border-b border-gray-100">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          We are <span className="text-blue-600">Test Explorer</span>.
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium">
          Building the future of assessment. We help students and schools unlock potential through data-driven practice.
        </p>
      </section>

      {/* Stats / Bento */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Students", value: "10K+" },
            { label: "Questions", value: "50k+" },
            { label: "Schools", value: "100+" },
            { label: "Success Rate", value: "94%" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm text-center border border-gray-100 hover:border-blue-200 transition-colors">
              <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
           {/* Placeholder for an image - replace src with actual image */}
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-3xl relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-tr from-blue-600 to-purple-600 opacity-80 mix-blend-multiply" />
             <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                Our Vibe
             </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              Education shouldn't be boring. We believe that practice is the key to mastery, but it needs to be engaging, instant, and personalized.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Whether you are a solo student preparing for JEE or a school managing thousands of exams, we provide the infrastructure to make it seamless.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}