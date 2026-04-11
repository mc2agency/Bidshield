import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertProjectOwnership, assertRecordOwnership, roundCurrency } from "./_helpers";

// ===== VALIDATION HELPERS =====

function validateWasteFactor(wasteFactor: number): number {
  if (wasteFactor < 1.0) return 1.0; // minimum: no waste
  if (wasteFactor > 1.50) return 1.50; // max 50% waste — likely a typo beyond this
  return wasteFactor;
}

function validateNumericFields(args: {
  quantity?: number;
  unitPrice?: number;
  totalCost?: number;
  wasteFactor?: number;
  coverage?: number;
  qtyPerSf?: number;
}) {
  if (args.quantity !== undefined && args.quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }
  if (args.unitPrice !== undefined && args.unitPrice < 0) {
    throw new Error("Unit price cannot be negative");
  }
  if (args.coverage !== undefined && args.coverage < 0) {
    throw new Error("Coverage cannot be negative");
  }
  if (args.qtyPerSf !== undefined && args.qtyPerSf < 0) {
    throw new Error("Quantity per SF cannot be negative");
  }
}

// ===== PROJECT MATERIALS =====

export const getProjectMaterials = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return [];
    const items = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const addProjectMaterial = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    templateKey: v.optional(v.string()),
    category: v.string(),
    name: v.string(),
    unit: v.string(),
    calcType: v.string(),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    wasteFactor: v.number(),
    coverage: v.optional(v.number()),
    qtyPerSf: v.optional(v.number()),
    takeoffItemType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    validateNumericFields(args);
    const wasteFactor = validateWasteFactor(args.wasteFactor);
    // P3: Only fetch the last item by sort order instead of loading all materials
    const lastItem = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .first();
    const maxSort = lastItem ? lastItem.sortOrder : -1;
    const now = Date.now();
    return await ctx.db.insert("bidshield_project_materials", {
      projectId: args.projectId,
      userId: args.userId,
      templateKey: args.templateKey,
      category: args.category,
      name: args.name,
      unit: args.unit,
      calcType: args.calcType,
      quantity: args.quantity,
      unitPrice: args.unitPrice ? roundCurrency(args.unitPrice) : args.unitPrice,
      totalCost: args.totalCost ? roundCurrency(args.totalCost) : args.totalCost,
      wasteFactor,
      coverage: args.coverage,
      qtyPerSf: args.qtyPerSf,
      takeoffItemType: args.takeoffItemType,
      notes: args.notes,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProjectMaterial = mutation({
  args: {
    materialId: v.id("bidshield_project_materials"),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    wasteFactor: v.optional(v.number()),
    coverage: v.optional(v.number()),
    qtyPerSf: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    await assertRecordOwnership(ctx, material, "project material");
    validateNumericFields(args);
    const { materialId, ...updates } = args;
    // Apply roundCurrency to financial fields and validate waste
    if (updates.unitPrice !== undefined) updates.unitPrice = roundCurrency(updates.unitPrice);
    if (updates.totalCost !== undefined) updates.totalCost = roundCurrency(updates.totalCost);
    if (updates.wasteFactor !== undefined) updates.wasteFactor = validateWasteFactor(updates.wasteFactor);
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(materialId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProjectMaterial = mutation({
  args: { materialId: v.id("bidshield_project_materials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    await assertRecordOwnership(ctx, material, "project material");
    await ctx.db.delete(args.materialId);
  },
});

// Bulk add materials from templates
export const initProjectMaterials = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    materials: v.array(v.object({
      templateKey: v.optional(v.string()),
      category: v.string(),
      name: v.string(),
      unit: v.string(),
      calcType: v.string(),
      quantity: v.optional(v.number()),
      unitPrice: v.optional(v.number()),
      totalCost: v.optional(v.number()),
      wasteFactor: v.number(),
      coverage: v.optional(v.number()),
      qtyPerSf: v.optional(v.number()),
      takeoffItemType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    // Check if materials already exist
    const existing = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (existing.length > 0) return existing.sort((a, b) => a.sortOrder - b.sortOrder);

    const now = Date.now();
    const created = [];
    for (let i = 0; i < args.materials.length; i++) {
      const m = args.materials[i];
      const id = await ctx.db.insert("bidshield_project_materials", {
        projectId: args.projectId,
        userId: args.userId,
        templateKey: m.templateKey,
        category: m.category,
        name: m.name,
        unit: m.unit,
        calcType: m.calcType,
        quantity: m.quantity,
        unitPrice: m.unitPrice,
        totalCost: m.totalCost,
        wasteFactor: m.wasteFactor,
        coverage: m.coverage,
        qtyPerSf: m.qtyPerSf,
        takeoffItemType: m.takeoffItemType,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ _id: id, ...m, sortOrder: i });
    }
    return created;
  },
});

// Delete all materials for a project (used before replacing with extracted items)
export const clearProjectMaterials = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    try {
      const existing = await ctx.db
        .query("bidshield_project_materials")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
      for (const m of existing) {
        await ctx.db.delete(m._id);
      }
      return { deleted: existing.length };
    } catch (error) {
      console.error("clearProjectMaterials error:", error);
      throw error;
    }
  },
});

// Bulk save materials extracted from PDF estimating report
export const bulkSaveMaterialsFromExtraction = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    items: v.array(v.object({
      materialName: v.string(),
      category: v.string(),
      unit: v.string(),
      quantity: v.optional(v.number()),
      coverageRate: v.optional(v.string()),
      wastePct: v.optional(v.number()),
      unitPrice: v.optional(v.number()),
      extendedTotal: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    try {
      const now = Date.now();
      const existing = await ctx.db
        .query("bidshield_project_materials")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
      const sortBase = existing.length;
      const categoryMap: Record<string, string> = {
        "Membrane": "membrane",
        "Insulation": "insulation",
        "Fasteners & Plates": "fasteners",
        "Adhesive & Sealant": "adhesive",
        "Sheet Metal": "sheet_metal",
        "Lumber & Blocking": "lumber",
        "Accessories": "accessories",
        "Tear-Off": "accessories",
        "Miscellaneous": "miscellaneous",
        // Legacy mappings
        "Edge Metal": "sheet_metal",
        "Fabricated Metal": "sheet_metal",
        "Metal Work": "sheet_metal",
        "Lumber": "lumber",
        "General": "miscellaneous",
      };
      for (let i = 0; i < args.items.length; i++) {
        const item = args.items[i];
        const cat = categoryMap[item.category] ?? "accessories";
        const wastePct = item.wastePct ?? 0;
        const wasteFactor = wastePct > 0 ? 1 + wastePct / 100 : 1.0;
        await ctx.db.insert("bidshield_project_materials", {
          projectId: args.projectId,
          userId: args.userId,
          category: cat,
          name: item.materialName,
          unit: item.unit,
          calcType: "fixed",
          quantity: item.quantity ?? 0,
          unitPrice: item.unitPrice ? roundCurrency(item.unitPrice) : 0,
          totalCost: item.extendedTotal ? roundCurrency(item.extendedTotal) : 0,
          wasteFactor,
          coverageRate: item.coverageRate ?? undefined,
          coverageSource: item.coverageRate ? "report" : undefined,
          extractedFromPdf: true,
          sortOrder: sortBase + i,
          createdAt: now,
          updatedAt: now,
        });
      }
      return { inserted: args.items.length };
    } catch (error) {
      console.error("bulkSaveMaterialsFromExtraction error:", error);
      throw error;
    }
  },
});

// Update coverage rate for a single material
export const updateMaterialCoverageRate = mutation({
  args: {
    materialId: v.id("bidshield_project_materials"),
    coverageRate: v.string(),
    source: v.string(), // "report" | "ai_estimated" | "manual"
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    await assertRecordOwnership(ctx, material, "project material");
    await ctx.db.patch(args.materialId, {
      coverageRate: args.coverageRate,
      coverageSource: args.source,
      coverageVerified: args.source === "manual",
      updatedAt: Date.now(),
    });
  },
});

// Fix miscategorized materials for a project
export const fixMaterialCategories = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
  },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const materials = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const SHEET_METAL_TERMS = [
      "coping", "counterflashing", "gravel stop", "fascia", "lock strip",
      "hook strip", "cleat", "drip edge", "expansion joint", "aluminum",
      "galvanized", "stainless", "galvalume", "kynar", " ga.", " ga ", "gauge",
      "sheet metal", "coil stock", "flash", "reglet",
    ];
    const LUMBER_TERMS = [
      "lumber", "plywood", "cdx", " pt ", "2x4", "2x6", "2x8", "2x10", "2x12",
      "4x4", "blocking", "nailer", "cant strip", "wood block",
    ];

    let fixed = 0;
    for (const m of materials) {
      const lower = m.name.toLowerCase();
      const oldCat = m.category;
      let newCat: string | null = null;

      // Recategorize edge_metal / fabricated items → sheet_metal
      if (
        oldCat === "edge_metal" ||
        oldCat === "accessories" ||
        oldCat === "miscellaneous"
      ) {
        if (SHEET_METAL_TERMS.some(t => lower.includes(t))) {
          newCat = "sheet_metal";
        }
      }

      // Recategorize accessories/miscellaneous → lumber
      if (!newCat && (oldCat === "accessories" || oldCat === "miscellaneous")) {
        if (LUMBER_TERMS.some(t => lower.includes(t))) {
          newCat = "lumber";
        }
      }

      if (newCat && newCat !== oldCat) {
        await ctx.db.patch(m._id, { category: newCat, updatedAt: Date.now() });
        fixed++;
      }
    }

    return { fixed };
  },
});

