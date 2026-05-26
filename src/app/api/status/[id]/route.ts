import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, params.id),
    columns: {
      status: true,
      pdfUrl: true,
      readinessScore: true,
      errorMessage: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: lead.status,
    pdfUrl: lead.pdfUrl ?? undefined,
    readinessScore: lead.readinessScore ?? undefined,
    error: lead.errorMessage ?? undefined,
  });
}
