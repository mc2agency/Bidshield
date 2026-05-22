/**
 * Assembly System Configs
 *
 * Provides:
 *  - INSULATION_CODE_LABELS  — human-readable labels for insulation type codes
 *  - formatInsulationLabel   — normalised display string for an assembly's insulation
 *  - classifyAssemblySystem  — deterministic LAM vs LAM_IRMA classification
 *  - validateAssembly        — intake-stage validation (hard errors vs soft review items)
 *  - mapAIResultToSectionValues — maps raw AI extraction output to UI section values
 */

// ─── Insulation label lookup ───────────────────────────────────────────────────

export const INSULATION_CODE_LABELS: Record<string, string> = {
  polyiso: "Polyisocyanurate",
  xps: "XPS Rigid Insulation",
  xps_high: "XPS Rigid Insulation (High-R)",
  eps: "EPS Rigid Insulation",
  mineral_wool: "Mineral Wool",
  rigid: "Rigid Insulation",
  vacuum: "Vacuum Insulation Panel",
  fiberglass: "Fiberglass Batt",
  spray_foam: "Spray Foam",
};

/**
 * Formats an insulation type + thickness + optional rValue into a readable label.
 *
 * Examples:
 *   formatInsulationLabel("xps",   "7",  35)  → '7" XPS Rigid Insulation (R-35)'
 *   formatInsulationLabel("polyiso","3",  null) → '3" Polyisocyanurate'
 *   formatInsulationLabel("rigid", "7",  35)  → '7" Rigid Insulation (R-35)'
 *
 * Never returns bare codes like "3 rigid" or "7 xps".
 */
export function formatInsulationLabel(
  insulationType: string | null | undefined,
  insulationThickness: string | null | undefined,
  rValue?: number | null,
): string {
  const typeLabel =
    (insulationType && INSULATION_CODE_LABELS[insulationType.toLowerCase()]) ??
    insulationType ??
    "Insulation";

  const thickness = insulationThickness?.trim();

  const rPart = rValue != null ? ` (R-${rValue})` : "";

  if (thickness) {
    return `${thickness}" ${typeLabel}${rPart}`;
  }
  return `${typeLabel}${rPart}`;
}

// ─── Assembly classification ───────────────────────────────────────────────────

export type AssemblySystem = "lam" | "lam_irma";

export interface AssemblyClassificationInput {
  /** Raw OCR / source text for the assembly (may include detail notes) */
  ocrText?: string;
  /** True only when drainage mat is explicitly labeled / leader-lined in the drawing */
  drainageMat?: boolean | null;
  /** True only when filter fabric is explicitly labeled / leader-lined in the drawing */
  filterFabric?: boolean | null;
}

const IRMA_KEYWORDS = /\b(IRMA|PMR|inverted[\s-]roof|protected[\s-]membrane)\b/i;

/**
 * Classify a liquid-applied assembly as lam or lam_irma.
 *
 * Rules (in priority order):
 *  1. If drainageMat===true OR filterFabric===true  → lam_irma
 *  2. If ocrText matches IRMA keywords              → lam_irma
 *  3. Otherwise                                     → lam (conventional)
 *
 * Anti-hallucination: never infers drainage mat or filter fabric from membrane
 * type alone. Caller must set those flags only when explicitly visible in source.
 */
