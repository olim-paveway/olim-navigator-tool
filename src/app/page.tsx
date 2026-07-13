import Image from "next/image";
import { AliyahForm } from "@/components/form/AliyahForm";
import {
  SITE_URL,
  MAIN_SITE_URL,
  PRIVACY_POLICY_URL,
  ALIYAH_GUIDE_URL,
} from "@/lib/config";

const faqs = [
  {
    q: "What is the Aliyah Navigator?",
    a: "The Aliyah Navigator is a free online tool by Olim Paveway. You answer 8 short questions about your situation — where you're moving from, your family, your timeline — and receive a personalised aliyah action plan as a PDF in your inbox within about 60 seconds.",
  },
  {
    q: "Is the aliyah plan really free?",
    a: "Yes. The Navigator is 100% free and comes with no obligation. It's our way of helping English-speaking Jews start their aliyah planning on the right foot.",
  },
  {
    q: "Which countries does the Navigator cover?",
    a: "The plan is tailored to olim coming from the USA, UK, Canada, Australia, South Africa, and other countries — each with its own document requirements, timelines, and practical steps.",
  },
  {
    q: "What's inside the PDF plan?",
    a: "Your plan covers the key stages of the aliyah process for your specific situation: eligibility and documents, working with the Jewish Agency or Nefesh B'Nefesh, timeline milestones, and first steps after landing — written by AI and informed by people who made aliyah themselves.",
  },
  {
    q: "Who is Olim Paveway?",
    a: "Olim Paveway is an aliyah concierge service run by olim, for olim. We help English-speaking Jews navigate Israeli bureaucracy, find trusted service providers, and settle into life in Israel.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Aliyah Navigator",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free tool that creates a personalised aliyah action plan. Answer 8 questions and receive a custom PDF plan by email in 60 seconds.",
      provider: {
        "@type": "Organization",
        name: "Olim Paveway",
        url: MAIN_SITE_URL,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen relative">
      {/* Static site-owned JSON-LD; "<" escaped to prevent tag breakout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
          <a href={MAIN_SITE_URL} aria-label="Olim Paveway home">
            <Image
              src="/images/paveway-logo-transparent.png"
              alt="Olim Paveway"
              width={240}
              height={67}
              priority
            />
          </a>
          <a
            href={MAIN_SITE_URL}
            className="text-white/70 text-sm hover:text-white transition-colors hidden sm:block"
          >
            Back to main site →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 px-6 text-center">
        <p className="text-white/60 text-xs tracking-[0.2em] mb-3 uppercase font-sans">
          Olim Navigator — a free tool by Olim Paveway
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Get Your Free Personalised Aliyah Plan
        </h1>
        <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Answer 8 questions about your situation. Receive a custom PDF plan —
          written by AI, informed by experts — in your inbox within 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/65 text-sm">
          <span>✓ 100% free</span>
          <span>✓ Personalised to your country &amp; family</span>
          <span>✓ PDF delivered to your inbox</span>
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
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </section>

      {/* SEO content + FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-white/70">
        <h2 className="text-2xl font-bold text-white mb-4">
          Plan Your Aliyah With Confidence
        </h2>
        <p className="text-sm leading-relaxed mb-4">
          Making aliyah involves dozens of moving parts: proving eligibility
          under the Law of Return, gathering apostilled documents, coordinating
          with the Jewish Agency or Nefesh B&apos;Nefesh, choosing where to
          live, registering with a kupat holim, and claiming your sal klita
          benefits. The right order of operations depends on where you&apos;re
          coming from, who&apos;s moving with you, and your timeline.
        </p>
        <p className="text-sm leading-relaxed mb-10">
          The Aliyah Navigator turns your answers into a step-by-step plan for
          your specific situation — so you know what to do first, what can
          wait, and what catches most olim by surprise. For the full picture,
          read our{" "}
          <a
            href={ALIYAH_GUIDE_URL}
            className="underline hover:text-white transition-colors"
          >
            Complete Guide to Making Aliyah
          </a>{" "}
          on the main site.
        </p>

        <h2 className="text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-base font-semibold text-white mb-1">{q}</h3>
              <p className="text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
