const features = [
  {
    title: "AI-Powered Summaries",
    desc: "Automatically generate concise summaries of uploaded documents.",
  },
  {
    title: "Collaborative Review",
    desc: "Share docs with teammates and leave comments.",
  },
  {
    title: "Workflow Approvals",
    desc: "Set up custom approval chains with version tracking.",
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-gray-100 px-6">
      <h2 className="text-3xl font-semibold text-center mb-10">Features</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow hover:shadow-lg">
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
