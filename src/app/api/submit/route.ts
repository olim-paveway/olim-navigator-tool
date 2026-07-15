import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { formSchema } from "@/lib/validations/form";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 300;

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
    const utm = {
      utmSource: (body.utmSource as string) ?? null,
      utmMedium: (body.utmMedium as string) ?? null,
      utmCampaign: (body.utmCampaign as string) ?? null,
    };

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
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      })
      .returning({ id: leads.id });

    leadId = lead.id;

    // Use waitUntil so Vercel keeps the function alive until the pipeline finishes
    waitUntil(
      runGenerationPipeline(leadId, data, utm).catch(async (err) => {
        console.error("[Pipeline] Fatal error:", err);
        if (leadId) {
          await db
            .update(leads)
            .set({ status: "failed", errorMessage: String(err), updatedAt: new Date() })
            .where(eq(leads.id, leadId));
        }
      })
    );

    return NextResponse.json({ leadId }, { status: 202 });
  } catch (err) {
    console.error("[submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

type Utm = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

async function runGenerationPipeline(
  leadId: string,
  data: import("@/lib/validations/form").FormSchema,
  utm: Utm
) {
  const { generateAliyahPlan } = await import("@/lib/ai/generate");
  const { generateAliyahPdf } = await import("@/lib/pdf/generate");
  const { uploadPdfToBlob } = await import("@/lib/pdf/upload");
  const { sendPlanEmail, sendInternalLeadNotification } = await import("@/lib/email/send");
  const { enrollInFluentCRM } = await import("@/lib/crm/enroll");

  console.log(`[Pipeline:${leadId}] Starting`);

  await db
    .update(leads)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  // Internal team notification — fires as soon as the user registers,
  // independent of whether AI/PDF generation later succeeds. Non-fatal.
  try {
    await sendInternalLeadNotification({
      leadId,
      firstName: data.firstName,
      email: data.email,
      country: data.country,
      targetArea: data.targetArea,
      timeline: data.timeline,
      familyType: data.familyType,
      career: data.career,
      spouseCareer: data.spouseCareer,
      concerns: data.concerns,
      ...utm,
    });
    console.log(`[Pipeline:${leadId}] Internal notification sent`);
  } catch (notifyErr) {
    console.error(`[Pipeline:${leadId}] Internal notification failed (non-fatal):`, notifyErr);
  }

  console.log(`[Pipeline:${leadId}] Generating AI plan…`);
  const aiPlan = await generateAliyahPlan(data);
  console.log(`[Pipeline:${leadId}] AI plan done. readiness=${aiPlan.readiness_score}`);

  console.log(`[Pipeline:${leadId}] Generating PDF…`);
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
  console.log(`[Pipeline:${leadId}] PDF done. size=${pdfBuffer.length}`);

  console.log(`[Pipeline:${leadId}] Uploading to Blob…`);
  const pdfUrl = await uploadPdfToBlob(pdfBuffer, leadId);
  console.log(`[Pipeline:${leadId}] Blob upload done. url=${pdfUrl}`);

  // Email is non-fatal — PDF is already in Blob; success screen shows the link
  let reportSentAt: Date | null = null;
  try {
    console.log(`[Pipeline:${leadId}] Sending email to ${data.email}…`);
    await sendPlanEmail({
      to: data.email,
      firstName: data.firstName,
      readinessScore: aiPlan.readiness_score,
      targetArea: data.targetArea,
      pdfUrl,
      pdfBuffer,
    });
    reportSentAt = new Date();
    console.log(`[Pipeline:${leadId}] Email sent OK`);
  } catch (emailErr) {
    // Log the error but do NOT fail the pipeline — user still gets the PDF via the success screen
    // reportSentAt stays null, so the follow-up cron will skip this lead
    console.error(`[Pipeline:${leadId}] Email failed (non-fatal):`, emailErr);
  }

  // Enroll in FluentCRM — non-fatal
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
      reportSentAt,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  console.log(`[Pipeline:${leadId}] Completed successfully`);
}
