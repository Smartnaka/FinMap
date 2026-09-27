export type Status = "PUBLISHED" | "DRAFT" | "NEEDS_REVIEW" | "ARCHIVED";
export type Source = { title: string; url: string; type: string; lastVerified: string };
export type Entity = { slug: string; name: string; type: string; categories: string[]; description: string; role: string; website: string; source: Source; status: Status };
export type Relationship = { from: string; to: string; type: string; explanation: string; source: Source };
export type Flow = { slug: string; name: string; summary: string; steps: { title: string; description: string; note: string }[]; source: Source };
