import { NextResponse } from "next/server"; import { publishedEntities } from "@/lib/repository"; export function GET() { return NextResponse.json({ data: publishedEntities() }); }
