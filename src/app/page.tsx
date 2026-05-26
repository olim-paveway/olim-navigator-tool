import { AliyahForm } from "@/components/form/AliyahForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-olive py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-gold font-bold tracking-widest text-sm">
            OLIM PAVEWAY
          </span>
          <a
            href="https://www.olimpaveway.com"
            className="text-cream/80 text-sm hover:text-gold transition-colors"
          >
            Back to main site →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-olive py-16 px-6 text-center">
        <p className="text-gold text-xs tracking-widest mb-3 uppercase">
          Free Tool
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Your Personal<br />Aliyah Action Plan
        </h1>
        <p className="text-cream/80 text-lg max-w-xl mx-auto mb-8">
          Answer 8 questions about your situation. Receive a custom PDF plan —
          written by AI, informed by experts — in your inbox within 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-cream/70 text-sm">
          <span>✓ 100% free</span>
          <span>✓ Personalised to your country &amp; family</span>
          <span>✓ PDF delivered to your inbox</span>
          <span>✓ No sales calls</span>
        </div>
      </section>

      {/* Form card */}
      <section className="max-w-2xl mx-auto px-4 -mt-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AliyahForm />
        </div>
        <p className="text-center text-gray-400 text-xs mt-6">
          By submitting you consent to receive your plan by email. Olim Paveway
          respects your privacy.
        </p>
      </section>
    </main>
  );
}
