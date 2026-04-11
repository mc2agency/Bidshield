const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ─── Colors ───
const NAVY = "1B2A4A";
const BLUE = "2E75B6";
const GREEN = "548235";
const RED = "C00000";
const ORANGE = "ED7D31";
const GRAY = "666666";
const LIGHT_BLUE = "D6E4F0";
const LIGHT_GREEN = "E2EFDA";
const LIGHT_RED = "FCE4EC";
const LIGHT_ORANGE = "FFF2CC";
const LIGHT_GRAY = "F2F2F2";
const WHITE = "FFFFFF";

// ─── Helpers ───
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  const runs = typeof text === "string" ? [new TextRun({ text, ...opts })] : text;
  return new Paragraph({ children: runs, spacing: { after: 120 } });
}

function bold(text) { return new TextRun({ text, bold: true }); }
function blue(text) { return new TextRun({ text, color: BLUE, bold: true }); }
function italic(text) { return new TextRun({ text, italics: true, color: GRAY }); }

function statusBadge(text, color, bgColor) {
  return new TableCell({
    borders, shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: cellMargins, verticalAlign: "center",
    width: { size: 1400, type: WidthType.DXA },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text, bold: true, color, size: 18, font: "Arial" })
    ] })]
  });
}

function cell(text, width, opts = {}) {
  const { bg, bold: isBold, color: textColor, align } = opts;
  return new TableCell({
    borders, margins: cellMargins,
    width: { size: width, type: WidthType.DXA },
    shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: align || AlignmentType.LEFT,
      children: [new TextRun({ text, bold: isBold, color: textColor, font: "Arial", size: 20 })]
    })]
  });
}

function headerCell(text, width) {
  return cell(text, width, { bg: NAVY, bold: true, color: WHITE });
}

function phaseHeader(title, subtitle, color) {
  return [
    new Paragraph({ spacing: { before: 360, after: 60 }, children: [
      new TextRun({ text: title, bold: true, size: 28, color, font: "Arial" })
    ] }),
    new Paragraph({ spacing: { after: 200 }, children: [
      new TextRun({ text: subtitle, italics: true, size: 22, color: GRAY, font: "Arial" })
    ] }),
  ];
}

