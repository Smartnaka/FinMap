import type { Entity, Flow, Relationship, Source } from "./types";
const nibss: Source = { title: "NIBSS — About us", url: "https://nibss-plc.com.ng/about-us/", type: "Official website", lastVerified: "2026-09-27" };
const cbn: Source = { title: "Central Bank of Nigeria", url: "https://www.cbn.gov.ng/", type: "Government", lastVerified: "2026-09-27" };
const nimc: Source = { title: "National Identity Management Commission", url: "https://nimc.gov.ng/", type: "Government", lastVerified: "2026-09-27" };
export const entities: Entity[] = [
 { slug: "nibss", name: "Nigeria Inter-Bank Settlement System", type: "Infrastructure", categories: ["Payment Rail", "Infrastructure"], description: "NIBSS is an infrastructure provider for the Nigerian financial-services industry.", role: "Provides shared infrastructure used by participating institutions.", website: "https://nibss-plc.com.ng/", source: nibss, status: "PUBLISHED" },
 { slug: "nip", name: "NIBSS Instant Payment", type: "Payment rail", categories: ["Payment Rail", "Infrastructure"], description: "NIBSS Instant Payment is a NIBSS product for instant electronic funds transfer.", role: "Provides a payment rail used for instant transfers between participating institutions.", website: "https://nibss-plc.com.ng/nibss-instant-payments-nip/", source: { title: "NIBSS Instant Payment", url: "https://nibss-plc.com.ng/nibss-instant-payments-nip/", type: "Official website", lastVerified: "2026-09-27" }, status: "PUBLISHED" },
 { slug: "central-bank-of-nigeria", name: "Central Bank of Nigeria", type: "Regulator", categories: ["Regulator"], description: "Nigeria’s central bank and principal monetary authority.", role: "Sets and administers relevant financial-sector regulation.", website: "https://www.cbn.gov.ng/", source: cbn, status: "PUBLISHED" },
 { slug: "nimc", name: "National Identity Management Commission", type: "Identity infrastructure", categories: ["Identity", "Government"], description: "The commission responsible for Nigeria’s national identity management system.", role: "Provides national identity infrastructure.", website: "https://nimc.gov.ng/", source: nimc, status: "PUBLISHED" }
];
export const relationships: Relationship[] = [
 { from: "nibss", to: "nip", type: "OPERATES", explanation: "NIBSS lists NIBSS Instant Payment as a product and describes it as an instant electronic funds-transfer service.", source: { title: "NIBSS Instant Payment", url: "https://nibss-plc.com.ng/nibss-instant-payments-nip/", type: "Official website", lastVerified: "2026-09-27" } }
];
export const glossary = [
 { slug: "reconciliation", term: "Reconciliation", definition: "The process of comparing what your system records with what an external financial system records." },
 { slug: "idempotency", term: "Idempotency", definition: "A property that lets a repeated request have the same intended effect as a single request." },
 { slug: "nip", term: "NIP", definition: "An acronym used for NIBSS Instant Payment. Consult NIBSS documentation for current operational detail." },
 { slug: "bvn", term: "BVN", definition: "Bank Verification Number: a banking identity identifier in Nigeria. Consult official CBN and NIBSS materials for requirements." }
];
export const flows: Flow[] = [{ slug: "bank-transfer", name: "Bank transfer: simplified reference flow", summary: "An educational sequence, not a specification for every institution or provider.", source: nibss, steps: [
 { title: "Customer initiates", description: "A customer submits a transfer instruction in a bank or fintech application.", note: "Validate amount, recipient information, and authorization before sending." },
 { title: "Sending institution", description: "The sending institution evaluates and authorizes the instruction.", note: "A debit alone does not prove the recipient has been credited." },
 { title: "Payment rail", description: "The instruction is routed through the relevant interbank infrastructure.", note: "Exact routing and participant responsibilities vary by scheme and provider." },
 { title: "Receiving institution", description: "The receiving institution processes the instruction and credits or rejects it.", note: "Use a definitive status plus reconciliation; do not infer success from a timeout." },
 { title: "Reconciliation", description: "Parties compare records and resolve uncertain outcomes, which may result in confirmation or reversal.", note: "Use idempotency keys and durable transaction state." }
] }];
