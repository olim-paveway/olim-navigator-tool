# Aliyah Navigator Tool — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personalized AI-powered aliyah planning tool that captures qualified leads, generates a custom PDF action plan via AI, delivers it by email, and stores leads in a Neon PostgreSQL database — all under navigator.olimpaveway.com.

**Architecture:** 8-step React state-machine form wizard → Edge API route validates + persists to Neon → background job calls AI (Anthropic or OpenAI via env-var-selected provider) → @react-pdf/renderer generates branded PDF → Vercel Blob Storage stores it → Resend delivers it with the PDF attached. Admin dashboard at /admin reads leads via API-key-protected route.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Framer Motion · Zod · Drizzle ORM · Neon Serverless PostgreSQL · @anthropic-ai/sdk + openai (abstracted) · @react-pdf/renderer · @vercel/blob · Resend · NextAuth.js (admin)

---

## Pre-flight checklist (do these manually before Task 1)

- [ ] Node 20+ installed (`node -v`)
- [ ] pnpm installed (`npm i -g pnpm`)
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Git configured with name + email

---

## Task 1: Project Bootstrap

**Files:**
- Create: `~/Documents/olim-paveway/` (root — all paths below are relative to this)
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `.gitignore`
- Create: `.env.local.example`

**Step 1: Scaffold the Next.js project**

```bash
cd ~/Documents
npx create-next-app@14 olim-paveway \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
cd olim-paveway
```

**Step 2: Install all dependencies in one shot**

```bash
pnpm add \
  drizzle-orm \
  @neondatabase/serverless \
  drizzle-orm \
  zod \
  framer-motion \
  @anthropic-ai/sdk \
  openai \
  @react-pdf/renderer \
  @vercel/blob \
  resend \
  next-auth \
  @auth/drizzle-adapter \
  uuid

pnpm add -D \
  drizzle-kit \
  @types/uuid \
  @types/react-pdf
```

**Step 3: Update next.config.ts** — enable serverExternalPackages for canvas (pdf renderer needs it)

Replace the generated `next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;
```

**Step 4: Create .env.local.example**

```bash
cat > .env.local.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# AI Provider — set to "anthropic" or "openai"
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=navigator@olimpaveway.com

# Admin
ADMIN_API_KEY=generate-a-random-32-char-string
NEXTAUTH_SECRET=generate-a-random-32-char-string
NEXTAUTH_URL=http://localhost:3000

# CRM (optional for MVP — leave blank to skip)
FLUENTCRM_API_KEY=
FLUENTCRM_BASE_URL=
EOF
```

**Step 5: Initialize git**

```bash
git init
git add .
git commit -m "chore: bootstrap Next.js 14 project with dependencies"
```

**Verify:** `pnpm dev` starts without errors at http://localhost:3000

---

## Task 2: Database Schema + Drizzle Setup

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Write drizzle.config.ts**

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Step 2: Write src/lib/db/schema.ts**

```typescript
import { pgTable, uuid, text, integer, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("lead_status", [
  "pending",
  "generating",
  "completed",
  "failed",
]);

export const urgencyEnum = pgEnum("urgency_level", ["high", "medium", "low"]);

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
  status: statusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  // UTM tracking
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// Mirrored in src/types/index.ts — keep in sync
export type AiPlan = {
  readiness_score: number;
  assessment: string;
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
};
```

**Step 3: Write src/lib/db/index.ts**

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Step 4: Generate and run the migration**

You need DATABASE_URL in your environment. Copy `.env.local.example` to `.env.local` and fill in the Neon connection string first.

```bash
cp .env.local.example .env.local
# Fill in DATABASE_URL in .env.local, then:
pnpm drizzle-kit generate:pg
pnpm drizzle-kit push:pg
```

Expected output: `Your schema changes have been successfully applied`

**Step 5: Commit**

```bash
git add src/lib/db/ drizzle/ drizzle.config.ts
git commit -m "feat: add Drizzle schema and Neon database connection"
```

---

## Task 3: Types + Zod Validation Schemas

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/validations/form.ts`

**Step 1: Write src/types/index.ts**

```typescript
export type Country = "USA" | "UK" | "Canada" | "Australia" | "South Africa" | "France" | "Other";
export type TargetArea = "Tel Aviv" | "Jerusalem" | "Ra'anana/Herzliya" | "Modi'in" | "Beer Sheva" | "Haifa" | "Other";
export type Timeline = "0-6 months" | "6-12 months" | "1-2 years" | "Just exploring";
export type FamilyType = "Single" | "Couple" | "Couple with children" | "Retiree/s";
export type Career = "Remote worker" | "Need Israeli employment" | "Self-employed" | "Student" | "Retired";
export type SpouseCareer = "N/A" | "Remote" | "Needs Israeli job" | "Professional license transfer" | "Other";
export type Concern = "Bureaucracy" | "Housing" | "Healthcare" | "Schools" | "Employment" | "Hebrew" | "Finance" | "Community";

export type FormData = {
  country: Country;
  targetArea: TargetArea;
  timeline: Timeline;
  familyType: FamilyType;
  career: Career;
  spouseCareer: SpouseCareer;
  concerns: Concern[];
  firstName: string;
  email: string;
  gdprConsent: boolean;
};

export type GenerationStatus = "pending" | "generating" | "completed" | "failed";

export type StatusResponse = {
  status: GenerationStatus;
  pdfUrl?: string;
  readinessScore?: number;
  error?: string;
};
```

**Step 2: Write src/lib/validations/form.ts**

```typescript
import { z } from "zod";

