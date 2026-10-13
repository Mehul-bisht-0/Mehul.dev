import { NextRequest, NextResponse } from "next/server";
import { portfolio } from "@/config/portfolio";
import { getActivity } from "@/lib/activity-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const currentYear = new Date().getUTCFullYear();
  const input = request.nextUrl.searchParams.get("year") ?? String(currentYear);
  const year = Number(input);
  if (!/^\d{4}$/.test(input) || year < portfolio.firstActivityYear || year > currentYear) {
    return NextResponse.json({ error: `Year must be between ${portfolio.firstActivityYear} and ${currentYear}.` }, { status: 400 });
  }
  return NextResponse.json(await getActivity(year), { headers: { "Cache-Control": "no-store" } });
}
