import { NextResponse } from "next/server";
import { publishedEntities } from "../../../lib/repository";

export async function GET() {
  try {
    return NextResponse.json({ data: await publishedEntities() });
  } catch {
    return NextResponse.json({ error: "Entities are temporarily unavailable." }, { status: 503 });
  }
}
