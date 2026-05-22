"use client";

interface Props {
  layers: string[];         // bottom-to-top order
  aiLayers?: string[];      // AI-extracted raw layers
  label?: string;
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
          {displayLayers.map((layer, i) => {
            const isTop = i === 0;
            const isBottom = i === displayLayers.length - 1;
            return (
              <div
                key={i}
                className="px-3 py-1.5 text-[11px] flex items-center gap-2"
                style={{
                  background: isTop
                    ? "var(--bs-teal-dim)"
                    : i % 2 === 0
                    ? "var(--bs-bg-elevated)"
                    : "var(--bs-bg-card)",
                  borderBottom: !isBottom ? "1px solid var(--bs-border)" : undefined,
                  color: isTop ? "var(--bs-teal)" : "var(--bs-text-muted)",
                  fontWeight: isTop || isBottom ? 600 : 400,
                }}
              >
                <span className="text-[9px] w-4 text-right flex-shrink-0 font-mono" style={{ color: "var(--bs-text-dim)" }}>
                  {displayLayers.length - i}
                </span>
                {layer}
                {isTop && (
                  <span className="ml-auto text-[9px] font-bold uppercase" style={{ color: "var(--bs-teal)", letterSpacing: "0.05em" }}>
                    TOP
                  </span>
                )}
                {isBottom && (
                  <span className="ml-auto text-[9px] font-bold uppercase" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.05em" }}>
                    DECK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : aiLayers && aiLayers.length > 0 ? (
        <div>
          <div className="text-[10px] mb-1" style={{ color: "var(--bs-text-dim)" }}>
            AI-extracted layers (bottom to top):
          </div>
          <ol
            className="rounded-lg px-3 py-2 space-y-0.5"
            style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", listStyleType: "decimal", listStylePosition: "inside" }}
          >
            {aiLayers.map((l, i) => (
              <li key={i} className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
                {l}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="text-[11px] py-2" style={{ color: "var(--bs-text-dim)" }}>
          Fill in assembly sections to generate the layer stack.
        </div>
      )}
    </div>
  );
}
