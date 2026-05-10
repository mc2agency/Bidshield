// Estimating report XLSX import — handles exports from Edge Estimating, STACK,
// Timberline/Sage, PlanSwift, ProEst, and generic spreadsheet formats.
// Detects manufacturer groupings from product names + CSI codes.

export interface EstimatingLineItem {
  description: string;
  orderQty: number;
  orderUnit: string;
  unitPrice: number;
  netCost: number;
  wastePct: number;
  userCode: string;
  conditionName: string | null;
  sectionName: string | null;
  scenarioName: string | null;
  manufacturer: string;
  category: string;
}

// --- Manufacturer detection ---

const MANUFACTURER_RULES: Array<{ test: (d: string, code: string) => boolean; name: string }> = [
  { test: (d) => /^siplast|PA-\d+\s*LS|Irex/i.test(d), name: "Siplast" },
  { test: (d) => /vapor retarder TA/i.test(d), name: "Siplast" },
  { test: (d) => /hydrodrain|hydroseal|hydrotech|hydroflex|flex.flash\s*(UN|F)|gardendrain|MM\s*6125|root stop|system filter|surface conditioner/i.test(d), name: "American Hydrotech" },
  { test: (d) => /sarnacol|sarnafil|sarnadisc|sarnaplate|sarnacorner|sarnastop|sarnaspeed|G-410|G410/i.test(d), name: "Sika Sarnafil" },
  { test: (d) => /sikagard|sikarepair|sika\s/i.test(d), name: "Sika" },
  { test: (d) => /henry\s|blueskin|henry\s*574|henry\s*878/i.test(d), name: "Henry" },
  { test: (d) => /master.?seal|masterseal/i.test(d), name: "BASF MasterSeal" },
  { test: (d) => /aquafin/i.test(d), name: "Aquafin" },
  { test: (d) => /plazamate|plaza.mate|XR insulation/i.test(d), name: "DuPont" },
  { test: (d) => /hunter\s*H-/i.test(d), name: "Hunter Panels" },
  { test: (d) => /gaco|gacoflex/i.test(d), name: "GacoFlex" },
  { test: (d) => /firestone|ultemp|rubberguard/i.test(d), name: "Firestone" },
  { test: (d) => /johns.?manville|jm\s/i.test(d), name: "Johns Manville" },
  { test: (d) => /carlisle|sure.weld|sure.flex/i.test(d), name: "Carlisle" },
  { test: (d) => /versico/i.test(d), name: "Versico" },
  { test: (d) => /gaf\s|liberty\s|ruberoid/i.test(d), name: "GAF" },
  { test: (d) => /tremco|tremproof|vulkem/i.test(d), name: "Tremco" },
  { test: (d) => /soprema|colphene|elastophene/i.test(d), name: "Soprema" },
  { test: (d) => /owens.?corning|foamular/i.test(d), name: "Owens Corning" },
  { test: (d, c) => c.startsWith("06-"), name: "Wood & Blocking" },
  { test: (d, c) => c.startsWith("07-100-15"), name: "Sheet Metal" },
  { test: (d, c) => c.startsWith("07-100-17"), name: "Fasteners & Hardware" },
  { test: (d, c) => c.startsWith("07-100-10") && !["07-100-102", "07-100-150", "07-100-160", "07-100-170"].some(x => c.startsWith(x)), name: "Waterproofing" },
  { test: (d, c) => ["07-100-940", "07-100-950", "07-100-920"].some(x => c.startsWith(x)), name: "General Conditions" },
  { test: (d, c) => c.startsWith("07-330"), name: "Green Roof" },
  { test: (d, c) => c.startsWith("07-100-102"), name: "Pavers & Pedestals" },
  { test: (d, c) => c.startsWith("07-181"), name: "Traffic Coatings" },
  { test: (d, c) => c.startsWith("07-500"), name: "Crystalline Waterproofing" },
  // Generic description-based fallbacks
  { test: (d) => /\blumber\b|plywood|2\s*x\s*\d|blocking/i.test(d), name: "Wood & Blocking" },
  { test: (d) => /\bfastener|screw|nail|anchor/i.test(d), name: "Fasteners & Hardware" },
  { test: (d) => /sheet.?metal|aluminum|galvan|stainless|coping|drip.?edge|gravel.?stop/i.test(d), name: "Sheet Metal" },
  { test: (d) => /propane|scaffold|lift|equipment rental/i.test(d), name: "Equipment & Tools" },
];

