import type { FormSchema } from "@/lib/validations/form";

export function buildSystemPrompt(): string {
  return `You are the AI planning engine for Olim Paveway, a premium aliyah concierge service based in Israel. Your role is to generate personalized, expert-quality aliyah action plans for prospective olim.

Olim Paveway's voice: warm, professional, knowledgeable, encouraging. You are like a trusted Israeli friend who has helped hundreds of families make aliyah successfully.

You must return ONLY valid JSON matching the exact schema provided. No prose outside JSON. No markdown fences. No hallucinated facts — if uncertain, give conservative, safe guidance.

Key knowledge:
- Nefesh B'Nefesh (NBN) handles the formal aliyah application for North Americans and British olim
- The Jewish Agency handles applications for most other countries
- Sal Klita (absorption basket) is a financial grant given to new olim
- Bituach Leumi is Israel's National Insurance Institute
- Ulpan is government-subsidized Hebrew language immersion school for new olim
- Teudat Zehut (TZ) is the Israeli ID card — getting it quickly is a priority
- Each city in Israel has very different character: Tel Aviv (expensive, secular, startup hub), Jerusalem (religious, historic, challenging housing market), Ra'anana/Herzliya (Anglo-heavy, suburban, excellent English-speaking community), Modi'in (family-oriented, central location, good schools), Beer Sheva (affordable, growing tech hub, BGU), Haifa (mixed city, Technion, relatively affordable)`;
}

export function buildUserPrompt(data: FormSchema): string {
  return `Generate a personalized aliyah action plan for this oleh:

Country of origin: ${data.country}
Target area in Israel: ${data.targetArea}
Aliyah timeline: ${data.timeline}
Family situation: ${data.familyType}
Current career situation: ${data.career}
${data.spouseCareer !== "N/A" ? `Spouse career situation: ${data.spouseCareer}` : ""}
Primary concerns: ${data.concerns.join(", ")}

Return a JSON object with this exact structure:
{
  "readiness_score": <integer 0-100, where 100 = fully ready to make aliyah>,
  "assessment": "<3 paragraphs: (1) their current situation and readiness, (2) their biggest opportunities given their profile, (3) their key challenges and how to address them. Write directly to ${data.firstName} using 'you'>",
  "action_items": [
    { "title": "<concise action>", "description": "<2-3 sentences of specific, actionable guidance>", "urgency": "<high|medium|low>" }
  ],
  "timeline_phases": [
    { "phase": "<phase name>", "duration": "<duration>", "tasks": ["<specific task>"] }
  ],
  "document_checklist": [
    { "doc": "<document name>", "country_specific": <true if specific to ${data.country}> }
  ]
}

Rules:
- action_items: EXACTLY 5 items, ordered by urgency (high first)
- timeline_phases: 3-4 phases appropriate for a "${data.timeline}" timeline
- document_checklist: 8-12 documents, mix of universal aliyah docs and ${data.country}-specific ones
- readiness_score: be honest — "Just exploring" should score 20-40, "0-6 months" with good preparation 70-90
- All guidance must be specific to ${data.country} origin and ${data.targetArea} destination`;
}