export function classifyAssemblySystem(
  input: AssemblyClassificationInput,
): AssemblySystem {
  const { drainageMat, filterFabric, ocrText } = input;

  if (drainageMat === true) return "lam_irma";
  if (filterFabric === true) return "lam_irma";
  if (ocrText && IRMA_KEYWORDS.test(ocrText)) return "lam_irma";

  return "lam";
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

/**
 * Intake-stage validation for a liquid-applied assembly.
 *
 * lam  (conventional):
 *   - drainage is a SOFT review item only — never an error
 *   - no IRMA-specific fields required
 *
 * lam_irma:
 *   - requires drainageMat
 *   - requires filterFabric
 *   - requires insulation above membrane (insulationAboveMembrane)
 */
export function validateAssembly(params: {
  system: AssemblySystem;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  insulationAboveMembrane?: boolean | null;
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { system, drainageMat, filterFabric, insulationAboveMembrane } = params;

  if (system === "lam") {
    // Soft review item only — do NOT block or error
    if (!drainageMat) {
      issues.push({
        severity: "info",
        code: "lam_drainage_review",
        message:
          "Drainage not specified — confirm drain type and overflow details.",
      });
    }
    // No filter fabric requirement for conventional lam
    return issues;
  }

  if (system === "lam_irma") {
    if (!drainageMat) {
      issues.push({
        severity: "error",
        code: "lam_irma_missing_drainage_mat",
        message: "IRMA/PMR assembly requires a drainage mat.",
      });
    }
    if (!filterFabric) {
      issues.push({
        severity: "error",
        code: "lam_irma_missing_filter_fabric",
        message: "IRMA/PMR assembly requires a filter fabric layer.",
      });
    }
    if (insulationAboveMembrane === false) {
      issues.push({
        severity: "error",
        code: "lam_irma_insulation_position",
        message:
          "IRMA/PMR assembly requires insulation above the waterproofing membrane.",
      });
    }
  }

  return issues;
}

// ─── AI result → section values ───────────────────────────────────────────────

/**
 * Shape returned by the extract-assemblies AI route for a single assembly item.
 */
export interface AIAssemblyResult {
  label?: string | null;
  system?: string | null;
  insulation?: string | null;
  /** Raw thickness string from AI — e.g. "7", "3.5". Must be from insulation layer only. */
  thickness?: string | null;
  rValue?: number | null;
  surface?: string | null;
  area?: number | null;
  name?: string | null;
  deckType?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
}

/**
 * Normalised values ready for UI section population.
 */
export interface AssemblySectionValues {
  /** "lam" or "lam_irma" */
  assemblySystem: AssemblySystem;
  /** Formatted insulation label e.g. '7" Rigid Insulation (R-35)' */
  insulationLabel: string | null;
  /** Raw type code e.g. "xps", "rigid" */
  insulationType: string | null;
  /** Raw thickness string e.g. "7" */
  insulationThickness: string | null;
  /** Numeric R-value if present */
  rValue: number | null;
  /** Intake-stage validation issues */
  validationIssues: ValidationIssue[];
}

/**
 * Maps a raw AI extraction result to normalised section values.
 *
 * This is the single source of truth for insulation formatting —
 * it replaces the former ad-hoc `${ai.insulationThickness} ${ai.insulationType}`.
 */
export function mapAIResultToSectionValues(
  ai: AIAssemblyResult,
  ocrText?: string,
): AssemblySectionValues {
  // 1. Classify system
  const assemblySystem = classifyAssemblySystem({
    ocrText,
    drainageMat: ai.drainageMat,
    filterFabric: ai.filterFabric,
  });

  // 2. Extract insulation fields
  const insulationType = ai.insulation ?? null;
  const insulationThickness = ai.thickness ?? null;
  const rValue = ai.rValue ?? null;

  // 3. Format insulation label — never output "3 rigid" or "7 xps"
  const insulationLabel =
    insulationType || insulationThickness
      ? formatInsulationLabel(insulationType, insulationThickness, rValue)
      : null;

  // 4. Validate
  const validationIssues = validateAssembly({
    system: assemblySystem,
    drainageMat: ai.drainageMat,
    filterFabric: ai.filterFabric,
    insulationAboveMembrane:
      assemblySystem === "lam_irma" ? true : undefined, // IRMA stack implies insulation above
  });

  return {
    assemblySystem,
    insulationLabel,
    insulationType,
    insulationThickness,
    rValue,
    validationIssues,
  };
}
