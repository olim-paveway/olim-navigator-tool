import { NextRequest, NextResponse } from "next/server";
import { formSchema } from "@/lib/validations/form";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
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

    // Insert lead in "pending" state and return leadId immediately
    const [lead] = await db
      .insert(leads)
      .values({
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
        utmSource: (body.utmSource as string) ?? null,
        utmMedium: (body.utmMedium as string) ?? null,
        utmCampaign: (body.utmCampaign as string) ?? null,
      })
      .returning({ id: leads.id });

    leadId = lead.id;

    // Fire-and-forget pipeline — client polls /api/status/[id]
    runGenerationPipeline(leadId, data).catch(async (err) => {
      console.error("[Pipeline] Fatal error:", err);
      if (leadId) {
        await db
          .update(leads)
          .set({ status: "failed", errorMessage: String(err), updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      }
    });

    return NextResponse.json({ leadId }, { status: 202 });
  } catch (err) {
    console.error("[submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function runGenerationPipeline(
  leadId: string,
  data: import("@/lib/validations/form").FormSchema
) {
  const { generateAliyahPlan } = await import("@/lib/ai/generate");
  const { generateAliyahPdf } = await import("@/lib/pdf/generate");
  const { uploadPdfToBlob } = await import("@/lib/pdf/upload");
  const { sendPlanEmail } = await import("@/lib/email/send");
  const { enrollInFluentCRM } = await import("@/lib/crm/enroll");

  await db
    .update(leads)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  const aiPlan = await generateAliyahPlan(data);

  const pdfBuffer = await generateAliyahPdf(
    {
      firstName: data.firstName,
      country: data.country,
      targetArea: data.targetArea,
      timeline: data.timeline,
      familyType: data.familyType,
    },
    aiPlan
  );

  const pdfUrl = await uploadPdfToBlob(pdfBuffer, leadId);

  await sendPlanEmail({
    to: data.email,
    firstName: data.firstName,
    readinessScore: aiPlan.readiness_score,
    targetArea: data.targetArea,
    pdfUrl,
    pdfBuffer,
  });

  // Enroll in FluentCRM — non-fatal if it fails
  await enrollInFluentCRM({
    email: data.email,
    firstName: data.firstName,
    country: data.country,
    targetArea: data.targetArea,
    timeline: data.timeline,
    familyType: data.familyType,
    career: data.career,
    concerns: data.concerns,
    readinessScore: aiPlan.readiness_score,
  });

  await db
    .update(leads)
    .set({
      status: "completed",
      readinessScore: aiPlan.readiness_score,
      aiPlan,
      pdfUrl,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));
}
