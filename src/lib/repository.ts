import { entities, flows, glossary, relationships } from "./seed";
import type { Entity } from "./types";
export function publishedEntities() { return entities.filter((entity) => entity.status === "PUBLISHED"); }
export function entityBySlug(slug: string) { return publishedEntities().find((entity) => entity.slug === slug); }
export function searchAtlas(query: string) { const q = query.trim().toLowerCase(); if (!q) return { entities: [], glossary: [], flows: [] }; const score = (text: string) => text.toLowerCase().includes(q); return { entities: publishedEntities().filter(e => score(`${e.name} ${e.description} ${e.categories.join(" ")}`)), glossary: glossary.filter(g => score(`${g.term} ${g.definition}`)), flows: flows.filter(f => score(`${f.name} ${f.summary}`)) }; }
export function entityLinks(slug: string) { return relationships.filter(r => r.from === slug || r.to === slug); }
export function canPublish(entity: Pick<Entity, "name" | "description" | "source">) { return Boolean(entity.name && entity.description && entity.source.url && entity.source.lastVerified); }
