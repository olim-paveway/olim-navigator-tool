import type { FormSchema, AiPlanSchema } from "@/lib/validations/form";

function buildFallbackPlan(data: FormSchema): AiPlanSchema {
  const score =
    data.timeline === "0-6 months"
      ? 65
      : data.timeline === "6-12 months"
        ? 45
        : 25;

  return {
    readiness_score: score,
    assessment: `Based on your profile as someone from ${data.country} planning to move to ${data.targetArea}, you have a solid foundation to begin your aliyah journey. Your ${data.familyType.toLowerCase()} profile and ${data.career.toLowerCase()} career situation are factors we've helped many olim navigate successfully.\n\nOlim Paveway specializes in exactly your type of move. We have deep experience helping families from ${data.country} settle in ${data.targetArea} and can guide you through every step of the process.\n\nThe key to a successful aliyah is starting early — both the paperwork and the mental preparation. We recommend booking a consultation with our team to build your truly personalized roadmap.`,
    action_items: [
      {
        title: "Contact Nefesh B'Nefesh or the Jewish Agency",
        description:
          "Begin your formal aliyah application immediately. This is the most time-sensitive step and determines your eligibility, timeline, and absorption benefits.",
        urgency: "high",
      },
      {
        title: "Gather and apostille identity documents",
        description:
          "Collect birth certificates, marriage certificate (if applicable), and Jewish heritage documentation. Apostilling these documents can take 4-8 weeks.",
        urgency: "high",
      },
      {
        title: `Book a pilot trip to ${data.targetArea}`,
        description: `Visit ${data.targetArea} before your aliyah to explore neighborhoods, schools, and daily life. Most successful olim make at least one pilot trip.`,
        urgency: "medium",
      },
      {
        title: "Research Israeli banking options",
        description:
          "Look into Bank Hapoalim, Leumi, or Discount. Some branches allow you to open an account before arriving in Israel, which smooths your first weeks.",
        urgency: "medium",
      },
      {
        title: "Begin Hebrew study now",
        description:
          "As a new oleh you are entitled to free Ulpan upon arrival. Starting online with Duolingo, Pimsleur, or a tutor before you arrive gives you a significant advantage.",
        urgency: "low",
      },
    ],
    timeline_phases: [
      {
        phase: "Preparation",
        duration: "Months 1-3",
        tasks: [
          "Submit aliyah application to NBN or Jewish Agency",
          "Gather and apostille all required documents",
          `Research neighborhoods in ${data.targetArea}`,
          "Connect with Anglo community groups online",
        ],
      },
      {
        phase: "Pre-Aliyah",
        duration: "Months 3-6",
        tasks: [
          `Pilot trip to ${data.targetArea}`,
          "Secure housing (rent first, buy later)",
          "Arrange shipping of belongings",
          "Notify relevant government agencies of move",
        ],
      },
      {
        phase: "Arrival & Absorption",
        duration: "Months 6-12",
        tasks: [
          "Collect Teudat Zehut at airport or NBN office",
          "Register with Bituach Leumi (National Insurance)",
          "Enroll in Ulpan (free for olim)",
          "Open Israeli bank account",
          "Register children in school",
        ],
      },
      {
        phase: "Integration",
        duration: "Year 2",
        tasks: [
          "Pursue employment or business setup",
          "Join community organizations",
          "Continue Hebrew study",
          "Explore long-term housing purchase",
        ],
      },
    ],
    document_checklist: [
      { doc: "Valid passport (min. 2 years validity)", country_specific: false },
      { doc: "Birth certificate (apostilled)", country_specific: false },
      {
        doc: "Jewish documentation (conversion certificate, Bar/Bat Mitzvah certificate, synagogue letter)",
        country_specific: false,
      },
      {
        doc: "Marriage certificate (if applicable, apostilled)",
        country_specific: false,
      },
      { doc: "Divorce decree (if applicable)", country_specific: false },
      {
        doc: "Children's birth certificates (apostilled)",
        country_specific: false,
      },
      { doc: "Medical records and vaccination history", country_specific: false },
      {
        doc: `${data.country} police clearance certificate`,
        country_specific: true,
      },
      {
        doc: "Professional degree and license translations (if applicable)",
        country_specific: false,
      },
      { doc: "Bank statements (last 6 months)", country_specific: false },
    ],
  };
}

export async function generateAliyahPlan(
  data: FormSchema
): Promise<AiPlanSchema> {
  const provider = process.env.AI_PROVIDER ?? "anthropic";

  try {
    if (provider === "openai") {
      const { generateWithOpenAI } = await import("./providers/openai");
      return await generateWithOpenAI(data);
    } else {
      const { generateWithAnthropic } = await import("./providers/anthropic");
      return await generateWithAnthropic(data);
    }
  } catch (error) {
    console.error("[AI] Generation failed, using rule-based fallback:", error);
    return buildFallbackPlan(data);
  }
}
