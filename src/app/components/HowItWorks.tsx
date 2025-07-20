const steps = [
  { title: "1. Upload", desc: "Drag and drop or upload documents in PDF or DOCX format." },
  { title: "2. Summarize", desc: "AI summarizes the document's key sections automatically." },
  { title: "3. Collaborate", desc: "Tag teammates, add comments, and approve or reject versions." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="text-3xl font-semibold text-center mb-10">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="p-6 border-l-4 border-blue-600 bg-gray-50 rounded shadow">
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
