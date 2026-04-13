import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertRecordOwnership } from "./_helpers";

const SOURCE_TYPE = v.union(
  v.literal("base_spec"),
  v.literal("addendum"),
  v.literal("related_division"),
  v.literal("other"),
);

export const listByProject = query({
  args: { projectId: v.id("bidshield_projects"), userId: v.string() },
  handler: async (ctx, { projectId, userId }) => {
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }
    const specs = await ctx.db
      .query("bidshield_project_specs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return specs.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const addProjectSpec = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    label: v.string(),
    sourceType: SOURCE_TYPE,
    addendumId: v.optional(v.id("bidshield_addenda")),
    filename: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    extractionJson: v.string(),
  },
  handler: async (ctx, args) => {
    const convexUserId = await validateAuth(ctx, args.userId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_project_specs", {
      ...args,
      convexUserId,
      extractedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProjectSpec = mutation({
  args: {
    id: v.id("bidshield_project_specs"),
    label: v.optional(v.string()),
    sourceType: v.optional(SOURCE_TYPE),
    extractionJson: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const spec = await ctx.db.get(id);
    await assertRecordOwnership(ctx, spec, "project spec");
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const deleteProjectSpec = mutation({
  args: { id: v.id("bidshield_project_specs") },
  handler: async (ctx, { id }) => {
    const spec = await ctx.db.get(id);
    await assertRecordOwnership(ctx, spec, "project spec");
    if (spec?.storageId) {
      try {
        await ctx.storage.delete(spec.storageId);
      } catch {}
    }
    await ctx.db.delete(id);
  },
});

// ===== Merged materials across all specs for a project =====

type SpecMat = {
  category?: string;
  name?: string;
  spec?: string;
  manufacturer?: string;
  coverageRate?: string;
  productName?: string;
};

export type MergedMaterial = {
  productName: string;
  manufacturer?: string;
  category: string;
  spec?: string;
  coverageRate?: string;
  sources: Array<{ specId: string; label: string; sourceType: string }>;
};

function normalizeProductName(m: SpecMat): string {
  // Prefer explicit productName, then name, then first few uppercase words of spec
  if (m.productName && m.productName.trim()) return m.productName.trim();
  if (m.name && m.name.trim()) {
    // Only fall back to regex if name looks like a generic description
    const looksGeneric =
      /^(sbs|app|tpo|pvc|epdm|polyiso|xps|eps)\s+(modified|membrane|board|insulation)/i.test(
        m.name,
      ) || /\b(base ply|finish ply|cap sheet|cover board)\b/i.test(m.name);
    if (!looksGeneric) return m.name.trim();
  }
  const fromSpec = m.spec?.match(
    /^([A-Z][A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-\.]+){0,3})/,
  )?.[1];
  if (fromSpec && !fromSpec.startsWith("ASTM")) return fromSpec.trim();
  return (m.name ?? "Unknown").trim();
}

function dedupeKey(productName: string, manufacturer?: string): string {
  return `${productName.toLowerCase().replace(/\s+/g, " ").trim()}::${(manufacturer ?? "").toLowerCase().trim()}`;
}

export const getMergedMaterials = query({
  args: { projectId: v.id("bidshield_projects"), userId: v.string() },
  handler: async (ctx, { projectId, userId }) => {
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }

    const specs = await ctx.db
      .query("bidshield_project_specs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    // Back-compat: if no rows in project_specs yet, fall back to project.specSummary
    let specRows: Array<{
      _id: string;
      label: string;
      sourceType: string;
      extractionJson: string;
    }> = specs.map((s) => ({
      _id: s._id as unknown as string,
      label: s.label,
      sourceType: s.sourceType,
      extractionJson: s.extractionJson,
    }));

    if (specRows.length === 0) {
      const project = await ctx.db.get(projectId);
      if (project?.specSummary) {
        specRows = [
          {
            _id: "legacy" as string,
            label: "Base Spec",
            sourceType: "base_spec",
            extractionJson: project.specSummary,
          },
        ];
      }
    }

    const merged = new Map<string, MergedMaterial>();

    for (const row of specRows) {
      let parsed: any;
      try {
        parsed = JSON.parse(row.extractionJson);
      } catch {
        continue;
      }
      const mats: SpecMat[] = parsed?.materials ?? [];
      for (const m of mats) {
        if (!m?.name && !m?.productName) continue;
        const productName = normalizeProductName(m);
        const manufacturer =
          m.manufacturer && m.manufacturer !== "as specified" ? m.manufacturer : undefined;
        const key = dedupeKey(productName, manufacturer);

        const existing = merged.get(key);
        const source = {
          specId: row._id,
          label: row.label,
          sourceType: row.sourceType,
        };

        if (existing) {
          // Keep richest data; append source
          if (!existing.coverageRate && m.coverageRate) existing.coverageRate = m.coverageRate;
          if (!existing.spec && m.spec) existing.spec = m.spec;
          if (!existing.sources.find((s) => s.specId === source.specId)) {
            existing.sources.push(source);
          }
        } else {
          merged.set(key, {
            productName,
            manufacturer,
            category: m.category || "miscellaneous",
            spec: m.spec,
            coverageRate: m.coverageRate,
            sources: [source],
          });
        }
      }
    }

    return Array.from(merged.values());
  },
});
