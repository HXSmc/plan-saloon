import { NextRequest, NextResponse } from "next/server";
import { availability } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Valid `date` (YYYY-MM-DD) is required." },
      { status: 400 }
    );
  }

  const slots = await availability(date, barberId || null);
  return NextResponse.json({ date, barberId: barberId || null, slots });
}