// ===== E-13: TAKEOFF → MATERIALS QUANTITY SYNC =====

/**
 * Reads takeoff sections (total SF) and line items (LF/EA quantities),
 * then recalculates every project material's quantity based on its calcType.
 *
 * calcType logic:
 *   "coverage"           → qty = ceil(totalSF × wasteFactor / coverage)
 *   "qty_per_sf"         → qty = ceil(totalSF × wasteFactor × qtyPerSf)
 *   "linear_from_takeoff"→ qty = takeoff LF for matching itemType × wasteFactor
 *   "count_from_takeoff" → qty = takeoff EA for matching itemType (no waste on counts)
 *   "fixed"              → no change (manual entry)
 *
 * Returns { updated: number, totalSF: number, warnings: string[] }
 */
export const syncTakeoffToMaterials = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);

    // 1. Sum total SF from takeoff sections
    const sections = await ctx.db
      .query("bidshield_takeoff_sections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const totalSF = sections.reduce((sum, s) => sum + (s.squareFeet || 0), 0);

    // 2. Build itemType → quantity map from takeoff line items
    const lineItems = await ctx.db
      .query("bidshield_takeoff_line_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const takeoffMap: Record<string, number> = {};
    for (const li of lineItems) {
      if (li.itemType && li.quantity !== undefined && li.quantity !== null) {
        // Accumulate in case there are duplicates (shouldn't happen, but safe)
        takeoffMap[li.itemType] = (takeoffMap[li.itemType] || 0) + li.quantity;
      }
    }

    // 3. Recalculate each material
    const materials = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    let updated = 0;
    const warnings: string[] = [];
    const now = Date.now();

    for (const mat of materials) {
      let newQty: number | undefined = undefined;

      switch (mat.calcType) {
        case "coverage": {
          if (!mat.coverage || mat.coverage <= 0) {
            warnings.push(`${mat.name}: missing or zero coverage rate — skipped`);
            break;
          }
          if (totalSF <= 0) {
            warnings.push(`${mat.name}: no takeoff SF entered — skipped`);
            break;
          }
          const wf = mat.wasteFactor || 1.0;
          newQty = Math.ceil((totalSF * wf) / mat.coverage);
          break;
        }

        case "qty_per_sf": {
          if (!mat.qtyPerSf || mat.qtyPerSf <= 0) {
            warnings.push(`${mat.name}: missing qty-per-SF rate — skipped`);
            break;
          }
          if (totalSF <= 0) {
            warnings.push(`${mat.name}: no takeoff SF entered — skipped`);
            break;
          }
          const wf2 = mat.wasteFactor || 1.0;
          newQty = Math.ceil(totalSF * wf2 * mat.qtyPerSf);
          break;
        }

        case "linear_from_takeoff": {
          if (!mat.takeoffItemType) {
            warnings.push(`${mat.name}: no takeoff item type linked — skipped`);
            break;
          }
          const lf = takeoffMap[mat.takeoffItemType];
          if (lf === undefined || lf <= 0) {
            warnings.push(`${mat.name}: takeoff "${mat.takeoffItemType}" has no quantity — skipped`);
            break;
          }
          const wf3 = mat.wasteFactor || 1.0;
          newQty = Math.ceil(lf * wf3);
          break;
        }

        case "count_from_takeoff": {
          if (!mat.takeoffItemType) {
            warnings.push(`${mat.name}: no takeoff item type linked — skipped`);
            break;
          }
          const ea = takeoffMap[mat.takeoffItemType];
          if (ea === undefined || ea <= 0) {
            warnings.push(`${mat.name}: takeoff "${mat.takeoffItemType}" has no quantity — skipped`);
            break;
          }
          // Count items don't apply waste factor — each penetration needs exactly 1 boot, etc.
          newQty = Math.ceil(ea);
          break;
        }

        case "fixed":
        default:
          // Manual entry — don't touch
          break;
      }

      if (newQty !== undefined && newQty !== mat.quantity) {
        const newTotal = mat.unitPrice ? roundCurrency(newQty * mat.unitPrice) : mat.totalCost;
        await ctx.db.patch(mat._id, {
          quantity: newQty,
          totalCost: newTotal,
          updatedAt: now,
        });
        updated++;
      }
    }

    return { updated, totalSF, warnings };
  },
});

// ===== USER MATERIAL PRICES =====

export const getUserMaterialPrices = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // P0-7: Verify caller identity
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("bidshield_user_material_prices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const upsertUserMaterialPrice = mutation({
  args: {
    userId: v.string(),
    materialName: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    vendorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const existing = await ctx.db
      .query("bidshield_user_material_prices")
      .withIndex("by_user_material", (q) => q.eq("userId", args.userId).eq("materialName", args.materialName))
      .first();

    const price = roundCurrency(args.unitPrice);
    if (existing) {
      await ctx.db.patch(existing._id, {
        unitPrice: price,
        unit: args.unit,
        vendorName: args.vendorName,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("bidshield_user_material_prices", {
      userId: args.userId,
      materialName: args.materialName,
      unit: args.unit,
      unitPrice: price,
      vendorName: args.vendorName,
      updatedAt: Date.now(),
    });
  },
});