export const countrySchema = z.enum(["USA", "UK", "Canada", "Australia", "South Africa", "France", "Other"]);
export const targetAreaSchema = z.enum(["Tel Aviv", "Jerusalem", "Ra'anana/Herzliya", "Modi'in", "Beer Sheva", "Haifa", "Other"]);
export const timelineSchema = z.enum(["0-6 months", "6-12 months", "1-2 years", "Just exploring"]);
export const familyTypeSchema = z.enum(["Single", "Couple", "Couple with children", "Retiree/s"]);
export const careerSchema = z.enum(["Remote worker", "Need Israeli employment", "Self-employed", "Student", "Retired"]);
export const spouseCareerSchema = z.enum(["N/A", "Remote", "Needs Israeli job", "Professional license transfer", "Other"]);
export const concernSchema = z.enum(["Bureaucracy", "Housing", "Healthcare", "Schools", "Employment", "Hebrew", "Finance", "Community"]);

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
  gdprConsent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

export type FormSchema = z.infer<typeof formSchema>;

export const submitResponseSchema = z.object({
  leadId: z.string().uuid(),
});

export const aiPlanSchema = z.object({
  readiness_score: z.number().min(0).max(100),
  assessment: z.string(),
  action_items: z.array(z.object({
    title: z.string(),
    description: z.string(),
    urgency: z.enum(["high", "medium", "low"]),
  })).length(5),
  timeline_phases: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    tasks: z.array(z.string()),
  })),
  document_checklist: z.array(z.object({
    doc: z.string(),
    country_specific: z.boolean(),
  })),
});

export type AiPlanSchema = z.infer<typeof aiPlanSchema>;
```

**Step 3: Commit**

```bash
git add src/types/ src/lib/validations/
git commit -m "feat: add TypeScript types and Zod validation schemas"
```

---

## Task 4: AI Provider Abstraction Layer

**Files:**
- Create: `src/lib/ai/providers/anthropic.ts`
- Create: `src/lib/ai/providers/openai.ts`
- Create: `src/lib/ai/generate.ts`
- Create: `src/lib/ai/prompt.ts`

**Step 1: Write the system prompt — src/lib/ai/prompt.ts**

```typescript
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
- Each city in Israel has very different character: Tel Aviv (expensive, secular, startup), Jerusalem (religious, historic, affordable apartments harder), Ra'anana/Herzliya (Anglo-heavy, suburban, good schools), Modi'in (family-oriented, central), Beer Sheva (affordable, tech hub, BGU), Haifa (mixed, Technion, affordable)`;
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
  "assessment": "<3 paragraphs: (1) their current situation and readiness, (2) their biggest opportunities, (3) their key challenges and how to address them. Write directly to ${data.firstName} using 'you'>",
  "action_items": [
    { "title": "<concise action>", "description": "<2-3 sentences of specific, actionable guidance>", "urgency": "<high|medium|low>" }
  ],
  "timeline_phases": [
    { "phase": "<phase name>", "duration": "<duration>", "tasks": ["<specific task>", ...] }
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
```

**Step 2: Write src/lib/ai/providers/anthropic.ts**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { aiPlanSchema, type AiPlanSchema } from "@/lib/validations/form";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import type { FormSchema } from "@/lib/validations/form";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateWithAnthropic(data: FormSchema): Promise<AiPlanSchema> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(data) }],
    tools: [
      {
        name: "generate_aliyah_plan",
        description: "Generate a structured aliyah action plan",
        input_schema: {
          type: "object" as const,
          properties: {
            readiness_score: { type: "number" },
            assessment: { type: "string" },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  urgency: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["title", "description", "urgency"],
              },
            },
            timeline_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                },
                required: ["phase", "duration", "tasks"],
              },
            },
            document_checklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  doc: { type: "string" },
                  country_specific: { type: "boolean" },
                },
                required: ["doc", "country_specific"],
              },
            },
          },
          required: ["readiness_score", "assessment", "action_items", "timeline_phases", "document_checklist"],
        },
      },
    ],
    tool_choice: { type: "tool" as const, name: "generate_aliyah_plan" },
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use response from Anthropic");
  }

  return aiPlanSchema.parse(toolUse.input);
}
```

**Step 3: Write src/lib/ai/providers/openai.ts**

```typescript
import OpenAI from "openai";
import { aiPlanSchema, type AiPlanSchema } from "@/lib/validations/form";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import type { FormSchema } from "@/lib/validations/form";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateWithOpenAI(data: FormSchema): Promise<AiPlanSchema> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(data) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generate_aliyah_plan",
          description: "Generate a structured aliyah action plan",
          parameters: {
            type: "object",
            properties: {
              readiness_score: { type: "number" },
              assessment: { type: "string" },
              action_items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    urgency: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["title", "description", "urgency"],
                },
              },
              timeline_phases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    duration: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                  },
                },
              },
              document_checklist: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    doc: { type: "string" },
                    country_specific: { type: "boolean" },
                  },
                },
              },
            },
            required: ["readiness_score", "assessment", "action_items", "timeline_phases", "document_checklist"],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "generate_aliyah_plan" } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No tool call response from OpenAI");

  return aiPlanSchema.parse(JSON.parse(toolCall.function.arguments));
}
```

**Step 4: Write src/lib/ai/generate.ts — the unified entry point**

```typescript
import type { FormSchema, AiPlanSchema } from "@/lib/validations/form";