export function detectManufacturer(description: string, userCode: string): string {
  for (const rule of MANUFACTURER_RULES) {
    if (rule.test(description, userCode)) return rule.name;
  }
  return "Other";
}

// --- CSI code → material category ---
function csiToCategory(code: string, description: string): string {
  const d = description.toLowerCase();
  if (code.startsWith("06-")) return "lumber";
  if (code.startsWith("07-100-15")) return "sheet_metal";
  if (code.startsWith("07-100-17")) return "fasteners";
  if (d.includes("insul") || d.includes("polyiso") || d.includes("plaza mate") || d.includes("plazamate") || d.includes("xr insul") || d.includes("cover board") || d.includes("coverboard") || d.includes("densdeck")) return "insulation";
  if (d.includes("adhesive") || d.includes("primer") || d.includes("cement") || d.includes("sealant") || d.includes("caulk") || d.includes("resin") || d.includes("sarnacol") || d.includes("mastic")) return "adhesive";
  if (d.includes("fastener") || d.includes("screw") || d.includes("nail") || d.includes("anchor") || d.includes("sarnadisc") || d.includes("sarnaplate")) return "fasteners";
  if (d.includes("sheet metal") || d.includes("aluminum") || d.includes("galvan") || d.includes("stainless") || d.includes("coping") || d.includes("drip edge") || d.includes("gravel stop")) return "sheet_metal";
  if (d.includes("lumber") || d.includes("plywood") || d.includes("blocking") || /2\s*x\s*\d/.test(d)) return "lumber";
  if (d.includes("waterproof") || d.includes("membrane") || d.includes("blueskin") || d.includes("flex flash") || d.includes("hydroseal") || d.includes("hydroflex") || d.includes("irex") || d.includes("vapor retarder") || d.includes("mm 6125") || d.includes("tpo") || d.includes("epdm") || d.includes("pvc")) return "membrane";
  if (code.startsWith("07-100-94") || code.startsWith("07-100-95")) return "accessories";
  return "accessories";
}

// --- Waste percent → waste factor ---
function toWasteFactor(pct: number): number {
  const f = 1 + Math.abs(pct);
  return Math.min(Math.max(f, 1.0), 1.5);
}

// --- Parse estimating report XLSX (any software) ---
// Handles: Edge Estimating, STACK, Timberline/Sage, PlanSwift, ProEst, generic spreadsheets
export async function parseEstimatingXlsx(arrayBuffer: ArrayBuffer): Promise<EstimatingLineItem[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });

  if (!rows.length) return [];

  const firstRow = rows[0];
  const keys = Object.keys(firstRow);

  function findCol(candidates: string[]): string | null {
    for (const c of candidates) {
      const norm = c.toLowerCase().replace(/[\s_\-]/g, "");
      const found = keys.find(k => k.toLowerCase().replace(/[\s_\-]/g, "") === norm);
      if (found) return found;
    }
    return null;
  }

  const COL = {
    isOn: findCol(["IsOn", "ison", "Active", "Include", "Use"]),
    description: findCol(["Description", "Item Description", "Material", "Item Name", "Name", "Product", "ItemName", "LineItem", "Line Item"]),
    adjOrderQty: findCol(["Adjusted Order Qty", "AdjustedOrderQty", "AdjOrderQty", "Order Qty", "OrderQty", "Order Quantity", "OrderQuantity", "Quantity", "Qty", "Amount"]),
    orderUnit: findCol(["Order Unit", "OrderUnit", "Price Unit", "PriceUnit", "Unit", "UOM", "Unit of Measure"]),
    unitPrice: findCol(["Unit Price", "UnitPrice", "Price", "Unit Cost", "UnitCost", "Cost Per Unit", "CostPerUnit", "Material Cost", "MaterialCost"]),
    netCost: findCol(["Net Cost", "NetCost", "Extended Total", "ExtendedTotal", "Total Cost", "TotalCost", "Total", "Extension", "Amount"]),
    wastePct: findCol(["Waste Percent", "WastePercent", "Waste Pct", "WastePct", "Waste %", "Waste", "Waste Factor"]),
    userCode: findCol(["UserCode", "User Code", "CSI Code", "CSICode", "CSI", "Division", "Cost Code", "CostCode", "Phase Code", "PhaseCode"]),
    conditionName: findCol(["ConditionName", "Condition Name", "Condition", "Sub-Item", "SubItem", "Detail"]),
    sectionName: findCol(["SectionName", "Section Name", "Section", "Area", "Zone", "Location"]),
    scenarioName: findCol(["ScenarioName", "Scenario Name", "Scenario", "Assembly", "System", "Phase", "Bid Package"]),
  };

  if (!COL.description) return [];

  const items: EstimatingLineItem[] = [];

  for (const row of rows) {
    if (COL.isOn && row[COL.isOn] === false) continue;

    const description = String(row[COL.description] ?? "").trim();
    if (!description || description.toLowerCase() === "description" || description.toLowerCase() === "item") continue;

    const orderQty = COL.adjOrderQty ? Number(row[COL.adjOrderQty]) || 0 : 0;
    const orderUnit = COL.orderUnit ? String(row[COL.orderUnit] ?? "EA").trim() || "EA" : "EA";
    const unitPrice = COL.unitPrice ? Number(row[COL.unitPrice]) || 0 : 0;
    const netCost = COL.netCost ? Number(row[COL.netCost]) || 0 : 0;
    const rawWaste = COL.wastePct ? Number(row[COL.wastePct]) || 0 : 0;
    // Handle both decimal (0.10) and percent (10) formats
    const wastePct = rawWaste > 1 ? rawWaste / 100 : rawWaste;
    const userCode = COL.userCode ? String(row[COL.userCode] ?? "").trim() : "";
    const conditionName = COL.conditionName ? String(row[COL.conditionName] ?? "").trim() || null : null;
    const sectionName = COL.sectionName ? String(row[COL.sectionName] ?? "").trim() || null : null;
    const scenarioName = COL.scenarioName ? String(row[COL.scenarioName] ?? "").trim() || null : null;

    const manufacturer = detectManufacturer(description, userCode);
    const category = csiToCategory(userCode, description);

    items.push({
      description,
      orderQty,
      orderUnit,
      unitPrice,
      netCost,
      wastePct,
      userCode,
      conditionName,
      sectionName,
      scenarioName,
      manufacturer,
      category,
    });
  }

  return items;
}

