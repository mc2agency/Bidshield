/**
 * BidShield — Bid Summary PDF Generator
 * Produces a professional 1-2 page PDF for estimators on bid day.
 */

export interface BidSummaryData {
  project: {
    name?: string;
    location?: string;
    gc?: string;
    owner?: string;
    bidDate?: string;
  };
  financials: {
    sumMaterial: number | null;
    sumLabor: number | null;
    sumGCLine: number | null;
    sumSubtotal: number | null;
    sumTotalBid: number | null;
    sumSqft: number | null;
    sumDpSF: number | null;
    overheadPct: number | null;
    overheadAmt: number | null;
    profitPct: number | null;
    profitAmt: number | null;
    otherMarkupAmt: number | null;
  };
  validator: {
    score: number;
    passCount: number;
    warnCount: number;
    failCount: number;
    isReady: boolean;
    allPass: boolean;
    warnings: { label: string; message: string }[];
    failures: { label: string; message: string }[];
  };
  scope: {
    includedCount: number;
    excludedCount: number;
    byOthersCount: number;
    exclusions: string[];
  };
  addendaCount: number;
  roofSystem: string | null;
  laborLabel: string | null;
}

// ── Color palette ─────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const TEAL: RGB   = [27, 58, 75];
const TEAL_LT: RGB = [230, 241, 246];
const GREEN: RGB  = [16, 185, 129];
const AMBER: RGB  = [245, 158, 11];
const RED: RGB    = [239, 68, 68];
const BLUE: RGB   = [59, 130, 246];
const DARK: RGB   = [17, 24, 39];
const GRAY: RGB   = [107, 114, 128];
const LGRAY: RGB  = [243, 244, 246];
const BORDER: RGB = [229, 231, 235];
const WHITE: RGB  = [255, 255, 255];