// ─── Document ───
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ] },
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ] },
    ]
  },
  sections: [
    // ═══════════════ COVER PAGE ═══════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 3600 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({ text: "BIDSHIELD", size: 56, bold: true, color: NAVY, font: "Arial" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: "AI Document Pipeline", size: 40, color: BLUE, font: "Arial" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [
          new TextRun({ text: "Implementation Roadmap", size: 32, color: GRAY, font: "Arial" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 2, color: BLUE } }, spacing: { before: 200, after: 200 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
          new TextRun({ text: "MC2 Agency LLC", size: 24, color: NAVY, font: "Arial" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
          new TextRun({ text: "April 2026", size: 22, color: GRAY, font: "Arial" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
          new TextRun({ text: "Version 2.0", size: 22, color: GRAY, font: "Arial" })
        ] }),
      ]
    },

    // ═══════════════ MAIN CONTENT ═══════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BLUE } },
          spacing: { after: 200 },
          children: [new TextRun({ text: "BidShield AI Implementation Roadmap", size: 18, color: GRAY, italics: true })]
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "MC2 Agency LLC  |  Page ", size: 16, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY })
          ]
        })] })
      },
      children: [

        // ─── VISION ───
        heading("The Vision: Eliminate Manual Spec Reading"),
        para([
          new TextRun("BidShield's AI document pipeline replaces the most time-consuming part of commercial roofing estimating: "),
          bold("manually reading specs, marking up documents, printing material lists, cross-referencing quantities, and tracking vendor pricing."),
          new TextRun(" Instead, estimators upload PDFs and BidShield extracts everything into a live dashboard they can work from immediately."),
        ]),

        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun({ text: "What changes for the estimator:", bold: true, color: NAVY, size: 22 })
        ] }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              headerCell("Today (Manual)", 4680),
              headerCell("With BidShield AI", 4680),
            ] }),
            ...([
              ["Read 3-5 spec sections marking materials", "Upload spec PDFs \u2192 material dashboard auto-populated"],
              ["Print specs, highlight, make handwritten lists", "All materials, coverages, warranty requirements in one screen"],
              ["Call vendors for pricing, track in spreadsheet", "Price library with vendor quotes + expiration dates (BUILT)"],
              ["Manually count areas from zoning drawings", "Upload zoning drawing \u2192 areas auto-populate by assembly"],
              ["Read GC Exhibit A, make pricing checklist by hand", "Upload Exhibit A \u2192 pricing checklist auto-generated"],
              ["Compare EDGE quantities vs takeoff by hand", "EDGE report uploaded \u2192 quantity comparison dashboard"],
              ["Cross-reference everything at bid time", "All data linked: specs \u2192 materials \u2192 pricing \u2192 quantities"],
            ]).map(([before, after]) =>
              new TableRow({ children: [
                cell(before, 4680),
                cell(after, 4680, { bg: LIGHT_GREEN }),
              ] })
            ),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── CURRENT STATE ───
        heading("Current State: What Exists vs. What We Build"),

        heading("Existing AI Endpoints (Working)", HeadingLevel.HEADING_2),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 2800, 2160, 2200],
          rows: [
            new TableRow({ children: [
              headerCell("Endpoint", 2200),
              headerCell("What It Does", 2800),
              headerCell("Model", 2160),
              headerCell("Status", 2200),
            ] }),
            ...([
              ["extract-assemblies", "Reads roof plans/zoning drawings, extracts assemblies with system, insulation, thickness, area, labels", "Haiku (vision)", "WORKING"],
              ["extract-estimating-report", "Reads EDGE/STACK/Bluebeam PDFs, extracts material line items with quantities, pricing, coverage rates, waste", "Haiku", "WORKING"],
              ["extract-price-sheet", "Reads vendor price sheet PDFs, extracts products with pricing, coverage, units", "Haiku", "WORKING"],
              ["extract-gc-form", "Reads GC bid forms, extracts questions, auto-confirms against project data, matches scope items", "Haiku", "WORKING"],
              ["lookup-coverage", "Looks up coverage rates for materials (regex shortcuts + AI fallback)", "Haiku", "WORKING"],
            ]).map(([ep, desc, model, status]) =>
              new TableRow({ children: [
                cell(ep, 2200, { bold: true }),
                cell(desc, 2800),
                cell(model, 2160),
                statusBadge(status, GREEN, LIGHT_GREEN),
              ] })
            ),
          ]
        }),

        heading("Existing Infrastructure (Working)", HeadingLevel.HEADING_2),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3000, 4960, 1400],
          rows: [
            new TableRow({ children: [
              headerCell("Component", 3000),
              headerCell("Details", 4960),
              headerCell("Status", 1400),
            ] }),
            ...([
              ["Price Library (bidshield_datasheets)", "Vendor, unitPrice, coverage, coverageUnit, quoteDate, expiration, PDF source. Indexed by user+product.", "BUILT"],
              ["Material Templates (84 templates)", "System-filtered templates with calcType, defaultCoverage, wasteFactor, defaultUnitPrice. Supports TPO/PVC/EPDM/SBS/APP/BUR/Metal.", "BUILT"],
              ["Bulk Material Import", "bulkSaveMaterialsFromExtraction mutation: category mapping, waste calc, coverage source tracking, extractedFromPdf flag.", "BUILT"],
              ["Quote Matching (fuzzy)", "Bidirectional numeric check, product family groups, 70% word-match confidence. Auto-links price library to project materials.", "BUILT"],
              ["Coverage Rate System", "coverageRate + coverageSource (report/ai_estimated/manual) + coverageVerified flag on every material.", "BUILT"],
              ["New Bid Wizard (5-step)", "Project info \u2192 assemblies from drawings \u2192 system config. Fixed null/undefined Convex bug.", "FIXED"],
            ]).map(([name, desc, status]) =>
              new TableRow({ children: [
                cell(name, 3000, { bold: true }),
                cell(desc, 4960),
                statusBadge(status, status === "FIXED" ? ORANGE : GREEN, status === "FIXED" ? LIGHT_ORANGE : LIGHT_GREEN),
              ] })
            ),
          ]
        }),

        heading("What Needs to Be Built", HeadingLevel.HEADING_2),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2800, 4360, 2200],
          rows: [
            new TableRow({ children: [
              headerCell("Feature", 2800),
              headerCell("What It Does", 4360),
              headerCell("Priority", 2200),
            ] }),
            ...([
              ["Spec Extraction Endpoint", "Reads multiple roofing spec PDFs. Extracts: all required materials by section, coverage rates from specs, warranty requirements, installation methods, testing requirements, submittal requirements.", "CRITICAL"],
              ["Spec Material Dashboard", "UI dashboard showing all extracted spec requirements in one place. Replaces manual reading/marking/list-making. Links to price library for auto-pricing.", "CRITICAL"],
              ["Zoning Area Auto-Populate", "Enhance extract-assemblies to read area schedule pages from zoning drawings, auto-populate roof areas into assembly setup.", "HIGH"],
              ["GC Exhibit Pricing Checklist", "Enhance extract-gc-form to handle Exhibit A pricing schedules, auto-generate line-item pricing checklists.", "HIGH"],
              ["EDGE Quantity Comparison", "Compare BidShield-calculated quantities vs EDGE report quantities. Flag discrepancies. This is about QUANTITIES not materials.", "HIGH"],
              ["Tab Cross-Communication", "Takeoff \u2192 Materials, Materials \u2192 Pricing, Labor \u2192 Pricing sync. Tabs currently don\u2019t talk to each other.", "HIGH"],
              ["Wizard Post-Creation Init", "After project creation, auto-init materials, scope items, and takeoff sections from assembly data.", "MEDIUM"],
              ["Submission Threshold Guard", "Block bid submission until minimum bid score is reached.", "MEDIUM"],
            ]).map(([name, desc, pri]) => {
              const priColor = pri === "CRITICAL" ? RED : pri === "HIGH" ? ORANGE : BLUE;
              const priBg = pri === "CRITICAL" ? LIGHT_RED : pri === "HIGH" ? LIGHT_ORANGE : LIGHT_BLUE;
              return new TableRow({ children: [
                cell(name, 2800, { bold: true }),
                cell(desc, 4360),
                statusBadge(pri, priColor, priBg),
              ] });
            }),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ PHASE 1 ═══════════════
        ...phaseHeader("PHASE 1: Spec Extraction Engine", "The biggest missing piece \u2014 eliminates manual spec reading", RED),

        heading("1A. New Endpoint: extract-specifications", HeadingLevel.HEADING_3),

        para([
          new TextRun("This is the core new AI endpoint. Roofing projects require "),
          bold("multiple spec sections"),
          new TextRun(" (not just one). The estimator uploads each spec section PDF and BidShield extracts everything."),
        ]),

        para([bold("API: "), new TextRun("POST /api/bidshield/extract-specifications")]),

        para([bold("Input:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("pdfBase64: base64-encoded spec section PDF")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("specSection: string (e.g., \"07 52 00 - Modified Bituminous Membrane\", \"07 22 00 - Roof Insulation\")")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("projectId: for linking back to project")
        ] }),

        para([bold("Output structure:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("materials[]"),
          new TextRun(" \u2014 productName, manufacturer, category, unit, coverageRate, approved alternatives")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("warranties[]"),
          new TextRun(" \u2014 warrantyType (NDL, material-only, system), duration, requirements, manufacturer")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("installationRequirements[]"),
          new TextRun(" \u2014 requirement text, category (substrate prep, application temp, adhesion method)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("testingRequirements[]"),
          new TextRun(" \u2014 test type (moisture scan, pull test, flood test), timing, criteria")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("submittals[]"),
          new TextRun(" \u2014 submittal item, type (product data, shop drawings, samples), timing")
        ] }),

        para([bold("Model: "), new TextRun("Claude Haiku (fast extraction, 8192 max tokens)")]),

        para([
          italic("Why multiple spec sections: A commercial roofing bid typically needs 07 52 00 (membrane), 07 22 00 (insulation), 07 62 00 (sheet metal), 07 92 00 (sealants), and sometimes 06 10 00 (lumber/blocking). Each is a separate PDF upload that builds the complete material dashboard."),
        ]),

        heading("1B. Spec Material Dashboard UI", HeadingLevel.HEADING_3),

        para([
          new TextRun("New tab or panel in the project view that replaces the manual spec-reading workflow. Shows everything extracted from specs in one place."),
        ]),

        para([bold("Dashboard columns:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Material Name + Manufacturer (from spec)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Spec Section source (07 52 00, 07 22 00, etc.)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Coverage Rate (from spec)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Current Price (auto-linked from price library / bidshield_datasheets)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Price Expiration (from price library \u2014 already built)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Quantity (from EDGE report or calculated from takeoff)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Extended Cost (auto-calculated)")
        ] }),

        para([bold("Warranty panel: "), new TextRun("Separate section showing all warranty requirements extracted across spec sections.")]),
        para([bold("Submittal tracker: "), new TextRun("List of required submittals with status tracking.")]),

        heading("1C. Database: bidshield_spec_requirements", HeadingLevel.HEADING_3),

        para("New Convex table to store extracted spec data:"),

        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("projectId, userId, specSection, sourceFileName")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("type: \"material\" | \"warranty\" | \"installation\" | \"testing\" | \"submittal\"")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("For materials: productName, manufacturer, category, unit, coverageRate, alternatives[]")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("For warranties: warrantyType, duration, requirements")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("linkedDatasheetId: v.optional(v.id(\"bidshield_datasheets\")) \u2014 auto-links to price library")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Indexes: by_project, by_project_section, by_project_type")
        ] }),

        para([
          italic("This table stores the RAW spec requirements. The existing bidshield_project_materials table stores the project\u2019s working material list (from EDGE or templates). Spec requirements link to project materials for verification."),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ PHASE 2 ═══════════════
        ...phaseHeader("PHASE 2: Drawing Intelligence", "Auto-populate areas + enhance assembly extraction", ORANGE),

        heading("2A. Zoning Drawing Area Auto-Population", HeadingLevel.HEADING_3),

        para([
          new TextRun("Most commercial roofing zoning drawings include an "),
          bold("area schedule page"),
          new TextRun(" \u2014 a table showing each assembly label (RT-01, RT-02, etc.) with its square footage. The extract-assemblies endpoint already reads drawings, but needs to be enhanced to prioritize this area schedule."),
        ]),

        para([bold("Enhancement to extract-assemblies:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Add instruction: \"Look for an area schedule or takeoff table showing roof areas by assembly label. This takes priority over estimating individual areas.\"")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Extract sub-areas (RT-01, RT-01 N) as separate entries (already in prompt, needs verification)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Return areas in the assembly objects so they auto-populate into Setup Tab")
        ] }),

        para([bold("Flow: "), new TextRun("Upload zoning drawing \u2192 extract-assemblies (enhanced) \u2192 assemblies with areas \u2192 Wizard Step 2 pre-fills areas \u2192 Setup Tab shows correct SF per assembly")]),

        para([italic("Low effort: This is mostly prompt tuning on the existing endpoint. The data path already exists \u2014 the assembly objects already have an area field.")]),

        heading("2B. Wizard Post-Creation Initialization", HeadingLevel.HEADING_3),

        para("After the wizard creates a project with assemblies, automatically initialize:"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("Materials"),
          new TextRun(" \u2014 from templates filtered by the assembly system types (already coded in initProjectMaterials)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("Scope items"),
          new TextRun(" \u2014 default scope from trade template (already coded in checklist init)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          bold("Takeoff sections"),
          new TextRun(" \u2014 create sections for each assembly label (needs new mutation)")
        ] }),

        para([italic("Currently the wizard creates the project and checklist but the estimator has to manually trigger material and scope initialization from their respective tabs.")]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ PHASE 3 ═══════════════
        ...phaseHeader("PHASE 3: GC Document Processing", "Exhibit A checklists + enhanced form handling", BLUE),

        heading("3A. GC Exhibit A Pricing Checklist", HeadingLevel.HEADING_3),

        para([
          new TextRun("GC Exhibit A (pricing schedule) is a document where the GC lists every line item they want priced. The extract-gc-form endpoint currently handles Q&A-style bid forms. It needs to also handle "),
          bold("pricing schedule formats"),
          new TextRun(" that create a checklist of items to price."),
        ]),

        para([bold("Enhancement to extract-gc-form:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Add new itemType: \"pricing-line-item\" (alongside existing \"fill-in\" and \"scope-item\")")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("For pricing items: extract lineItemDescription, unit (LS/SF/LF/EA), quantity if provided")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Auto-match pricing line items against project scope items and materials")
        ] }),

        para([bold("New UI: "), new TextRun("GC Pricing Checklist panel showing each Exhibit A line item with: description, unit, your price (from materials), status (priced/pending/N/A)")]),

        heading("3B. Addendum Impact Analysis (Existing)", HeadingLevel.HEADING_3),
        para("The check-addendum-impact endpoint is already designed but may need connection to the spec requirements and material dashboard to flag when addenda change specified materials or quantities."),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ PHASE 4 ═══════════════
        ...phaseHeader("PHASE 4: Quantity Verification & Tab Sync", "EDGE comparison + connecting the tabs", GREEN),

        heading("4A. EDGE Quantity Comparison", HeadingLevel.HEADING_3),

        para([
          new TextRun("The EDGE report and BidShield use the "),
          bold("same materials"),
          new TextRun(" (not different ones). The comparison is about "),
          bold("quantities"),
          new TextRun(": does BidShield\u2019s calculated quantity match what the EDGE report shows?"),
        ]),

        para([bold("Logic:")]),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("EDGE extraction already captures: materialName, quantity, unit, coverageRate")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("BidShield project materials have: name, quantity (calculated from takeoff + coverage + waste)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Match by material name (fuzzy matching already built)")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Compare quantities: flag items where BidShield qty differs from EDGE qty by > 5%")
        ] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
          new TextRun("Dashboard: material name | EDGE qty | BidShield qty | variance % | status flag")
        ] }),

        heading("4B. Tab Cross-Communication", HeadingLevel.HEADING_3),

        para("The #1 architectural issue from the workflow audit: tabs don't talk to each other. Data entered in one tab doesn't flow to where it's needed."),

        para([bold("Priority connections:")]),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2000, 1200, 2000, 4160],
          rows: [
            new TableRow({ children: [
              headerCell("Source Tab", 2000),
              headerCell("\u2192", 1200),
              headerCell("Target Tab", 2000),
              headerCell("What Syncs", 4160),
            ] }),
            ...([
              ["Takeoff", "\u2192", "Materials", "Total SF/LF/EA per line item \u2192 drives quantity calculations using coverage rates"],
              ["Materials", "\u2192", "Pricing", "Material costs roll up into total material cost line"],
              ["Labor", "\u2192", "Pricing", "Labor hours \u00D7 rates \u2192 total labor cost line"],
              ["Setup (areas)", "\u2192", "Takeoff", "Assembly areas populate takeoff field measurement defaults"],
              ["Spec Dashboard", "\u2192", "Materials", "Required materials from specs link to project material list"],
              ["Price Library", "\u2192", "Materials", "Latest vendor pricing auto-fills unitPrice on materials"],
            ]).map(([src, arrow, tgt, desc]) =>
              new TableRow({ children: [
                cell(src, 2000, { bold: true }),
                cell(arrow, 1200, { align: AlignmentType.CENTER }),
                cell(tgt, 2000, { bold: true }),
                cell(desc, 4160),
              ] })
            ),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ PHASE 5 ═══════════════
        ...phaseHeader("PHASE 5: Guardrails & Polish", "Submission safety + bid quality enforcement", NAVY),

        heading("5A. Submission Threshold", HeadingLevel.HEADING_3),
        para("Block bid submission until the bid score reaches a configurable minimum (default 85%). The bid score system is already built and tracks 22+ weighted factors. This adds enforcement at the submit action."),

        heading("5B. Component Reconciliation", HeadingLevel.HEADING_3),
        para("Cross-check that every material in the takeoff has a price, every scope item is addressed, every GC form question is answered. Surface a pre-submission checklist showing gaps."),

        heading("5C. Critical Phase Enforcement", HeadingLevel.HEADING_3),
        para("Require certain tabs (Setup, Materials, Scope) to be completed before others (Pricing, Submission) become available. Prevents estimators from jumping ahead and missing steps."),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ IMPLEMENTATION ORDER ═══════════════
        heading("Implementation Order"),

        para("Each phase builds on the previous. The spec extraction engine (Phase 1) is the foundation because it creates the material dashboard that everything else connects to."),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1200, 2600, 1800, 1800, 1960],
          rows: [
            new TableRow({ children: [
              headerCell("Phase", 1200),
              headerCell("Deliverable", 2600),
              headerCell("Effort", 1800),
              headerCell("Depends On", 1800),
              headerCell("Impact", 1960),
            ] }),
            ...([
              ["1A", "extract-specifications endpoint", "2-3 days", "None", "CRITICAL"],
              ["1B", "Spec Material Dashboard UI", "2-3 days", "1A", "CRITICAL"],
              ["1C", "bidshield_spec_requirements table", "0.5 day", "None (do first)", "CRITICAL"],
              ["2A", "Zoning area auto-populate", "0.5-1 day", "None", "HIGH"],
              ["2B", "Wizard post-creation init", "1 day", "None", "HIGH"],
              ["3A", "GC Exhibit A pricing checklist", "1-2 days", "None", "HIGH"],
              ["4A", "EDGE quantity comparison", "1-2 days", "Phase 1", "HIGH"],
              ["4B", "Tab cross-communication", "3-4 days", "Phase 1", "HIGH"],
              ["5A", "Submission threshold", "0.5 day", "None", "MEDIUM"],
              ["5B", "Component reconciliation", "1-2 days", "Phase 4", "MEDIUM"],
              ["5C", "Critical phase enforcement", "1 day", "None", "MEDIUM"],
            ]).map(([phase, del, effort, dep, impact]) => {
              const impactColor = impact === "CRITICAL" ? RED : impact === "HIGH" ? ORANGE : BLUE;
              const impactBg = impact === "CRITICAL" ? LIGHT_RED : impact === "HIGH" ? LIGHT_ORANGE : LIGHT_BLUE;
              return new TableRow({ children: [
                cell(phase, 1200, { bold: true }),
                cell(del, 2600),
                cell(effort, 1800),
                cell(dep, 1800, { color: dep === "None" || dep === "None (do first)" ? GREEN : GRAY }),
                statusBadge(impact, impactColor, impactBg),
              ] });
            }),
          ]
        }),

        para([
          italic("Total estimated effort: 14-20 working days. Recommended approach: start with Phase 1C (schema), then 1A + 2A in parallel, then 1B, then remaining phases."),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════ DATA FLOW ═══════════════
        heading("Complete Data Flow: Upload to Bid"),

        para([bold("Step 1: Project Creation (Wizard)")]),
        para("Upload drawings \u2192 extract-assemblies \u2192 assemblies + areas auto-populated \u2192 project created \u2192 materials, scope, takeoff auto-initialized"),

        para([bold("Step 2: Spec Upload (NEW)")]),
        para("Upload spec section PDFs (07 52 00, 07 22 00, etc.) \u2192 extract-specifications \u2192 material requirements + warranties + installation reqs stored in bidshield_spec_requirements \u2192 spec material dashboard populated \u2192 auto-linked to price library for current pricing"),

        para([bold("Step 3: EDGE Import (Existing)")]),
        para("Upload EDGE report PDF \u2192 extract-estimating-report \u2192 material line items with quantities imported \u2192 compared against spec requirements \u2192 quantity discrepancies flagged"),

        para([bold("Step 4: Vendor Pricing (Existing)")]),
        para("Upload vendor price sheets \u2192 extract-price-sheet \u2192 products with pricing saved to price library (bidshield_datasheets) with quote date + expiration \u2192 auto-matched to project materials"),

        para([bold("Step 5: GC Form Processing (Enhanced)")]),
        para("Upload GC bid form/Exhibit A \u2192 extract-gc-form (enhanced) \u2192 Q&A items auto-confirmed from project data + pricing line items create checklist \u2192 matched against scope and materials"),

        para([bold("Step 6: Review & Submit")]),
        para("All tabs connected: takeoff drives quantities, materials drive pricing, specs verify completeness \u2192 bid score calculated \u2192 submission threshold enforced \u2192 bid submitted with confidence"),

        new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 2, color: BLUE } } }),
        para([
          bold("Bottom line: "),
          new TextRun("The estimator uploads PDFs. BidShield does the reading, extracting, linking, and calculating. The estimator reviews, adjusts, and submits."),
        ]),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "/sessions/wizardly-sweet-maxwell/mnt/bidshield/BidShield-AI-Implementation-Roadmap.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Written to " + outPath + " (" + buffer.length + " bytes)");
});