// Rule-based fallback plan if AI fails
function buildFallbackPlan(data: FormSchema): AiPlanSchema {
  return {
    readiness_score: data.timeline === "0-6 months" ? 65 : data.timeline === "6-12 months" ? 45 : 25,
    assessment: `Based on your profile as someone from ${data.country} planning to move to ${data.targetArea}, you have a solid foundation to begin your aliyah journey. Your ${data.familyType.toLowerCase()} profile and ${data.career.toLowerCase()} career situation are factors we've helped many olim navigate successfully.\n\nOlim Paveway specializes in exactly your type of move. We have deep experience helping families from ${data.country} settle in ${data.targetArea} and can guide you through every step.\n\nThe key to a successful aliyah is starting the paperwork and planning early. We recommend booking a consultation with our team to build your personalized roadmap.`,
    action_items: [
      { title: "Contact Nefesh B'Nefesh or Jewish Agency", description: "Begin your formal aliyah application immediately. This is the most time-sensitive step and determines your eligibility and benefits.", urgency: "high" },
      { title: "Gather identity documents", description: "Collect birth certificates, marriage certificate (if applicable), and Jewish heritage documentation. These take time to apostille.", urgency: "high" },
      { title: "Book a pilot trip to Israel", description: `Visit ${data.targetArea} before your aliyah to explore neighborhoods, schools, and get a feel for daily life.`, urgency: "medium" },
      { title: "Open an Israeli bank account", description: "Research banks like Bank Hapoalim, Leumi, or Discount. Some allow you to open an account before arriving.", urgency: "medium" },
      { title: "Enroll in Ulpan (Hebrew classes)", description: "Begin online Hebrew study now. As a new oleh you are entitled to free Ulpan upon arrival.", urgency: "low" },
    ],
    timeline_phases: [
      { phase: "Preparation", duration: "Months 1-3", tasks: ["Submit aliyah application", "Gather documents", "Research neighborhoods in " + data.targetArea] },
      { phase: "Pre-Aliyah", duration: "Months 3-6", tasks: ["Pilot trip to Israel", "Secure housing", "Ship belongings"] },
      { phase: "Arrival & Absorption", duration: "Months 6-12", tasks: ["Collect Teudat Zehut", "Register with Bituach Leumi", "Enroll in Ulpan", "Open bank account"] },
      { phase: "Integration", duration: "Year 2", tasks: ["Find employment or transfer business", "Join community organizations", "Continue Hebrew study"] },
    ],
    document_checklist: [
      { doc: "Valid passport", country_specific: false },
      { doc: "Birth certificate (apostilled)", country_specific: false },
      { doc: "Jewish documentation (conversion certificate, Bar/Bat Mitzvah certificate)", country_specific: false },
      { doc: "Marriage certificate (if applicable, apostilled)", country_specific: false },
      { doc: "Divorce decree (if applicable)", country_specific: false },
      { doc: "Children's birth certificates (apostilled)", country_specific: false },
      { doc: "Medical records and vaccination history", country_specific: false },
      { doc: `${data.country} police clearance certificate`, country_specific: true },
      { doc: "Professional license/degree translations", country_specific: false },
      { doc: "Bank statements (last 6 months)", country_specific: false },
    ],
  };
}

export async function generateAliyahPlan(data: FormSchema): Promise<AiPlanSchema> {
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
    console.error("[AI] Generation failed, using fallback:", error);
    return buildFallbackPlan(data);
  }
}
```

**Step 5: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: add AI provider abstraction (Anthropic + OpenAI) with fallback"
```

---

## Task 5: PDF Generation

**Files:**
- Create: `src/lib/pdf/generate.tsx`
- Create: `src/lib/pdf/upload.ts`

Note: `@react-pdf/renderer` uses React-like syntax but renders to PDF — it must run in a Node.js context (not Edge Runtime). The API route that calls this must NOT use `export const runtime = "edge"`.

**Step 1: Write src/lib/pdf/generate.tsx**

```tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import type { AiPlanSchema } from "@/lib/validations/form";
import type { FormSchema } from "@/lib/validations/form";

// Brand colors
const COLORS = {
  olive: "#5C6B3A",
  gold: "#B8962E",
  lightOlive: "#8A9B5C",
  cream: "#F8F4E8",
  darkText: "#1A1A1A",
  mutedText: "#6B7280",
  white: "#FFFFFF",
  highUrgency: "#DC2626",
  medUrgency: "#D97706",
  lowUrgency: "#059669",
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.white, padding: 0 },
  coverPage: { backgroundColor: COLORS.olive, padding: 48, minHeight: "100%" },
  bodyPage: { backgroundColor: COLORS.white, padding: 48 },
  // Cover
  coverLogo: { fontSize: 11, color: COLORS.gold, letterSpacing: 2, marginBottom: 8 },
  coverTitle: { fontSize: 28, fontWeight: "bold", color: COLORS.white, marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: COLORS.cream, marginBottom: 48 },
  scoreBox: { backgroundColor: COLORS.gold, borderRadius: 8, padding: 24, width: 160, alignItems: "center", marginBottom: 32 },
  scoreNumber: { fontSize: 56, fontWeight: "bold", color: COLORS.white },
  scoreLabel: { fontSize: 10, color: COLORS.white, letterSpacing: 1 },
  coverFooter: { position: "absolute", bottom: 48, left: 48, right: 48 },
  coverFooterText: { fontSize: 9, color: COLORS.cream, opacity: 0.7 },
  // Body
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.olive, marginBottom: 12, borderBottomWidth: 2, borderBottomColor: COLORS.gold, paddingBottom: 6 },
  paragraph: { fontSize: 10, color: COLORS.darkText, lineHeight: 1.6, marginBottom: 8 },
  // Action items
  actionItem: { marginBottom: 12, borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 6 },
  actionTitle: { fontSize: 11, fontWeight: "bold", color: COLORS.darkText, marginBottom: 3 },
  actionDesc: { fontSize: 9, color: COLORS.mutedText, lineHeight: 1.5 },
  urgencyBadge: { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, color: COLORS.white, marginBottom: 4, alignSelf: "flex-start" },
  // Timeline
  timelinePhase: { marginBottom: 16 },
  phaseName: { fontSize: 11, fontWeight: "bold", color: COLORS.olive },
  phaseDuration: { fontSize: 9, color: COLORS.gold, marginBottom: 4 },
  phaseTask: { fontSize: 9, color: COLORS.darkText, marginBottom: 2, paddingLeft: 12 },
  // Checklist
  checkItem: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
  checkbox: { width: 10, height: 10, borderWidth: 1, borderColor: COLORS.olive, borderRadius: 2, marginRight: 8 },
  checkText: { fontSize: 9, color: COLORS.darkText },
  countryBadge: { fontSize: 7, color: COLORS.gold, marginLeft: 6 },
  // CTA page
  ctaPage: { backgroundColor: COLORS.cream, padding: 48 },
  ctaTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.olive, marginBottom: 12 },
  ctaText: { fontSize: 11, color: COLORS.darkText, lineHeight: 1.6, marginBottom: 24 },
  ctaBox: { backgroundColor: COLORS.olive, borderRadius: 8, padding: 24, marginBottom: 24 },
  ctaBoxTitle: { fontSize: 13, fontWeight: "bold", color: COLORS.white, marginBottom: 8 },
  ctaBoxText: { fontSize: 10, color: COLORS.cream, lineHeight: 1.6 },
  website: { fontSize: 14, color: COLORS.gold, fontWeight: "bold", textAlign: "center" },
});

function urgencyColor(urgency: string): string {
  if (urgency === "high") return COLORS.highUrgency;
  if (urgency === "medium") return COLORS.medUrgency;
  return COLORS.lowUrgency;
}

type Props = {
  formData: Pick<FormSchema, "firstName" | "country" | "targetArea" | "timeline" | "familyType">;
  plan: AiPlanSchema;
};

function AliyahPlanDocument({ formData, plan }: Props) {
  const paragraphs = plan.assessment.split("\n").filter(Boolean);

  return (
    <Document title={`Aliyah Plan — ${formData.firstName}`} author="Olim Paveway">
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverLogo}>OLIM PAVEWAY</Text>
          <Text style={styles.coverTitle}>Your Personal{"\n"}Aliyah Action Plan</Text>
          <Text style={styles.coverSubtitle}>
            Prepared exclusively for {formData.firstName} · {formData.country} → {formData.targetArea}
          </Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{plan.readiness_score}</Text>
            <Text style={styles.scoreLabel}>READINESS SCORE</Text>
          </View>
          <Text style={{ color: COLORS.cream, fontSize: 10, marginBottom: 8 }}>
            Timeline: {formData.timeline} · {formData.familyType}
          </Text>
          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              This plan was generated exclusively for {formData.firstName} based on their unique situation.{"\n"}
              © {new Date().getFullYear()} Olim Paveway · www.olimpaveway.com · All rights reserved.
            </Text>
          </View>
        </View>
      </Page>

      {/* Page 2: Assessment + Action Items */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={styles.sectionTitle}>Your Personal Assessment</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
        ))}

        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Your 5 Priority Actions</Text>
          {plan.action_items.map((item, i) => (
            <View key={i} style={[styles.actionItem, { borderLeftColor: urgencyColor(item.urgency) }]}>
              <Text style={[styles.urgencyBadge, { backgroundColor: urgencyColor(item.urgency) }]}>
                {item.urgency.toUpperCase()}
              </Text>
              <Text style={styles.actionTitle}>{i + 1}. {item.title}</Text>
              <Text style={styles.actionDesc}>{item.description}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 3: Timeline + Document Checklist */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={styles.sectionTitle}>Your Aliyah Timeline</Text>
        {plan.timeline_phases.map((phase, i) => (
          <View key={i} style={styles.timelinePhase}>
            <Text style={styles.phaseName}>{phase.phase}</Text>
            <Text style={styles.phaseDuration}>{phase.duration}</Text>
            {phase.tasks.map((task, j) => (
              <Text key={j} style={styles.phaseTask}>• {task}</Text>
            ))}
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Document Checklist</Text>
          {plan.document_checklist.map((item, i) => (
            <View key={i} style={styles.checkItem}>
              <View style={styles.checkbox} />
              <Text style={styles.checkText}>{item.doc}</Text>
              {item.country_specific && (
                <Text style={styles.countryBadge}>({formData.country} specific)</Text>
              )}
            </View>
          ))}
        </View>
      </Page>

      {/* Page 4: CTA */}
      <Page size="A4" style={styles.ctaPage}>
        <Text style={styles.ctaTitle}>Ready to Make Aliyah{"\n"}the Right Way?</Text>
        <Text style={styles.ctaText}>
          This plan gives you the roadmap. Olim Paveway gives you the team.{"\n\n"}
          Our olim concierge service handles everything from your NBN application through your first year of integration — so you can focus on your family and your future in Israel, not on paperwork.
        </Text>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaBoxTitle}>What Olim Paveway handles for you:</Text>
          <Text style={styles.ctaBoxText}>
            ✓ Aliyah application preparation and submission{"\n"}
            ✓ Pre-aliyah pilot trip coordination{"\n"}
            ✓ Housing search and lease review{"\n"}
            ✓ Bank account opening assistance{"\n"}
            ✓ School enrollment for children{"\n"}
            ✓ Employment and business setup guidance{"\n"}
            ✓ 12-month post-arrival support
          </Text>
        </View>
        <Text style={styles.ctaText}>
          Book a free 30-minute consultation and let's build your aliyah plan together.
        </Text>
        <Text style={styles.website}>www.olimpaveway.com</Text>
      </Page>
    </Document>
  );
}

export async function generateAliyahPdf(
  formData: Pick<FormSchema, "firstName" | "country" | "targetArea" | "timeline" | "familyType">,
  plan: AiPlanSchema
): Promise<Buffer> {
  const doc = <AliyahPlanDocument formData={formData} plan={plan} />;
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

**Step 2: Write src/lib/pdf/upload.ts**

```typescript
import { put } from "@vercel/blob";

export async function uploadPdfToBlob(
  pdfBuffer: Buffer,
  leadId: string
): Promise<string> {
  const filename = `aliyah-plans/${leadId}.pdf`;
  const blob = await put(filename, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
  });
  return blob.url;
}
```

**Step 3: Commit**

```bash
git add src/lib/pdf/
git commit -m "feat: add PDF generation with @react-pdf/renderer and Vercel Blob upload"
```

---

## Task 6: Email Delivery

**Files:**
- Create: `src/lib/email/send.ts`
- Create: `src/lib/email/templates/delivery.tsx`

**Step 1: Write the email template — src/lib/email/templates/delivery.tsx**

```tsx
import * as React from "react";

type DeliveryEmailProps = {
  firstName: string;
  readinessScore: number;
  targetArea: string;
  pdfUrl: string;
};

