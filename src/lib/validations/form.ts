import { z } from "zod";

export const countrySchema = z.enum([
  "USA",
  "UK",
  "Canada",
  "Australia",
  "South Africa",
  "France",
  "Other",
]);

export const targetAreaSchema = z.enum([
  "Tel Aviv",
  "Jerusalem",
  "Ra'anana/Herzliya",
  "Modi'in",
  "Beer Sheva",
  "Haifa",
  "Other",
]);

export const timelineSchema = z.enum([
  "0-6 months",
  "6-12 months",
  "1-2 years",
  "Just exploring",
]);

export const familyTypeSchema = z.enum([
  "Single",
  "Couple",
  "Couple with children",
  "Retiree/s",
]);

export const careerSchema = z.enum([
  "Remote worker",
  "Need Israeli employment",
  "Self-employed",
  "Student",
  "Retired",
]);

export const spouseCareerSchema = z.enum([
  "N/A",
  "Remote",
  "Needs Israeli job",
  "Professional license transfer",
  "Other",
]);

export const concernSchema = z.enum([
  "Bureaucracy",
  "Housing",
  "Healthcare",
  "Schools",
  "Employment",
  "Hebrew",
  "Finance",
  "Community",
]);

export const formSchema = z.object({
  country: countrySchema,
  targetArea: targetAreaSchema,
  timeline: timelineSchema,
  familyType: familyTypeSchema,
  career: careerSchema,
  spouseCareer: spouseCareerSchema,
  concerns: z.array(concernSchema).min(1, "Select at least one concern"),
  firstName: z.string().min(1, "First name is required").max(100),
  email: z.string().email("Valid email required"),
  gdprConsent: z.literal(true, { message: "Consent is required" }),
});

export type FormSchema = z.infer<typeof formSchema>;

export const aiPlanSchema = z.object({
  readiness_score: z.number().min(0).max(100),
  intent_score: z.number().min(0).max(100),
  intent_band: z.enum(["Exploring", "Warming Up", "Committed", "Ready to Launch"]),
  personal_snapshot: z.string(),
  profile_meaning: z.string(),
  assessment: z.string(),
  country_notes: z.string(),
  location_notes: z.string(),
  action_items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        urgency: z.enum(["high", "medium", "low"]),
      })
    )
    .length(5),
  timeline_phases: z.array(
    z.object({
      phase: z.string(),
      duration: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  document_checklist: z.array(
    z.object({
      doc: z.string(),
      country_specific: z.boolean(),
    })
  ),
  consultation_questions: z.array(z.string()).length(3),
  next_step: z.string(),
  disclaimer: z.string(),
});

export type AiPlanSchema = z.infer<typeof aiPlanSchema>;
