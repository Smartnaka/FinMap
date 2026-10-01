import "server-only";

import { pool } from "./db";
import type { Entity, Flow, Relationship, Source } from "./types";

type EntityRow = {
  slug: string; name: string; entity_type: string; categories: string[] | null;
  description: string; infrastructure_role: string | null; website_url: string | null;
  status: Entity["status"]; source_title: string; source_url: string;
  source_type: string; last_verified_at: Date;
};
type RelationshipRow = {
  from_slug: string; to_slug: string; relationship_type: string; explanation: string | null;
  source_title: string; source_url: string; source_type: string; last_verified_at: Date;
};
type FlowRow = {
  slug: string; name: string; summary: string; source_title: string; source_url: string;
  source_type: string; last_verified_at: Date;
};

const entitySelect = `
  SELECT e.slug, e.name, e.entity_type, e.description, e.infrastructure_role,
         e.website_url, e.status, s.title AS source_title, s.url AS source_url,
         s.source_type::text AS source_type, s.last_verified_at,
         COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories
  FROM entities e
  JOIN sources s ON s.id = e.source_id
  LEFT JOIN entity_categories ec ON ec.entity_id = e.id
  LEFT JOIN categories c ON c.id = ec.category_id
`;
const entityGroupBy = `
  GROUP BY e.id, s.id
`;

function formatDate(date: Date) { return date.toISOString().slice(0, 10); }
function toSource(row: Pick<EntityRow, "source_title" | "source_url" | "source_type" | "last_verified_at">): Source {
  return { title: row.source_title, url: row.source_url, type: row.source_type, lastVerified: formatDate(row.last_verified_at) };
}
function toEntity(row: EntityRow): Entity {
  return {
    slug: row.slug, name: row.name, type: row.entity_type, categories: row.categories ?? [],
    description: row.description, role: row.infrastructure_role ?? "", website: row.website_url ?? "",
    source: toSource(row), status: row.status,
  };
}
function toRelationship(row: RelationshipRow): Relationship {
  return { from: row.from_slug, to: row.to_slug, type: row.relationship_type, explanation: row.explanation ?? "", source: toSource(row) };
}
function toFlow(row: FlowRow, steps: Flow["steps"]): Flow {
  return { slug: row.slug, name: row.name, summary: row.summary, steps, source: toSource(row) };
}

/** Returns only public, sourced entities. */
export async function publishedEntities(): Promise<Entity[]> {
  const result = await pool.query<EntityRow>(`${entitySelect} WHERE e.status = 'PUBLISHED' ${entityGroupBy} ORDER BY e.name`);
  return result.rows.map(toEntity);
}

/** Returns null for a missing, unpublished, or unsourced entity. */
export async function entityBySlug(slug: string): Promise<Entity | null> {
  const result = await pool.query<EntityRow>(`${entitySelect} WHERE e.status = 'PUBLISHED' AND e.slug = $1 ${entityGroupBy}`, [slug]);
  return result.rows[0] ? toEntity(result.rows[0]) : null;
}

export async function searchAtlas(query: string) {
  const term = query.trim();
  if (!term) return { entities: [], glossary: [], flows: [] };
  const pattern = `%${term}%`;
  const [entityResult, glossaryResult, flowResult] = await Promise.all([
    pool.query<{ slug: string; name: string; entity_type: string }>(`
      SELECT DISTINCT e.slug, e.name, e.entity_type
      FROM entities e LEFT JOIN entity_categories ec ON ec.entity_id = e.id
      LEFT JOIN categories c ON c.id = ec.category_id
      WHERE e.status = 'PUBLISHED' AND (e.name ILIKE $1 OR e.description ILIKE $1 OR c.name ILIKE $1)
      ORDER BY e.name LIMIT 20`, [pattern]),
    pool.query<{ slug: string; term: string }>(`
      SELECT slug, term FROM glossary_terms
      WHERE term ILIKE $1 OR definition ILIKE $1 ORDER BY term LIMIT 20`, [pattern]),
    pool.query<{ slug: string; name: string }>(`
      SELECT slug, name FROM transaction_flows
      WHERE status = 'PUBLISHED' AND (name ILIKE $1 OR summary ILIKE $1)
      ORDER BY name LIMIT 20`, [pattern]),
  ]);
  return { entities: entityResult.rows.map(row => ({ slug: row.slug, name: row.name, type: row.entity_type })), glossary: glossaryResult.rows, flows: flowResult.rows };
}

/** Returns relationships only when both endpoints are publicly published. */
export async function entityLinks(slug: string): Promise<Relationship[]> {
  const result = await pool.query<RelationshipRow>(`
    SELECT source_entity.slug AS from_slug, target_entity.slug AS to_slug,
           relationship.relationship_type::text, relationship.explanation,
           source.title AS source_title, source.url AS source_url,
           source.source_type::text AS source_type, source.last_verified_at
    FROM entity_relationships relationship
    JOIN entities source_entity ON source_entity.id = relationship.from_entity_id AND source_entity.status = 'PUBLISHED'
    JOIN entities target_entity ON target_entity.id = relationship.to_entity_id AND target_entity.status = 'PUBLISHED'
    JOIN sources source ON source.id = relationship.source_id
    WHERE source_entity.slug = $1 OR target_entity.slug = $1
    ORDER BY relationship.relationship_type`, [slug]);
  return result.rows.map(toRelationship);
}

export async function publishedRelationships(): Promise<Relationship[]> {
  const entities = await publishedEntities();
  const links = await Promise.all(entities.map(entity => entityLinks(entity.slug)));
  return links.flat().filter((link, index, all) => all.findIndex(other => other.from === link.from && other.to === link.to && other.type === link.type) === index);
}

export async function publishedFlows(): Promise<Flow[]> {
  const flows = await pool.query<FlowRow>(`
    SELECT flow.slug, flow.name, flow.summary, source.title AS source_title, source.url AS source_url,
           source.source_type::text AS source_type, source.last_verified_at
    FROM transaction_flows flow JOIN sources source ON source.id = flow.source_id
    WHERE flow.status = 'PUBLISHED' ORDER BY flow.name`);
  const steps = await pool.query<{ flow_slug: string; title: string; description: string; technical_note: string | null }>(`
    SELECT flow.slug AS flow_slug, step.title, step.description, step.technical_note
    FROM transaction_steps step JOIN transaction_flows flow ON flow.id = step.flow_id
    WHERE flow.status = 'PUBLISHED' ORDER BY flow.slug, step.position`);
  return flows.rows.map(flow => toFlow(flow, steps.rows.filter(step => step.flow_slug === flow.slug).map(step => ({ title: step.title, description: step.description, note: step.technical_note ?? "" }))));
}

export async function flowBySlug(slug: string): Promise<Flow | null> {
  const flows = await publishedFlows();
  return flows.find(flow => flow.slug === slug) ?? null;
}

export async function glossaryTerms() {
  const result = await pool.query<{ slug: string; term: string; definition: string }>("SELECT slug, term, definition FROM glossary_terms ORDER BY term");
  return result.rows;
}

export function canPublish(entity: Pick<Entity, "name" | "description" | "source">) {
  return Boolean(entity.name && entity.description && entity.source.url && entity.source.lastVerified);
}
