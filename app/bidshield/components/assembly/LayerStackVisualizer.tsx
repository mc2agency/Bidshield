"use client";

interface Props {
  layers: string[];     // bottom-to-top order
  aiLayers?: string[];  // AI-extracted raw layers
  label?: string;
}

// Color-codes a layer row based on its content
function getLayerStyle(text: string): { bg: string; color: string; borderColor: string } {
  const t = text.toLowerCase();
  if (/\bdeck\b|slab|substrate|concrete deck|steel deck|wood deck|gypsum|lightweight conc|tectum/i.test(t))
    return { bg: "#111318", color: "#6b7280", borderColor: "#1f2937" };
  if (/vapor retarder|vapor barrier/i.test(t))
    return { bg: "#1a1628", color: "#a78bfa", borderColor: "#3b1f6b" };
  if (/insulation|polyiso|xps|eps|mineral wool|foam|r-\d/i.test(t))
    return { bg: "#151c10", color: "#a3e635", borderColor: "#2d4010" };
  if (/drainage mat|drain mat|enkadrain|hydrodrain|miradrain|drainage composite/i.test(t))
    return { bg: "#0a1a24", color: "#38bdf8", borderColor: "#0c3d5a" };
  if (/filter fabric|geotextile|systemfilter/i.test(t))
    return { bg: "#0a1f18", color: "#34d399", borderColor: "#0a3826" };
  if (/membrane|waterproof|tpo|pvc|epdm|sbs|app|fluid|mm6125|parapro|tremproof|bitumen|hydrotech/i.test(t))
    return { bg: "#0a2626", color: "#2dd4bf", borderColor: "#0d6b6b" };
  if (/protection sheet|protection board|hydroflex|protection course|ccw/i.test(t))
    return { bg: "#1a1e1e", color: "#94a3b8", borderColor: "#334155" };
  if (/cover board|densdeck|securock|gypsum board|dens/i.test(t))
    return { bg: "#1a1918", color: "#a1a1aa", borderColor: "#3f3f46" };
  if (/pedestal|paver|ballast|concrete pavement|overburden|topping/i.test(t))
    return { bg: "#1c1a16", color: "#d6d3d1", borderColor: "#57534e" };
  if (/green roof|sedum|vegetation|growing media|planted/i.test(t))
    return { bg: "#0a1f0a", color: "#86efac", borderColor: "#14532d" };
  if (/root barrier|root stop/i.test(t))
    return { bg: "#1a1208", color: "#fb923c", borderColor: "#7c2d12" };
  if (/drainage layer|leca|aggregate|drainage cell/i.test(t))
    return { bg: "#0f1a24", color: "#7dd3fc", borderColor: "#0c4a6e" };
  return { bg: "#14161c", color: "#9ca3af", borderColor: "#374151" };
}

export function LayerStackVisualizer({ layers, aiLayers, label }: Props) {
  const displayLayers = layers.length > 0 ? [...layers].reverse() : [];
  const hasLayers = displayLayers.length > 0;

  return (
    <div>
      {label && (
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--bs-text-dim)" }}>
          {label}
        </div>
      )}

      {hasLayers ? (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
          {/* Column headers */}
          <div
            className="px-3 py-1 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"
            style={{ background: "var(--bs-bg-card)", borderBottom: "1px solid var(--bs-border)", color: "var(--bs-text-dim)" }}
          >
            <span className="w-4 text-right flex-shrink-0">#</span>
            <span>Layer · top to bottom</span>
          </div>

          {displayLayers.map((layer, i) => {
            const isTop = i === 0;
            const isBottom = i === displayLayers.length - 1;
            const s = getLayerStyle(layer);
            return (
              <div
                key={i}
                className="px-3 py-2 text-[11px] flex items-center gap-2"
                style={{
                  background: s.bg,
                  borderBottom: !isBottom ? `1px solid ${s.borderColor}` : undefined,
                  color: s.color,
                  fontWeight: isTop || isBottom ? 600 : 400,
                }}
              >
                <span
                  className="text-[9px] w-4 text-right flex-shrink-0 font-mono tabular-nums"
                  style={{ color: s.color, opacity: 0.5 }}
                >
                  {displayLayers.length - i}
                </span>

                {/* Layer type indicator bar */}
                <span
                  className="w-1 h-4 flex-shrink-0 rounded-sm"
                  style={{ background: s.color, opacity: 0.4 }}
                />

                <span className="flex-1 min-w-0 truncate">{layer}</span>

                {isTop && (
                  <span
                    className="ml-auto text-[8px] font-bold uppercase tracking-wider flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ background: s.color + "25", color: s.color }}
                  >
                    TOP
                  </span>
                )}
                {isBottom && (
                  <span
                    className="ml-auto text-[8px] font-bold uppercase tracking-wider flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ background: "#37415120", color: "#6b7280" }}
                  >
                    DECK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : aiLayers && aiLayers.length > 0 ? (
        <div>
          <div className="text-[10px] mb-1.5 flex items-center gap-1" style={{ color: "var(--bs-text-dim)" }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            AI-extracted layers
          </div>
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--bs-border)" }}
          >
            {[...aiLayers].reverse().map((l, i) => (
              <div
                key={i}
                className="px-3 py-1.5 text-[11px] flex items-center gap-2"
                style={{
                  background: i % 2 === 0 ? "var(--bs-bg-elevated)" : "var(--bs-bg-card)",
                  borderBottom: i < aiLayers.length - 1 ? "1px solid var(--bs-border)" : undefined,
                  color: "var(--bs-text-muted)",
                }}
              >
                <span className="text-[9px] w-4 text-right flex-shrink-0 font-mono" style={{ color: "var(--bs-text-dim)" }}>
                  {aiLayers.length - i}
                </span>
                {l}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] py-2" style={{ color: "var(--bs-text-dim)" }}>
          Fill in assembly sections to generate the layer stack.
        </div>
      )}
    </div>
  );
}
