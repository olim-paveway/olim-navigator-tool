/**
 * Generates scripts/sample-report.pdf using the REAL production PDF
 * generator (src/lib/pdf/generate.tsx), so the sample can never drift
 * from what users actually receive. Only the sample data lives here.
 *
 * Run from the repo root (the generator reads the logo via process.cwd()):
 *   pnpm sample-pdf
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { generateAliyahPdf } from "../src/lib/pdf/generate";
import { aiPlanSchema, type FormSchema } from "../src/lib/validations/form";

const sampleFormData = {
  firstName: "Sarah",
  country: "USA",
  targetArea: "Jerusalem",
  timeline: "6-12 months",
  familyType: "Couple with children",
} satisfies Pick<
  FormSchema,
  "firstName" | "country" | "targetArea" | "timeline" | "familyType"
>;

// Parsed through the production schema so the sample data is guaranteed
// to have the exact shape the AI pipeline produces.
const samplePlan = aiPlanSchema.parse({
  readiness_score: 72,
  intent_score: 78,
  intent_band: "Committed",
  personal_snapshot:
    "A family of five from the United States, aiming to settle in Jerusalem within the next year. Strong motivation, solid financial planning underway, and children in elementary school ages.",
  profile_meaning:
    "Your profile places you among families who benefit most from early school registration and community selection. Your one-year timeline is realistic but leaves little slack for document delays.",
  assessment:
    "Based on your profile as a family from the United States planning to move to Jerusalem, you have a solid foundation to begin your aliyah journey. Your timeline is achievable if you start the document-gathering process immediately, as apostilled FBI background checks and birth certificates are currently the longest-lead items for American olim. Jerusalem offers excellent Anglo communities for families with children, and school placement will be a key early decision.",
  country_notes:
    "US citizens need an FBI background check with apostille (currently 8–12 weeks), apostilled birth certificates for every family member, and an apostilled marriage certificate. Nefesh B'Nefesh handles most of the process jointly with the Jewish Agency.",
  location_notes:
    "Jerusalem has strong English-speaking communities in neighbourhoods like Baka, Katamon, and Arnona. School registration for September closes in early spring — make this your first post-approval priority.",
  action_items: [
    {
      title: "Order FBI background checks with apostille",
      description:
        "This is the longest-lead document for US olim. Order through an FBI-approved channeler and request the apostille immediately.",
      urgency: "high",
    },
    {
      title: "Open your Nefesh B'Nefesh application",
      description:
        "Start the joint NBN / Jewish Agency application now — approval typically takes 2–4 months from a complete file.",
      urgency: "high",
    },
    {
      title: "Gather apostilled civil documents",
      description:
        "Birth certificates for every family member and your marriage certificate, each with an apostille from the issuing state.",
      urgency: "high",
    },
    {
      title: "Shortlist Jerusalem neighbourhoods and schools",
      description:
        "Research Anglo-friendly neighbourhoods and contact schools about places for your children for the coming September.",
      urgency: "medium",
    },
    {
      title: "Plan a pilot trip",
      description:
        "A 7–10 day trip to visit neighbourhoods, schools, and potential rentals will de-risk your biggest decisions.",
      urgency: "low",
    },
  ],
  timeline_phases: [
    {
      phase: "Now – 3 months",
      duration: "3 months",
      tasks: [
        "Order FBI checks and apostilled documents",
        "Open Nefesh B'Nefesh application",
        "Set your target aliyah month",
      ],
    },
    {
      phase: "3 – 6 months",
      duration: "3 months",
      tasks: [
        "Complete Jewish Agency interview",
        "Pilot trip to Jerusalem",
        "Apply to schools",
      ],
    },
    {
      phase: "6 – 12 months",
      duration: "6 months",
      tasks: [
        "Receive aliyah visa",
        "Book NBN charter or group flight",
        "Arrange shipping and temporary housing",
      ],
    },
  ],
  document_checklist: [
    { doc: "FBI background check with apostille", country_specific: true },
    { doc: "Apostilled birth certificates (all family members)", country_specific: true },
    { doc: "Apostilled marriage certificate", country_specific: true },
    { doc: "Proof of Judaism letter from a recognised rabbi", country_specific: false },
    { doc: "Valid passports (18+ months remaining)", country_specific: false },
    { doc: "Passport photos for every family member", country_specific: false },
  ],
  consultation_questions: [
    "Which Jerusalem neighbourhoods fit our budget and community preferences?",
    "How do we time school registration against our aliyah flight date?",
    "What should we do about our US home, accounts, and tax obligations?",
  ],
  next_step:
    "Book your free consultation with Olim Paveway to turn this plan into a week-by-week roadmap for your family.",
  disclaimer:
    "This aliyah action plan is generated by AI for informational and planning purposes only. It does not constitute legal, immigration, financial, or tax advice. Aliyah eligibility, benefits, and procedures are subject to change. Always verify current requirements directly with Nefesh B'Nefesh, the Jewish Agency, or a qualified aliyah advisor before making decisions. Olim Paveway's consultation service can connect you with licensed professionals. © Olim Paveway.",
});

async function main() {
  const pdfBuffer = await generateAliyahPdf(sampleFormData, samplePlan);
  const outPath = path.join(process.cwd(), "scripts", "sample-report.pdf");
  writeFileSync(outPath, pdfBuffer);
  console.log(`Sample PDF written to ${outPath} (${pdfBuffer.length} bytes)`);
}

main().catch((err) => {
  console.error("Sample PDF generation failed:", err);
  process.exit(1);
});
