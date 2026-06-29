import Image from "next/image";
import { AliyahForm } from "@/components/form/AliyahForm";

export default function HomePage() {
  return (
    <main className="min-h-screen relative">
      {/* Full-page background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/background.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* Dark blue overlay for contrast */}
        <div className="absolute inset-0 bg-[#1a1640]/80" />
      </div>

      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="https://www.olimpaveway.com" aria-label="Olim Paveway home">
            <Image
              src="/images/paveway-logo-transparent.png"
              alt="Olim Paveway"
              width={240}
              height={67}
              priority
            />
          </a>
          <a
            href="https://www.olimpaveway.com"
            className="text-white/70 text-sm hover:text-white transition-colors hidden sm:block"
          >
            Back to main site →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 px-6 text-center">
        <p className="text-white/60 text-xs tracking-[0.2em] mb-3 uppercase font-sans">
          A free tool by Olim Paveway
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Olim Navigator Tool
        </h1>
        <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Answer 8 questions about your situation. Receive a custom PDF plan —
          written by AI, informed by experts — in your inbox within 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/65 text-sm">
          <span>✓ 100% free</span>
          <span>✓ Personalised to your country &amp; family</span>
          <span>✓ PDF delivered to your inbox</span>
          <span>✓ No sales calls</span>
        </div>
      </section>

      {/* Form card */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <AliyahForm />
        </div>
        <p className="text-center text-white/40 text-xs mt-5 px-4">
          By submitting you consent to receive your plan by email.{" "}
          <a
            href="https://www.olimpaveway.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </section>
    </main>
  );
}