export function DeliveryEmail({ firstName, readinessScore, targetArea, pdfUrl }: DeliveryEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: "'Georgia', serif", backgroundColor: "#F8F4E8", margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#F8F4E8", padding: "40px 20px" }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: "#5C6B3A", padding: "32px 40px" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#B8962E", letterSpacing: "2px" }}>OLIM PAVEWAY</p>
                    <h1 style={{ margin: "8px 0 0", fontSize: "24px", color: "#ffffff", fontWeight: "bold" }}>
                      Your Aliyah Plan is Ready
                    </h1>
                  </td>
                </tr>
                {/* Score */}
                <tr>
                  <td style={{ padding: "32px 40px 0" }}>
                    <table cellPadding="0" cellSpacing="0">
                      <tr>
                        <td style={{ backgroundColor: "#B8962E", borderRadius: "8px", padding: "20px 32px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}>{readinessScore}</p>
                          <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#ffffff", letterSpacing: "1px" }}>READINESS SCORE</p>
                        </td>
                        <td style={{ paddingLeft: "24px" }}>
                          <p style={{ margin: 0, fontSize: "16px", color: "#1A1A1A" }}>Hi {firstName},</p>
                          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>
                            Your personalized aliyah action plan for {targetArea} is attached to this email.
                            It was created specifically for your situation.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                {/* Body */}
                <tr>
                  <td style={{ padding: "24px 40px" }}>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6" }}>
                      Your plan includes:
                    </p>
                    <ul style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "2", paddingLeft: "20px" }}>
                      <li>Your personal readiness assessment</li>
                      <li>5 priority action items ranked by urgency</li>
                      <li>A phased aliyah timeline for your situation</li>
                      <li>A document checklist specific to your country of origin</li>
                    </ul>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6" }}>
                      The PDF is attached below. You can also{" "}
                      <a href={pdfUrl} style={{ color: "#5C6B3A" }}>view it online</a>.
                    </p>
                  </td>
                </tr>
                {/* CTA */}
                <tr>
                  <td style={{ padding: "0 40px 32px" }}>
                    <a
                      href="https://www.olimpaveway.com/consultation"
                      style={{
                        display: "inline-block",
                        backgroundColor: "#5C6B3A",
                        color: "#ffffff",
                        padding: "14px 32px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Book Your Free Consultation
                    </a>
                  </td>
                </tr>
                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: "#F8F4E8", padding: "24px 40px", borderTop: "1px solid #e5e7eb" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF" }}>
                      © {new Date().getFullYear()} Olim Paveway · www.olimpaveway.com
                      <br />
                      You received this because you requested an aliyah plan. To unsubscribe, reply with "unsubscribe".
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
```

**Step 2: Write src/lib/email/send.ts**

```typescript
import { Resend } from "resend";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DeliveryEmail } from "./templates/delivery";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendPlanEmailArgs = {
  to: string;
  firstName: string;
  readinessScore: number;
  targetArea: string;
  pdfUrl: string;
  pdfBuffer: Buffer;
};

export async function sendPlanEmail({
  to,
  firstName,
  readinessScore,
  targetArea,
  pdfUrl,
  pdfBuffer,
}: SendPlanEmailArgs) {
  const html = renderToStaticMarkup(
    createElement(DeliveryEmail, { firstName, readinessScore, targetArea, pdfUrl })
  );

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "navigator@olimpaveway.com",
    to,
    subject: `${firstName}, your personal aliyah plan is ready`,
    html,
    attachments: [
      {
        filename: "Your-Aliyah-Plan-Olim-Paveway.pdf",
        content: pdfBuffer,
      },
    ],
  });
}
```

**Step 3: Commit**

```bash
git add src/lib/email/
git commit -m "feat: add Resend email delivery with branded HTML template and PDF attachment"
```

---

## Task 7: API Routes

**Files:**
- Create: `src/app/api/submit/route.ts`
- Create: `src/app/api/status/[id]/route.ts`
- Create: `src/app/api/admin/leads/route.ts`

**Important:** The submit route triggers the generation pipeline asynchronously — it immediately returns a `leadId` and fires the pipeline in the background using `waitUntil` (Vercel Edge) or a similar pattern. The status route is polled every 2 seconds by the frontend.

**Step 1: Write src/app/api/submit/route.ts**

This route does NOT use Edge Runtime because it needs @react-pdf/renderer (Node.js only).

```typescript
import { NextRequest, NextResponse } from "next/server";
import { formSchema } from "@/lib/validations/form";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { generateAliyahPlan } from "@/lib/ai/generate";
import { generateAliyahPdf } from "@/lib/pdf/generate";
import { uploadPdfToBlob } from "@/lib/pdf/upload";
import { sendPlanEmail } from "@/lib/email/send";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let leadId: string | undefined;

  try {
    const body = await req.json();
    const parsed = formSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Extract UTM params from referer or body
    const utmSource = body.utmSource ?? null;
    const utmMedium = body.utmMedium ?? null;
    const utmCampaign = body.utmCampaign ?? null;

    // Insert lead in "pending" state
    const [lead] = await db.insert(leads).values({
      firstName: data.firstName,
      email: data.email,
      gdprConsent: data.gdprConsent ? "true" : "false",
      country: data.country,
      targetArea: data.targetArea,
      timeline: data.timeline,
      familyType: data.familyType,
      career: data.career,
      spouseCareer: data.spouseCareer,
      concerns: data.concerns,
      status: "pending",
      utmSource,
      utmMedium,
      utmCampaign,
    }).returning({ id: leads.id });

    leadId = lead.id;

    // Respond immediately with the leadId — client starts polling /api/status/[id]
    const response = NextResponse.json({ leadId }, { status: 202 });

    // Run the pipeline (non-blocking on Vercel via background execution)
    runGenerationPipeline(leadId, data).catch(async (err) => {
      console.error("[Pipeline] Fatal error:", err);
      if (leadId) {
        await db.update(leads)
          .set({ status: "failed", errorMessage: String(err), updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      }
    });

    return response;
  } catch (err) {
    console.error("[submit] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function runGenerationPipeline(leadId: string, data: import("@/lib/validations/form").FormSchema) {
  // Mark as generating
  await db.update(leads)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  // 1. Generate AI plan
  const aiPlan = await generateAliyahPlan(data);

  // 2. Generate PDF
  const pdfBuffer = await generateAliyahPdf(
    { firstName: data.firstName, country: data.country, targetArea: data.targetArea, timeline: data.timeline, familyType: data.familyType },
    aiPlan
  );

  // 3. Upload to Blob
  const pdfUrl = await uploadPdfToBlob(pdfBuffer, leadId);

  // 4. Send email
  await sendPlanEmail({
    to: data.email,
    firstName: data.firstName,
    readinessScore: aiPlan.readiness_score,
    targetArea: data.targetArea,
    pdfUrl,
    pdfBuffer,
  });

  // 5. Mark complete
  await db.update(leads)
    .set({
      status: "completed",
      readinessScore: aiPlan.readiness_score,
      aiPlan,
      pdfUrl,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));
}
```

**Step 2: Write src/app/api/status/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, params.id),
    columns: { status: true, pdfUrl: true, readinessScore: true, errorMessage: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: lead.status,
    pdfUrl: lead.pdfUrl ?? undefined,
    readinessScore: lead.readinessScore ?? undefined,
    error: lead.errorMessage ?? undefined,
  });
}
```

**Step 3: Write src/app/api/admin/leads/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

export const runtime = "edge";

function isAuthorized(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key");
  return apiKey === process.env.ADMIN_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const country = searchParams.get("country");
  const status = searchParams.get("status");
  const scoreMin = searchParams.get("scoreMin") ? parseInt(searchParams.get("scoreMin")!) : null;
  const scoreMax = searchParams.get("scoreMax") ? parseInt(searchParams.get("scoreMax")!) : null;

  const conditions = [
    country ? eq(leads.country, country) : undefined,
    status ? eq(leads.status, status as "pending" | "generating" | "completed" | "failed") : undefined,
    scoreMin !== null ? gte(leads.readinessScore, scoreMin) : undefined,
    scoreMax !== null ? lte(leads.readinessScore, scoreMax) : undefined,
  ].filter(Boolean) as Parameters<typeof and>;

  const rows = await db.query.leads.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: desc(leads.createdAt),
    limit,
    offset: (page - 1) * limit,
    columns: {
      id: true,
      firstName: true,
      email: true,
      country: true,
      targetArea: true,
      timeline: true,
      familyType: true,
      career: true,
      concerns: true,
      readinessScore: true,
      status: true,
      pdfUrl: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ leads: rows, page, limit });
}
```

**Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: add submit, status polling, and admin API routes"
```

---

## Task 8: Multi-Step Form Wizard

**Files:**
- Create: `src/components/form/AliyahForm.tsx`
- Create: `src/components/form/ProgressBar.tsx`
- Create: `src/components/form/steps/Step1Country.tsx`
- Create: `src/components/form/steps/Step2Area.tsx`
- Create: `src/components/form/steps/Step3Timeline.tsx`
- Create: `src/components/form/steps/Step4Family.tsx`
- Create: `src/components/form/steps/Step5Career.tsx`
- Create: `src/components/form/steps/Step6SpouseCareer.tsx`
- Create: `src/components/form/steps/Step7Concerns.tsx`
- Create: `src/components/form/steps/Step8Contact.tsx`
- Create: `src/components/form/SuccessScreen.tsx`
- Create: `src/components/form/LoadingScreen.tsx`
- Create: `src/components/ui/OptionCard.tsx`

**Step 1: Write shared OptionCard UI — src/components/ui/OptionCard.tsx**

```tsx
"use client";

type OptionCardProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
};

export function OptionCard({ label, selected, onClick, icon }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150
        flex items-center gap-3 font-medium text-sm
        ${selected
          ? "border-olive bg-olive/10 text-olive"
          : "border-gray-200 bg-white text-gray-700 hover:border-olive/40"
        }
      `}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
      {selected && <span className="ml-auto text-olive">✓</span>}
    </button>
  );
}
```

**Step 2: Write ProgressBar — src/components/form/ProgressBar.tsx**

```tsx
type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Step {step} of {totalSteps}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-olive transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