function fmt$(n: number | null): string {
  if (n == null) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function scoreColor(score: number): RGB {
  if (score >= 90) return GREEN;
  if (score >= 70) return BLUE;
  if (score >= 40) return AMBER;
  return RED;
}

export async function generateBidSummaryPDF(data: BidSummaryData): Promise<void> {
  // Dynamic import so jsPDF is never bundled server-side
  const { jsPDF } = await import("jspdf");

  const PAGE_W = 215.9; // Letter width in mm
  const PAGE_H = 279.4; // Letter height in mm
  const M = 15;         // Margin
  const CW = PAGE_W - M * 2; // Content width

  const doc = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
  let y = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setColor(rgb: RGB) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
  function setFill(rgb: RGB)  { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
  function setDraw(rgb: RGB)  { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

  function hRule(yPos: number, color: RGB = BORDER, w = 0.3) {
    setDraw(color);
    doc.setLineWidth(w);
    doc.line(M, yPos, PAGE_W - M, yPos);
  }

  function sectionLabel(text: string, xPos: number, yPos: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setColor(TEAL);
    doc.text(text, xPos, yPos);
  }

  function dot(rgb: RGB, xPos: number, yPos: number, r = 1.5) {
    setFill(rgb);
    doc.circle(xPos, yPos, r, "F");
  }

  function kvRow(
    label: string,
    value: string,
    xPos: number,
    yPos: number,
    colW: number,
    bold = false
  ) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(GRAY);
    doc.text(label, xPos, yPos);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    setColor(DARK);
    doc.text(value, xPos + colW, yPos, { align: "right" });
  }

  // ── HEADER ─────────────────────────────────────────────────────────────────
  setFill(TEAL);
  doc.rect(0, 0, PAGE_W, 26, "F");

  // Left: branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setColor(WHITE);
  doc.text("BidShield", M, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor([180, 205, 215] as RGB);
  doc.text("Bid Workflow & QA Platform", M, 17);

  // Right: document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(WHITE);
  doc.text("BID SUMMARY", PAGE_W - M, 11, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setColor([180, 205, 215] as RGB);
  doc.text("Confidential — Bid Day Reference", PAGE_W - M, 17, { align: "right" });

  y = 33;

  // ── PROJECT TITLE ──────────────────────────────────────────────────────────
  const { project } = data;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  setColor(DARK);
  doc.text(project.name || "Untitled Project", M, y);
  y += 6;

  if (project.location) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setColor(GRAY);
    doc.text(project.location, M, y);
    y += 5;
  }

  // Meta pills
  const metaParts: string[] = [];
  if (project.gc)    metaParts.push(`GC: ${project.gc}`);
  if (project.owner) metaParts.push(`Owner: ${project.owner}`);
  if (data.financials.sumSqft)
    metaParts.push(`${data.financials.sumSqft.toLocaleString()} SF`);
  if (project.bidDate) {
    const d = new Date(project.bidDate + "T12:00:00");
    metaParts.push(
      `Bid: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    );
  }
  if (data.roofSystem) metaParts.push(data.roofSystem);
  if (data.laborLabel) metaParts.push(data.laborLabel);

  if (metaParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(GRAY);
    doc.text(metaParts.join("   ·   "), M, y);
    y += 5;
  }

  y += 3;
  hRule(y, TEAL, 0.8);
  y += 7;

  // ── TWO-COLUMN: COST BREAKDOWN + BID TOTALS BOX ───────────────────────────
  const HALF = (CW - 8) / 2;
  const C2X = M + HALF + 8;

  const colStartY = y;

  // LEFT — Cost Breakdown label + underline
  sectionLabel("COST BREAKDOWN", M, y);
  y += 3.5;
  hRule(y, BORDER);
  y += 4.5;

  const { financials: fin } = data;
  const RH = 5.5; // row height

  interface CostRow { label: string; value: string; bold?: boolean; large?: boolean }
  const costRows: CostRow[] = [
    { label: "Materials",     value: fmt$(fin.sumMaterial) },
    { label: "Labor",         value: fmt$(fin.sumLabor) },
    { label: "GC Line Items", value: fmt$(fin.sumGCLine) },
  ];

  for (const r of costRows) {
    kvRow(r.label, r.value, M, y, HALF);
    y += RH;
  }

  // Subtotal separator
  hRule(y, BORDER);
  y += 3;

  kvRow("Subtotal", fmt$(fin.sumSubtotal), M, y, HALF, true);
  y += RH;

  if (fin.overheadPct != null && fin.overheadAmt != null) {
    kvRow(`Overhead (${fin.overheadPct}%)`, fmt$(fin.overheadAmt), M, y, HALF);
    y += RH;
  }
  if (fin.profitPct != null && fin.profitAmt != null) {
    kvRow(`Profit (${fin.profitPct}%)`, fmt$(fin.profitAmt), M, y, HALF);
    y += RH;
  }
  if (
    fin.otherMarkupAmt != null &&
    fin.overheadPct == null &&
    fin.profitPct == null
  ) {
    kvRow("Markups", fmt$(fin.otherMarkupAmt), M, y, HALF);
    y += RH;
  }

  // Heavy separator → total
  setDraw(DARK);
  doc.setLineWidth(0.7);
  doc.line(M, y, M + HALF, y);
  y += 3.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(TEAL);
  doc.text("TOTAL BID", M, y);
  doc.text(fmt$(fin.sumTotalBid), M + HALF, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(GRAY);
  doc.text("$/SF", M, y);
  doc.setFont("helvetica", "bold");
  setColor(DARK);
  doc.text(
    fin.sumDpSF != null ? `$${fin.sumDpSF.toFixed(2)}/SF` : "—",
    M + HALF,
    y,
    { align: "right" }
  );
  y += 4;

  const leftBottomY = y;

  // RIGHT — Bid Totals box
  const BOX_H = 26;
  setFill(TEAL_LT);
  setDraw(TEAL);
  doc.setLineWidth(0.5);
  doc.roundedRect(C2X, colStartY, HALF, BOX_H, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setColor(TEAL);
  doc.text("TOTAL BID AMOUNT", C2X + HALF / 2, colStartY + 8, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(DARK);
  doc.text(fmt$(fin.sumTotalBid), C2X + HALF / 2, colStartY + 18, { align: "center" });

  // Metrics below the box
  const metrics: [string, string][] = [];
  if (fin.sumSqft)
    metrics.push(["Square Footage", `${fin.sumSqft.toLocaleString()} SF`]);
  if (fin.sumDpSF != null)
    metrics.push(["Cost per SF", `$${fin.sumDpSF.toFixed(2)}/SF`]);
  if (project.bidDate) {
    const d = new Date(project.bidDate + "T12:00:00");
    metrics.push([
      "Bid Date",
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ]);
  }

  let rightY = colStartY + BOX_H + 4;
  for (const [lbl, val] of metrics) {
    kvRow(lbl, val, C2X, rightY, HALF);
    rightY += 5;
  }

  y = Math.max(leftBottomY, rightY) + 4;

  // ── SEPARATOR ─────────────────────────────────────────────────────────────
  hRule(y);
  y += 7;

  // ── THREE COLUMNS: SCOPE | ADDENDA | VALIDATOR ────────────────────────────
  const THIRD = (CW - 8) / 3;
  const TC1 = M;
  const TC2 = M + THIRD + 4;
  const TC3 = M + (THIRD + 4) * 2;

  sectionLabel("SCOPE SUMMARY", TC1, y);
  sectionLabel("ADDENDA STATUS", TC2, y);
  sectionLabel("VALIDATOR STATUS", TC3, y);
  y += 3.5;

  // Underlines
  for (const tx of [TC1, TC2, TC3]) {
    setDraw(BORDER);
    doc.setLineWidth(0.3);
    doc.line(tx, y, tx + THIRD, y);
  }
  y += 4.5;

  const { scope, validator } = data;

  // Scope column
  let s1Y = y;
  const scopeRows: [string, number, RGB][] = [
    ["Included",  scope.includedCount,  GREEN],
    ["Excluded",  scope.excludedCount,  RED],
    ["By Others", scope.byOthersCount,  AMBER],
  ];
  for (const [lbl, cnt, clr] of scopeRows) {
    dot(clr, TC1 + 2, s1Y - 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(DARK);
    doc.text(lbl, TC1 + 6, s1Y);
    doc.setFont("helvetica", "bold");
    doc.text(String(cnt), TC1 + THIRD, s1Y, { align: "right" });
    s1Y += 5;
  }

  // Addenda column
  let s2Y = y;
  if (data.addendaCount === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(GRAY);
    doc.text("No addenda issued", TC2, s2Y);
    s2Y += 5;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setColor(DARK);
    doc.text(
      `${data.addendaCount} Addend${data.addendaCount === 1 ? "um" : "a"}`,
      TC2,
      s2Y
    );
    s2Y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(GREEN);
    doc.text("✓ Acknowledged", TC2, s2Y);
    s2Y += 5;
  }

  // Validator column
  let s3Y = y;
  const sc = validator.score;
  const scClr = scoreColor(sc);

  // Score badge
  setFill(scClr);
  doc.roundedRect(TC3, s3Y - 4.5, 18, 13, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setColor(WHITE);
  doc.text(String(sc), TC3 + 9, s3Y + 4, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(GRAY);
  doc.text("/100", TC3 + 20, s3Y + 1);

  const statusLabel = validator.allPass
    ? "All checks passing"
    : validator.isReady
    ? "Ready with warnings"
    : "Failing checks — review";
  doc.text(statusLabel, TC3 + 20, s3Y + 6);

  s3Y += 16;

  const checkRows: [string, number, RGB][] = [
    ["Passing",  validator.passCount,  GREEN],
    ["Warnings", validator.warnCount,  AMBER],
    ["Failing",  validator.failCount,  RED],
  ];
  for (const [lbl, cnt, clr] of checkRows) {
    if (cnt > 0 || lbl === "Passing") {
      dot(clr, TC3 + 2, s3Y - 1.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setColor(DARK);
      doc.text(lbl, TC3 + 6, s3Y);
      doc.setFont("helvetica", "bold");
      doc.text(String(cnt), TC3 + THIRD, s3Y, { align: "right" });
      s3Y += 5;
    }
  }

  y = Math.max(s1Y, s2Y, s3Y) + 5;

  // ── KEY EXCLUSIONS ────────────────────────────────────────────────────────
  if (scope.exclusions.length > 0) {
    hRule(y);
    y += 6;

    sectionLabel("KEY EXCLUSIONS", M, y);
    y += 3.5;
    hRule(y);
    y += 4.5;

    const maxEx = Math.min(scope.exclusions.length, 8);
    for (let i = 0; i < maxEx; i++) {
      dot(RED, M + 2, y - 1.5, 1.2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setColor(DARK);
      const lines = doc.splitTextToSize(scope.exclusions[i], CW - 10) as string[];
      doc.text(lines[0], M + 6, y);
      y += 4.5;
    }
    if (scope.exclusions.length > 8) {
      doc.setFontSize(8);
      setColor(GRAY);
      doc.text(`+ ${scope.exclusions.length - 8} more exclusions`, M + 6, y);
      y += 4.5;
    }
    y += 2;
  }

  // ── ACTION ITEMS (fails + warnings) ───────────────────────────────────────
  const actionItems = [
    ...validator.failures.map((f) => ({ ...f, type: "fail" as const })),
    ...validator.warnings.map((w) => ({ ...w, type: "warn" as const })),
  ];

  if (actionItems.length > 0) {
    hRule(y);
    y += 6;

    sectionLabel("ACTION ITEMS", M, y);
    y += 3.5;
    hRule(y);
    y += 4.5;

    const maxItems = Math.min(actionItems.length, 6);
    for (let i = 0; i < maxItems; i++) {
      const item = actionItems[i];
      const clr = item.type === "fail" ? RED : AMBER;
      const tag = item.type === "fail" ? "FAIL" : "WARN";

      // Check for page overflow — add new page if needed
      if (y > PAGE_H - 30) {
        doc.addPage();
        y = 20;
      }

      // Tag badge
      setFill(clr);
      doc.roundedRect(M, y - 3.5, 9, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      setColor(WHITE);
      doc.text(tag, M + 4.5, y, { align: "center" });

      // Item label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      setColor(DARK);
      doc.text(item.label, M + 11, y - 1);

      // Item message
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(GRAY);
      const msgLines = doc.splitTextToSize(item.message, CW - 12) as string[];
      doc.text(msgLines[0], M + 11, y + 3);

      y += 11;
    }

    if (actionItems.length > maxItems) {
      doc.setFontSize(8);
      setColor(GRAY);
      doc.text(
        `+ ${actionItems.length - maxItems} more items — see full Validator tab`,
        M + 11,
        y
      );
      y += 5;
    }
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const FOOTER_Y = PAGE_H - 14;
  setFill(TEAL);
  doc.rect(0, FOOTER_Y - 3, PAGE_W, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setColor(WHITE);
  doc.text("Generated by BidShield", M, FOOTER_Y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const now = new Date();
  const ts =
    now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  doc.text(`Generated ${ts}`, PAGE_W - M, FOOTER_Y + 5, { align: "right" });

  setColor([160, 195, 210] as RGB);
  doc.setFontSize(6.5);
  doc.text(
    "Confidential — for internal estimating use only",
    PAGE_W / 2,
    FOOTER_Y + 10,
    { align: "center" }
  );

  // Save
  const safeName = (project.name || "BidSummary").replace(/[^a-z0-9]/gi, "_");
  doc.save(`${safeName}_BidSummary.pdf`);
}
