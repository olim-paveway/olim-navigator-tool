import type { FormSchema, AiPlanSchema } from "@/lib/validations/form";

function calcIntentScore(data: FormSchema): number {
  const timelinePts =
    data.timeline === "0-6 months" ? 40 :
    data.timeline === "6-12 months" ? 30 :
    data.timeline === "1-2 years" ? 20 : 10;
  const concernPts = data.concerns.length >= 4 ? 25 : data.concerns.length >= 2 ? 15 : 8;
  const familyPts =
    data.familyType === "Couple with children" ? 20 :
    data.familyType === "Couple" ? 15 :
    data.familyType === "Retiree/s" ? 12 : 10;
  const careerPts =
    data.career === "Remote worker" ? 15 :
    data.career === "Retired" ? 12 :
    data.career === "Self-employed" ? 10 :
    data.career === "Student" ? 8 : 5;
  return Math.min(100, timelinePts + concernPts + familyPts + careerPts);
}

function intentBand(
  score: number
): "Exploring" | "Warming Up" | "Committed" | "Ready to Launch" {
  if (score >= 76) return "Ready to Launch";
  if (score >= 56) return "Committed";
  if (score >= 31) return "Warming Up";
  return "Exploring";
}

function buildFallbackPlan(data: FormSchema): AiPlanSchema {
  const readinessScore =
    data.timeline === "0-6 months" ? 65 :
    data.timeline === "6-12 months" ? 45 :
    data.timeline === "1-2 years" ? 35 : 22;

  const intentScore = calcIntentScore(data);
  const band = intentBand(intentScore);

  const organisation =
    ["USA", "UK", "Canada", "South Africa"].includes(data.country)
      ? "Nefesh B'Nefesh (NBN)"
      : "the Jewish Agency";

  return {
    readiness_score: readinessScore,
    intent_score: intentScore,
    intent_band: band,
    personal_snapshot: data.targetArea === "Other"
      ? `You are a ${data.familyType.toLowerCase()} from ${data.country} still weighing where in Israel to land — and your aliyah journey starts here. Based on your profile, you are in the "${band}" phase of your aliyah planning.`
      : `You are a ${data.familyType.toLowerCase()} from ${data.country} with your sights set on ${data.targetArea} — and your aliyah journey starts here. Based on your profile, you are in the "${band}" phase of your aliyah planning.`,
    profile_meaning: data.targetArea === "Other"
      ? `As a ${data.career.toLowerCase()} ${data.familyType.toLowerCase()} from ${data.country}, your move is very achievable — ${data.country} is one of the better-supported origins for aliyah. Your career situation as a ${data.career.toLowerCase()} is a key factor in your financial planning and visa timing, and choosing the right city will shape the rest.`
      : `As a ${data.career.toLowerCase()} ${data.familyType.toLowerCase()} from ${data.country}, your move to ${data.targetArea} is very achievable — ${data.country} is one of the better-supported origins for aliyah. Your career situation as a ${data.career.toLowerCase()} is a key factor in your financial planning and visa timing.`,
    assessment: `Based on your profile as someone from ${data.country} planning to move to ${data.targetArea}, you have a solid foundation to begin your aliyah journey. Your ${data.familyType.toLowerCase()} profile and ${data.career.toLowerCase()} situation are factors we help many olim navigate successfully.\n\nOlim Paveway specialises in exactly your type of move. We have deep experience helping families from ${data.country} settle in ${data.targetArea} and can guide you through every step of the process — from your initial application through your first year of integration.\n\nThe key to a successful aliyah is starting early with both the paperwork and the mental preparation. We recommend booking a free consultation to build your truly personalised roadmap.`,
    country_notes: `As someone from ${data.country}, your aliyah application is handled by ${organisation}. ${data.country === "USA" || data.country === "Canada" ? "NBN offers subsidised flights and ulpan scholarships for North American olim — be sure to claim these benefits early." : data.country === "UK" ? "British olim have strong NBN support; prepare for an NHS-to-Kupat Cholim healthcare transition and a likely salary adjustment." : data.country === "South Africa" ? "SA olim have a strong community in Ra'anana and Netanya — connect with the SA olim WhatsApp groups early. Plan your property sale timeline carefully." : "Locate your nearest Jewish Agency shaliach early and verify your Jewish status documentation requirements, as these can vary by country."}`,
    location_notes: data.targetArea === "Other"
      ? `You haven't settled on a specific landing city yet, and that's a completely normal place to be at this stage. The right fit depends on your budget, family needs, religious or community preference, and career — for example, Tel Aviv and Ra'anana suit different priorities than Jerusalem or Beer Sheva. Narrowing this down is exactly what an Olim Paveway consultation can help with.`
      : `${data.targetArea} is a popular destination for ${data.familyType.toLowerCase()} olim from ${data.country}. ${data.targetArea === "Tel Aviv" ? "Expect high living costs (₪8,000–14,000/mo for a family apartment) but excellent employment opportunities, especially in tech." : data.targetArea === "Jerusalem" ? "Jerusalem offers a deeply meaningful environment with a strong Anglo community in Katamon, Baka, and Talpiot at somewhat lower rents than Tel Aviv." : data.targetArea === "Ra'anana/Herzliya" ? "Ra'anana and Herzliya are the top choice for English-speaking families — excellent schools, large Anglo community, and strong professional networks." : data.targetArea === "Modi'in" ? "Modi'in is ideal for families — central location, excellent schools, active Anglo community, and more affordable rents than coastal cities." : data.targetArea === "Beer Sheva" ? "Beer Sheva offers the most affordable rents of any major city, government incentives for periphery olim, and a growing tech sector anchored by Ben-Gurion University." : "Haifa combines affordability with quality of life — the Carmel area is preferred by Anglo olim, with good access to the Technion and tech industry."}`,
    action_items: [
      {
        title: `Register with ${organisation}`,
        description: `Begin your formal aliyah application immediately at ${data.country === "USA" || data.country === "Canada" ? "nbn.org.il" : data.country === "UK" ? "nbn.org.uk" : "jewishagency.org"}. This is the most time-sensitive step — it determines your eligibility, timeline, and absorption benefits.`,
        urgency: "high",
      },
      {
        title: "Gather and apostille identity documents",
        description: `Collect birth certificates, marriage certificate (if applicable), and Jewish heritage documentation. Apostilling these documents can take 4–8 weeks — start immediately to avoid delays.`,
        urgency: "high",
      },
      {
        title: `Book a pilot trip to ${data.targetArea}`,
        description: `Visit ${data.targetArea} before your aliyah to explore neighbourhoods, schools, and daily life. Most successful olim make at least one pilot trip — it dramatically improves their integration.`,
        urgency: "medium",
      },
      {
        title: "Research Israeli banking and financial planning",
        description: `Look into Bank Hapoalim, Leumi, or Discount Bank — some branches allow you to open an account before arriving. Also consult a cross-border financial advisor about ${data.country} pension and tax implications.`,
        urgency: "medium",
      },
      {
        title: "Start Hebrew study now",
        description: `As a new oleh you are entitled to free Ulpan upon arrival. Starting online with Duolingo, Pimsleur, or a tutor before you arrive gives you a significant advantage in your first weeks.`,
        urgency: "low",
      },
    ],
    timeline_phases: [
      {
        phase: "Preparation",
        duration: "Months 1–3",
        tasks: [
          `Submit aliyah application to ${organisation}`,
          "Gather and apostille all required documents",
          `Research neighbourhoods in ${data.targetArea}`,
          "Connect with Anglo community groups online",
          "Book free Olim Paveway consultation",
        ],
      },
      {
        phase: "Pre-Aliyah",
        duration: "Months 3–6",
        tasks: [
          `Pilot trip to ${data.targetArea}`,
          "Secure housing (rent first, buy later)",
          "Arrange shipping of belongings",
          "Notify relevant government agencies of move",
          "Set up Israeli bank account pre-arrival (if possible)",
        ],
      },
      {
        phase: "Arrival & Absorption",
        duration: "Months 6–12",
        tasks: [
          "Collect Teudat Zehut at Ben Gurion or NBN office",
          "Register with Bituach Leumi (National Insurance) within 90 days",
          "Enrol in Ulpan (free for olim)",
          "Register with Kupat Cholim (HMO) for healthcare",
          data.familyType === "Couple with children" ? "Register children in school (contact your municipality)" : "Join community organisations and Anglo groups",
        ],
      },
      {
        phase: "Integration",
        duration: "Year 2",
        tasks: [
          data.career === "Need Israeli employment" ? "Begin active Israeli job search — update CV to Israeli format" : "Establish remote work or local business routines",
          "Continue Hebrew study and language progress",
          "Build local community connections",
          "Explore long-term housing — renting before buying is strongly advised",
        ],
      },
    ],
    document_checklist: [
      { doc: "Valid passport (minimum 2 years remaining validity)", country_specific: false },
      { doc: "Birth certificate (apostilled)", country_specific: false },
      { doc: "Jewish documentation (conversion certificate, Bar/Bat Mitzvah certificate, or synagogue letter)", country_specific: false },
      { doc: "Marriage certificate (if applicable, apostilled)", country_specific: false },
      { doc: "Divorce decree (if applicable)", country_specific: false },
      { doc: "Children's birth certificates (apostilled)", country_specific: false },
      { doc: "Medical records and vaccination history", country_specific: false },
      { doc: `${data.country} police clearance certificate`, country_specific: true },
      { doc: "Professional degree and licence translations (if applicable)", country_specific: false },
      { doc: "Bank statements (last 6 months)", country_specific: false },
      { doc: `${data.country} tax clearance / residency termination documentation`, country_specific: true },
    ],
    consultation_questions: [
      `What specific neighbourhood in ${data.targetArea} would best suit your ${data.familyType.toLowerCase()} lifestyle and budget?`,
      `Given your background as a ${data.career.toLowerCase()}, what is the best strategy for financial stability in your first year in Israel?`,
      `What are the most common challenges you have seen for ${data.country} olim making this specific move?`,
    ],
    next_step: `This week, visit ${data.country === "USA" || data.country === "Canada" ? "nbn.org.il" : data.country === "UK" ? "nbn.org.uk" : "jewishagency.org"} and create your aliyah profile — this takes 20 minutes and officially starts your journey with the support of your aliyah organisation.`,
    disclaimer:
      "This aliyah action plan is generated by AI for informational and planning purposes only. It does not constitute legal, immigration, financial, or tax advice. Aliyah eligibility, benefits, and procedures are subject to change. Always verify current requirements directly with Nefesh B'Nefesh, the Jewish Agency, or a qualified aliyah advisor before making decisions. Olim Paveway's consultation service can connect you with licensed professionals. © Olim Paveway.",
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
