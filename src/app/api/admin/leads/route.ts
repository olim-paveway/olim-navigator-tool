import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, type SQL } from "drizzle-orm";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key");
  return apiKey === process.env.ADMIN_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const country = searchParams.get("country");
  const status = searchParams.get("status");
  const scoreMin = searchParams.get("scoreMin");
  const scoreMax = searchParams.get("scoreMax");

  const conditions: SQL[] = [];
  if (country) conditions.push(eq(leads.country, country));
  if (status)
    conditions.push(
      eq(
        leads.status,
        status as "pending" | "generating" | "completed" | "failed"
      )
    );
  if (scoreMin) conditions.push(gte(leads.readinessScore, parseInt(scoreMin)));
  if (scoreMax) conditions.push(lte(leads.readinessScore, parseInt(scoreMax)));

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
