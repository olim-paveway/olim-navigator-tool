type Props = {
  pdfUrl: string;
  score: number;
  firstName: string;
};

export function SuccessScreen({ pdfUrl, score, firstName }: Props) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-olive rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl text-white">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your plan is on its way, {firstName}!
      </h2>
      <p className="text-gray-500 mb-8">
        Check your inbox — your personalised aliyah PDF is being delivered now.
      </p>

      <div className="bg-olive/10 border border-olive/20 rounded-xl p-6 mb-8 inline-block">
        <p className="text-sm text-olive/80 mb-1 uppercase tracking-widest text-xs">
          Your Readiness Score
        </p>
        <p className="text-6xl font-bold text-olive">{score}</p>
        <p className="text-xs text-olive/60 mt-1">out of 100</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-olive text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-dark transition-colors"
        >
          View Your Plan
        </a>
        <a
          href="https://www.olimpaveway.com/consultation"
          className="border-2 border-olive text-olive px-6 py-3 rounded-lg font-semibold hover:bg-olive/5 transition-colors"
        >
          Book a Free Consultation
        </a>
      </div>
    </div>
  );
}
