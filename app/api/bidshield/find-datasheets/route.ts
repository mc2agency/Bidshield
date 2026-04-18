import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
const MIN_PDF_BYTES = 10_000;
const MAX_PDF_BYTES = 25 * 1024 * 1024;

const MANUFACTURER_DOMAINS: Record<string, string> = {
  siplast: "siplast.com",
  carlisle: "carlislesyntec.com",
  "carlisle syntec": "carlislesyntec.com",
  gaf: "gaf.com",
  "johns manville": "jm.com",
  jm: "jm.com",
  firestone: "firestonebpco.com",
  tremco: "tremcoinc.com",
  soprema: "soprema.us",
};

const ALLOWED_DOMAIN_SUFFIXES = new Set(Object.values(MANUFACTURER_DOMAINS));

// SSRF guard — refuse to fetch URLs that aren't plain HTTPS on a known manufacturer
// domain. Brave is a partial-trust source and will happily return URLs that redirect
// to internal networks if an attacker seeds one.
function isSafeDownloadUrl(url: string): boolean {
  let u: URL;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (/^(\d+\.){3}\d+$/.test(host)) return false; // raw IPv4
  if (host.includes(":")) return false;            // raw IPv6 / port tricks
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  for (const suffix of ALLOWED_DOMAIN_SUFFIXES) {
    if (host === suffix || host.endsWith(`.${suffix}`)) return true;
  }
  return false;
}

type Candidate = {
  productName: string;
  manufacturer?: string;
  category?: string;
};

type ResultItem = {
  productName: string;
  manufacturer?: string;
  category?: string;
  status: "downloaded" | "failed";
  sourceUrl?: string;
  title?: string;
  pdfBase64?: string;
  fileSize?: number;
  errorMessage?: string;
};

function dedupeCandidates(input: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of input) {
    if (!c.productName || !c.manufacturer) continue;
    const key = `${c.productName.toLowerCase()}::${c.manufacturer.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

async function braveSearchPdf(
  query: string,
  apiKey: string,
): Promise<{ url: string; title: string } | null> {
  const url = `${BRAVE_ENDPOINT}?q=${encodeURIComponent(query)}&count=10`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const results: any[] = data?.web?.results ?? [];
  for (const r of results) {
    const u: string = r?.url ?? "";
    if (u.toLowerCase().endsWith(".pdf")) {
      return { url: u, title: r?.title ?? "" };
    }
  }
  return null;
}

async function downloadPdf(
  url: string,
): Promise<{ base64: string; size: number } | { error: string }> {
  if (!isSafeDownloadUrl(url)) return { error: "Blocked: URL not on allowed manufacturer domain" };
  try {
    const res = await fetch(url, { redirect: "error" });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.toLowerCase().includes("pdf") && !url.toLowerCase().endsWith(".pdf")) {
      return { error: `Not a PDF (${ct})` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_PDF_BYTES) return { error: "PDF too small" };
    if (buf.length > MAX_PDF_BYTES) return { error: "PDF too large" };
    if (!buf.slice(0, 4).toString().startsWith("%PDF")) return { error: "Not a valid PDF" };
    return { base64: buf.toString("base64"), size: buf.length };
  } catch (e: any) {
    return { error: e?.message ?? "fetch failed" };
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BRAVE_API_KEY not configured on server" },
      { status: 500 },
    );
  }

  let body: { materials?: Candidate[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.materials || !Array.isArray(body.materials) || body.materials.length > 20) {
    return NextResponse.json({ error: "materials must be an array of 1–20 items" }, { status: 400 });
  }

  const candidates = dedupeCandidates(body.materials);
  if (candidates.length === 0) {
    return NextResponse.json({
      results: [],
      message: "No materials with both productName and manufacturer found",
    });
  }

  const resolvedApiKey = apiKey as string;

  // Process one candidate: search → fallback search → download
  async function processCandidate(c: Candidate): Promise<ResultItem> {
    const manuKey = (c.manufacturer ?? "").toLowerCase().trim();
    const domain = MANUFACTURER_DOMAINS[manuKey];
    const query = domain
      ? `"${c.productName}" datasheet site:${domain}`
      : `"${c.productName}" "${c.manufacturer}" datasheet filetype:pdf`;

    const hit = await braveSearchPdf(query, resolvedApiKey);
    if (!hit) {
      // Fallback: drop site filter
      const fallback = await braveSearchPdf(
        `"${c.productName}" "${c.manufacturer}" datasheet filetype:pdf`,
        resolvedApiKey,
      );
      if (!fallback) {
        return { ...c, status: "failed", errorMessage: "No PDF result found" };
      }
      const dl = await downloadPdf(fallback.url);
      if ("error" in dl) {
        return { ...c, status: "failed", sourceUrl: fallback.url, title: fallback.title, errorMessage: dl.error };
      }
      return { ...c, status: "downloaded", sourceUrl: fallback.url, title: fallback.title, pdfBase64: dl.base64, fileSize: dl.size };
    }

    const dl = await downloadPdf(hit.url);
    if ("error" in dl) {
      return { ...c, status: "failed", sourceUrl: hit.url, title: hit.title, errorMessage: dl.error };
    }
    return { ...c, status: "downloaded", sourceUrl: hit.url, title: hit.title, pdfBase64: dl.base64, fileSize: dl.size };
  }

  // Run up to 4 candidates in parallel to avoid hammering Brave / download servers
  const CONCURRENCY = 4;
  const results: ResultItem[] = [];
  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(processCandidate));
    results.push(...batchResults);
  }

  return NextResponse.json({ results });
}
