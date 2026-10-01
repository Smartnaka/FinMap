import { NextRequest, NextResponse } from "next/server";
import { searchAtlas } from "../../../lib/repository";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    return NextResponse.json(await searchAtlas(q), { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
