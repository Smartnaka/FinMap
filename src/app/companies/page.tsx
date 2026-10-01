import { publishedEntities } from "../../lib/repository";
export const dynamic = "force-dynamic";
export const metadata = { title: "Companies & institutions" };
export default async function Companies() { const entities = await publishedEntities(); return <main><p className="eyebrow">DIRECTORY</p><h1>Companies & institutions</h1><div className="listing">{entities.map(e => <a className="record" key={e.slug} href={`/companies/${e.slug}`}><span>{e.categories.join(" · ")}</span><strong>{e.name}</strong><p>{e.description}</p></a>)}</div></main>; }
