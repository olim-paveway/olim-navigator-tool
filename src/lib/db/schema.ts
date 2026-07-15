import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export type AiPlan = {
  readiness_score: number;
  intent_score: number;
  intent_band: "Exploring" | "Warming Up" | "Committed" | "Ready to Launch";
  personal_snapshot: string;
  profile_meaning: string;
  assessment: string;
  country_notes: string;
  location_notes: string;
  action_items: Array<{
    title: string;
    description: string;
    urgency: "high" | "medium" | "low";
  }>;
  timeline_phases: Array<{
    phase: string;
    duration: string;
    tasks: string[];
  }>;
  document_checklist: Array<{
    doc: string;
    country_specific: boolean;
  }>;
  consultation_questions: string[];
  next_step: string;
  disclaimer: string;
};

export const leadStatusEnum = pgEnum("lead_status", [
  "pending",
  "generating",
  "completed",
  "failed",
]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Contact
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  gdprConsent: text("gdpr_consent").notNull().default("true"),
  // Form answers
  country: text("country").notNull(),
  targetArea: text("target_area").notNull(),
  timeline: text("timeline").notNull(),
  familyType: text("family_type").notNull(),
  career: text("career").notNull(),
  spouseCareer: text("spouse_career").notNull(),
  concerns: jsonb("concerns").$type<string[]>().notNull().default([]),
  // AI output
  readinessScore: integer("readiness_score"),
  aiPlan: jsonb("ai_plan").$type<AiPlan>(),
  pdfUrl: text("pdf_url"),
  // Pipeline state
  status: leadStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  // UTM tracking
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  // Email lifecycle
  reportSentAt: timestamp("report_sent_at"),
  followUpSentAt: timestamp("follow_up_sent_at"),
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
