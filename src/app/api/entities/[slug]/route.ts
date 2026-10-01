import { NextResponse } from "next/server";
import { entityBySlug, entityLinks } from "../../../../lib/repository";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const entity = await entityBySlug(slug);
    if (!entity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: entity, relationships: await entityLinks(entity.slug) });
  } catch {
    return NextResponse.json({ error: "Entity is temporarily unavailable." }, { status: 503 });
  }
}