**Step 3: Write a representative step — src/components/form/steps/Step1Country.tsx**

All 8 steps follow this same pattern. Write them all following this template:

```tsx
"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Country } from "@/types";

const OPTIONS: { value: Country; icon: string }[] = [
  { value: "USA", icon: "🇺🇸" },
  { value: "UK", icon: "🇬🇧" },
  { value: "Canada", icon: "🇨🇦" },
  { value: "Australia", icon: "🇦🇺" },
  { value: "South Africa", icon: "🇿🇦" },
  { value: "France", icon: "🇫🇷" },
  { value: "Other", icon: "🌍" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step1Country({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you making aliyah from?</h2>
      <p className="text-gray-500 mb-6">We'll tailor your plan to your country's specific requirements.</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.country === opt.value}
            onClick={() => {
              onUpdate({ country: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

Follow this pattern for Steps 2–6 (single-select, auto-advance on selection). Step 7 (Concerns) is multi-select — do NOT auto-advance; show a "Continue" button instead. Step 8 (Contact) shows text inputs + checkbox.

**Step 4: Write src/components/form/LoadingScreen.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Analyzing your aliyah profile...",
  "Consulting our Israel knowledge base...",
  "Building your personalized timeline...",
  "Preparing your document checklist...",
  "Generating your PDF plan...",
  "Almost ready...",
];

type Props = { leadId: string; onComplete: (pdfUrl: string, score: number) => void; onError: () => void };

export function LoadingScreen({ leadId, onComplete, onError }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 3000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${leadId}`);
        const data = await res.json();
        if (data.status === "completed" && data.pdfUrl) {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          onComplete(data.pdfUrl, data.readinessScore ?? 0);
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          onError();
        }
      } catch {
        // ignore transient fetch errors during polling
      }
    }, 2000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(pollInterval);
    };
  }, [leadId, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 border-4 border-olive border-t-transparent rounded-full animate-spin mb-8" />
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-gray-600 text-lg"
        >
          {MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
      <p className="text-gray-400 text-sm mt-4">This takes about 15 seconds</p>
    </div>
  );
}
```

**Step 5: Write the main AliyahForm state machine — src/components/form/AliyahForm.tsx**

```tsx
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import { LoadingScreen } from "./LoadingScreen";
import { SuccessScreen } from "./SuccessScreen";
import { Step1Country } from "./steps/Step1Country";
import { Step2Area } from "./steps/Step2Area";
import { Step3Timeline } from "./steps/Step3Timeline";
import { Step4Family } from "./steps/Step4Family";
import { Step5Career } from "./steps/Step5Career";
import { Step6SpouseCareer } from "./steps/Step6SpouseCareer";
import { Step7Concerns } from "./steps/Step7Concerns";
import { Step8Contact } from "./steps/Step8Contact";
import type { FormData } from "@/types";

