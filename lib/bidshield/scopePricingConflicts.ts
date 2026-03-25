// Scope-to-Pricing Conflict Detection
// Cross-references scope item decisions against pricing data to surface mismatches
// before a bid is submitted.

export type ConflictSeverity = "warn" | "fail";

export interface ScopePricingConflict {
  type:
    | "included_no_price"        // Included scope items exist but no pricing entered
    | "excluded_has_material"    // Excluded scope item has a matching material cost
    | "excluded_has_labor"       // Excluded scope item has a matching labor task
    | "unreviewed_scope_with_price"; // Pricing entered but scope is entirely unreviewed
  severity: ConflictSeverity;
  message: string;
  detail: string;
  scopeItemName?: string;
  scopeCategory?: string;
  pricingEntry?: string;
}

// Extracts meaningful keywords (>3 chars) from a string for fuzzy matching
function keywords(str: string): string[] {
  const STOP = new Set(["with", "from", "this", "that", "have", "will", "been", "roof", "roofing", "install"]);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

// Returns true if two strings share at least `minShared` meaningful keywords
function fuzzyMatch(a: string, b: string, minShared = 2): boolean {
  const kA = keywords(a);
  const kB = new Set(keywords(b));
  const shared = kA.filter((w) => kB.has(w)).length;
  if (shared >= minShared) return true;
  // Single-word match allowed when one string is short
  if (kA.length === 1 && shared === 1) return true;
  return false;
}

export function detectScopePricingConflicts({
  scopeItems,
  projectMaterials,
  laborTasks,
  project,
}: {
  scopeItems: any[];
  projectMaterials: any[];
  laborTasks: any[];
  project: any;
}): ScopePricingConflict[] {
  const conflicts: ScopePricingConflict[] = [];

  if (!scopeItems || scopeItems.length === 0) return conflicts;

  const included = scopeItems.filter((s) => s.status === "included");
  const excluded = scopeItems.filter((s) => s.status === "excluded" || s.status === "by_others");
  const unaddressed = scopeItems.filter((s) => s.status === "unaddressed");

  const totalBid: number = project?.totalBidAmount ?? 0;
  const hasMaterials = (projectMaterials ?? []).length > 0;
  const hasLabor = (laborTasks ?? []).length > 0;
  const hasAnyPricing = totalBid > 0 || hasMaterials || hasLabor;

  // ── Conflict 1: Included scope items but zero pricing anywhere ────────────
  if (included.length > 0 && !hasAnyPricing) {
    conflicts.push({
      type: "included_no_price",
      severity: "fail",
      message: `${included.length} scope item${included.length !== 1 ? "s" : ""} marked Included but no pricing entered`,
      detail:
        "Add costs in Materials, Labor, or enter a Total Bid amount — scope decisions must be reflected in pricing.",
    });
  }

  // ── Conflict 2: Pricing entered but scope entirely unreviewed ─────────────
  if (
    hasAnyPricing &&
    scopeItems.length > 0 &&
    unaddressed.length === scopeItems.length
  ) {
    conflicts.push({
      type: "unreviewed_scope_with_price",
      severity: "warn",
      message: "Pricing entered but no scope items have been reviewed",
      detail:
        "Mark each scope item as Included, Excluded, By Others, or N/A before submitting.",
    });
  }

  // ── Conflict 3: Excluded/By Others scope items with matching material cost ─
  const matEntries: { name: string; category: string }[] = (projectMaterials ?? []).map(
    (m: any) => ({ name: m.name ?? "", category: m.category ?? "" })
  );

  const flaggedExcluded = new Set<string>(); // avoid duplicate conflicts per scope item

  for (const scopeItem of excluded) {
    if (flaggedExcluded.has(scopeItem._id)) continue;
    const sName = scopeItem.name ?? "";
    const sCat = (scopeItem.category ?? "").toLowerCase();

    // Check materials
    for (const mat of matEntries) {
      // Direct category match (e.g., scope category "sheetmetal" → material category "sheetmetal")
      const catMatch = sCat === mat.category.toLowerCase();
      // Fuzzy name match
      const nameMatch = fuzzyMatch(sName, mat.name);

      if (catMatch || nameMatch) {
        const label = mat.name || mat.category;
        conflicts.push({
          type: "excluded_has_material",
          severity: "warn",
          message: `Scope excludes "${sName}" but a matching material is priced`,
          detail: `Material "${label}" is still in your cost breakdown — remove it or change the scope decision.`,
          scopeItemName: sName,
          scopeCategory: scopeItem.category,
          pricingEntry: label,
        });
        flaggedExcluded.add(scopeItem._id);
        break;
      }
    }
  }

  // ── Conflict 4: Excluded/By Others scope items with matching labor task ────
  const laborEntries: { task: string; category: string }[] = (laborTasks ?? []).map(
    (t: any) => ({ task: t.task ?? "", category: t.category ?? "" })
  );

  for (const scopeItem of excluded) {
    if (flaggedExcluded.has(scopeItem._id)) continue;
    const sName = scopeItem.name ?? "";
    const sCat = (scopeItem.category ?? "").toLowerCase();

    for (const lt of laborEntries) {
      const catMatch = sCat === lt.category.toLowerCase();
      const nameMatch = fuzzyMatch(sName, lt.task);

      if (catMatch || nameMatch) {
        const label = lt.task || lt.category;
        conflicts.push({
          type: "excluded_has_labor",
          severity: "warn",
          message: `Scope excludes "${sName}" but a matching labor task exists`,
          detail: `Labor task "${label}" is still in your cost breakdown — remove it or change the scope decision.`,
          scopeItemName: sName,
          scopeCategory: scopeItem.category,
          pricingEntry: label,
        });
        flaggedExcluded.add(scopeItem._id);
        break;
      }
    }
  }

  return conflicts;
}
