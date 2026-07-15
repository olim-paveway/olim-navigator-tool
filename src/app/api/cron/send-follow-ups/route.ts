import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { and, eq, isNull, isNotNull, lte } from "drizzle-orm";
import { sendFollowUpEmail } from "@/lib/email/send";
import { FOLLOW_UP_DELAY_DAYS } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

// Triggered daily by Vercel Cron (see vercel.json). Vercel signs the
// request with this header when CRON_SECRET is set as an env var.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FOLLOW_UP_DELAY_DAYS);

  const due = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      email: leads.email,
    })
    .from(leads)
    .where(
      and(
        eq(leads.status, "completed"),
        isNotNull(leads.reportSentAt),
        isNull(leads.followUpSentAt),
        lte(leads.reportSentAt, cutoff)
      )
    );

  let sent = 0;
  let failed = 0;

  for (const lead of due) {
    try {
      await sendFollowUpEmail({ to: lead.email, firstName: lead.firstName });
      await db
        .update(leads)
        .set({ followUpSentAt: new Date(), updatedAt: new Date() })
        .where(eq(leads.id, lead.id));
      sent++;
    } catch (err) {
      console.error(`[FollowUpCron] Failed to send to lead ${lead.id}:`, err);
      failed++;
    }
  }

  console.log(`[FollowUpCron] Done. due=${due.length} sent=${sent} failed=${failed}`);
  return NextResponse.json({ due: due.length, sent, failed });
}