type FormState = "form" | "loading" | "success" | "error";

const TOTAL_STEPS = 8;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export function AliyahForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formState, setFormState] = useState<FormState>("form");
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [result, setResult] = useState<{ pdfUrl: string; score: number } | null>(null);

  const updateForm = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setFormState("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submit failed");
      const { leadId: id } = await res.json();
      setLeadId(id);
    } catch {
      setFormState("error");
    }
  }, [formData]);

  if (formState === "loading" && leadId) {
    return (
      <LoadingScreen
        leadId={leadId}
        onComplete={(pdfUrl, score) => {
          setResult({ pdfUrl, score });
          setFormState("success");
        }}
        onError={() => setFormState("error")}
      />
    );
  }

  if (formState === "success" && result) {
    return <SuccessScreen pdfUrl={result.pdfUrl} score={result.score} firstName={formData.firstName ?? ""} />;
  }

  if (formState === "error") {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Something went wrong. Please try again.</p>
        <button onClick={() => setFormState("form")} className="btn-primary">Try Again</button>
      </div>
    );
  }

  const stepProps = { data: formData, onUpdate: updateForm, onNext: goNext };

  return (
    <div className="max-w-lg mx-auto">
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 1 && <Step1Country {...stepProps} />}
            {step === 2 && <Step2Area {...stepProps} />}
            {step === 3 && <Step3Timeline {...stepProps} />}
            {step === 4 && <Step4Family {...stepProps} />}
            {step === 5 && <Step5Career {...stepProps} />}
            {step === 6 && <Step6SpouseCareer {...stepProps} />}
            {step === 7 && <Step7Concerns {...stepProps} />}
            {step === 8 && <Step8Contact {...stepProps} onSubmit={handleSubmit} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 1 && formState === "form" && (
        <button
          onClick={goBack}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add src/components/form/ src/components/ui/
git commit -m "feat: add 8-step form wizard with Framer Motion transitions and polling"
```

---

## Task 9: Landing Page + Tailwind Brand Config

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/components/form/SuccessScreen.tsx`

**Step 1: Add brand tokens to tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#5C6B3A",
          light: "#8A9B5C",
          dark: "#3D4826",
        },
        gold: {
          DEFAULT: "#B8962E",
          light: "#D4AF60",
        },
        cream: "#F8F4E8",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Update globals.css with utility classes**

Add after the existing Tailwind directives:
```css
@layer components {
  .btn-primary {
    @apply bg-olive text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-dark transition-colors duration-150;
  }
  .btn-secondary {
    @apply border-2 border-olive text-olive px-6 py-3 rounded-lg font-semibold hover:bg-olive/5 transition-colors duration-150;
  }
}
```

**Step 3: Update src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aliyah Navigator | Olim Paveway",
  description: "Get your personalized aliyah action plan in 60 seconds. Free tool by Olim Paveway.",
  openGraph: {
    title: "Aliyah Navigator | Olim Paveway",
    description: "Answer 8 questions. Get a custom PDF aliyah plan sent to your inbox.",
    siteName: "Olim Paveway",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-cream min-h-screen`}>{children}</body>
    </html>
  );
}
```

**Step 4: Write src/app/page.tsx — the landing page**

```tsx
import { AliyahForm } from "@/components/form/AliyahForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-olive py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-gold font-bold tracking-widest text-sm">OLIM PAVEWAY</span>
          <a href="https://www.olimpaveway.com" className="text-cream text-sm hover:text-gold transition-colors">
            Back to main site →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-olive py-16 px-6 text-center">
        <p className="text-gold text-xs tracking-widest mb-3">FREE TOOL</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif leading-tight">
          Your Personal<br />Aliyah Action Plan
        </h1>
        <p className="text-cream/80 text-lg max-w-xl mx-auto mb-8">
          Answer 8 questions about your situation. Receive a custom PDF plan — written by AI, informed by experts — in your inbox within 60 seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-cream/70 text-sm">
          <span>✓ 100% free</span>
          <span>✓ Personalized to your country & family</span>
          <span>✓ PDF delivered to your inbox</span>
          <span>✓ No sales calls</span>
        </div>
      </section>

      {/* Form Card */}
      <section className="max-w-2xl mx-auto px-4 -mt-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AliyahForm />
        </div>
        <p className="text-center text-gray-400 text-xs mt-6">
          By submitting, you consent to receive your plan by email. Olim Paveway respects your privacy.
        </p>
      </section>
    </main>
  );
}
```

**Step 5: Write src/components/form/SuccessScreen.tsx**

```tsx
type Props = { pdfUrl: string; score: number; firstName: string };

export function SuccessScreen({ pdfUrl, score, firstName }: Props) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-olive rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl text-white">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your plan is on its way, {firstName}!</h2>
      <p className="text-gray-500 mb-8">Check your inbox — your personalized aliyah PDF is being delivered now.</p>

      <div className="bg-olive/10 rounded-xl p-6 mb-8 inline-block">
        <p className="text-sm text-olive mb-1">YOUR READINESS SCORE</p>
        <p className="text-6xl font-bold text-olive">{score}</p>
        <p className="text-xs text-olive/60 mt-1">out of 100</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          View Your Plan
        </a>
        <a href="https://www.olimpaveway.com/consultation" className="btn-secondary">
          Book a Free Consultation
        </a>
      </div>
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add src/app/ src/components/form/SuccessScreen.tsx tailwind.config.ts
git commit -m "feat: add landing page, brand tokens, and success screen"
```

---

## Task 10: Admin Dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/LeadsTable.tsx`
- Create: `src/middleware.ts`

**Step 1: Write src/middleware.ts — API key check for /admin**

For MVP, use a simple HTTP Basic Auth approach rather than NextAuth (can upgrade later):

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const authHeader = req.headers.get("authorization");
    const expected = `Basic ${Buffer.from(`admin:${process.env.ADMIN_API_KEY}`).toString("base64")}`;
    if (authHeader !== expected) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
      });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

