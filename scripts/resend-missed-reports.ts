/**
 * One-off backfill: re-send the plan-report email for leads that completed
 * generation (AI plan + PDF already exist) but never got a successful send —
 * mostly from before the MailerSend trial-recipient-cap bug was fixed by
 * switching to Resend. Uses the PDF already stored in Blob (no AI call, no
 * regeneration) and goes through the normal sendPlanEmail() path, so it
 * also BCCs the internal team exactly like a live submission would.
 *
 * Run from the repo root:
 *   pnpm exec tsx scripts/resend-missed-reports.ts
 */
import { db } from "../src/lib/db";
import { leads } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendPlanEmail } from "../src/lib/email/send";

// Hand-picked and confirmed with the user — see conversation for the
// dedup reasoning (multiple submissions per person, internal test entries
// excluded).
const LEAD_IDS = [
  "10cb4aaa-82f8-403f-8292-d32aa3984f8b", // Shevy — shevyshulman@gmail.com
  "9dc25ad7-b204-4875-81b5-755f5f1cef67", // Zev — mcplumm@gmail.com
  "476ad728-3c29-49ca-a7c6-da81484da590", // Joseph — schwarzj2004@yahoo.com
  "e690cd88-5d0d-413b-9f07-9b75051bbcc6", // Joseph — joseph.schwarz161@gmail.com
  "30193102-68df-4a3b-b837-4d9ca902b798", // Ivor — ivor.mord@hotmail.com
];

async function main() {
  for (const id of LEAD_IDS) {
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, id) });

    if (!lead) {
      console.error(`[${id}] Not found — skipping`);
      continue;
    }
    if (lead.reportSentAt) {
      console.log(`[${id}] ${lead.email} already has report_sent_at set — skipping`);
      continue;
    }
    if (!lead.pdfUrl || lead.readinessScore == null) {
      console.error(`[${id}] ${lead.email} missing pdfUrl/readinessScore — skipping`);
      continue;
    }

    try {
      console.log(`[${id}] Fetching stored PDF for ${lead.email}…`);
      const pdfRes = await fetch(lead.pdfUrl);
      if (!pdfRes.ok) {
        throw new Error(`PDF fetch failed: HTTP ${pdfRes.status}`);
      }
      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

      console.log(`[${id}] Sending to ${lead.email}…`);
      await sendPlanEmail({
        to: lead.email,
        firstName: lead.firstName,
        readinessScore: lead.readinessScore,
        targetArea: lead.targetArea,
        pdfUrl: lead.pdfUrl,
        pdfBuffer,
      });

      await db
        .update(leads)
        .set({ reportSentAt: new Date(), updatedAt: new Date() })
        .where(eq(leads.id, id));

      console.log(`[${id}] ✅ Sent and marked report_sent_at`);
    } catch (err) {
      console.error(`[${id}] ❌ Failed:`, err);
    }
  }
}

main().then(() => {
  console.log("Done.");
  process.exit(0);
});
