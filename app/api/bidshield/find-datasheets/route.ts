import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";

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

type SpecMaterial = {
  name?: string;
  spec?: string;
  manufacturer?: string;
  category?: string;
};

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

function extractCandidates(specSummary: string): Candidate[] {
  let parsed: any;
  try {
    parsed = JSON.parse(specSummary);
  } catch {
    return [];
  }
  const mats: SpecMaterial[] = parsed?.materials ?? [];
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const mat of mats) {
    if (!mat?.name) continue;
    const productName = mat.spec?.match(/^([A-Z][A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-\.]+){0,3})/)?.[1];
    const baseName = productName && !productName.startsWith("ASTM") ? productName : mat.name;
    const manufacturer =
      mat.manufacturer && mat.manufacturer !== "as specified" ? mat.manufacturer : undefined;
    if (!manufacturer) continue; // need manufacturer to scope search
    const key = `${baseName.toLowerCase()}::${manufacturer.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ productName: baseName, manufacturer, category: mat.category });
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
  try {
    const res = await fetch(url, { redirect: "follow" });
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

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BRAVE_API_KEY not configured on server" },
      { status: 500 },
    );
  }

  let body: { specSummary?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.specSummary) {
    return NextResponse.json({ error: "Missing specSummary" }, { status: 400 });
  }

  const candidates = extractCandidates(body.specSummary);
  if (candidates.length === 0) {
    return NextResponse.json({ results: [], message: "No materials with manufacturer found" });
  }

  const results: ResultItem[] = [];
  for (const c of candidates) {
    const manuKey = (c.manufacturer ?? "").toLowerCase().trim();
    const domain = MANUFACTURER_DOMAINS[manuKey];
    const query = domain
      ? `"${c.productName}" datasheet site:${domain}`
      : `"${c.productName}" "${c.manufacturer}" datasheet filetype:pdf`;

    const hit = await braveSearchPdf(query, apiKey);
    if (!hit) {
      // Fallback: drop site filter
      const fallback = await braveSearchPdf(
        `"${c.productName}" "${c.manufacturer}" datasheet filetype:pdf`,
        apiKey,
      );
      if (!fallback) {
        results.push({
          ...c,
          status: "failed",
          errorMessage: "No PDF result found",
        });
        continue;
      }
      const dl = await downloadPdf(fallback.url);
      if ("error" in dl) {
        results.push({
          ...c,
          status: "failed",
          sourceUrl: fallback.url,
          title: fallback.title,
          errorMessage: dl.error,
        });
        continue;
      }
      results.push({
        ...c,
        status: "downloaded",
        sourceUrl: fallback.url,
        title: fallback.title,
        pdfBase64: dl.base64,
        fileSize: dl.size,
      });
      continue;
    }

    const dl = await downloadPdf(hit.url);
    if ("error" in dl) {
      results.push({
        ...c,
        status: "failed",
        sourceUrl: hit.url,
        title: hit.title,
        errorMessage: dl.error,
      });
      continue;
    }
    results.push({
      ...c,
      status: "downloaded",
      sourceUrl: hit.url,
      title: hit.title,
      pdfBase64: dl.base64,
      fileSize: dl.size,
    });
  }

  return NextResponse.json({ results });
}
