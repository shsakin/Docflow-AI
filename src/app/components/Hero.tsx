export default function Hero() {
  return (
    <section className="text-center py-20 px-6 bg-white shadow-md">
      <h1 className="text-4xl font-bold mb-4">DocFlow AI</h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
        Smart document summarization and approval workflows powered by AI.
      </p>
      <a
        href="/dashboard"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Get Started
      </a>
    </section>
  );
}