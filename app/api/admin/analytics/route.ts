import { NextRequest, NextResponse } from "next/server";
import { analytics, type AnalyticsRange } from "@/lib/analytics";
import { requireUser } from "@/lib/guard";

export async function GET(req: NextRequest) {
  const guard = await requireUser({ owner: true });
  if ("response" in guard) return guard.response;

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") ?? "week") as AnalyticsRange;
  const valid: AnalyticsRange[] = ["day", "week", "month"];
  const data = await analytics(valid.includes(range) ? range : "week");
  return NextResponse.json(data);
}
