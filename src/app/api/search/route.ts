import { NextRequest, NextResponse } from "next/server"; import { searchAtlas } from "@/lib/repository";
export function GET(request: NextRequest) { const q = request.nextUrl.searchParams.get("q") ?? ""; return NextResponse.json(searchAtlas(q), { headers: { "Cache-Control": "public, max-age=60" } }); }
