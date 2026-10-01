import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const sources = [
  ["NIBSS — About us", "https://nibss-plc.com.ng/about-us/", "OFFICIAL_WEBSITE"],
  ["NIBSS Instant Payment", "https://nibss-plc.com.ng/nibss-instant-payments-nip/", "OFFICIAL_WEBSITE"],
  ["Central Bank of Nigeria", "https://www.cbn.gov.ng/", "GOVERNMENT"],
  ["National Identity Management Commission", "https://nimc.gov.ng/", "GOVERNMENT"],
];
const entities = [
  ["nibss", "Nigeria Inter-Bank Settlement System", "Infrastructure", "NIBSS is an infrastructure provider for the Nigerian financial-services industry.", "Provides shared infrastructure used by participating institutions.", "https://nibss-plc.com.ng/", "https://nibss-plc.com.ng/about-us/"],
  ["nip", "NIBSS Instant Payment", "Payment rail", "NIBSS Instant Payment is a NIBSS product for instant electronic funds transfer.", "Provides a payment rail used for instant transfers between participating institutions.", "https://nibss-plc.com.ng/nibss-instant-payments-nip/", "https://nibss-plc.com.ng/nibss-instant-payments-nip/"],
  ["central-bank-of-nigeria", "Central Bank of Nigeria", "Regulator", "Nigeria’s central bank and principal monetary authority.", "Sets and administers relevant financial-sector regulation.", "https://www.cbn.gov.ng/", "https://www.cbn.gov.ng/"],
  ["nimc", "National Identity Management Commission", "Identity infrastructure", "The commission responsible for Nigeria’s national identity management system.", "Provides national identity infrastructure.", "https://nimc.gov.ng/", "https://nimc.gov.ng/"],
];
const categories = [["payment-rail", "Payment Rail"], ["infrastructure", "Infrastructure"], ["regulator", "Regulator"], ["identity", "Identity"], ["government", "Government"]];
const entityCategories = [["nibss", "payment-rail"], ["nibss", "infrastructure"], ["nip", "payment-rail"], ["nip", "infrastructure"], ["central-bank-of-nigeria", "regulator"], ["nimc", "identity"], ["nimc", "government"]];
const glossary = [["reconciliation", "Reconciliation", "The process of comparing what your system records with what an external financial system records."], ["idempotency", "Idempotency", "A property that lets a repeated request have the same intended effect as a single request."], ["nip", "NIP", "An acronym used for NIBSS Instant Payment. Consult NIBSS documentation for current operational detail."], ["bvn", "BVN", "Bank Verification Number: a banking identity identifier in Nigeria. Consult official CBN and NIBSS materials for requirements."]];
const flowSteps = [[1, "Customer initiates", "A customer submits a transfer instruction in a bank or fintech application.", "Validate amount, recipient information, and authorization before sending."], [2, "Sending institution", "The sending institution evaluates and authorizes the instruction.", "A debit alone does not prove the recipient has been credited."], [3, "Payment rail", "The instruction is routed through the relevant interbank infrastructure.", "Exact routing and participant responsibilities vary by scheme and provider."], [4, "Receiving institution", "The receiving institution processes the instruction and credits or rejects it.", "Use a definitive status plus reconciliation; do not infer success from a timeout."], [5, "Reconciliation", "Parties compare records and resolve uncertain outcomes, which may result in confirmation or reversal.", "Use idempotency keys and durable transaction state."]];

await client.connect();
try {
  await client.query("BEGIN");
  for (const [title, url, type] of sources) await client.query("INSERT INTO sources (title, url, source_type) VALUES ($1, $2, $3::source_kind) ON CONFLICT (url) DO UPDATE SET title = EXCLUDED.title, source_type = EXCLUDED.source_type, last_verified_at = now()", [title, url, type]);
  for (const [slug, name, type, description, role, website, sourceUrl] of entities) await client.query("INSERT INTO entities (slug, name, entity_type, description, infrastructure_role, website_url, status, source_id) VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', (SELECT id FROM sources WHERE url = $7)) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, entity_type = EXCLUDED.entity_type, description = EXCLUDED.description, infrastructure_role = EXCLUDED.infrastructure_role, website_url = EXCLUDED.website_url, status = EXCLUDED.status, source_id = EXCLUDED.source_id, updated_at = now()", [slug, name, type, description, role, website, sourceUrl]);
  for (const [slug, name] of categories) await client.query("INSERT INTO categories (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name", [slug, name]);
  for (const [entitySlug, categorySlug] of entityCategories) await client.query("INSERT INTO entity_categories (entity_id, category_id) VALUES ((SELECT id FROM entities WHERE slug = $1), (SELECT id FROM categories WHERE slug = $2)) ON CONFLICT DO NOTHING", [entitySlug, categorySlug]);
  await client.query("INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, explanation, source_id) SELECT (SELECT id FROM entities WHERE slug = 'nibss'), (SELECT id FROM entities WHERE slug = 'nip'), 'OPERATES', 'NIBSS lists NIBSS Instant Payment as a product and describes it as an instant electronic funds-transfer service.', (SELECT id FROM sources WHERE url = 'https://nibss-plc.com.ng/nibss-instant-payments-nip/') WHERE NOT EXISTS (SELECT 1 FROM entity_relationships WHERE from_entity_id = (SELECT id FROM entities WHERE slug = 'nibss') AND to_entity_id = (SELECT id FROM entities WHERE slug = 'nip') AND relationship_type = 'OPERATES')");
  for (const [slug, term, definition] of glossary) await client.query("INSERT INTO glossary_terms (slug, term, definition) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET term = EXCLUDED.term, definition = EXCLUDED.definition", [slug, term, definition]);
  await client.query("INSERT INTO transaction_flows (slug, name, summary, status, source_id) VALUES ('bank-transfer', 'Bank transfer: simplified reference flow', 'An educational sequence, not a specification for every institution or provider.', 'PUBLISHED', (SELECT id FROM sources WHERE url = 'https://nibss-plc.com.ng/about-us/')) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, summary = EXCLUDED.summary, status = EXCLUDED.status, source_id = EXCLUDED.source_id");
  for (const [position, title, description, note] of flowSteps) await client.query("INSERT INTO transaction_steps (flow_id, position, title, description, technical_note) VALUES ((SELECT id FROM transaction_flows WHERE slug = 'bank-transfer'), $1, $2, $3, $4) ON CONFLICT (flow_id, position) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, technical_note = EXCLUDED.technical_note", [position, title, description, note]);
  await client.query("COMMIT");
  console.log("Seed complete");
} catch (error) { await client.query("ROLLBACK"); throw error; } finally { await client.end(); }