**Step 2: Write src/app/admin/page.tsx**

```tsx
import { LeadsTable } from "@/components/admin/LeadsTable";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-olive px-8 py-4">
        <h1 className="text-gold font-bold tracking-widest text-sm">OLIM PAVEWAY — ADMIN</h1>
      </header>
      <main className="max-w-7xl mx-auto px-8 py-8">
        <LeadsTable />
      </main>
    </div>
  );
}
```

**Step 3: Write src/components/admin/LeadsTable.tsx — client component with filtering**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";

type Lead = {
  id: string;
  firstName: string;
  email: string;
  country: string;
  targetArea: string;
  timeline: string;
  readinessScore: number | null;
  status: string;
  createdAt: string;
  pdfUrl: string | null;
};

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ country: "", status: "" });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter.country) params.set("country", filter.country);
    if (filter.status) params.set("status", filter.status);
    const res = await fetch(`/api/admin/leads?${params}`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "" },
    });
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const exportCsv = () => {
    const headers = ["ID", "Name", "Email", "Country", "Target Area", "Timeline", "Score", "Status", "Created"];
    const rows = leads.map((l) => [
      l.id, l.firstName, l.email, l.country, l.targetArea, l.timeline,
      l.readinessScore ?? "", l.status, l.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-page-${page}.csv`;
    a.click();
  };

  const statusColor = (s: string) =>
    s === "completed" ? "text-green-600" :
    s === "failed" ? "text-red-600" :
    s === "generating" ? "text-yellow-600" : "text-gray-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Leads</h2>
        <button onClick={exportCsv} className="btn-secondary text-sm px-4 py-2">Export CSV</button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filter.country}
          onChange={(e) => setFilter((f) => ({ ...f, country: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All countries</option>
          {["USA", "UK", "Canada", "Australia", "South Africa", "France", "Other"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {["pending", "generating", "completed", "failed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Name", "Email", "Country", "Area", "Timeline", "Score", "Status", "Created", "PDF"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{lead.firstName}</td>
                <td className="px-4 py-3 text-gray-500">{lead.email}</td>
                <td className="px-4 py-3">{lead.country}</td>
                <td className="px-4 py-3">{lead.targetArea}</td>
                <td className="px-4 py-3">{lead.timeline}</td>
                <td className="px-4 py-3 font-bold text-olive">{lead.readinessScore ?? "—"}</td>
                <td className={`px-4 py-3 font-medium ${statusColor(lead.status)}`}>{lead.status}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {lead.pdfUrl ? (
                    <a href={lead.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-olive hover:underline">View</a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 justify-end">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40">Previous</button>
        <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-sm border rounded-lg">Next</button>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/ src/components/admin/ src/middleware.ts
git commit -m "feat: add admin dashboard with leads table, filtering, and CSV export"
```

---

## Task 11: Environment Variables + Vercel Setup

**Files:**
- Create: `vercel.json`

**Step 1: Write vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "functions": {
    "src/app/api/submit/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Step 2: Push to GitHub + link to Vercel**

```bash
# Create a new repo on GitHub first (via gh CLI)
gh repo create olim-paveway --private --source=. --remote=origin --push

# Link to Vercel
vercel link
vercel env pull .env.local
```

**Step 3: Add all environment variables to Vercel**

```bash
# Add each one (Vercel will prompt for value):
vercel env add DATABASE_URL production
vercel env add AI_PROVIDER production
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add ADMIN_API_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

**Step 4: Deploy**

```bash
vercel --prod
```

**Step 5: Add custom domain**

In Vercel dashboard → Settings → Domains → Add `navigator.olimpaveway.com`

Then add CNAME at DNS registrar:
```
navigator → cname.vercel-dns.com
```

**Step 6: Final commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel config and deployment setup"
```

---

## Task 12: Smoke Test Checklist

Run these manually after deployment or locally with `pnpm dev`:

- [ ] Form loads at localhost:3000
- [ ] Each step advances correctly
- [ ] Back navigation works without losing data
- [ ] Step 7 (multi-select) allows multiple concerns
- [ ] Step 8 requires email + GDPR checkbox before submit
- [ ] Submit returns 202 with leadId
- [ ] Status polling shows "generating" then "completed"
- [ ] Email arrives with PDF attachment
- [ ] PDF opens correctly with all 4 pages
- [ ] Admin dashboard at /admin requires credentials
- [ ] Admin table shows the test lead
- [ ] CSV export downloads correctly
- [ ] Deploy preview at Vercel URL works end-to-end

---

## Post-MVP Backlog (do not build now)

- CRM integration: Resend enrolled lead to FluentCRM/Mailchimp via API after email send
- A/B testing on headline copy
- Referral tracking (ref param → utm_source)
- Premium report upsell flow
- NextAuth.js upgrade for admin (swap Basic Auth)
- Drizzle Studio integration for admin
- Metrics dashboard: submission rate by step, average score by country
