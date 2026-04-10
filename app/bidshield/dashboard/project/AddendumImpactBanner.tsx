"use client";

/**
 * Cross-tab banner that warns when unresolved addenda affect a section.
 * Usage: <AddendumImpactBanner addenda={addenda} section="Materials" />
 *
 * Shows banners for addenda that:
 *   - affect scope (affectsScope === true)
 *   - have NOT been repriced yet (repriced !== true)
 *   - match the given section via impactCategories
 */

// Map section labels to impactCategories keywords
const SECTION_KEYWORDS: Record<string, string[]> = {
  Materials: ["material", "materials"],
  Takeoff: ["takeoff", "quantities"],
  Labor: ["labor"],
  Pricing: ["price", "pricing", "bid price"],
  Scope: ["scope", "exclusion", "exclusions"],
};

export function AddendumImpactBanner({
  addenda,
  section,
}: {
  addenda: any[] | undefined;
  section: keyof typeof SECTION_KEYWORDS | string;
}) {
  if (!addenda || addenda.length === 0) return null;

  const keywords = SECTION_KEYWORDS[section] ?? [section.toLowerCase()];

  const unresolved = addenda.filter((a: any) => {
    if (!a.affectsScope || a.repriced) return false;
    // If impactCategories is set, check if this section is mentioned
    if (a.impactCategories) {
      const cats = a.impactCategories.toLowerCase();
      return keywords.some((k) => cats.includes(k));
    }
    // If no impactCategories set but scope is affected, show generically
    return true;
  });

  if (unresolved.length === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: "var(--bs-amber-dim)",
        border: "1px solid var(--bs-amber-border)",
      }}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="var(--bs-amber)"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <span style={{ color: "var(--bs-amber)" }}>
        {unresolved.length === 1
          ? `Addendum #${unresolved[0].number} may affect ${section} — needs repricing`
          : `${unresolved.length} addenda may affect ${section} — needs repricing`}
      </span>
    </div>
  );
}