// --- Group by manufacturer ---
export interface ManufacturerGroup {
  manufacturer: string;
  items: EstimatingLineItem[];
  subtotal: number;
}

export function groupByManufacturer(items: EstimatingLineItem[]): ManufacturerGroup[] {
  const map = new Map<string, EstimatingLineItem[]>();
  for (const item of items) {
    const g = map.get(item.manufacturer) ?? [];
    g.push(item);
    map.set(item.manufacturer, g);
  }
  return Array.from(map.entries())
    .map(([manufacturer, groupItems]) => {
      // Merge items with identical descriptions (sum qty + netCost, keep first unitPrice)
      const merged = new Map<string, EstimatingLineItem>();
      for (const item of groupItems) {
        const key = item.description.toLowerCase().trim();
        if (merged.has(key)) {
          const ex = merged.get(key)!;
          merged.set(key, { ...ex, orderQty: ex.orderQty + item.orderQty, netCost: ex.netCost + item.netCost });
        } else {
          merged.set(key, { ...item });
        }
      }
      const items = Array.from(merged.values());
      return { manufacturer, items, subtotal: items.reduce((s, i) => s + i.netCost, 0) };
    })
    .sort((a, b) => b.subtotal - a.subtotal);
}

// --- Convert EstimatingLineItem → saveBulkMaterials shape ---
export function estimatingItemToMaterial(item: EstimatingLineItem, index: number) {
  return {
    category: item.category,
    name: item.description,
    unit: item.orderUnit,
    calcType: "fixed" as const,
    quantity: item.orderQty > 0 ? item.orderQty : undefined,
    unitPrice: item.unitPrice > 0 ? item.unitPrice : undefined,
    totalCost: item.netCost > 0 ? item.netCost : undefined,
    wasteFactor: toWasteFactor(item.wastePct),
    notes: item.conditionName || undefined,
    sortOrder: index,
    extractedFromPdf: false,
    coverageSource: "report" as const,
    manufacturer: item.manufacturer,
  };
}

// --- Generate pricing request email body ---
export function generatePricingEmailBody(
  manufacturer: string,
  items: EstimatingLineItem[],
  projectName: string
): { subject: string; body: string } {
  const lines = items
    .filter(i => i.orderQty > 0)
    .map(i => `  • ${i.description} — ${i.orderQty} ${i.orderUnit}`)
    .join("\n");

  const subject = `Material Pricing Request – ${projectName}`;
  const body = `Hi,

I'm putting together pricing for the following ${manufacturer} materials on project: ${projectName}.

Please provide unit pricing and lead time for the items below:

${lines}

Please reply with your best pricing valid for 30 days. Let me know if you need additional spec information.

Thank you`;

  return { subject, body };
}
